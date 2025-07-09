import { supabase } from './supabase';
import { MemoryCache } from './memoryCache';
import { logger } from '@/utils/logger';
import { N8nChatMemory, MemoryType, MemoryLevel } from '@/types/memory';

// Cache global para memória
const memoryCache = new MemoryCache({ maxSize: 500 });

/**
 * Serviço simplificado para gerenciar memória
 */
export const memoryService = {
  /**
   * Busca memórias por sessão
   */
  getMemoriesBySession: async (
    sessionId: string,
    memoryType?: MemoryType,
    limit = 50,
    useCache = true
  ): Promise<N8nChatMemory[]> => {
    try {
      const cacheKey = `memory_${sessionId}_${memoryType || 'all'}`;
      
      if (useCache) {
        const cached = memoryCache.get(cacheKey) as N8nChatMemory[] | undefined;
        if (cached) return cached;
      }

      let query = supabase
        .from('n8n_chat_memory')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (memoryType) {
        query = query.eq('memory_type', memoryType);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Converter para N8nChatMemory com parsing seguro
      const memories: N8nChatMemory[] = (data || []).map(item => ({
        ...item,
        memory_type: (item.memory_type as MemoryType) || 'contextual',
        memory_level: (item.memory_level as MemoryLevel) || 'medium_term',
        entities: item.entities ? (typeof item.entities === 'string' ? JSON.parse(item.entities) : item.entities) : undefined,
        relationships: item.relationships ? (typeof item.relationships === 'string' ? JSON.parse(item.relationships) : item.relationships) : undefined,
        context: item.context ? (typeof item.context === 'string' ? JSON.parse(item.context) : item.context) : undefined,
        metadata: item.metadata ? (typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata) : undefined,
      }));

      if (useCache) {
        memoryCache.set(cacheKey, memories);
      }

      return memories;
    } catch (error) {
      logger.error('Erro ao buscar memórias por sessão:', error);
      return [];
    }
  },

  /**
   * Armazena uma nova memória
   */
  storeMemory: async (memory: Partial<N8nChatMemory>): Promise<N8nChatMemory | null> => {
    try {
      if (!memory.session_id || !memory.message) {
        throw new Error('session_id e message são obrigatórios');
      }

      const memoryToInsert = {
        session_id: memory.session_id,
        message: memory.message,
        memory_type: memory.memory_type || 'contextual',
        memory_level: memory.memory_level || 'medium_term',
        importance: memory.importance || 3,
        entities: memory.entities ? JSON.stringify(memory.entities) : null,
        relationships: memory.relationships ? JSON.stringify(memory.relationships) : null,
        context: memory.context ? JSON.stringify(memory.context) : null,
        metadata: memory.metadata ? JSON.stringify(memory.metadata) : null,
        expiration_date: memory.expiration_date,
        data: memory.data,
        hora: memory.hora,
      };

      const { data, error } = await supabase
        .from('n8n_chat_memory')
        .insert(memoryToInsert)
        .select()
        .single();

      if (error) throw error;

      // Invalidar cache
      memoryCache.clear();

      return {
        ...data,
        memory_type: data.memory_type as MemoryType,
        memory_level: data.memory_level as MemoryLevel,
        entities: data.entities ? JSON.parse(data.entities as string) : undefined,
        relationships: data.relationships ? JSON.parse(data.relationships as string) : undefined,
        context: data.context ? JSON.parse(data.context as string) : undefined,
        metadata: data.metadata ? JSON.parse(data.metadata as string) : undefined,
      };
    } catch (error) {
      logger.error('Erro ao armazenar memória:', error);
      return null;
    }
  },

  /**
   * Busca memórias por importância
   */
  getMemoriesByImportance: async (
    sessionId: string,
    minImportance = 3,
    useCache = true
  ): Promise<N8nChatMemory[]> => {
    try {
      const memories = await memoryService.getMemoriesBySession(sessionId, undefined, 100, useCache);
      return memories.filter(memory => (memory.importance || 0) >= minImportance);
    } catch (error) {
      logger.error('Erro ao buscar memórias por importância:', error);
      return [];
    }
  },

  /**
   * Limpa o cache
   */
  clearCache: (pattern?: string): void => {
    memoryCache.clear();
  },

  /**
   * Obtém estatísticas do cache
   */
  getCacheStats: () => {
    return memoryCache.getStats();
  },
};