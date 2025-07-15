import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Simplified pricing plan interface (no pricing_plans table exists)
interface SimplePricingPlan {
  id: string;
  name: string;
  description: string; // Make required to match PricingPlan
  price: number;
  currency: string;
  billing_period: 'monthly' | 'yearly';
  billingPeriod: 'monthly' | 'yearly'; // Add for compatibility
  features: string[];
  is_popular?: boolean;
  instances?: number;
  messages?: number;
  ai_products?: string[];
  popular?: boolean; // Add for compatibility
  is_active: boolean;
  created_at: string;
  updated_at: string;
  aiProducts: string[]; // Add for compatibility
}

interface CreatePricingPlan {
  name: string;
  description?: string;
  price: number;
  currency: string;
  billing_period: 'monthly' | 'yearly';
  features: string[];
}

// Mock data since pricing_plans table doesn't exist in schema
const mockPricingPlans: SimplePricingPlan[] = [
  {
    id: 'basic',
    name: 'Básico',
    description: 'Plano básico para pequenas empresas',
    price: 29.90,
    currency: 'BRL',
    billing_period: 'monthly',
    billingPeriod: 'monthly',
    features: ['1 instância', '1000 mensagens/mês', '1 IA incluída', 'Suporte por email'],
    is_popular: false,
    popular: false,
    instances: 1,
    messages: 1000,
    ai_products: ['chatbot-basic'],
    aiProducts: ['chatbot-basic'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'professional',
    name: 'Profissional',
    description: 'Plano profissional para médias empresas',
    price: 79.90,
    currency: 'BRL',
    billing_period: 'monthly',
    billingPeriod: 'monthly',
    features: ['3 instâncias', '5000 mensagens/mês', '3 IAs incluídas', 'Suporte prioritário'],
    is_popular: true,
    popular: true,
    instances: 3,
    messages: 5000,
    ai_products: ['chatbot-basic', 'chatbot-advanced', 'assistant'],
    aiProducts: ['chatbot-basic', 'chatbot-advanced', 'assistant'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'enterprise',
    name: 'Empresarial',
    description: 'Plano empresarial para grandes empresas',
    price: 199.90,
    currency: 'BRL',
    billing_period: 'monthly',
    billingPeriod: 'monthly',
    features: ['Instâncias ilimitadas', 'Mensagens ilimitadas', 'Todas as IAs', 'Suporte 24/7'],
    is_popular: false,
    popular: false,
    instances: 0, // 0 means unlimited
    messages: 0, // 0 means unlimited
    ai_products: ['chatbot-basic', 'chatbot-advanced', 'assistant', 'analytics', 'automation'],
    aiProducts: ['chatbot-basic', 'chatbot-advanced', 'assistant', 'analytics', 'automation'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Query to fetch pricing plans
export const usePricingQuery = () => {
  return useQuery({
    queryKey: ['pricing-plans'],
    queryFn: async (): Promise<SimplePricingPlan[]> => {
      // Since the pricing_plans table doesn't exist, return mock data
      // In a real app, this would query the pricing_plans table
      return mockPricingPlans;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Query to fetch a single pricing plan
export const usePricingPlanQuery = (planId: string) => {
  return useQuery({
    queryKey: ['pricing-plan', planId],
    queryFn: async (): Promise<SimplePricingPlan | null> => {
      // Since the pricing_plans table doesn't exist, return mock data
      const plan = mockPricingPlans.find(p => p.id === planId);
      return plan || null;
    },
    enabled: !!planId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutation to create a pricing plan
export const useCreatePricingPlanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newPlan: CreatePricingPlan): Promise<SimplePricingPlan> => {
      // Mock implementation since table doesn't exist
      const plan: SimplePricingPlan = {
        id: `plan-${Date.now()}`,
        ...newPlan,
        description: newPlan.description || 'No description',
        billingPeriod: newPlan.billing_period,
        is_popular: false,
        popular: false,
        instances: 1,
        messages: 1000,
        ai_products: [],
        aiProducts: [],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      mockPricingPlans.push(plan);
      return plan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-plans'] });
      toast({
        title: 'Plano criado',
        description: 'Plano de preços criado com sucesso!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Falha ao criar plano de preços',
        variant: 'destructive',
      });
      console.error('Error creating pricing plan:', error);
    },
  });
};

// Mutation to update a pricing plan
export const useUpdatePricingPlanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<CreatePricingPlan>): Promise<SimplePricingPlan> => {
      // Mock implementation since table doesn't exist
      const planIndex = mockPricingPlans.findIndex(p => p.id === id);
      if (planIndex === -1) {
        throw new Error('Plan not found');
      }
      
      mockPricingPlans[planIndex] = {
        ...mockPricingPlans[planIndex],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      return mockPricingPlans[planIndex];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-plans'] });
      toast({
        title: 'Plano atualizado',
        description: 'Plano de preços atualizado com sucesso!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar plano de preços',
        variant: 'destructive',
      });
      console.error('Error updating pricing plan:', error);
    },
  });
};

// Mutation to delete a pricing plan
export const useDeletePricingPlanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: string): Promise<void> => {
      // Mock implementation since table doesn't exist
      const planIndex = mockPricingPlans.findIndex(p => p.id === planId);
      if (planIndex === -1) {
        throw new Error('Plan not found');
      }
      
      mockPricingPlans.splice(planIndex, 1);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-plans'] });
      toast({
        title: 'Plano excluído',
        description: 'Plano de preços excluído com sucesso!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Falha ao excluir plano de preços',
        variant: 'destructive',
      });
      console.error('Error deleting pricing plan:', error);
    },
  });
};

// Add missing query function
export const usePricingByPeriodQuery = (billingPeriod: 'monthly' | 'yearly') => {
  return useQuery({
    queryKey: ['pricing-plans', billingPeriod],
    queryFn: async (): Promise<SimplePricingPlan[]> => {
      return mockPricingPlans.filter(plan => plan.billing_period === billingPeriod);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export type { SimplePricingPlan, CreatePricingPlan };