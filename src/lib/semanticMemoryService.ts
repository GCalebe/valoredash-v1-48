import { supabase } from './supabase';
import { MemoryCache } from './memoryCache';
import { logger } from '@/utils/logger';
import { N8nChatMemory, SemanticEntity, EntityRelationship, MemoryType, MemoryLevel } from '@/types/memory';

// Cache dedicado para memória semântica
const semanticCache = new MemoryCache({
  maxSize: 1000
});

/**
 * Serviço simplificado para gerenciar memória semântica
 */
export const semanticMemoryService = {
  /**
   * Armazena uma nova memória semântica
   */
  storeSemanticMemory: async (memory: Partial<N8nChatMemory>): Promise<N8nChatMemory | null> => {
    try {
      if (!memory.session_id || !memory.message) {
        throw new Error('session_id e message são obrigatórios');
      }

      const memoryToInsert = {
        session_id: memory.session_id,
        message: memory.message,
        memory_type: 'semantic',
        memory_level: memory.memory_level || 'medium_term',
        importance: memory.importance || 5,
        entities: memory.entities ? JSON.stringify(memory.entities) : '[]',
        relationships: memory.relationships ? JSON.stringify(memory.relationships) : '[]',
        context: memory.context ? JSON.stringify(memory.context) : '{}',
        metadata: memory.metadata ? JSON.stringify(memory.metadata) : '{}',
        expiration_date: memory.expiration_date || new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
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
      semanticCache.clear();

      return {
        ...data,
        memory_type: data.memory_type as MemoryType,
        memory_level: data.memory_level as MemoryLevel,
        entities: data.entities ? JSON.parse(data.entities as string) : null,
        relationships: data.relationships ? JSON.parse(data.relationships as string) : null,
        context: data.context ? JSON.parse(data.context as string) : null,
        metadata: data.metadata ? JSON.parse(data.metadata as string) : null,
      };
    } catch (error) {
      logger.error('Erro ao armazenar memória semântica:', error);
      return null;
    }
  },

  /**
   * Busca memórias semânticas por sessão
   */
  getSemanticMemories: async (sessionId: string, useCache = true): Promise<N8nChatMemory[]> => {
    try {
      const cacheKey = `semantic_${sessionId}`;

      if (useCache) {
        const cached = semanticCache.get(cacheKey) as N8nChatMemory[] | undefined;
        if (cached) return cached;
      }

      const { data, error } = await supabase
        .from('n8n_chat_memory')
        .select('*')
        .eq('session_id', sessionId)
        .eq('memory_type', 'semantic')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const memories: N8nChatMemory[] = (data || []).map(memory => ({
        ...memory,
        memory_type: memory.memory_type as MemoryType,
        memory_level: memory.memory_level as MemoryLevel,
        entities: memory.entities ? JSON.parse(memory.entities as string) : null,
        relationships: memory.relationships ? JSON.parse(memory.relationships as string) : null,
        context: memory.context ? JSON.parse(memory.context as string) : null,
        metadata: memory.metadata ? JSON.parse(memory.metadata as string) : null,
      }));

      if (useCache) {
        semanticCache.set(cacheKey, memories);
      }

      return memories;
    } catch (error) {
      logger.error('Erro ao buscar memórias semânticas:', error);
      return [];
    }
  },

  /**
   * Busca entidades semânticas
   */
  getEntities: async (sessionId: string, useCache = true): Promise<SemanticEntity[]> => {
    try {
      const memories = await semanticMemoryService.getSemanticMemories(sessionId, useCache);
      
      const entitiesMap = new Map<string, SemanticEntity>();
      memories.forEach(memory => {
        if (memory.entities && Array.isArray(memory.entities)) {
          memory.entities.forEach((entity: SemanticEntity) => {
            if (entity.name && !entitiesMap.has(entity.name)) {
              entitiesMap.set(entity.name, entity);
            }
          });
        }
      });

      return Array.from(entitiesMap.values());
    } catch (error) {
      logger.error('Erro ao buscar entidades:', error);
      return [];
    }
  },

  /**
   * Busca relacionamentos
   */
  getRelationships: async (sessionId: string, useCache = true): Promise<EntityRelationship[]> => {
    try {
      const memories = await semanticMemoryService.getSemanticMemories(sessionId, useCache);
      
      const relationshipsMap = new Map<string, EntityRelationship>();
      memories.forEach(memory => {
        if (memory.relationships && Array.isArray(memory.relationships)) {
          memory.relationships.forEach((relationship: EntityRelationship) => {
            const key = `${relationship.source}_${relationship.type}_${relationship.target}`;
            if (!relationshipsMap.has(key)) {
              relationshipsMap.set(key, relationship);
            }
          });
        }
      });

      return Array.from(relationshipsMap.values());
    } catch (error) {
      logger.error('Erro ao buscar relacionamentos:', error);
      return [];
    }
  },

  /**
   * Limpa o cache
   */
  clearCache: (pattern?: string): void => {
    semanticCache.clear();
  },

  /**
   * Obtém estatísticas do cache
   */
  getCacheStats: () => {
    return semanticCache.getStats();
  },
};