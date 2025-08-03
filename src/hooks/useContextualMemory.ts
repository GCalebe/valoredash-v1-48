import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/utils/logger';
import { N8nChatMemory, SemanticEntity, EntityRelationship } from '@/types/memory';

interface ContextSummary {
  short_term_count: number;
  medium_term_count: number;
  long_term_count: number;
  total_memories: number;
  entities: SemanticEntity[];
  relationships: EntityRelationship[];
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
  updateImportance: (memoryId: number, importance: number) => Promise<boolean>;
  generateSummary: () => Promise<string>;
  clearCache: (pattern?: string) => void;
}

/**
 * Hook para gerenciar memória contextual - Simplificado durante unificação
 */
export function useContextualMemory(options: any): UseContextualMemoryResult {
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