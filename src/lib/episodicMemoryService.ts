import { supabase } from '@/integrations/supabase/client';
import { MemoryCache } from './memoryCache';
import { N8nChatMemory, MemoryType, MemoryLevel } from '@/types/memory';
import { logger } from '@/utils/logger';

// Simplified cache
const episodicCache = new MemoryCache({ maxSize: 50 });

export const episodicMemoryService = {
  /**
   * Armazena uma memória episódica
   */
  storeEpisodicMemory: async (
    memory: Partial<N8nChatMemory>
  ): Promise<N8nChatMemory | null> => {
    try {
      const newMemory: N8nChatMemory = {
        id: Math.floor(Math.random() * 1000),
        sessionId: memory.sessionId || 'mock-session',
        type: memory.type || MemoryType.MESSAGE,
        level: memory.level || MemoryLevel.SHORT_TERM,
        importance: memory.importance || Math.random() * 10,
        content: memory.content || 'Mock memory content',
        timestamp: new Date().toISOString(),
        metadata: memory.metadata || {},
      };
      console.log('Mock storeEpisodicMemory called', { memory });
      episodicCache.set(newMemory.id.toString(), newMemory);
      return newMemory;
    } catch (err) {
      logger.error('Erro ao armazenar memória episódica:', err);
      return null;
    }
  },

  /**
   * Obtém memórias episódicas de uma sessão
   */
  getEpisodicMemories: async (
    sessionId: string,
    limit = 50,
    useCache = true
  ): Promise<N8nChatMemory[]> => {
    try {
      if (useCache) {
        const cached = episodicCache.get(sessionId);
        if (cached) return cached as N8nChatMemory[];
      }
      // Mock implementation
      const mockMemories: N8nChatMemory[] = Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
        id: i,
        sessionId,
        type: MemoryType.MESSAGE,
        level: MemoryLevel.SHORT_TERM,
        importance: Math.random() * 10,
        content: `Mock memory ${i} for session ${sessionId}`,
        timestamp: new Date().toISOString(),
        metadata: {},
      }));
      console.log('Mock getEpisodicMemories called', { sessionId, limit, useCache });
      if(useCache) episodicCache.set(sessionId, mockMemories);
      return mockMemories;
    } catch (err) {
      logger.error('Erro ao buscar memórias episódicas:', err);
      return [];
    }
  },

  /**
   * Busca memórias por importância
   */
  getMemoriesByImportance: async (
    sessionId: string,
    minImportance = 3,
    useCache = true
  ): Promise<N8nChatMemory[]> => {
    try {
      const cacheKey = `${sessionId}-importance-${minImportance}`;
      if (useCache) {
        const cached = episodicCache.get(cacheKey);
        if (cached) return cached as N8nChatMemory[];
      }
      // Mock implementation
      const mockMemories: N8nChatMemory[] = Array.from({ length: 3 }, (_, i) => ({
        id: 100 + i,
        sessionId,
        type: MemoryType.MESSAGE,
        level: MemoryLevel.MEDIUM_TERM,
        importance: minImportance + Math.random() * (10 - minImportance),
        content: `Mock memory with importance > ${minImportance}`,
        timestamp: new Date().toISOString(),
        metadata: { source: 'importance-filter' },
      }));
      console.log('Mock getMemoriesByImportance called', { sessionId, minImportance, useCache });
      if(useCache) episodicCache.set(cacheKey, mockMemories);
      return mockMemories;
    } catch (err) {
      logger.error('Erro ao buscar memórias por importância:', err);
      return [];
    }
  },

  /**
   * Atualiza uma memória episódica
   */
  updateEpisodicMemory: async (
    memoryId: number,
    updates: Partial<N8nChatMemory>
  ): Promise<boolean> => {
    try {
      const cachedMemory = episodicCache.get(memoryId.toString()) as N8nChatMemory;
      if (cachedMemory) {
        const updatedMemory = { ...cachedMemory, ...updates };
        episodicCache.set(memoryId.toString(), updatedMemory);
      }
      console.log('Mock updateEpisodicMemory called', { memoryId, updates });
      return Math.random() > 0.1; // Simulate a small chance of failure
    } catch (err) {
      logger.error('Erro ao atualizar memória episódica:', err);
      return false;
    }
  },

  /**
   * Remove memórias episódicas expiradas
   */
  removeExpiredMemories: async (): Promise<number> => {
    try {
      // Mock implementation
      const removedCount = Math.floor(Math.random() * 5);
      console.log('Mock removeExpiredMemories called');
      return removedCount;
    } catch (err) {
      logger.error('Erro ao remover memórias episódicas expiradas:', err);
      return 0;
    }
  },

  /**
   * Limpa o cache de memória episódica
   */
  clearCache: (sessionId?: string): void => {
    console.log('Mock clearCache called', { sessionId });
    episodicCache.clear();
  },

  /**
   * Gera linha do tempo episódica
   */
  generateTimeline: async (sessionId: string, useCache = true): Promise<unknown[]> => {
    try {
      // Mock implementation
      const timeline = [
        { event: 'User signed up', timestamp: new Date(Date.now() - 86400000).toISOString() },
        { event: 'First interaction', timestamp: new Date().toISOString() },
      ];
      console.log('Mock generateTimeline called', { sessionId, useCache });
      return timeline;
    } catch (err) {
      logger.error('Erro ao gerar linha do tempo:', err);
      return [];
    }
  },

  /**
   * Busca memórias por período
   */
  getEpisodicMemoriesByPeriod: async (
    sessionId: string,
    startDate: string,
    endDate: string,
    useCache = true
  ): Promise<N8nChatMemory[]> => {
    try {
      // Mock implementation
      const mockMemories: N8nChatMemory[] = [
        {
          id: 201,
          sessionId,
          type: MemoryType.MESSAGE,
          level: MemoryLevel.LONG_TERM,
          importance: 8,
          content: 'Memory from a specific period',
          timestamp: startDate,
          metadata: { period: 'custom' },
        }
      ];
      console.log('Mock getEpisodicMemoriesByPeriod called', { sessionId, startDate, endDate, useCache });
      return mockMemories;
    } catch (err) {
      logger.error('Erro ao buscar memórias por período:', err);
      return [];
    }
  },

  /**
   * Atualiza importância de uma memória
   */
  updateImportance: async (memoryId: number, importance: number): Promise<boolean> => {
    try {
      // Mock implementation
      console.log('Mock updateImportance called', { memoryId, importance });
      return Math.random() > 0.1;
    } catch (err) {
      logger.error('Erro ao atualizar importância:', err);
      return false;
    }
  },

  /**
   * Gera estatísticas da memória episódica
   */
  getMemoryStats: async (sessionId: string): Promise<unknown> => {
    try {
      // Mock implementation
      console.log('Mock getMemoryStats called', { sessionId });
      return {
        total: Math.floor(Math.random() * 100),
        byImportance: { 
          low: Math.floor(Math.random() * 30),
          medium: Math.floor(Math.random() * 50),
          high: Math.floor(Math.random() * 20) 
        },
        byLevel: { 
          short_term: Math.floor(Math.random() * 60),
          medium_term: Math.floor(Math.random() * 30),
          long_term: Math.floor(Math.random() * 10)
        },
        mostRecent: { id: 1, content: 'Last memory', timestamp: new Date().toISOString() },
        mostImportant: { id: 2, content: 'Most important memory', importance: 9.8 },
      };
    } catch (err) {
      logger.error('Erro ao gerar estatísticas da memória:', err);
      return {
        total: 0,
        byImportance: { low: 0, medium: 0, high: 0 },
        byLevel: { short_term: 0, medium_term: 0, long_term: 0 },
        mostRecent: null,
        mostImportant: null,
      };
    }
  },
};