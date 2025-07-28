import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/utils/logger';

interface SemanticMemory {
  id: number;
  content: string;
  importance: number;
  timestamp: string;
  sessionId: string;
  metadata?: Record<string, unknown>;
}

interface SemanticEntity {
  id: number;
  name: string;
  type: string;
  confidence: number;
  mentions: number;
}

interface SemanticRelationship {
  id: number;
  sourceEntity: string;
  targetEntity: string;
  relationshipType: string;
  strength: number;
}

interface UseSemanticMemoryOptions {
  sessionId: string;
  useCache?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseSemanticMemoryResult {
  memories: SemanticMemory[];
  entities: SemanticEntity[];
  relationships: SemanticRelationship[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  searchBySimilarity: (query: string, limit?: number) => Promise<SemanticMemory[]>;
  searchByEntity: (entityName: string) => Promise<SemanticMemory[]>;
  storeMemory: (memory: Omit<SemanticMemory, 'id'>) => Promise<SemanticMemory | null>;
  updateImportance: (memoryId: number, importance: number) => Promise<boolean>;
  clearCache: (pattern?: string) => void;
}

/**
 * Hook para gerenciar memória semântica - Simplificado durante unificação
 */
export function useSemanticMemory({
  sessionId,
  useCache = true,
  autoRefresh = false,
  refreshInterval = 30000,
}: UseSemanticMemoryOptions): UseSemanticMemoryResult {
  const [memories, setMemories] = useState<SemanticMemory[]>([]);
  const [entities, setEntities] = useState<SemanticEntity[]>([]);
  const [relationships, setRelationships] = useState<SemanticRelationship[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const loadSemanticData = useCallback(async () => {
    logger.info('useSemanticMemory: Funcionalidade desabilitada durante unificação');
    setLoading(false);
  }, []);

  const searchBySimilarity = useCallback(async (query: string, limit = 10): Promise<SemanticMemory[]> => {
    logger.info('useSemanticMemory: Busca por similaridade desabilitada durante unificação');
    return [];
  }, []);

  const searchByEntity = useCallback(async (entityName: string): Promise<SemanticMemory[]> => {
    logger.info('useSemanticMemory: Busca por entidade desabilitada durante unificação');
    return [];
  }, []);

  const storeMemory = useCallback(async (memory: Omit<SemanticMemory, 'id'>): Promise<SemanticMemory | null> => {
    logger.info('useSemanticMemory: Armazenamento de memória desabilitado durante unificação');
    return null;
  }, []);

  const updateImportance = useCallback(async (memoryId: number, importance: number): Promise<boolean> => {
    logger.info('useSemanticMemory: Atualização de importância desabilitada durante unificação');
    return false;
  }, []);

  const clearCache = useCallback((pattern?: string): void => {
    logger.info('useSemanticMemory: Limpeza de cache desabilitada durante unificação');
  }, []);

  useEffect(() => {
    loadSemanticData();
  }, [loadSemanticData]);

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