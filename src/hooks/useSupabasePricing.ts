import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import type { Database } from '../integrations/supabase/types';
import { PricingPlan, UserSubscription, PaymentMethod, Invoice } from '@/types/pricing';

type PricingPlanRow = Database['public']['Tables']['pricing_plans']['Row'];
type UserSubscriptionRow = Database['public']['Tables']['user_subscriptions']['Row'];
type PaymentMethodRow = Database['public']['Tables']['payment_methods']['Row'];
type InvoiceRow = Database['public']['Tables']['invoices']['Row'];

export const useSupabasePricing = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Transform Supabase data to app format
  const transformPlan = (plan: PricingPlanRow): PricingPlan => ({
    id: plan.id,
    name: plan.name,
    description: plan.description || '',
    price: plan.price,
    billingPeriod: plan.billing_period as 'monthly' | 'yearly',
    features: plan.features || [],
    popular: plan.popular || false,
    aiProducts: plan.ai_products || []
  });

  const transformSubscription = (sub: UserSubscriptionRow): UserSubscription => ({
    id: sub.id,
    userId: sub.user_id,
    planId: sub.plan_id,
    status: sub.status as 'active' | 'canceled' | 'past_due' | 'trialing',
    currentPeriodStart: sub.current_period_start,
    currentPeriodEnd: sub.current_period_end,
    cancelAtPeriodEnd: sub.cancel_at_period_end || false,
    createdAt: sub.created_at
  });

  const transformPaymentMethod = (pm: PaymentMethodRow): PaymentMethod => ({
    id: pm.id,
    type: pm.type as 'credit_card' | 'debit_card' | 'pix',
    lastFour: pm.last_four,
    brand: pm.brand,
    expiryMonth: pm.expiry_month,
    expiryYear: pm.expiry_year,
    isDefault: pm.is_default || false
  });

  const transformInvoice = (inv: InvoiceRow): Invoice => ({
    id: inv.id,
    subscriptionId: inv.subscription_id,
    amount: inv.amount,
    status: inv.status as 'paid' | 'pending' | 'failed',
    dueDate: inv.due_date,
    paidAt: inv.paid_at,
    createdAt: inv.created_at
  });

  // Fetch all pricing plans
  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .order('price');

      if (error) throw error;

      const transformedPlans = data?.map(transformPlan) || [];
      setPlans(transformedPlans);
    } catch (err) {
      console.error('Error fetching pricing plans:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch pricing plans');
    } finally {
      setLoading(false);
    }
  }, []);

  // Get plans by billing period
  const getPlansByPeriod = useCallback((period: 'monthly' | 'yearly') => {
    return plans.filter(plan => plan.billingPeriod === period);
  }, [plans]);

  // Get user subscription
  const getUserSubscription = useCallback(async (userId: string): Promise<UserSubscription | null> => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      
      return data ? transformSubscription(data) : null;
    } catch (err) {
      console.error('Error fetching user subscription:', err);
      return null;
    }
  }, []);

  // Get user payment methods
  const getUserPaymentMethods = useCallback(async (userId: string): Promise<PaymentMethod[]> => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (error) throw error;
      
      return data?.map(transformPaymentMethod) || [];
    } catch (err) {
      console.error('Error fetching payment methods:', err);
      return [];
    }
  }, []);

  // Get user invoices
  const getUserInvoices = useCallback(async (userId: string): Promise<Invoice[]> => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data?.map(transformInvoice) || [];
    } catch (err) {
      console.error('Error fetching invoices:', err);
      return [];
    }
  }, []);

  // Create subscription
  const createSubscription = useCallback(async (subscription: Omit<UserSubscription, 'id' | 'createdAt'>): Promise<UserSubscription | null> => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: subscription.userId,
          plan_id: subscription.planId,
          status: subscription.status,
          current_period_start: subscription.currentPeriodStart,
          current_period_end: subscription.currentPeriodEnd,
          cancel_at_period_end: subscription.cancelAtPeriodEnd
        })
        .select()
        .single();

      if (error) throw error;
      
      return data ? transformSubscription(data) : null;
    } catch (err) {
      console.error('Error creating subscription:', err);
      return null;
    }
  }, []);

  // Update subscription
  const updateSubscription = useCallback(async (id: string, updates: Partial<UserSubscription>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          ...(updates.planId && { plan_id: updates.planId }),
          ...(updates.status && { status: updates.status }),
          ...(updates.currentPeriodStart && { current_period_start: updates.currentPeriodStart }),
          ...(updates.currentPeriodEnd && { current_period_end: updates.currentPeriodEnd }),
          ...(updates.cancelAtPeriodEnd !== undefined && { cancel_at_period_end: updates.cancelAtPeriodEnd })
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error updating subscription:', err);
      return false;
    }
  }, []);

  // Add payment method
  const addPaymentMethod = useCallback(async (userId: string, paymentMethod: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod | null> => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .insert({
          user_id: userId,
          type: paymentMethod.type,
          last_four: paymentMethod.lastFour,
          brand: paymentMethod.brand,
          expiry_month: paymentMethod.expiryMonth,
          expiry_year: paymentMethod.expiryYear,
          is_default: paymentMethod.isDefault
        })
        .select()
        .single();

      if (error) throw error;
      
      return data ? transformPaymentMethod(data) : null;
    } catch (err) {
      console.error('Error adding payment method:', err);
      return null;
    }
  }, []);

  // Remove payment method
  const removePaymentMethod = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error removing payment method:', err);
      return false;
    }
  }, []);

  // Set default payment method
  const setDefaultPaymentMethod = useCallback(async (userId: string, paymentMethodId: string): Promise<boolean> => {
    try {
      // First, set all payment methods to non-default
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', userId);

      // Then set the selected one as default
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', paymentMethodId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error setting default payment method:', err);
      return false;
    }
  }, []);

  return {
    plans,
    loading,
    error,
    fetchPlans,
    getPlansByPeriod,
    getUserSubscription,
    getUserPaymentMethods,
    getUserInvoices,
    createSubscription,
    updateSubscription,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod
  };
};