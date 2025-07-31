
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, cacheConfig } from '@/lib/queryClient';

interface DashboardMetrics {
  totalClients: number;
  activeConversations: number;
  pendingLeads: number;
  conversionRate: number;
  responseTime: number;
  todayScheduled: number;
  monthlyRevenue: number;
  growthRate: number;
}

/**
 * Hook otimizado para métricas do dashboard
 * Cache de 2 minutos com invalidação inteligente
 */
export const useDashboardMetricsQuery = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.metrics,
    queryFn: async (): Promise<DashboardMetrics> => {
      // Buscar dados em paralelo usando as novas tabelas implementadas
      const [
        clientsResult,
        conversationsResult,
        leadsResult,
        profilesResult,
        metricsResult,
        kanbanResult
      ] = await Promise.allSettled([
        supabase.from('contacts').select('id, stage, value').limit(1000),
        supabase.from('conversations').select('id, status, created_at, user_id').limit(100),
        supabase.from('contacts').select('id, stage, value').eq('stage', 'lead').limit(100),
        supabase.from('profiles').select('id, full_name, avatar_url').limit(100),
        supabase.from('performance_metrics').select('*').limit(1).single(),
        supabase.from('kanban_stages').select('id, name, order_index').order('order_index')
      ]);

      // Processar resultados com fallbacks seguros
      const clients = clientsResult.status === 'fulfilled' ? clientsResult.value.data || [] : [];
      const conversations = conversationsResult.status === 'fulfilled' ? conversationsResult.value.data || [] : [];
      const leads = leadsResult.status === 'fulfilled' ? leadsResult.value.data || [] : [];
      const profiles = profilesResult.status === 'fulfilled' ? profilesResult.value.data || [] : [];
      const metrics = metricsResult.status === 'fulfilled' ? metricsResult.value.data : null;
      const kanbanStages = kanbanResult.status === 'fulfilled' ? kanbanResult.value.data || [] : [];

      // Cálculos otimizados usando as novas tabelas
      const totalClients = clients.length;
      const activeConversations = conversations.filter(c => c.status === 'active').length;
      const pendingLeads = leads.length;
      
      // Usar dados das tabelas de métricas implementadas
       const conversionRate = metrics?.conversion_rate || 0;
       const responseTime = metrics?.avg_response_time || 0;
       const monthlyRevenue = metrics?.monthly_revenue || 0;
       const growthRate = metrics?.growth_rate || 0;
       const todayScheduled = 0; // Placeholder - implementar quando tabela de agendamentos estiver disponível

       return {
          totalClients,
          activeConversations,
          pendingLeads,
          conversionRate,
          responseTime,
          todayScheduled,
          monthlyRevenue,
          growthRate
        };
    },
    ...cacheConfig.metrics,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 5 * 60 * 1000, // Refetch a cada 5 minutos em background
    refetchIntervalInBackground: true,
  });
};

/**
 * Hook para invalidar métricas do dashboard
 */
export const useInvalidateDashboardMetrics = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.metrics });
  };
};

/**
 * Hook para prefetch das métricas do dashboard
 */
export const usePrefetchDashboardMetrics = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.dashboard.metrics,
      staleTime: cacheConfig.metrics.staleTime,
    });
  };
};
