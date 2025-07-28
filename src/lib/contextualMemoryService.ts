import { logger } from '@/utils/logger';
import { N8nChatMemory } from '@/types/memory';

/**
 * Serviço para gerenciar memória contextual - Simplificado para nova estrutura
 */
export const contextualMemoryService = {
  /**
   * Armazena uma memória contextual - Desabilitado temporariamente
   */
  storeContextualMemory: async (memory: unknown): Promise<null> => {
    logger.info('contextualMemoryService: Funcionalidade desabilitada durante unificação');
    return null;
  },
  
  /**
   * Obtém todas as memórias contextuais - Desabilitado temporariamente
   */
  getContextualMemories: async (sessionId: string, useCache = true): Promise<N8nChatMemory[]> => {
    logger.info('contextualMemoryService: Funcionalidade desabilitada durante unificação');
    return [];
  },
  
  /**
   * Limpa o cache
   */
  clearCache: (pattern?: string): void => {
    logger.info('contextualMemoryService: Cache clearing desabilitado durante unificação');
  },
};