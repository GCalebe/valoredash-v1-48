import { useState, useEffect, useCallback } from 'react';
import { episodicMemoryService } from '@/lib/episodicMemoryService';
import { N8nChatMemory, EpisodicMemory, Memory } from '@/types/memory';
import { logger } from '@/utils/logger';

interface UseEpisodicMemoryOptions {
  sessionId: string;
  useCache?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseEpisodicMemoryResult {
  memories: Memory[];
  timeline: EpisodicMemory[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  getMemoriesByPeriod: (startDate: string, endDate: string) => Promise<Memory[]>;
  storeMemory: (memory: Partial<N8nChatMemory>) => Promise<N8nChatMemory | null>;
  updateImportance: (memoryId: number, importance: number) => Promise<boolean>;
  clearCache: (pattern?: string) => void;
}

/**
 * Hook para gerenciar memória episódica com suporte a cache e linha do tempo
 */
export function useEpisodicMemory({
  sessionId,
  useCache = true,
  autoRefresh = false,
  refreshInterval = 30000, // 30 segundos
}: UseEpisodicMemoryOptions): UseEpisodicMemoryResult {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [timeline, setTimeline] = useState<EpisodicMemory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Função para carregar todos os dados episódicos
  const loadEpisodicData = useCallback(async () => {
    if (!sessionId) return;

    try {
      setLoading(true);

      // Carregar memórias e linha do tempo em paralelo
      const [memoriesData, timelineData] = await Promise.all([
        episodicMemoryService.getEpisodicMemories(sessionId, 50, useCache),
        episodicMemoryService.generateTimeline(sessionId, useCache),
      ]);

      // Convert N8nChatMemory to Memory format
      const convertedMemories: Memory[] = memoriesData.map(item => ({
        id: item.id,
        message: typeof item.message === 'string' ? item.message : JSON.stringify(item.message),
        memory_type: item.memory_type || 'episodic',
        created_at: item.created_at || new Date().toISOString(),
        importance: item.importance,
        entities: item.entities,
        context: item.context
      }));

      setMemories(convertedMemories);
      setTimeline(timelineData);
      setError(null);
    } catch (err) {
      logger.error('Erro ao carregar dados episódicos:', err);
      setError(err instanceof Error ? err : new Error('Erro ao carregar dados episódicos'));
    } finally {
      setLoading(false);
    }
  }, [sessionId, useCache]);

  // Função para buscar memórias por período
  const getMemoriesByPeriod = useCallback(
    async (startDate: string, endDate: string): Promise<Memory[]> => {
      if (!sessionId) return [];

      try {
        const results = await episodicMemoryService.getEpisodicMemoriesByPeriod(
          sessionId,
          startDate,
          endDate,
          useCache
        );
        
        // Convert N8nChatMemory to Memory format
        return results.map(item => ({
          id: item.id,
          message: typeof item.message === 'string' ? item.message : JSON.stringify(item.message),
          memory_type: item.memory_type || 'episodic',
          created_at: item.created_at || new Date().toISOString(),
          importance: item.importance,
          entities: item.entities,
          context: item.context
        }));
      } catch (err) {
        logger.error('Erro ao buscar memórias por período:', err);
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
        const newMemory = await episodicMemoryService.storeEpisodicMemory({
          ...memory,
          session_id: sessionId,
        });

        if (newMemory) {
          // Convert and update local state
          const convertedMemory: Memory = {
            id: newMemory.id,
            message: typeof newMemory.message === 'string' ? newMemory.message : JSON.stringify(newMemory.message),
            memory_type: newMemory.memory_type || 'episodic',
            created_at: newMemory.created_at || new Date().toISOString(),
            importance: newMemory.importance,
            entities: newMemory.entities,
            context: newMemory.context
          };
          
          setMemories(prev => [convertedMemory, ...prev]);
          
          // Recarregar linha do tempo
          const updatedTimeline = await episodicMemoryService.generateTimeline(sessionId, false);
          setTimeline(updatedTimeline);
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
        const success = await episodicMemoryService.updateImportance(memoryId, importance);

        if (success) {
          // Atualizar estado local
          setMemories(prev =>
            prev.map(memory =>
              memory.id === memoryId ? { ...memory, importance } : memory
            )
          );
          
          // Recarregar linha do tempo
          const updatedTimeline = await episodicMemoryService.generateTimeline(sessionId, false);
          setTimeline(updatedTimeline);
        }

        return success;
      } catch (err) {
        logger.error('Erro ao atualizar importância:', err);
        return false;
      }
    },
    [sessionId]
  );

  // Função para limpar cache
  const clearCache = useCallback((pattern?: string): void => {
    episodicMemoryService.clearCache(pattern);
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    loadEpisodicData();
  }, [loadEpisodicData]);

  // Configurar atualização automática se habilitada
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const intervalId = setInterval(() => {
      loadEpisodicData();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, loadEpisodicData]);

  return {
    memories,
    timeline,
    loading,
    error,
    refresh: loadEpisodicData,
    getMemoriesByPeriod,
    storeMemory,
    updateImportance,
    clearCache,
  };
}