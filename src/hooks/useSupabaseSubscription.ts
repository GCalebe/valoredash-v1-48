import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  UserSubscription,
  PricingPlan,
  PaymentMethod,
  Invoice,
} from "@/types/pricing";
import { usePricingQuery } from "@/hooks/usePricingQuery";

interface SupabaseUserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  start_date: string;
  end_date?: string;
  trial_end_date?: string;
  auto_renew: boolean;
  payment_method_id?: string;
  last_payment_date?: string;
  next_billing_date?: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
}

interface SupabasePaymentMethod {
  id: string;
  user_id: string;
  type: string;
  provider?: string;
  provider_payment_method_id?: string;
  last_four_digits?: string;
  card_brand?: string;
  expiry_month?: number;
  expiry_year?: number;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SupabaseInvoice {
  id: string;
  invoice_number: string;
  user_id: string;
  subscription_id?: string;
  status: string;
  subtotal: number;
  tax_amount?: number;
  discount_amount?: number;
  total_amount: number;
  currency: string;
  due_date: string;
  paid_at?: string;
  payment_method_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export function useSupabaseSubscription() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: supabasePlans = [] } = usePricingQuery();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  const availablePlans = supabasePlans && supabasePlans.length > 0 ? supabasePlans : [];

  // Convert Supabase subscription to app format
  const convertSupabaseSubscription = (sub: SupabaseUserSubscription): UserSubscription => {
    return {
      id: sub.id,
      userId: sub.user_id,
      planId: sub.plan_id,
      status: sub.status as 'active' | 'cancelled' | 'past_due' | 'trialing',
      currentPeriodStart: new Date(sub.start_date),
      currentPeriodEnd: sub.end_date ? new Date(sub.end_date) : new Date(),
      trialEnd: sub.trial_end_date ? new Date(sub.trial_end_date) : undefined,
      autoRenew: sub.auto_renew,
      paymentMethodId: sub.payment_method_id,
      lastPaymentDate: sub.last_payment_date ? new Date(sub.last_payment_date) : undefined,
      nextBillingDate: sub.next_billing_date ? new Date(sub.next_billing_date) : undefined,
      cancellationReason: sub.cancellation_reason,
      cancelledAt: sub.cancelled_at ? new Date(sub.cancelled_at) : undefined,
    };
  };

  // Convert Supabase payment method to app format
  const convertSupabasePaymentMethod = (pm: SupabasePaymentMethod): PaymentMethod => {
    return {
      id: pm.id,
      type: pm.type as 'credit_card' | 'debit_card' | 'pix' | 'bank_transfer',
      lastFour: pm.last_four_digits || '',
      brand: pm.card_brand || '',
      expiryMonth: pm.expiry_month || 1,
      expiryYear: pm.expiry_year || new Date().getFullYear(),
      isDefault: pm.is_default,
    };
  };

  // Convert Supabase invoice to app format
  const convertSupabaseInvoice = (inv: SupabaseInvoice): Invoice => {
    return {
      id: inv.id,
      number: inv.invoice_number,
      date: new Date(inv.created_at),
      dueDate: new Date(inv.due_date),
      amount: inv.total_amount,
      status: inv.status as 'paid' | 'pending' | 'overdue' | 'cancelled',
      paidAt: inv.paid_at ? new Date(inv.paid_at) : undefined,
      paymentMethodId: inv.payment_method_id,
      subscriptionId: inv.subscription_id,
    };
  };

  // Fetch user subscription data
  const fetchSubscription = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch subscription
      const { data: subscriptionData, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (subError && subError.code !== 'PGRST116') {
        throw subError;
      }

      if (subscriptionData) {
        setSubscription(convertSupabaseSubscription(subscriptionData));
      } else {
        setSubscription(null);
      }

      // Fetch payment methods
      const { data: paymentMethodsData, error: pmError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('is_default', { ascending: false });

      if (pmError) throw pmError;

      setPaymentMethods(
        paymentMethodsData?.map(convertSupabasePaymentMethod) || []
      );

      // Fetch invoices
      const { data: invoicesData, error: invError } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (invError) throw invError;

      setInvoices(invoicesData?.map(convertSupabaseInvoice) || []);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados da sua assinatura.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  // Subscribe to a plan
  const subscribeToPlan = async (planId: string, paymentMethodId?: string) => {
    if (!user) throw new Error('User not authenticated');

    setProcessingPayment(true);
    try {
      const plan = availablePlans.find(p => p.id === planId);
      if (!plan) throw new Error('Plan not found');

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + (plan.billingPeriod === 'yearly' ? 12 : 1));

      // Create subscription
      const { data: subscriptionData, error: subError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_id: planId,
          status: 'active',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          next_billing_date: endDate.toISOString(),
          payment_method_id: paymentMethodId,
          auto_renew: true,
        })
        .select()
        .single();

      if (subError) throw subError;

      // Create invoice
      const invoiceNumber = `INV-${Date.now()}`;
      const { data: invoiceData, error: invError } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          user_id: user.id,
          subscription_id: subscriptionData.id,
          status: 'paid',
          subtotal: plan.price,
          total_amount: plan.price,
          currency: 'BRL',
          due_date: new Date().toISOString(),
          paid_at: new Date().toISOString(),
          payment_method_id: paymentMethodId,
        })
        .select()
        .single();

      if (invError) throw invError;

      // Update local state
      setSubscription(convertSupabaseSubscription(subscriptionData));
      setInvoices(prev => [convertSupabaseInvoice(invoiceData), ...prev]);

      toast({
        title: "Assinatura ativada",
        description: `Você agora tem acesso ao plano ${plan.name}.`,
      });
    } catch (error) {
      console.error('Error subscribing to plan:', error);
      toast({
        title: "Erro na assinatura",
        description: "Não foi possível processar sua assinatura.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setProcessingPayment(false);
    }
  };

  // Cancel subscription
  const cancelSubscription = async (reason?: string) => {
    if (!subscription) throw new Error('No active subscription');

    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'cancelled',
          cancellation_reason: reason,
          cancelled_at: new Date().toISOString(),
          auto_renew: false,
        })
        .eq('id', subscription.id);

      if (error) throw error;

      setSubscription(prev => prev ? {
        ...prev,
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: new Date(),
        autoRenew: false,
      } : null);

      toast({
        title: "Assinatura cancelada",
        description: "Sua assinatura foi cancelada com sucesso.",
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  };

  // Change plan
  const changePlan = async (newPlanId: string) => {
    if (!subscription) throw new Error('No active subscription');

    try {
      const newPlan = availablePlans.find(p => p.id === newPlanId);
      if (!newPlan) throw new Error('Plan not found');

      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          plan_id: newPlanId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id);

      if (error) throw error;

      setSubscription(prev => prev ? {
        ...prev,
        planId: newPlanId,
      } : null);

      toast({
        title: "Plano alterado",
        description: "Seu plano foi alterado para " + newPlan.name + ".",
      });
    } catch (error) {
      console.error('Error changing plan:', error);
      throw error;
    }
  };

  // Add payment method
  const addPaymentMethod = async (paymentMethod: Omit<PaymentMethod, 'id'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // If this is the default method, unset others
      if (paymentMethod.isDefault) {
        await supabase
          .from('payment_methods')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { data, error } = await supabase
        .from('payment_methods')
        .insert({
          user_id: user.id,
          type: paymentMethod.type,
          last_four_digits: paymentMethod.lastFour,
          card_brand: paymentMethod.brand,
          expiry_month: paymentMethod.expiryMonth,
          expiry_year: paymentMethod.expiryYear,
          is_default: paymentMethod.isDefault,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      const newPaymentMethod = convertSupabasePaymentMethod(data);
      setPaymentMethods(prev => [...prev, newPaymentMethod]);

      toast({
        title: "Método de pagamento adicionado",
        description: "Seu método de pagamento foi adicionado com sucesso.",
      });
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  };

  // Remove payment method
  const removePaymentMethod = async (paymentMethodId: string) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_active: false })
        .eq('id', paymentMethodId);

      if (error) throw error;

      setPaymentMethods(prev => prev.filter(pm => pm.id !== paymentMethodId));

      toast({
        title: "Método de pagamento removido",
        description: "Seu método de pagamento foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw error;
    }
  };

  // Set default payment method
  const setDefaultPaymentMethod = async (paymentMethodId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Unset all default methods
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Set the new default
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', paymentMethodId);

      if (error) throw error;

      setPaymentMethods(prev => prev.map(pm => ({
        ...pm,
        isDefault: pm.id === paymentMethodId,
      })));

      toast({
        title: "Método padrão alterado",
        description: "Seu método de pagamento padrão foi alterado.",
      });
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  };

  // Get current plan
  const getCurrentPlan = useCallback((): PricingPlan | null => {
    if (!subscription) return null;
    const foundPlan = availablePlans.find((p) => p.id === subscription.planId);
    return foundPlan
      ? { ...foundPlan, description: foundPlan.description || "" }
      : null;
  }, [subscription, availablePlans]);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [fetchSubscription]);

  return {
    subscription,
    paymentMethods,
    invoices,
    loading,
    processingPayment,
    subscribeToPlan,
    cancelSubscription,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    changePlan,
    getCurrentPlan,
    fetchSubscription,
    availablePlans,
  };
}