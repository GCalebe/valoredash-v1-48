import { useState, useEffect, useCallback } from 'react';
import { contextualMemoryService } from '@/lib/contextualMemoryService';
import { N8nChatMemory } from '@/types/memory';
import { logger } from '@/utils/logger';

interface UseContextualMemoryOptions {
  sessionId: string;
  useCache?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface ContextSummary {
  short_term_count: number;
  medium_term_count: number;
  long_term_count: number;
  total_memories: number;
  entities: any[];
  relationships: any[];
  context: Record<string, any>;
  most_important: N8nChatMemory | null;
}

interface UseContextualMemoryResult {
  memories: N8nChatMemory[];
  shortTermMemories: N8nChatMemory[];
  mediumTermMemories: N8nChatMemory[];
  longTermMemories: N8nChatMemory[];
  contextSummary: ContextSummary;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  storeMemory: (memory: Partial<N8nChatMemory>) => Promise<N8nChatMemory | null>;
  updateImportance: (memoryId: number, importance: number) => Promise<boolean>;
  clearCache: (pattern?: string) => void;
}

/**
 * Hook para gerenciar memória contextual com suporte a cache
 */
export function useContextualMemory({
  sessionId,
  useCache = true,
  autoRefresh = false,
  refreshInterval = 30000, // 30 segundos
}: UseContextualMemoryOptions): UseContextualMemoryResult {
  const [memories, setMemories] = useState<N8nChatMemory[]>([]);
  const [shortTermMemories, setShortTermMemories] = useState<N8nChatMemory[]>([]);
  const [mediumTermMemories, setMediumTermMemories] = useState<N8nChatMemory[]>([]);
  const [longTermMemories, setLongTermMemories] = useState<N8nChatMemory[]>([]);
  const [contextSummary, setContextSummary] = useState<ContextSummary>({
    short_term_count: 0,
    medium_term_count: 0,
    long_term_count: 0,
    total_memories: 0,
    entities: [],
    relationships: [],
    context: {},
    most_important: null,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Função para carregar todos os dados contextuais
  const loadContextualData = useCallback(async () => {
    if (!sessionId) return;

    try {
      setLoading(true);

      // Carregar memórias e resumo do contexto em paralelo
      const [
        allMemories,
        shortTerm,
        mediumTerm,
        longTerm,
        summary,
      ] = await Promise.all([
        contextualMemoryService.getContextualMemories(sessionId, useCache),
        contextualMemoryService.getContextualMemoriesByLevel(sessionId, 'short_term', useCache),
        contextualMemoryService.getContextualMemoriesByLevel(sessionId, 'medium_term', useCache),
        contextualMemoryService.getContextualMemoriesByLevel(sessionId, 'long_term', useCache),
        contextualMemoryService.generateContextSummary(sessionId, useCache),
      ]);

      setMemories(allMemories);
      setShortTermMemories(shortTerm);
      setMediumTermMemories(mediumTerm);
      setLongTermMemories(longTerm);
      setContextSummary(summary);
      setError(null);
    } catch (err) {
      logger.error('Erro ao carregar dados contextuais:', err);
      setError(err instanceof Error ? err : new Error('Erro ao carregar dados contextuais'));
    } finally {
      setLoading(false);
    }
  }, [sessionId, useCache]);

  // Função para armazenar nova memória
  const storeMemory = useCallback(
    async (memory: Partial<N8nChatMemory>): Promise<N8nChatMemory | null> => {
      if (!sessionId) return null;

      try {
        const newMemory = await contextualMemoryService.storeContextualMemory({
          ...memory,
          session_id: sessionId,
          memory_type: 'contextual',
        });

        if (newMemory) {
          // Atualizar estado local
          setMemories(prev => [newMemory, ...prev]);
          
          // Atualizar a lista específica do nível de memória
          if (newMemory.memory_level === 'short_term') {
            setShortTermMemories(prev => [newMemory, ...prev]);
          } else if (newMemory.memory_level === 'medium_term') {
            setMediumTermMemories(prev => [newMemory, ...prev]);
          } else if (newMemory.memory_level === 'long_term') {
            setLongTermMemories(prev => [newMemory, ...prev]);
          }
          
          // Recarregar resumo do contexto
          const updatedSummary = await contextualMemoryService.generateContextSummary(sessionId, false);
          setContextSummary(updatedSummary);
        }

        return newMemory;
      } catch (err) {
        logger.error('Erro ao armazenar memória contextual:', err);
        return null;
      }
    },
    [sessionId]
  );

  // Função para atualizar importância
  const updateImportance = useCallback(
    async (memoryId: number, importance: number): Promise<boolean> => {
      try {
        const success = await contextualMemoryService.updateImportance(memoryId, importance);

        if (success) {
          // Função para atualizar uma lista específica de memórias
          const updateMemoryList = (list: N8nChatMemory[]) => 
            list.map(memory =>
              memory.id === memoryId ? { ...memory, importance } : memory
            );

          // Atualizar todas as listas de memórias
          setMemories(updateMemoryList);
          setShortTermMemories(updateMemoryList);
          setMediumTermMemories(updateMemoryList);
          setLongTermMemories(updateMemoryList);
          
          // Recarregar resumo do contexto
          const updatedSummary = await contextualMemoryService.generateContextSummary(sessionId, false);
          setContextSummary(updatedSummary);
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
    contextualMemoryService.clearCache(pattern);
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    loadContextualData();
  }, [loadContextualData]);

  // Configurar atualização automática se habilitada
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const intervalId = setInterval(() => {
      loadContextualData();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, loadContextualData]);

  return {
    memories,
    shortTermMemories,
    mediumTermMemories,
    longTermMemories,
    contextSummary,
    loading,
    error,
    refresh: loadContextualData,
    storeMemory,
    updateImportance,
    clearCache,
  };
}