import { logger } from '@/utils/logger';
import { SemanticEntity, EntityRelationship } from '@/types/memory';

/**
 * Serviço para gerenciar memória semântica - Simplificado durante unificação
 */
export const semanticMemoryService = {
  storeSemanticMemory: async (memory: unknown): Promise<null> => {
    logger.info('semanticMemoryService: Funcionalidade desabilitada durante unificação');
    return null;
  },

  getSemanticMemories: async (sessionId: string, useCache = true): Promise<SemanticEntity[]> => {
    logger.info('semanticMemoryService: Funcionalidade desabilitada durante unificação');
    return [];
  },

  searchBySimilarity: async (query: string, limit = 10): Promise<SemanticEntity[]> => {
    logger.info('semanticMemoryService: Busca por similaridade desabilitada durante unificação');
    return [];
  },

  clearCache: (pattern?: string): void => {
    logger.info('semanticMemoryService: Limpeza de cache desabilitada durante unificação');
  },
};