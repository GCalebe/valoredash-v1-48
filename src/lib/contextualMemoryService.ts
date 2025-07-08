import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { MemoryCache } from './memoryCache';
import { N8nChatMemory } from '@/types/memory';
import { logger } from '@/utils/logger';

// Cache dedicado para memória contextual
const contextCache = new MemoryCache({
  maxSize: 100,
  defaultTTL: 5 * 60 * 1000, // 5 minutos
});

/**
 * Serviço para gerenciar memória contextual com suporte a cache
 */
export const contextualMemoryService = {
  /**
   * Armazena uma memória contextual
   */
  storeContextualMemory: async (memory: Partial<N8nChatMemory>): Promise<N8nChatMemory | null> => {
    try {
      const supabase = createClientComponentClient();
      
      // Garantir que é uma memória contextual
      const memoryData = {
        ...memory,
        memory_type: 'contextual',
        memory_level: memory.memory_level || 'short_term',
        importance: memory.importance || 1,
      };
      
      // Serializar campos JSON
      const serializedMemory = {
        ...memoryData,
        entities: memoryData.entities ? JSON.stringify(memoryData.entities) : null,
        relationships: memoryData.relationships ? JSON.stringify(memoryData.relationships) : null,
        context: memoryData.context ? JSON.stringify(memoryData.context) : null,
        metadata: memoryData.metadata ? JSON.stringify(memoryData.metadata) : null,
      };
      
      // Inserir na tabela
      const { data, error } = await supabase
        .from('n8n_chat_memory')
        .insert(serializedMemory)
        .select()
        .single();
      
      if (error) {
        logger.error('Erro ao armazenar memória contextual:', error);
        return null;
      }
      
      // Invalidar caches relacionados
      if (data.session_id) {
        contextCache.delete(`contextual_${data.session_id}`);
        contextCache.delete(`contextual_${data.session_id}_${data.memory_level}`);
      }
      
      // Deserializar campos JSON
      const parsedMemory = {
        ...data,
        entities: data.entities ? JSON.parse(data.entities) : [],
        relationships: data.relationships ? JSON.parse(data.relationships) : [],
        context: data.context ? JSON.parse(data.context) : {},
        metadata: data.metadata ? JSON.parse(data.metadata) : {},
      };
      
      return parsedMemory;
    } catch (err) {
      logger.error('Erro ao armazenar memória contextual:', err);
      return null;
    }
  },
  
  /**
   * Obtém todas as memórias contextuais de uma sessão
   */
  getContextualMemories: async (
    sessionId: string,
    useCache = true
  ): Promise<N8nChatMemory[]> => {
    try {
      // Verificar cache
      const cacheKey = `contextual_${sessionId}`;
      if (useCache) {
        const cachedData = contextCache.get(cacheKey);
        if (cachedData) {
          return cachedData;
        }
      }
      
      const supabase = createClientComponentClient();
      
      // Buscar memórias contextuais
      const { data, error } = await supabase
        .from('n8n_chat_memory')
        .select('*')
        .eq('session_id', sessionId)
        .eq('memory_type', 'contextual')
        .order('created_at', { ascending: false });
      
      if (error) {
        logger.error('Erro ao buscar memórias contextuais:', error);
        return [];
      }
      
      // Deserializar campos JSON
      const parsedMemories = data.map(memory => ({
        ...memory,
        entities: memory.entities ? JSON.parse(memory.entities) : [],
        relationships: memory.relationships ? JSON.parse(memory.relationships) : [],
        context: memory.context ? JSON.parse(memory.context) : {},
        metadata: memory.metadata ? JSON.parse(memory.metadata) : {},
      }));
      
      // Armazenar no cache
      contextCache.set(cacheKey, parsedMemories);
      
      return parsedMemories;
    } catch (err) {
      logger.error('Erro ao buscar memórias contextuais:', err);
      return [];
    }
  },
  
  /**
   * Obtém memórias contextuais por nível (curto, médio, longo prazo)
   */
  getContextualMemoriesByLevel: async (
    sessionId: string,
    level: string,
    useCache = true
  ): Promise<N8nChatMemory[]> => {
    try {
      // Verificar cache
      const cacheKey = `contextual_${sessionId}_${level}`;
      if (useCache) {
        const cachedData = contextCache.get(cacheKey);
        if (cachedData) {
          return cachedData;
        }
      }
      
      const supabase = createClientComponentClient();
      
      // Buscar memórias contextuais por nível
      const { data, error } = await supabase
        .from('n8n_chat_memory')
        .select('*')
        .eq('session_id', sessionId)
        .eq('memory_type', 'contextual')
        .eq('memory_level', level)
        .order('created_at', { ascending: false });
      
      if (error) {
        logger.error(`Erro ao buscar memórias contextuais de nível ${level}:`, error);
        return [];
      }
      
      // Deserializar campos JSON
      const parsedMemories = data.map(memory => ({
        ...memory,
        entities: memory.entities ? JSON.parse(memory.entities) : [],
        relationships: memory.relationships ? JSON.parse(memory.relationships) : [],
        context: memory.context ? JSON.parse(memory.context) : {},
        metadata: memory.metadata ? JSON.parse(memory.metadata) : {},
      }));
      
      // Armazenar no cache
      contextCache.set(cacheKey, parsedMemories);
      
      return parsedMemories;
    } catch (err) {
      logger.error(`Erro ao buscar memórias contextuais de nível ${level}:`, err);
      return [];
    }
  },
  
  /**
   * Atualiza a importância de uma memória contextual
   */
  updateImportance: async (memoryId: number, importance: number): Promise<boolean> => {
    try {
      const supabase = createClientComponentClient();
      
      // Buscar a memória atual para obter o session_id
      const { data: memoryData, error: fetchError } = await supabase
        .from('n8n_chat_memory')
        .select('session_id, memory_level')
        .eq('id', memoryId)
        .single();
      
      if (fetchError) {
        logger.error('Erro ao buscar memória para atualização:', fetchError);
        return false;
      }
      
      // Atualizar importância
      const { error } = await supabase
        .from('n8n_chat_memory')
        .update({ importance })
        .eq('id', memoryId);
      
      if (error) {
        logger.error('Erro ao atualizar importância da memória:', error);
        return false;
      }
      
      // Invalidar caches relacionados
      if (memoryData) {
        contextCache.delete(`contextual_${memoryData.session_id}`);
        contextCache.delete(`contextual_${memoryData.session_id}_${memoryData.memory_level}`);
      }
      
      return true;
    } catch (err) {
      logger.error('Erro ao atualizar importância da memória:', err);
      return false;
    }
  },
  
  /**
   * Remove memórias contextuais expiradas
   */
  removeExpiredMemories: async (): Promise<number> => {
    try {
      const supabase = createClientComponentClient();
      
      // Buscar IDs de sessões com memórias expiradas para invalidar cache depois
      const { data: sessionsData } = await supabase
        .from('n8n_chat_memory')
        .select('session_id')
        .eq('memory_type', 'contextual')
        .lt('expiration_date', new Date().toISOString())
        .limit(1000);
      
      // Remover memórias expiradas
      const { data, error } = await supabase
        .from('n8n_chat_memory')
        .delete()
        .eq('memory_type', 'contextual')
        .lt('expiration_date', new Date().toISOString())
        .select('id');
      
      if (error) {
        logger.error('Erro ao remover memórias contextuais expiradas:', error);
        return 0;
      }
      
      // Invalidar caches para as sessões afetadas
      if (sessionsData) {
        const uniqueSessionIds = [...new Set(sessionsData.map(item => item.session_id))];
        uniqueSessionIds.forEach(sessionId => {
          contextCache.delete(`contextual_${sessionId}`);
          // Invalidar caches de níveis específicos
          ['short_term', 'medium_term', 'long_term'].forEach(level => {
            contextCache.delete(`contextual_${sessionId}_${level}`);
          });
        });
      }
      
      return data?.length || 0;
    } catch (err) {
      logger.error('Erro ao remover memórias contextuais expiradas:', err);
      return 0;
    }
  },
  
  /**
   * Gera um resumo do contexto atual da conversa
   */
  generateContextSummary: async (sessionId: string, useCache = true): Promise<any> => {
    try {
      // Verificar cache
      const cacheKey = `context_summary_${sessionId}`;
      if (useCache) {
        const cachedData = contextCache.get(cacheKey);
        if (cachedData) {
          return cachedData;
        }
      }
      
      // Buscar memórias contextuais por nível de importância
      const memories = await contextualMemoryService.getContextualMemories(sessionId, useCache);
      
      // Filtrar por importância e agrupar por nível
      const importantMemories = memories.filter(m => m.importance >= 3);
      
      const byLevel = {
        short_term: importantMemories.filter(m => m.memory_level === 'short_term'),
        medium_term: importantMemories.filter(m => m.memory_level === 'medium_term'),
        long_term: importantMemories.filter(m => m.memory_level === 'long_term'),
      };
      
      // Extrair entidades únicas
      const entities = new Map();
      importantMemories.forEach(memory => {
        if (memory.entities && memory.entities.length > 0) {
          memory.entities.forEach((entity: any) => {
            if (!entities.has(entity.name)) {
              entities.set(entity.name, entity);
            }
          });
        }
      });
      
      // Extrair relacionamentos únicos
      const relationships = new Map();
      importantMemories.forEach(memory => {
        if (memory.relationships && memory.relationships.length > 0) {
          memory.relationships.forEach((rel: any) => {
            const key = `${rel.source}-${rel.type}-${rel.target}`;
            if (!relationships.has(key)) {
              relationships.set(key, rel);
            }
          });
        }
      });
      
      // Mesclar contextos
      const mergedContext: Record<string, any> = {};
      importantMemories.forEach(memory => {
        if (memory.context && Object.keys(memory.context).length > 0) {
          Object.entries(memory.context).forEach(([key, value]) => {
            // Priorizar valores de memórias mais importantes
            if (!mergedContext[key] || memory.importance > mergedContext[`${key}_importance`]) {
              mergedContext[key] = value;
              mergedContext[`${key}_importance`] = memory.importance;
            }
          });
        }
      });
      
      // Limpar chaves de importância do contexto mesclado
      const cleanContext: Record<string, any> = {};
      Object.entries(mergedContext).forEach(([key, value]) => {
        if (!key.endsWith('_importance')) {
          cleanContext[key] = value;
        }
      });
      
      // Criar resumo do contexto
      const summary = {
        short_term_count: byLevel.short_term.length,
        medium_term_count: byLevel.medium_term.length,
        long_term_count: byLevel.long_term.length,
        total_memories: importantMemories.length,
        entities: Array.from(entities.values()),
        relationships: Array.from(relationships.values()),
        context: cleanContext,
        most_important: importantMemories.length > 0 ? 
          importantMemories.sort((a, b) => b.importance - a.importance)[0] : null,
      };
      
      // Armazenar no cache
      contextCache.set(cacheKey, summary, 60 * 1000); // 1 minuto TTL para o resumo
      
      return summary;
    } catch (err) {
      logger.error('Erro ao gerar resumo do contexto:', err);
      return {
        short_term_count: 0,
        medium_term_count: 0,
        long_term_count: 0,
        total_memories: 0,
        entities: [],
        relationships: [],
        context: {},
        most_important: null,
      };
    }
  },
  
  /**
   * Limpa o cache de memória contextual
   */
  clearCache: (pattern?: string): void => {
    if (pattern) {
      contextCache.deletePattern(pattern);
    } else {
      contextCache.clear();
    }
  },
};