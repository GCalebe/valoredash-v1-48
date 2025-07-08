import { supabase } from './supabase';
import { MemoryCache } from './memoryCache';
import { logger } from '@/utils/logger';
import { N8nChatMemory, EpisodicMemory } from '@/types/memory';

// Cache dedicado para memória episódica
const episodicCache = new MemoryCache({
  maxSize: 500,
  defaultTTL: 1000 * 60 * 15, // 15 minutos
});

/**
 * Serviço otimizado para gerenciar memória episódica
 * Inclui suporte a busca por período e cache
 */
export const episodicMemoryService = {
  /**
   * Armazena uma nova memória episódica
   */
  storeEpisodicMemory: async (memory: Partial<N8nChatMemory>): Promise<N8nChatMemory | null> => {
    try {
      // Garantir que os campos obrigatórios estejam presentes
      if (!memory.session_id || !memory.message) {
        throw new Error('session_id e message são obrigatórios');
      }

      // Definir tipo de memória como episódica
      const episodicMemory = {
        ...memory,
        memory_type: 'episodic',
        memory_level: memory.memory_level || 'medium_term',
        expiration_date: memory.expiration_date || new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString(), // 90 dias por padrão
        importance: memory.importance || 5, // Importância média por padrão
      };

      // Converter objetos para JSON strings
      const memoryToInsert = {
        ...episodicMemory,
        entities: episodicMemory.entities ? JSON.stringify(episodicMemory.entities) : null,
        relationships: episodicMemory.relationships ? JSON.stringify(episodicMemory.relationships) : null,
        context: episodicMemory.context ? JSON.stringify(episodicMemory.context) : null,
        metadata: episodicMemory.metadata ? JSON.stringify(episodicMemory.metadata) : null,
      };

      // Inserir no banco de dados
      const { data, error } = await supabase
        .from('n8n_chat_memory')
        .insert(memoryToInsert)
        .select()
        .single();

      if (error) throw error;

      // Invalidar caches relacionados
      episodicCache.delete(`episodic_${memory.session_id}`);
      episodicCache.delete(`episodic_timeline_${memory.session_id}`);
      
      // Converter strings JSON de volta para objetos
      const result: N8nChatMemory = {
        ...data,
        entities: data.entities ? JSON.parse(data.entities) : null,
        relationships: data.relationships ? JSON.parse(data.relationships) : null,
        context: data.context ? JSON.parse(data.context) : null,
        metadata: data.metadata ? JSON.parse(data.metadata) : null,
      };

      return result;
    } catch (error) {
      logger.error('Erro ao armazenar memória episódica:', error);
      return null;
    }
  },

  /**
   * Busca memórias episódicas por sessão
   */
  getEpisodicMemories: async (sessionId: string, useCache = true): Promise<N8nChatMemory[]> => {
    try {
      const cacheKey = `episodic_${sessionId}`;

      // Verificar cache
      if (useCache) {
        const cachedMemories = episodicCache.get<N8nChatMemory[]>(cacheKey);
        if (cachedMemories) return cachedMemories;
      }

      // Buscar do banco de dados
      const { data, error } = await supabase
        .from('n8n_chat_memory')
        .select('*')
        .eq('session_id', sessionId)
        .eq('memory_type', 'episodic')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Converter strings JSON para objetos
      const memories: N8nChatMemory[] = data.map(memory => ({
        ...memory,
        entities: memory.entities ? JSON.parse(memory.entities) : null,
        relationships: memory.relationships ? JSON.parse(memory.relationships) : null,
        context: memory.context ? JSON.parse(memory.context) : null,
        metadata: memory.metadata ? JSON.parse(memory.metadata) : null,
      }));

      // Armazenar no cache
      if (useCache) {
        episodicCache.set(cacheKey, memories);
      }

      return memories;
    } catch (error) {
      logger.error('Erro ao buscar memórias episódicas:', error);
      return [];
    }
  },

  /**
   * Busca memórias episódicas por período
   */
  getEpisodicMemoriesByPeriod: async (
    sessionId: string,
    startDate: string,
    endDate: string,
    useCache = true
  ): Promise<N8nChatMemory[]> => {
    try {
      const cacheKey = `episodic_${sessionId}_${startDate}_${endDate}`;

      // Verificar cache
      if (useCache) {
        const cachedMemories = episodicCache.get<N8nChatMemory[]>(cacheKey);
        if (cachedMemories) return cachedMemories;
      }

      // Buscar do banco de dados
      const { data, error } = await supabase
        .from('n8n_chat_memory')
        .select('*')
        .eq('session_id', sessionId)
        .eq('memory_type', 'episodic')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Converter strings JSON para objetos
      const memories: N8nChatMemory[] = data.map(memory => ({
        ...memory,
        entities: memory.entities ? JSON.parse(memory.entities) : null,
        relationships: memory.relationships ? JSON.parse(memory.relationships) : null,
        context: memory.context ? JSON.parse(memory.context) : null,
        metadata: memory.metadata ? JSON.parse(memory.metadata) : null,
      }));

      // Armazenar no cache
      if (useCache) {
        episodicCache.set(cacheKey, memories, 1000 * 60 * 5); // 5 minutos de TTL para consultas específicas
      }

      return memories;
    } catch (error) {
      logger.error('Erro ao buscar memórias episódicas por período:', error);
      return [];
    }
  },

  /**
   * Gera uma linha do tempo de memórias episódicas
   */
  generateTimeline: async (sessionId: string, useCache = true): Promise<EpisodicMemory[]> => {
    try {
      const cacheKey = `episodic_timeline_${sessionId}`;

      // Verificar cache
      if (useCache) {
        const cachedTimeline = episodicCache.get<EpisodicMemory[]>(cacheKey);
        if (cachedTimeline) return cachedTimeline;
      }

      // Buscar memórias episódicas
      const memories = await episodicMemoryService.getEpisodicMemories(sessionId, useCache);

      // Agrupar por dia
      const timelineMap = new Map<string, EpisodicMemory>();
      
      memories.forEach(memory => {
        if (!memory.created_at) return;
        
        // Extrair data (sem hora)
        const date = new Date(memory.created_at).toISOString().split('T')[0];
        
        // Criar ou atualizar entrada na linha do tempo
        if (!timelineMap.has(date)) {
          timelineMap.set(date, {
            date,
            events: [],
            summary: '',
          });
        }
        
        const timelineEntry = timelineMap.get(date)!;
        
        // Adicionar evento
        timelineEntry.events.push({
          id: memory.id,
          timestamp: memory.created_at,
          content: memory.message?.content || '',
          importance: memory.importance || 0,
          metadata: memory.metadata || {},
        });
        
        // Ordenar eventos por timestamp
        timelineEntry.events.sort((a, b) => {
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        });
        
        // Gerar resumo simples (pode ser substituído por um resumo gerado por IA)
        timelineEntry.summary = `${timelineEntry.events.length} eventos em ${date}`;
      });

      // Converter para array e ordenar por data
      const timeline = Array.from(timelineMap.values()).sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      // Armazenar no cache
      if (useCache) {
        episodicCache.set(cacheKey, timeline);
      }

      return timeline;
    } catch (error) {
      logger.error('Erro ao gerar linha do tempo:', error);
      return [];
    }
  },

  /**
   * Atualiza a importância de uma memória episódica
   */
  updateImportance: async (memoryId: number, importance: number): Promise<boolean> => {
    try {
      // Buscar memória atual para obter session_id
      const { data: memoryData, error: memoryError } = await supabase
        .from('n8n_chat_memory')
        .select('session_id')
        .eq('id', memoryId)
        .single();

      if (memoryError) throw memoryError;

      // Atualizar importância
      const { error } = await supabase
        .from('n8n_chat_memory')
        .update({ importance })
        .eq('id', memoryId);

      if (error) throw error;

      // Invalidar caches relacionados
      if (memoryData?.session_id) {
        episodicCache.delete(`episodic_${memoryData.session_id}`);
        episodicCache.delete(`episodic_timeline_${memoryData.session_id}`);
      }

      return true;
    } catch (error) {
      logger.error('Erro ao atualizar importância da memória:', error);
      return false;
    }
  },

  /**
   * Remove memórias expiradas
   */
  removeExpiredMemories: async (): Promise<number> => {
    try {
      // Buscar IDs e session_ids das memórias expiradas
      const { data: expiredMemories, error: fetchError } = await supabase
        .from('n8n_chat_memory')
        .select('id, session_id')
        .eq('memory_type', 'episodic')
        .lt('expiration_date', new Date().toISOString());

      if (fetchError) throw fetchError;

      if (!expiredMemories || expiredMemories.length === 0) {
        return 0;
      }

      // Extrair IDs para remoção
      const idsToRemove = expiredMemories.map(memory => memory.id);

      // Remover memórias expiradas
      const { error } = await supabase
        .from('n8n_chat_memory')
        .delete()
        .in('id', idsToRemove);

      if (error) throw error;

      // Invalidar caches para as sessões afetadas
      const affectedSessions = new Set(expiredMemories.map(memory => memory.session_id));
      affectedSessions.forEach(sessionId => {
        episodicCache.delete(`episodic_${sessionId}`);
        episodicCache.delete(`episodic_timeline_${sessionId}`);
      });

      return idsToRemove.length;
    } catch (error) {
      logger.error('Erro ao remover memórias expiradas:', error);
      return 0;
    }
  },

  /**
   * Limpa o cache de memória episódica
   */
  clearCache: (pattern?: string): void => {
    if (pattern) {
      episodicCache.deletePattern(pattern);
    } else {
      episodicCache.clear();
    }
  },

  /**
   * Obtém estatísticas do cache
   */
  getCacheStats: (): { hits: number; misses: number; size: number } => {
    return {
      hits: episodicCache.getStats().hits,
      misses: episodicCache.getStats().misses,
      size: episodicCache.size(),
    };
  },
};