import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '../integrations/supabase/types';
import { queryKeys, cacheConfig } from '../lib/queryClient';

type ConversationMetrics = Database['public']['Tables']['conversation_metrics']['Row'];

// Funções de fetch separadas para melhor reutilização
const fetchConversationMetrics = async (): Promise<ConversationMetrics[]> => {
  const { data, error } = await supabase
    .from('conversation_metrics')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

const fetchMetricsByDateRange = async (startDate: string, endDate: string): Promise<ConversationMetrics[]> => {
  const { data, error } = await supabase
    .from('conversation_metrics')
    .select('*')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

const fetchLatestMetrics = async (): Promise<ConversationMetrics[]> => {
  const { data, error } = await supabase
    .from('conversation_metrics')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10); // Últimas 10 métricas

  if (error) throw error;
  return data || [];
};

// Hook principal para métricas de conversação
export const useConversationMetricsQuery = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.conversations.metrics,
    queryFn: fetchConversationMetrics,
    ...cacheConfig.metrics,
  });

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.conversations.metrics });
  };

  return {
    metrics: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch,
    isStale: query.isStale,
    isFetching: query.isFetching,
  };
};

// Hook para métricas por período
export const useMetricsByDateRangeQuery = (startDate: string, endDate: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.conversations.byDateRange(startDate, endDate),
    queryFn: () => fetchMetricsByDateRange(startDate, endDate),
    enabled: enabled && !!startDate && !!endDate,
    ...cacheConfig.dynamic,
  });
};

// Hook para métricas mais recentes (realtime)
export const useLatestConversationMetricsQuery = () => {
  return useQuery({
    queryKey: queryKeys.conversations.latest,
    queryFn: fetchLatestMetrics,
    ...cacheConfig.realtime,
  });
};

// Hook para métricas agregadas (para dashboards)
export const useConversationMetricsAggregated = (dateRange?: { start: string; end: string }) => {
  const { data: metrics, ...query } = useQuery({
    queryKey: dateRange 
      ? queryKeys.conversations.byDateRange(dateRange.start, dateRange.end)
      : queryKeys.conversations.metrics,
    queryFn: dateRange 
      ? () => fetchMetricsByDateRange(dateRange.start, dateRange.end)
      : fetchConversationMetrics,
    ...cacheConfig.metrics,
  });

  // Agregações calculadas
  const aggregated = {
    total: metrics?.length || 0,
    totalResponded: metrics?.filter(m => m.status === 'responded').length || 0,
    totalPending: metrics?.filter(m => m.status === 'pending').length || 0,
    responseRate: metrics?.length ? 
      (metrics.filter(m => m.status === 'responded').length / metrics.length) * 100 : 0,
    avgResponseTime: metrics?.length ?
      metrics.reduce((acc, m) => acc + (m.response_time || 0), 0) / metrics.length : 0,
  };

  return {
    ...query,
    metrics: metrics || [],
    aggregated,
  };
};

// Utilitários para invalidação de cache
export const useConversationMetricsUtils = () => {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
  };

  const invalidateMetrics = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.conversations.metrics });
  };

  const invalidateLatest = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.conversations.latest });
  };

  const prefetchMetrics = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.conversations.metrics,
      queryFn: fetchConversationMetrics,
      ...cacheConfig.metrics,
    });
  };

  return {
    invalidateAll,
    invalidateMetrics,
    invalidateLatest,
    prefetchMetrics,
  };
};