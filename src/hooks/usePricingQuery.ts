import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Simplified pricing plan interface (no pricing_plans table exists)
interface SimplePricingPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  billing_period: 'monthly' | 'yearly';
  billingPeriod: 'monthly' | 'yearly'; // Add for compatibility
  features: string[];
  is_popular?: boolean;
  popular?: boolean; // Add for compatibility
  is_active: boolean;
  created_at: string;
  updated_at: string;
  aiProducts: string[]; // Add for compatibility
  instances?: number; // Add for compatibility  
  messages?: number; // Add for compatibility
}

// Mock data since pricing_plans table doesn't exist in schema
const mockPricingPlans: SimplePricingPlan[] = [
  {
    id: '1',
    name: 'Basic',
    description: 'Perfect for small businesses',
    price: 29.99,
    currency: 'BRL',
    billing_period: 'monthly',
    billingPeriod: 'monthly',
    features: ['Basic chat support', 'Up to 100 contacts', 'Email integration'],
    is_popular: false,
    popular: false,
    is_active: true,
    aiProducts: ['chat-basic', 'analytics-basic'],
    instances: 1,
    messages: 1000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Pro',
    description: 'For growing businesses',
    price: 79.99,
    currency: 'BRL',
    billing_period: 'monthly',
    billingPeriod: 'monthly',
    features: ['Advanced chat support', 'Up to 1000 contacts', 'CRM integration', 'Analytics'],
    is_popular: true,
    popular: true,
    is_active: true,
    aiProducts: ['chat-pro', 'analytics-pro', 'crm-integration'],
    instances: 5,
    messages: 10000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Query keys
export const pricingKeys = {
  all: ['pricing'] as const,
  lists: () => [...pricingKeys.all, 'list'] as const,
  list: (filters: string) => [...pricingKeys.lists(), { filters }] as const,
  byPeriod: (period: string) => [...pricingKeys.all, 'period', period] as const,
};

// Fetch pricing plans (mock data)
const fetchPricingPlans = async (): Promise<SimplePricingPlan[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockPricingPlans.filter(plan => plan.is_active);
};

// Fetch pricing plans by period
const fetchPricingPlansByPeriod = async (period: 'monthly' | 'yearly'): Promise<SimplePricingPlan[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockPricingPlans.filter(plan => plan.is_active && plan.billing_period === period);
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

// Hook for creating pricing plan (mock)
export const useCreatePricingPlanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plan: Omit<SimplePricingPlan, 'id' | 'created_at' | 'updated_at'>): Promise<SimplePricingPlan> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newPlan: SimplePricingPlan = {
        ...plan,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return newPlan;
    },
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

// Hook for updating pricing plan (mock)
export const useUpdatePricingPlanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SimplePricingPlan> & { id: string }): Promise<SimplePricingPlan> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const updatedPlan: SimplePricingPlan = {
        ...mockPricingPlans.find(p => p.id === id)!,
        ...updates,
        updated_at: new Date().toISOString(),
      };
      return updatedPlan;
    },
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

// Hook for deleting pricing plan (mock)
export const useDeletePricingPlanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await new Promise(resolve => setTimeout(resolve, 500));
    },
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

// Utility functions
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
};