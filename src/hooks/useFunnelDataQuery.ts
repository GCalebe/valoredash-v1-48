import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Types for funnel data
export interface FunnelData {
  id: string;
  stage: string;
  count: number;
  conversion_rate?: number;
  date: string;
  source?: string;
  campaign?: string;
  created_at: string;
  updated_at: string;
}

export interface FunnelFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  source?: string;
  campaign?: string;
  stage?: string;
}

export interface FunnelMetrics {
  stage: string;
  count: number;
  conversion_rate: number;
  previous_stage_count?: number;
}

// Query keys
export const funnelDataKeys = {
  all: ['funnelData'] as const,
  lists: () => [...funnelDataKeys.all, 'list'] as const,
  list: (filters: FunnelFilters) => [...funnelDataKeys.lists(), { filters }] as const,
  byDateRange: (start: string, end: string) => [...funnelDataKeys.all, 'dateRange', { start, end }] as const,
  bySource: (source: string) => [...funnelDataKeys.all, 'source', source] as const,
  metrics: () => [...funnelDataKeys.all, 'metrics'] as const,
  metricsFiltered: (filters: FunnelFilters) => [...funnelDataKeys.metrics(), { filters }] as const,
};

// Fetch funnel data
const fetchFunnelData = async (filters: FunnelFilters = {}): Promise<FunnelData[]> => {
  let query = supabase
    .from('funnel_data')
    .select('id, name, value, percentage, color, created_at')
    .order('created_at', { ascending: false });

  // Apply basic filters (dateRange removed since 'date' column doesn't exist in funnel_data)
  if (filters.dateRange) {
    query = query
      .gte('created_at', filters.dateRange.start)
      .lte('created_at', filters.dateRange.end);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching funnel data:', error);
    throw new Error(`Failed to fetch funnel data: ${error.message}`);
  }

  // Transform data to match FunnelData interface
  return (data || []).map(item => ({
    id: item.id,
    stage: item.name || 'unknown',
    count: item.value || 0,
    conversion_rate: item.percentage || 0,
    date: item.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    created_at: item.created_at,
    updated_at: item.created_at, // Use created_at as fallback
  }));
};

// Fetch funnel data by date range
const fetchFunnelByDateRange = async (startDate: string, endDate: string): Promise<FunnelData[]> => {
  const { data, error } = await supabase
    .from('funnel_data')
    .select('id, name, value, percentage, color, created_at')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching funnel data by date range:', error);
    throw new Error(`Failed to fetch funnel data by date range: ${error.message}`);
  }

  // Transform data to match FunnelData interface
  return (data || []).map(item => ({
    id: item.id,
    stage: item.name || 'unknown',
    count: item.value || 0,
    conversion_rate: item.percentage || 0,
    date: item.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    created_at: item.created_at,
    updated_at: item.created_at, // Use created_at as fallback
  }));
};

// Calculate funnel metrics
const calculateFunnelMetrics = async (filters: FunnelFilters = {}): Promise<FunnelMetrics[]> => {
  const funnelData = await fetchFunnelData(filters);
  
  // Group by stage and calculate metrics
  const stageGroups = funnelData.reduce((acc, item) => {
    if (!acc[item.stage]) {
      acc[item.stage] = [];
    }
    acc[item.stage].push(item);
    return acc;
  }, {} as Record<string, FunnelData[]>);

  const stages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
  const metrics: FunnelMetrics[] = [];
  let previousCount = 0;

  stages.forEach((stage, index) => {
    const stageData = stageGroups[stage] || [];
    const count = stageData.reduce((sum, item) => sum + item.count, 0);
    
    let conversion_rate = 0;
    if (index === 0) {
      conversion_rate = 100; // First stage is 100%
      previousCount = count;
    } else if (previousCount > 0) {
      conversion_rate = (count / previousCount) * 100;
    }

    metrics.push({
      stage,
      count,
      conversion_rate,
      previous_stage_count: index > 0 ? previousCount : undefined,
    });

    if (index === 0) {
      previousCount = count;
    }
  });

  return metrics;
};

// Create funnel data entry
const createFunnelData = async (data: Omit<FunnelData, 'id' | 'created_at' | 'updated_at'>): Promise<FunnelData> => {
  // Transform FunnelData to funnel_data table format
  const insertData = {
    name: data.stage,
    value: data.count,
    percentage: data.conversion_rate || 0,
    color: '#8884d8' // Default color
  };
  
  const { data: result, error } = await supabase
    .from('funnel_data')
    .insert([insertData])
    .select()
    .single();

  if (error) {
    console.error('Error creating funnel data:', error);
    throw new Error(`Failed to create funnel data: ${error.message}`);
  }

  // Transform back to FunnelData format
  return {
    id: result.id,
    stage: result.name || 'unknown',
    count: result.value || 0,
    conversion_rate: result.percentage || 0,
    date: result.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    created_at: result.created_at,
    updated_at: result.created_at,
  };
};

// Update funnel data
const updateFunnelData = async ({ id, ...updates }: Partial<FunnelData> & { id: string }): Promise<FunnelData> => {
  const { data, error } = await supabase
    .from('funnel_data')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating funnel data:', error);
    throw new Error(`Failed to update funnel data: ${error.message}`);
  }

  // Transform back to FunnelData format
  return {
    id: data.id,
    stage: data.name || 'unknown',
    count: data.value || 0,
    conversion_rate: data.percentage || 0,
    date: data.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    created_at: data.created_at,
    updated_at: data.created_at,
  };
};

// Hook for fetching funnel data
export const useFunnelDataQuery = (filters: FunnelFilters = {}) => {
  return useQuery({
    queryKey: funnelDataKeys.list(filters),
    queryFn: () => fetchFunnelData(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for fetching funnel data by date range
export const useFunnelByDateRangeQuery = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: funnelDataKeys.byDateRange(startDate, endDate),
    queryFn: () => fetchFunnelByDateRange(startDate, endDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    enabled: !!startDate && !!endDate,
  });
};

// Hook for calculating funnel metrics
export const useFunnelMetricsQuery = (filters: FunnelFilters = {}) => {
  return useQuery({
    queryKey: funnelDataKeys.metricsFiltered(filters),
    queryFn: () => calculateFunnelMetrics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for creating funnel data
export const useCreateFunnelDataMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFunnelData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: funnelDataKeys.all });
      toast({
        title: "Success",
        description: "Funnel data created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for updating funnel data
export const useUpdateFunnelDataMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateFunnelData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: funnelDataKeys.all });
      toast({
        title: "Success",
        description: "Funnel data updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Utility functions for manual cache management
export const funnelDataUtils = {
  invalidateAll: (queryClient: ReturnType<typeof useQueryClient>) => {
    queryClient.invalidateQueries({ queryKey: funnelDataKeys.all });
  },
  prefetchFunnelData: (queryClient: ReturnType<typeof useQueryClient>, filters: FunnelFilters = {}) => {
    queryClient.prefetchQuery({
      queryKey: funnelDataKeys.list(filters),
      queryFn: () => fetchFunnelData(filters),
      staleTime: 5 * 60 * 1000,
    });
  },
  prefetchFunnelByDateRange: (queryClient: ReturnType<typeof useQueryClient>, startDate: string, endDate: string) => {
    queryClient.prefetchQuery({
      queryKey: funnelDataKeys.byDateRange(startDate, endDate),
      queryFn: () => fetchFunnelByDateRange(startDate, endDate),
      staleTime: 5 * 60 * 1000,
    });
  },
};