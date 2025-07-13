
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
      // Buscar dados em paralelo para máxima performance
      const [
        clientsResult,
        conversationsResult,
        leadsResult,
        scheduleResult
      ] = await Promise.allSettled([
        supabase.from('contacts').select('id, kanban_stage_id, sales, budget').limit(1000),
        supabase.from('conversation_metrics').select('*').limit(100),
        supabase.from('contacts').select('id, sales, budget').limit(100),
        supabase.from('calendar_events').select('*').gte('start_time', new Date().toISOString().split('T')[0])
      ]);

      // Processar resultados com fallbacks seguros
      const clients = clientsResult.status === 'fulfilled' ? clientsResult.value.data || [] : [];
      const conversations = conversationsResult.status === 'fulfilled' ? conversationsResult.value.data || [] : [];
      const leads = leadsResult.status === 'fulfilled' ? leadsResult.value.data || [] : [];
      const schedule = scheduleResult.status === 'fulfilled' ? scheduleResult.value.data || [] : [];

      // Cálculos otimizados
      const totalClients = clients.length;
      const activeConversations = conversations.length;
      const pendingLeads = clients.filter(c => 
        c.kanban_stage_id === 'lead' || c.kanban_stage_id === 'contato-inicial'
      ).length;
      
      const conversionRate = 0; // Set to 0 since conversion_probability doesn't exist

      const responseTime = conversations.length > 0 
        ? conversations.reduce((acc, curr) => acc + (curr.avg_response_time || 0), 0) / conversations.length
        : 0;

      const todayScheduled = schedule.length;
      
      const monthlyRevenue = clients.reduce((acc, curr) => acc + (curr.sales || curr.budget || 0), 0);
      
      // Calcular crescimento (mock - implementar lógica real depois)
      const growthRate = Math.random() * 20 - 10; // Placeholder

      return {
        totalClients,
        activeConversations,
        pendingLeads,
        conversionRate,
        responseTime,
        todayScheduled,
        monthlyRevenue,
        growthRate,
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
