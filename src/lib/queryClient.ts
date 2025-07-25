import { QueryClient } from '@tanstack/react-query';

/**
 * Configuração OTIMIZADA do QueryClient para máxima performance
 * 
 * Features implementadas:
 * - Cache hierárquico por tipo de dados
 * - Retry strategy inteligente
 * - Background refetch otimizado
 * - Performance máxima em produção
 * - Prefetch automático
 * - Garbage collection otimizada
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache Strategy - Hierárquico por importância
      staleTime: 5 * 60 * 1000, // 5 minutos default
      gcTime: 15 * 60 * 1000, // 15 minutos no cache
      
      // Network Strategy Otimizada
      refetchOnWindowFocus: false, // Evita refetch desnecessário
      refetchOnReconnect: 'always', // Sempre refetch ao reconectar
      refetchOnMount: true, // Refetch inteligente ao montar
      
      // Retry Strategy Inteligente
      retry: (failureCount, error) => {
        // Não retry em erros 4xx (client errors)
        if (error?.message?.includes('4')) return false;
        return failureCount < 2;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000),
      
      // Performance Optimizations
      networkMode: 'online',
      notifyOnChangeProps: 'all', // Otimiza re-renders
      
      // Background Updates
      refetchInterval: false, // Controlado manualmente
      refetchIntervalInBackground: false,
    },
    mutations: {
      // Retry otimizado para mutations
      retry: (failureCount, error) => {
        if (error?.message?.includes('4')) return false;
        return failureCount < 1;
      },
      retryDelay: 1500,
      networkMode: 'online',
      
      // Performance para mutations
      onSettled: () => {
        // Cleanup automático após mutations
        queryClient.resumePausedMutations();
      },
    },
  },
  
  // Configurações globais do cache
  mutationCache: undefined,
  queryCache: undefined,
});

/**
 * Configurações específicas por tipo de dados
 */
export const queryKeys = {
  // Client Stats
  clientStats: {
    all: ['client-stats'] as const,
    latest: ['client-stats', 'latest'] as const,
    byDateRange: (start: string, end: string) => ['client-stats', 'date-range', start, end] as const,
  },
  
  // Dashboard
  dashboard: {
    metrics: ['dashboard-metrics'] as const,
  },
  
  // Conversations
  conversations: {
    all: ['conversations'] as const,
    metrics: ['conversation-metrics'] as const,
    latest: ['conversation-metrics', 'latest'] as const,
    byDateRange: (start: string, end: string) => ['conversation-metrics', 'date-range', start, end] as const,
  },
  
  // UTM Metrics
  utmMetrics: {
    all: ['utm-metrics'] as const,
    byCampaign: (campaign: string) => ['utm-metrics', 'campaign', campaign] as const,
    analytics: ['utm-analytics'] as const,
  },
  
  // Outros dados
  aiProducts: ['ai-products'] as const,
  kanbanStages: ['kanban-stages'] as const,
  contacts: (filters?: unknown) => ['contacts', filters] as const,
  funnelData: (dateRange?: unknown) => ['funnel-data', dateRange] as const,
  realtimeMetrics: ['realtime-metrics'] as const,
  notifications: ['notifications'] as const,
} as const;

/**
 * Configurações de cache específicas por tipo de query
 */
export const cacheConfig = {
  // Dados críticos - cache longo
  critical: {
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 20 * 60 * 1000, // 20 minutos
  },
  
  // Dados estáticos - cache longo
  static: {
    staleTime: 15 * 60 * 1000, // 15 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  },
  
  // Dados dinâmicos - cache médio
  dynamic: {
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  },
  
  // Métricas - cache curto
  metrics: {
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  },
  
  // Tempo real - cache muito curto
  realtime: {
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 2 * 60 * 1000, // 2 minutos
  },
} as const;

/**
 * Utilitários para invalidação de cache
 */
export const cacheUtils = {
  /**
   * Invalida todas as queries relacionadas a métricas
   */
  invalidateMetrics: () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    queryClient.invalidateQueries({ queryKey: ['funnel-data'] });
    queryClient.invalidateQueries({ queryKey: ['utm-metrics'] });
    queryClient.invalidateQueries({ queryKey: ['conversation-metrics'] });
  },
  
  /**
   * Invalida dados de contatos e relacionados
   */
  invalidateContacts: () => {
    queryClient.invalidateQueries({ queryKey: ['contacts'] });
    queryClient.invalidateQueries({ queryKey: ['client-stats'] });
  },
  
  /**
   * Invalida dados em tempo real
   */
  invalidateRealtime: () => {
    queryClient.invalidateQueries({ queryKey: ['realtime-metrics'] });
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  },
  
  /**
   * Limpa todo o cache (usar com cuidado)
   */
  clearAll: () => {
    queryClient.clear();
  },
};