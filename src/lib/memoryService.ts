import { logger } from '@/utils/logger';

/**
 * Serviço de memória - Simplificado durante unificação
 */
export const memoryService = {
  /**
   * Obtém todas as memórias - Desabilitado temporariamente
   */
  getAllMemories: async (sessionId: string, useCache = true): Promise<any[]> => {
    logger.info('memoryService: Funcionalidade desabilitada durante unificação');
    return [];
  },

  /**
   * Busca memórias por sessão - Desabilitado temporariamente
   */
  getMemoriesBySession: async (
    sessionId: string,
    memoryType?: any,
    limit = 50,
    useCache = true
  ): Promise<any[]> => {
    logger.info('memoryService: Funcionalidade desabilitada durante unificação');
    return [];
  },

  /**
   * Armazena uma nova memória - Desabilitado temporariamente
   */
  storeMemory: async (memory: any): Promise<any> => {
    logger.info('memoryService: Armazenamento de memória desabilitado durante unificação');
    return null;
  },

  /**
   * Busca memórias por importância - Desabilitado temporariamente
   */
  getMemoriesByImportance: async (
    sessionId: string,
    minImportance = 3,
    useCache = true
  ): Promise<any[]> => {
    logger.info('memoryService: Busca por importância desabilitada durante unificação');
    return [];
  },

  /**
   * Limpa o cache
   */
  clearCache: (pattern?: string): void => {
    logger.info('memoryService: Limpeza de cache desabilitada durante unificação');
  },

  /**
   * Obtém estatísticas do cache
   */
  getCacheStats: () => {
    logger.info('memoryService: Estatísticas de cache desabilitadas durante unificação');
    return {};
  },
};