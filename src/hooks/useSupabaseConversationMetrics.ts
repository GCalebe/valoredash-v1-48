import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import type { Database } from '../integrations/supabase/types';

type ConversationMetrics = Database['public']['Tables']['conversation_metrics']['Row'];

export const useSupabaseConversationMetrics = () => {
  const [metrics, setMetrics] = useState<ConversationMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('conversation_metrics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMetrics(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar métricas');
    } finally {
      setLoading(false);
    }
  };

  const getMetricsByDateRange = async (startDate: string, endDate: string) => {
    try {
      // Fallback to simple query if RPC function doesn't exist
      const { data, error } = await supabase
        .from('conversation_metrics')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar métricas por período:', err);
      return [];
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics,
    getMetricsByDateRange
  };
};