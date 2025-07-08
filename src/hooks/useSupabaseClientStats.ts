import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import type { Database } from '../integrations/supabase/types';

type ClientStats = Database['public']['Tables']['client_stats']['Row'];

export const useSupabaseClientStats = () => {
  const [stats, setStats] = useState<ClientStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('client_stats')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStats(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  const getDashboardMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('dashboard_metrics')
        .select('*');

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Erro ao buscar métricas do dashboard:', err);
      return [];
    }
  };

  const getStatsByDateRange = async (startDate: string, endDate: string) => {
    try {
      const { data, error } = await supabase
        .from('client_stats')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar estatísticas por período:', err);
      return [];
    }
  };

  const getLatestStats = async () => {
    try {
      const { data, error } = await supabase
        .from('client_stats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Erro ao buscar estatísticas mais recentes:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
    getDashboardMetrics,
    getStatsByDateRange,
    getLatestStats
  };
};