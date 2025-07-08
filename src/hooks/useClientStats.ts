import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useClientStatsQuery, useDashboardMetricsQuery } from "./useClientStatsQuery";

export function useClientStats() {
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    newClientsThisMonth: 0,
    conversionRate: 0,
    monthlyGrowth: [],
    ChatBreeds: [],
    recentClients: [],
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { stats: supabaseStats, loading: queryLoading, error: queryError, refetch: fetchStats, isStale } = useClientStatsQuery();
  const { data: dashboardMetrics } = useDashboardMetricsQuery();

  // Atualizar stats quando os dados do React Query mudarem
  useEffect(() => {
    if (supabaseStats && supabaseStats.length > 0) {
      const latestStats = supabaseStats[0];
      console.log("Using optimized client stats:", latestStats);
      
      // Transform Supabase data to match expected format
      const transformedStats = {
        totalClients: latestStats.total_clients || 0,
        activeClients: latestStats.active_clients || 0,
        newClientsThisMonth: latestStats.new_clients_this_month || 0,
        conversionRate: latestStats.conversion_rate || 0,
        monthlyGrowth: [], // Empty array for charts
        ChatBreeds: [], // Empty array for charts
        recentClients: [], // Empty array for recent clients
      };
      
      setStats(transformedStats);
      console.log("Optimized client stats loaded successfully");
    } else {
      // No data available
      const safeStats = {
        totalClients: 0,
        activeClients: 0,
        newClientsThisMonth: 0,
        conversionRate: 0,
        monthlyGrowth: [],
        ChatBreeds: [],
        recentClients: [],
      };
      setStats(safeStats);
    }
  }, [supabaseStats]);

  // Mostrar erro se houver
  useEffect(() => {
    if (queryError) {
      console.error("Error loading client stats:", queryError);
      toast({
        title: "Erro ao atualizar estatísticas",
        description: "Problema ao buscar as estatísticas de clientes. Dados podem estar desatualizados.",
        variant: "destructive",
      });
    }
  }, [queryError, toast]);

  const refetchStats = useCallback(async () => {
    console.log("Refetching client stats with React Query...");
    fetchStats();
  }, [fetchStats]);

  return { 
    stats, 
    loading: queryLoading || loading, 
    refetchStats,
    isStale,
    dashboardMetrics 
  };
}
