import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Types for pricing
export interface PricingPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  billing_period: 'monthly' | 'yearly';
  features: string[];
  is_popular?: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Query keys
export const pricingKeys = {
  all: ['pricing'] as const,
  lists: () => [...pricingKeys.all, 'list'] as const,
  list: (filters: string) => [...pricingKeys.lists(), { filters }] as const,
  byPeriod: (period: string) => [...pricingKeys.all, 'period', period] as const,
  details: () => [...pricingKeys.all, 'detail'] as const,
  detail: (id: string) => [...pricingKeys.details(), id] as const,
};

// Fetch pricing plans
const fetchPricingPlans = async (): Promise<PricingPlan[]> => {
  const { data, error } = await supabase
    .from('pricing_plans')
    .select('*')
    .eq('is_active', true)
    .order('price', { ascending: true });

  if (error) {
    console.error('Error fetching pricing plans:', error);
    throw new Error(`Failed to fetch pricing plans: ${error.message}`);
  }

  return data || [];
};

// Fetch pricing plans by period
const fetchPricingPlansByPeriod = async (period: 'monthly' | 'yearly'): Promise<PricingPlan[]> => {
  const { data, error } = await supabase
    .from('pricing_plans')
    .select('*')
    .eq('is_active', true)
    .eq('billing_period', period)
    .order('price', { ascending: true });

  if (error) {
    console.error('Error fetching pricing plans by period:', error);
    throw new Error(`Failed to fetch pricing plans by period: ${error.message}`);
  }

  return data || [];
};

// Create pricing plan
const createPricingPlan = async (plan: Omit<PricingPlan, 'id' | 'created_at' | 'updated_at'>): Promise<PricingPlan> => {
  const { data, error } = await supabase
    .from('pricing_plans')
    .insert([plan])
    .select()
    .single();

  if (error) {
    console.error('Error creating pricing plan:', error);
    throw new Error(`Failed to create pricing plan: ${error.message}`);
  }

  return data;
};

// Update pricing plan
const updatePricingPlan = async ({ id, ...updates }: Partial<PricingPlan> & { id: string }): Promise<PricingPlan> => {
  const { data, error } = await supabase
    .from('pricing_plans')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating pricing plan:', error);
    throw new Error(`Failed to update pricing plan: ${error.message}`);
  }

  return data;
};

// Delete pricing plan
const deletePricingPlan = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('pricing_plans')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting pricing plan:', error);
    throw new Error(`Failed to delete pricing plan: ${error.message}`);
  }
};

// Hook for fetching all pricing plans
export const usePricingQuery = () => {
  return useQuery({
    queryKey: pricingKeys.lists(),
    queryFn: fetchPricingPlans,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for fetching pricing plans by period
export const usePricingByPeriodQuery = (period: 'monthly' | 'yearly') => {
  return useQuery({
    queryKey: pricingKeys.byPeriod(period),
    queryFn: () => fetchPricingPlansByPeriod(period),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    enabled: !!period,
  });
};

// Hook for creating pricing plan
export const useCreatePricingPlanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPricingPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pricingKeys.all });
      toast({
        title: "Success",
        description: "Pricing plan created successfully",
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

// Hook for updating pricing plan
export const useUpdatePricingPlanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePricingPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pricingKeys.all });
      toast({
        title: "Success",
        description: "Pricing plan updated successfully",
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

// Hook for deleting pricing plan
export const useDeletePricingPlanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePricingPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pricingKeys.all });
      toast({
        title: "Success",
        description: "Pricing plan deleted successfully",
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
export const pricingUtils = {
  invalidateAll: (queryClient: ReturnType<typeof useQueryClient>) => {
    queryClient.invalidateQueries({ queryKey: pricingKeys.all });
  },
  prefetchPlans: (queryClient: ReturnType<typeof useQueryClient>) => {
    queryClient.prefetchQuery({
      queryKey: pricingKeys.lists(),
      queryFn: fetchPricingPlans,
      staleTime: 10 * 60 * 1000,
    });
  },
  prefetchPlansByPeriod: (queryClient: ReturnType<typeof useQueryClient>, period: 'monthly' | 'yearly') => {
    queryClient.prefetchQuery({
      queryKey: pricingKeys.byPeriod(period),
      queryFn: () => fetchPricingPlansByPeriod(period),
      staleTime: 10 * 60 * 1000,
    });
  },
};