import { logger } from '@/utils/logger';

/**
 * Serviço para gerenciar memória semântica - Simplificado durante unificação
 */
export const semanticMemoryService = {
  storeSemanticMemory: async (memory: unknown): Promise<unknown> => {
    logger.info('semanticMemoryService: Funcionalidade desabilitada durante unificação');
    return null;
  },

  getSemanticMemories: async (sessionId: string, useCache = true): Promise<any[]> => {
    logger.info('semanticMemoryService: Funcionalidade desabilitada durante unificação');
    return [];
  },

  searchBySimilarity: async (query: string, limit = 10): Promise<any[]> => {
    logger.info('semanticMemoryService: Busca por similaridade desabilitada durante unificação');
    return [];
  },

  clearCache: (pattern?: string): void => {
    logger.info('semanticMemoryService: Limpeza de cache desabilitada durante unificação');
  },
};