import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import type { Database } from '../integrations/supabase/types';

type UTMMetrics = Database['public']['Tables']['utm_metrics']['Row'];

export const useSupabaseUTMMetrics = () => {
  const [metrics, setMetrics] = useState<UTMMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('utm_metrics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMetrics(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching UTM metrics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getMetricsByDateRange = async (startDate: string, endDate: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('utm_metrics')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (err) {
      console.error('Error fetching UTM metrics by date range:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getMetricsByCampaign = async (campaign: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('utm_metrics')
        .select('*')
        .eq('utm_campaign', campaign)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (err) {
      console.error('Error fetching UTM metrics by campaign:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createUTMMetric = async (metric: Omit<UTMMetrics, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('utm_metrics')
        .insert([metric])
        .select()
        .single();

      if (error) throw error;

      // Refresh the metrics list
      await fetchMetrics();
      return data;
    } catch (err) {
      console.error('Error creating UTM metric:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return {
    metrics,
    loading,
    error,
    fetchMetrics,
    getMetricsByDateRange,
    getMetricsByCampaign,
    createUTMMetric,
  };
};