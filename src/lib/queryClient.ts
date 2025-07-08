import { QueryClient } from '@tanstack/react-query';

/**
 * Configuração do QueryClient para otimização de performance
 * 
 * Configurações otimizadas para:
 * - Cache inteligente com TTL apropriado
 * - Retry strategy balanceada
 * - Background refetch controlado
 * - Performance em produção
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache Strategy
      staleTime: 5 * 60 * 1000, // 5 minutos - dados considerados frescos
      gcTime: 10 * 60 * 1000, // 10 minutos - tempo no cache após unused
      
      // Network Strategy
      refetchOnWindowFocus: false, // Evita refetch desnecessário
      refetchOnReconnect: true, // Refetch quando reconectar
      refetchOnMount: true, // Refetch ao montar se stale
      
      // Retry Strategy
      retry: 2, // Máximo 2 tentativas
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      
      // Performance
      networkMode: 'online', // Só executa com conexão
    },
    mutations: {
      // Retry para mutations críticas
      retry: 1,
      retryDelay: 1000,
      networkMode: 'online',
    },
  },
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
  contacts: (filters?: any) => ['contacts', filters] as const,
  funnelData: (dateRange?: any) => ['funnel-data', dateRange] as const,
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