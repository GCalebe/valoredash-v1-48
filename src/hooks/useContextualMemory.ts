import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/utils/logger';

interface ContextSummary {
  short_term_count: number;
  medium_term_count: number;
  long_term_count: number;
  total_memories: number;
  entities: unknown[];
  relationships: unknown[];
  context: Record<string, unknown>;
  most_important: unknown | null;
}

interface UseContextualMemoryResult {
  memories: unknown[];
  shortTermMemories: unknown[];
  mediumTermMemories: unknown[];
  longTermMemories: unknown[];
  contextSummary: ContextSummary;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  updateImportance: (memoryId: number, importance: number) => Promise<boolean>;
  generateSummary: () => Promise<string>;
  clearCache: (pattern?: string) => void;
}

/**
 * Hook para gerenciar memória contextual - Simplificado durante unificação
 */
export function useContextualMemory(options: unknown): UseContextualMemoryResult {
  const [memories, setMemories] = useState<unknown[]>([]);
  const [shortTermMemories, setShortTermMemories] = useState<unknown[]>([]);
  const [mediumTermMemories, setMediumTermMemories] = useState<unknown[]>([]);
  const [longTermMemories, setLongTermMemories] = useState<unknown[]>([]);
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
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const loadContextualData = useCallback(async () => {
    logger.info('useContextualMemory: Funcionalidade desabilitada durante unificação');
    setLoading(false);
  }, []);

  const updateImportance = useCallback(async (memoryId: number, importance: number): Promise<boolean> => {
    logger.info('useContextualMemory: Atualização de importância desabilitada durante unificação');
    return false;
  }, []);

  const generateSummary = useCallback(async (): Promise<string> => {
    logger.info('useContextualMemory: Geração de resumo desabilitada durante unificação');
    return 'Resumo desabilitado durante unificação';
  }, []);

  const clearCache = useCallback((pattern?: string): void => {
    logger.info('useContextualMemory: Limpeza de cache desabilitada durante unificação');
  }, []);

  useEffect(() => {
    loadContextualData();
  }, [loadContextualData]);

  return {
    memories,
    shortTermMemories,
    mediumTermMemories,
    longTermMemories,
    contextSummary,
    loading,
    error,
    refresh: loadContextualData,
    updateImportance,
    generateSummary,
    clearCache,
  };
}