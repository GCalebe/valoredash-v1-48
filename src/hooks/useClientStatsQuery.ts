import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { queryKeys, cacheConfig } from '../lib/queryClient';

type ClientStats = Database['public']['Tables']['client_stats']['Row'];
type DashboardMetrics = Database['public']['Views']['dashboard_metrics']['Row'];

// Funções de fetch separadas para melhor reutilização
const fetchClientStats = async (): Promise<ClientStats[]> => {
  const { data, error } = await supabase
    .from('client_stats')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

const fetchDashboardMetrics = async (): Promise<DashboardMetrics[]> => {
  const { data, error } = await supabase
    .from('dashboard_metrics')
    .select('*');

  if (error) throw error;
  return data || [];
};

const fetchStatsByDateRange = async (startDate: string, endDate: string): Promise<ClientStats[]> => {
  const { data, error } = await supabase
    .from('client_stats')
    .select('*')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

const fetchLatestStats = async (): Promise<ClientStats | null> => {
  const { data, error } = await supabase
    .from('client_stats')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    throw error;
  }
  return data;
};

// Hook principal para estatísticas do cliente
export const useClientStatsQuery = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.clientStats.all,
    queryFn: fetchClientStats,
    ...cacheConfig.critical,
  });

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.clientStats.all });
  };

  return {
    stats: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch,
    isStale: query.isStale,
    isFetching: query.isFetching,
  };
};

// Hook para métricas do dashboard
export const useDashboardMetricsQuery = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.metrics,
    queryFn: fetchDashboardMetrics,
    ...cacheConfig.metrics,
  });
};

// Hook para estatísticas por período
export const useStatsByDateRangeQuery = (startDate: string, endDate: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.clientStats.byDateRange(startDate, endDate),
    queryFn: () => fetchStatsByDateRange(startDate, endDate),
    enabled: enabled && !!startDate && !!endDate,
    ...cacheConfig.dynamic,
  });
};

// Hook para estatísticas mais recentes
export const useLatestStatsQuery = () => {
  return useQuery({
    queryKey: queryKeys.clientStats.latest,
    queryFn: fetchLatestStats,
    ...cacheConfig.realtime,
  });
};

// Utilitários para invalidação de cache
export const useClientStatsUtils = () => {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.clientStats.all });
  };

  const invalidateMetrics = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.metrics });
  };

  const invalidateLatest = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.clientStats.latest });
  };

  const prefetchStats = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.clientStats.all,
      queryFn: fetchClientStats,
      ...cacheConfig.critical,
    });
  };

  return {
    invalidateAll,
    invalidateMetrics,
    invalidateLatest,
    prefetchStats,
  };
};