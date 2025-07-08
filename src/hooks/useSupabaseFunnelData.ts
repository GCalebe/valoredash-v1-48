import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import type { Database } from '../integrations/supabase/types';

type FunnelData = Database['public']['Tables']['funnel_data']['Row'];

export const useSupabaseFunnelData = () => {
  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFunnelData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('funnel_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFunnelData(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados do funil');
    } finally {
      setLoading(false);
    }
  };

  const getFunnelByDateRange = async (startDate: string, endDate: string) => {
    try {
      // Try conversion_funnel_view first, fallback to funnel_data
      let { data, error } = await supabase
        .from('conversion_funnel_view')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (error) {
        // Fallback to funnel_data table
        const fallback = await supabase
          .from('funnel_data')
          .select('*')
          .gte('created_at', startDate)
          .lte('created_at', endDate)
          .order('created_at', { ascending: false });
        
        if (fallback.error) throw fallback.error;
        return fallback.data || [];
      }
      
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar funil por período:', err);
      return [];
    }
  };

  const getFunnelSummary = async () => {
    try {
      // Try conversion_funnel_view first, fallback to funnel_data
      let { data, error } = await supabase
        .from('conversion_funnel_view')
        .select('*');

      if (error) {
        // Fallback to funnel_data table
        const fallback = await supabase
          .from('funnel_data')
          .select('*');
        
        if (fallback.error) throw fallback.error;
        return fallback.data || [];
      }
      
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar resumo do funil:', err);
      return [];
    }
  };

  useEffect(() => {
    fetchFunnelData();
  }, []);

  return {
    funnelData,
    loading,
    error,
    refetch: fetchFunnelData,
    getFunnelByDateRange,
    getFunnelSummary
  };
};