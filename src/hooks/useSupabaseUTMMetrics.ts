import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

// Simplified UTM Metrics type to avoid deep instantiation
export interface UTMMetrics {
  id: string;
  utm_source?: string;
  utm_campaign?: string;
  utm_medium?: string;
  utm_term?: string;
  utm_content?: string;
  created_at: string;
  updated_at?: string;
}

export const useSupabaseUTMMetrics = () => {
  const [metrics, setMetrics] = useState<UTMMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      
      // Use utm_tracking table instead of utm_metrics
      const { data, error } = await supabase
        .from('utm_tracking')
        .select('id, utm_source, utm_campaign, utm_medium, utm_term, utm_content, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMetrics(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching UTM metrics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Set empty array as fallback
      setMetrics([]);
    } finally {
      setLoading(false);
    }
  };

  const getMetricsByDateRange = async (startDate: string, endDate: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('utm_tracking')
        .select('id, utm_source, utm_campaign, utm_medium, utm_term, utm_content, created_at, updated_at')
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
        .from('utm_tracking')
        .select('id, utm_source, utm_campaign, utm_medium, utm_term, utm_content, created_at, updated_at')
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
        .from('utm_tracking')
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