import { supabase } from './supabase';
import { MemoryCache } from './memoryCache';
import { logger } from '@/utils/logger';
import { N8nChatMemory, SemanticEntity, EntityRelationship } from '@/types/memory';

// Cache dedicado para memória semântica
const semanticCache = new MemoryCache({
  maxSize: 1000,
  defaultTTL: 1000 * 60 * 30, // 30 minutos
});

/**
 * Serviço otimizado para gerenciar memória semântica
 * Inclui suporte a busca por similaridade e cache
 */
export const semanticMemoryService = {
  /**
   * Armazena uma nova memória semântica
   */
  storeSemanticMemory: async (memory: Partial<N8nChatMemory>): Promise<N8nChatMemory | null> => {
    try {
      // Garantir que os campos obrigatórios estejam presentes
      if (!memory.session_id || !memory.message) {
        throw new Error('session_id e message são obrigatórios');
      }

      // Definir tipo de memória como semântica
      const semanticMemory = {
        ...memory,
        memory_type: 'semantic',
        memory_level: memory.memory_level || 'medium_term',
        expiration_date: memory.expiration_date || new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 dias por padrão
        importance: memory.importance || 5, // Importância média por padrão
      };

      // Converter objetos para JSON strings
      const memoryToInsert = {
        ...semanticMemory,
        entities: semanticMemory.entities ? JSON.stringify(semanticMemory.entities) : null,
        relationships: semanticMemory.relationships ? JSON.stringify(semanticMemory.relationships) : null,
        context: semanticMemory.context ? JSON.stringify(semanticMemory.context) : null,
        metadata: semanticMemory.metadata ? JSON.stringify(semanticMemory.metadata) : null,
      };

      // Inserir no banco de dados
      const { data, error } = await supabase
        .from('n8n_chat_memory')
        .insert(memoryToInsert)
        .select()
        .single();

      if (error) throw error;

      // Invalidar caches relacionados
      semanticCache.delete(`semantic_${memory.session_id}`);
      semanticCache.delete(`entities_${memory.session_id}`);
      
      // Se houver entidades, invalidar caches específicos
      if (memory.entities && Array.isArray(memory.entities)) {
        memory.entities.forEach((entity: SemanticEntity) => {
          semanticCache.delete(`entity_${memory.session_id}_${entity.name}`);
        });
      }

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

      // Verificar cache
      if (useCache) {
        const cachedMemories = semanticCache.get<N8nChatMemory[]>(cacheKey);
        if (cachedMemories) return cachedMemories;
      }

      // Buscar do banco de dados
      const { data, error } = await supabase
        .from('n8n_chat_memory')
        .select('*')
        .eq('session_id', sessionId)
        .eq('memory_type', 'semantic')
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
        semanticCache.set(cacheKey, memories);
      }

      return memories;
    } catch (error) {
      logger.error('Erro ao buscar memórias semânticas:', error);
      return [];
    }
  },

  /**
   * Busca entidades semânticas por sessão
   */
  getEntities: async (sessionId: string, useCache = true): Promise<SemanticEntity[]> => {
    try {
      const cacheKey = `entities_${sessionId}`;

      // Verificar cache
      if (useCache) {
        const cachedEntities = semanticCache.get<SemanticEntity[]>(cacheKey);
        if (cachedEntities) return cachedEntities;
      }

      // Buscar memórias semânticas
      const memories = await semanticMemoryService.getSemanticMemories(sessionId, useCache);

      // Extrair entidades únicas
      const entitiesMap = new Map<string, SemanticEntity>();
      
      memories.forEach(memory => {
        if (memory.entities && Array.isArray(memory.entities)) {
          memory.entities.forEach((entity: SemanticEntity) => {
            // Usar o nome como chave para garantir unicidade
            if (entity.name && !entitiesMap.has(entity.name)) {
              entitiesMap.set(entity.name, entity);
            }
          });
        }
      });

      const entities = Array.from(entitiesMap.values());

      // Armazenar no cache
      if (useCache) {
        semanticCache.set(cacheKey, entities);
      }

      return entities;
    } catch (error) {
      logger.error('Erro ao buscar entidades:', error);
      return [];
    }
  },

  /**
   * Busca memórias por entidade específica
   */
  getMemoriesByEntity: async (sessionId: string, entityName: string, useCache = true): Promise<N8nChatMemory[]> => {
    try {
      const cacheKey = `entity_${sessionId}_${entityName}`;

      // Verificar cache
      if (useCache) {
        const cachedMemories = semanticCache.get<N8nChatMemory[]>(cacheKey);
        if (cachedMemories) return cachedMemories;
      }

      // Buscar do banco de dados usando operador de consulta JSON
      const { data, error } = await supabase
        .from('n8n_chat_memory')
        .select('*')
        .eq('session_id', sessionId)
        .eq('memory_type', 'semantic')
        .filter('entities', 'cs', `{"name":"${entityName}"}`);

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
        semanticCache.set(cacheKey, memories);
      }

      return memories;
    } catch (error) {
      logger.error('Erro ao buscar memórias por entidade:', error);
      return [];
    }
  },

  /**
   * Busca relacionamentos entre entidades
   */
  getRelationships: async (sessionId: string, useCache = true): Promise<EntityRelationship[]> => {
    try {
      const cacheKey = `relationships_${sessionId}`;

      // Verificar cache
      if (useCache) {
        const cachedRelationships = semanticCache.get<EntityRelationship[]>(cacheKey);
        if (cachedRelationships) return cachedRelationships;
      }

      // Buscar memórias semânticas
      const memories = await semanticMemoryService.getSemanticMemories(sessionId, useCache);

      // Extrair relacionamentos únicos
      const relationshipsMap = new Map<string, EntityRelationship>();
      
      memories.forEach(memory => {
        if (memory.relationships && Array.isArray(memory.relationships)) {
          memory.relationships.forEach((relationship: EntityRelationship) => {
            // Criar chave única para o relacionamento
            const key = `${relationship.source}_${relationship.relation}_${relationship.target}`;
            if (!relationshipsMap.has(key)) {
              relationshipsMap.set(key, relationship);
            }
          });
        }
      });

      const relationships = Array.from(relationshipsMap.values());

      // Armazenar no cache
      if (useCache) {
        semanticCache.set(cacheKey, relationships);
      }

      return relationships;
    } catch (error) {
      logger.error('Erro ao buscar relacionamentos:', error);
      return [];
    }
  },

  /**
   * Busca memórias semânticas por similaridade de texto
   * Implementação inicial usando busca por palavras-chave
   * Futuramente pode ser substituída por busca vetorial
   */
  searchMemoriesBySimilarity: async (
    sessionId: string,
    query: string,
    limit = 10,
    useCache = false
  ): Promise<N8nChatMemory[]> => {
    try {
      // Não usar cache para buscas por similaridade para garantir resultados atualizados
      
      // Extrair palavras-chave da consulta (remover palavras comuns)
      const stopWords = ['a', 'o', 'e', 'de', 'da', 'do', 'em', 'para', 'com', 'um', 'uma'];
      const keywords = query
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.includes(word));
      
      if (keywords.length === 0) {
        return [];
      }
      
      // Construir consulta de texto usando operador de texto do PostgreSQL
      const searchQuery = keywords.join(' | '); // Operador OR
      
      // Buscar do banco de dados
      const { data, error } = await supabase
        .from('n8n_chat_memory')
        .select('*')
        .eq('session_id', sessionId)
        .eq('memory_type', 'semantic')
        .textSearch('message', searchQuery, {
          type: 'plain',
          config: 'english'
        })
        .limit(limit);

      if (error) throw error;

      // Converter strings JSON para objetos
      const memories: N8nChatMemory[] = data.map(memory => ({
        ...memory,
        entities: memory.entities ? JSON.parse(memory.entities) : null,
        relationships: memory.relationships ? JSON.parse(memory.relationships) : null,
        context: memory.context ? JSON.parse(memory.context) : null,
        metadata: memory.metadata ? JSON.parse(memory.metadata) : null,
      }));

      return memories;
    } catch (error) {
      logger.error('Erro ao buscar memórias por similaridade:', error);
      return [];
    }
  },

  /**
   * Atualiza a importância de uma memória semântica
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
        semanticCache.delete(`semantic_${memoryData.session_id}`);
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
        .eq('memory_type', 'semantic')
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
        semanticCache.delete(`semantic_${sessionId}`);
        semanticCache.delete(`entities_${sessionId}`);
      });

      return idsToRemove.length;
    } catch (error) {
      logger.error('Erro ao remover memórias expiradas:', error);
      return 0;
    }
  },

  /**
   * Limpa o cache de memória semântica
   */
  clearCache: (pattern?: string): void => {
    if (pattern) {
      semanticCache.deletePattern(pattern);
    } else {
      semanticCache.clear();
    }
  },

  /**
   * Obtém estatísticas do cache
   */
  getCacheStats: (): { hits: number; misses: number; size: number } => {
    return {
      hits: semanticCache.getStats().hits,
      misses: semanticCache.getStats().misses,
      size: semanticCache.size(),
    };
  },
};