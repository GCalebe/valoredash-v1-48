import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Types for UTM metrics
export interface UTMMetric {
  id: string;
  lead_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  utm_conversion?: boolean;
  utm_conversion_value?: number;
  landing_page?: string;
  device_type?: string;
  conversion_stage?: string;
  created_at: string;
  updated_at?: string;
}

export interface UTMFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  device_type?: string;
  landing_page?: string;
}

export interface UTMAnalytics {
  total_events: number;
  unique_sessions: number;
  conversion_rate: number;
  top_sources: Array<{ source: string; count: number; percentage: number }>;
  top_campaigns: Array<{ campaign: string; count: number; percentage: number }>;
  top_mediums: Array<{ medium: string; count: number; percentage: number }>;
  events_by_type: Record<string, number>;
  daily_metrics: Array<{
    date: string;
    events: number;
    leads: number;
    conversions: number;
  }>;
}

// Query keys
export const utmMetricsKeys = {
  all: ['utmMetrics'] as const,
  lists: () => [...utmMetricsKeys.all, 'list'] as const,
  list: (filters: UTMFilters) => [...utmMetricsKeys.lists(), { filters }] as const,
  bySource: (source: string) => [...utmMetricsKeys.all, 'source', source] as const,
  byCampaign: (campaign: string) => [...utmMetricsKeys.all, 'campaign', campaign] as const,
  byDateRange: (start: string, end: string) => [...utmMetricsKeys.all, 'dateRange', { start, end }] as const,
  analytics: () => [...utmMetricsKeys.all, 'analytics'] as const,
  analyticsFiltered: (filters: UTMFilters) => [...utmMetricsKeys.analytics(), { filters }] as const,
};

// Fetch UTM metrics
const fetchUTMMetrics = async (filters: UTMFilters = {}): Promise<UTMMetric[]> => {
  let query = supabase
    .from('utm_tracking')
    .select('*')
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters.dateRange) {
    query = query
      .gte('created_at', filters.dateRange.start)
      .lte('created_at', filters.dateRange.end);
  }

  if (filters.utm_source) {
    query = query.eq('utm_source', filters.utm_source);
  }

  if (filters.utm_medium) {
    query = query.eq('utm_medium', filters.utm_medium);
  }

  if (filters.utm_campaign) {
    query = query.eq('utm_campaign', filters.utm_campaign);
  }

  if (filters.device_type) {
    query = query.eq('device_type', filters.device_type);
  }

  if (filters.landing_page) {
    query = query.ilike('landing_page', `%${filters.landing_page}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching UTM metrics:', error);
    throw new Error(`Failed to fetch UTM metrics: ${error.message}`);
  }

  return data || [];
};

// Fetch metrics by campaign
const fetchMetricsByCampaign = async (campaign: string): Promise<UTMMetric[]> => {
  const { data, error } = await supabase
    .from('utm_tracking')
    .select('*')
    .eq('utm_campaign', campaign)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching metrics by campaign:', error);
    throw new Error(`Failed to fetch metrics by campaign: ${error.message}`);
  }

  return data || [];
};

// Calculate UTM analytics
const calculateUTMAnalytics = async (filters: UTMFilters = {}): Promise<UTMAnalytics> => {
  const metrics = await fetchUTMMetrics(filters);
  
  const total_events = metrics.length;
  const unique_leads = new Set(metrics.map(m => m.lead_id).filter(Boolean)).size;
  const conversions = metrics.filter(m => m.utm_conversion === true).length;
  const conversion_rate = total_events > 0 ? (conversions / total_events) * 100 : 0;

  // Top sources
  const sourceGroups = metrics.reduce((acc, metric) => {
    const source = metric.utm_source || 'direct';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const top_sources = Object.entries(sourceGroups)
    .map(([source, count]) => ({
      source,
      count,
      percentage: (count / total_events) * 100,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Top campaigns
  const campaignGroups = metrics.reduce((acc, metric) => {
    const campaign = metric.utm_campaign || 'no-campaign';
    acc[campaign] = (acc[campaign] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const top_campaigns = Object.entries(campaignGroups)
    .map(([campaign, count]) => ({
      campaign,
      count,
      percentage: (count / total_events) * 100,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Top mediums
  const mediumGroups = metrics.reduce((acc, metric) => {
    const medium = metric.utm_medium || 'no-medium';
    acc[medium] = (acc[medium] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const top_mediums = Object.entries(mediumGroups)
    .map(([medium, count]) => ({
      medium,
      count,
      percentage: (count / total_events) * 100,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Events by device type
  const events_by_device = metrics.reduce((acc, metric) => {
    const device = metric.device_type || 'unknown';
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Daily metrics
  const dailyGroups = metrics.reduce((acc, metric) => {
    const date = metric.created_at.split('T')[0];
    if (!acc[date]) {
      acc[date] = {
        events: 0,
        leads: new Set(),
        conversions: 0,
      };
    }
    acc[date].events += 1;
    if (metric.lead_id) {
      acc[date].leads.add(metric.lead_id);
    }
    if (metric.utm_conversion === true) {
      acc[date].conversions += 1;
    }
    return acc;
  }, {} as Record<string, { events: number; leads: Set<string>; conversions: number }>);

  const daily_metrics = Object.entries(dailyGroups)
    .map(([date, data]) => ({
      date,
      events: data.events,
      leads: data.leads.size,
      conversions: data.conversions,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    total_events,
    unique_sessions: unique_leads,
    conversion_rate,
    top_sources,
    top_campaigns,
    top_mediums,
    events_by_type: events_by_device,
    daily_metrics,
  };
};

// Create UTM metric entry
const createUTMMetric = async (metric: Omit<UTMMetric, 'id' | 'created_at'>): Promise<UTMMetric> => {
  const { data, error } = await supabase
    .from('utm_tracking')
    .insert([metric])
    .select()
    .single();

  if (error) {
    console.error('Error creating UTM metric:', error);
    throw new Error(`Failed to create UTM metric: ${error.message}`);
  }

  return data;
};

// Bulk create UTM metrics
const bulkCreateUTMMetrics = async (metrics: Omit<UTMMetric, 'id' | 'created_at'>[]): Promise<UTMMetric[]> => {
  const { data, error } = await supabase
    .from('utm_tracking')
    .insert(metrics)
    .select();

  if (error) {
    console.error('Error bulk creating UTM metrics:', error);
    throw new Error(`Failed to bulk create UTM metrics: ${error.message}`);
  }

  return data || [];
};

// Hook for fetching UTM metrics
export const useUTMMetricsQuery = (filters: UTMFilters = {}) => {
  return useQuery({
    queryKey: utmMetricsKeys.list(filters),
    queryFn: () => fetchUTMMetrics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for fetching metrics by campaign
export const useMetricsByCampaignQuery = (campaign: string) => {
  return useQuery({
    queryKey: utmMetricsKeys.byCampaign(campaign),
    queryFn: () => fetchMetricsByCampaign(campaign),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    enabled: !!campaign,
  });
};

// Hook for calculating UTM analytics
export const useUTMAnalyticsQuery = (filters: UTMFilters = {}) => {
  return useQuery({
    queryKey: utmMetricsKeys.analyticsFiltered(filters),
    queryFn: () => calculateUTMAnalytics(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for creating UTM metric
export const useCreateUTMMetricMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUTMMetric,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: utmMetricsKeys.all });
    },
    onError: (error: Error) => {
      console.error('Failed to create UTM metric:', error);
    },
  });
};

// Hook for bulk creating UTM metrics
export const useBulkCreateUTMMetricsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkCreateUTMMetrics,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: utmMetricsKeys.all });
    },
    onError: (error: Error) => {
      console.error('Failed to bulk create UTM metrics:', error);
    },
  });
};

// Utility functions for manual cache management
export const utmMetricsUtils = {
  invalidateAll: (queryClient: ReturnType<typeof useQueryClient>) => {
    queryClient.invalidateQueries({ queryKey: utmMetricsKeys.all });
  },
  prefetchMetrics: (queryClient: ReturnType<typeof useQueryClient>, filters: UTMFilters = {}) => {
    queryClient.prefetchQuery({
      queryKey: utmMetricsKeys.list(filters),
      queryFn: () => fetchUTMMetrics(filters),
      staleTime: 5 * 60 * 1000,
    });
  },
  prefetchAnalytics: (queryClient: ReturnType<typeof useQueryClient>, filters: UTMFilters = {}) => {
    queryClient.prefetchQuery({
      queryKey: utmMetricsKeys.analyticsFiltered(filters),
      queryFn: () => calculateUTMAnalytics(filters),
      staleTime: 10 * 60 * 1000,
    });
  },
};