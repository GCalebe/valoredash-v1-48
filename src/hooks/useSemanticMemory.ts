import { useState, useEffect, useCallback } from 'react';
import { semanticMemoryService } from '@/lib/semanticMemoryService';
import { N8nChatMemory, SemanticEntity, EntityRelationship } from '@/types/memory';
import { logger } from '@/utils/logger';

interface UseSemanticMemoryOptions {
  sessionId: string;
  useCache?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseSemanticMemoryResult {
  memories: N8nChatMemory[];
  entities: SemanticEntity[];
  relationships: EntityRelationship[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  searchBySimilarity: (query: string, limit?: number) => Promise<N8nChatMemory[]>;
  searchByEntity: (entityName: string) => Promise<N8nChatMemory[]>;
  storeMemory: (memory: Partial<N8nChatMemory>) => Promise<N8nChatMemory | null>;
  updateImportance: (memoryId: number, importance: number) => Promise<boolean>;
  clearCache: (pattern?: string) => void;
}

/**
 * Hook para gerenciar memória semântica com suporte a cache e busca
 */
export function useSemanticMemory({
  sessionId,
  useCache = true,
  autoRefresh = false,
  refreshInterval = 30000, // 30 segundos
}: UseSemanticMemoryOptions): UseSemanticMemoryResult {
  const [memories, setMemories] = useState<N8nChatMemory[]>([]);
  const [entities, setEntities] = useState<SemanticEntity[]>([]);
  const [relationships, setRelationships] = useState<EntityRelationship[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Função para carregar todos os dados semânticos
  const loadSemanticData = useCallback(async () => {
    if (!sessionId) return;

    try {
      setLoading(true);

      // Carregar memórias, entidades e relacionamentos em paralelo
      const [memoriesData, entitiesData, relationshipsData] = await Promise.all([
        semanticMemoryService.getSemanticMemories(sessionId, useCache),
        semanticMemoryService.getEntities(sessionId, useCache),
        semanticMemoryService.getRelationships(sessionId, useCache),
      ]);

      setMemories(memoriesData);
      setEntities(entitiesData);
      setRelationships(relationshipsData);
      setError(null);
    } catch (err) {
      logger.error('Erro ao carregar dados semânticos:', err);
      setError(err instanceof Error ? err : new Error('Erro ao carregar dados semânticos'));
    } finally {
      setLoading(false);
    }
  }, [sessionId, useCache]);

  // Função para buscar memórias por similaridade
  const searchBySimilarity = useCallback(
    async (query: string, limit = 10): Promise<N8nChatMemory[]> => {
      if (!sessionId || !query.trim()) return [];

      try {
        return await semanticMemoryService.searchMemoriesBySimilarity(
          sessionId,
          query,
          limit,
          false // Não usar cache para buscas por similaridade
        );
      } catch (err) {
        logger.error('Erro ao buscar memórias por similaridade:', err);
        return [];
      }
    },
    [sessionId]
  );

  // Função para buscar memórias por entidade
  const searchByEntity = useCallback(
    async (entityName: string): Promise<N8nChatMemory[]> => {
      if (!sessionId || !entityName.trim()) return [];

      try {
        return await semanticMemoryService.getMemoriesByEntity(
          sessionId,
          entityName,
          useCache
        );
      } catch (err) {
        logger.error('Erro ao buscar memórias por entidade:', err);
        return [];
      }
    },
    [sessionId, useCache]
  );

  // Função para armazenar nova memória
  const storeMemory = useCallback(
    async (memory: Partial<N8nChatMemory>): Promise<N8nChatMemory | null> => {
      if (!sessionId) return null;

      try {
        const newMemory = await semanticMemoryService.storeSemanticMemory({
          ...memory,
          session_id: sessionId,
        });

        if (newMemory) {
          // Atualizar estado local
          setMemories(prev => [newMemory, ...prev]);

          // Atualizar entidades e relacionamentos se necessário
          if (newMemory.entities) {
            setEntities(prev => {
              const existingNames = new Set(prev.map(e => e.name));
              const newEntities = newMemory.entities?.filter(
                e => e.name && !existingNames.has(e.name)
              ) || [];
              return [...prev, ...newEntities];
            });
          }

          if (newMemory.relationships) {
            setRelationships(prev => {
              const existingKeys = new Set(
                prev.map(r => `${r.source}_${r.relation}_${r.target}`)
              );
              const newRelationships = newMemory.relationships?.filter(r => {
                const key = `${r.source}_${r.relation}_${r.target}`;
                return !existingKeys.has(key);
              }) || [];
              return [...prev, ...newRelationships];
            });
          }
        }

        return newMemory;
      } catch (err) {
        logger.error('Erro ao armazenar memória:', err);
        return null;
      }
    },
    [sessionId]
  );

  // Função para atualizar importância
  const updateImportance = useCallback(
    async (memoryId: number, importance: number): Promise<boolean> => {
      try {
        const success = await semanticMemoryService.updateImportance(memoryId, importance);

        if (success) {
          // Atualizar estado local
          setMemories(prev =>
            prev.map(memory =>
              memory.id === memoryId ? { ...memory, importance } : memory
            )
          );
        }

        return success;
      } catch (err) {
        logger.error('Erro ao atualizar importância:', err);
        return false;
      }
    },
    []
  );

  // Função para limpar cache
  const clearCache = useCallback((pattern?: string): void => {
    semanticMemoryService.clearCache(pattern);
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    loadSemanticData();
  }, [loadSemanticData]);

  // Configurar atualização automática se habilitada
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const intervalId = setInterval(() => {
      loadSemanticData();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, loadSemanticData]);

  return {
    memories,
    entities,
    relationships,
    loading,
    error,
    refresh: loadSemanticData,
    searchBySimilarity,
    searchByEntity,
    storeMemory,
    updateImportance,
    clearCache,
  };
}