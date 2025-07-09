import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserSubscription, PricingPlan, PaymentMethod, Invoice } from '@/types/pricing';
import { usePricingQuery } from '@/hooks/usePricingQuery';
// Mock data removed - using Supabase integration

export function useSubscription() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: supabasePlans = [] } = usePricingQuery();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Use Supabase plans if available, fallback to empty array
  const availablePlans = supabasePlans && supabasePlans.length > 0 ? supabasePlans : [];

  // Store subscription in localStorage to persist between page refreshes
  const saveSubscriptionToLocalStorage = (subscription: UserSubscription | null) => {
    try {
      const userId = user?.id || 'anonymous';
      localStorage.setItem(`subscription_${userId}`, JSON.stringify(subscription));
    } catch (error) {
      console.error("Error saving subscription to localStorage:", error);
    }
  };

  // Load subscription from localStorage
  const loadSubscriptionFromLocalStorage = (): UserSubscription | null => {
    try {
      const userId = user?.id || 'anonymous';
      const storedSubscription = localStorage.getItem(`subscription_${userId}`);
      if (storedSubscription) {
        return JSON.parse(storedSubscription);
      }
    } catch (error) {
      console.error("Error loading subscription from localStorage:", error);
    }
    return null;
  };

  // Store payment methods in localStorage
  const savePaymentMethodsToLocalStorage = (methods: PaymentMethod[]) => {
    try {
      const userId = user?.id || 'anonymous';
      localStorage.setItem(`payment_methods_${userId}`, JSON.stringify(methods));
    } catch (error) {
      console.error("Error saving payment methods to localStorage:", error);
    }
  };

  // Load payment methods from localStorage
  const loadPaymentMethodsFromLocalStorage = (): PaymentMethod[] => {
    try {
      const userId = user?.id || 'anonymous';
      const storedMethods = localStorage.getItem(`payment_methods_${userId}`);
      if (storedMethods) {
        return JSON.parse(storedMethods);
      }
    } catch (error) {
      console.error("Error loading payment methods from localStorage:", error);
    }
    return [];
  };

  // Store invoices in localStorage
  const saveInvoicesToLocalStorage = (invoices: Invoice[]) => {
    try {
      const userId = user?.id || 'anonymous';
      localStorage.setItem(`invoices_${userId}`, JSON.stringify(invoices));
    } catch (error) {
      console.error("Error saving invoices to localStorage:", error);
    }
  };

  // Load invoices from localStorage
  const loadInvoicesFromLocalStorage = (): Invoice[] => {
    try {
      const userId = user?.id || 'anonymous';
      const storedInvoices = localStorage.getItem(`invoices_${userId}`);
      if (storedInvoices) {
        return JSON.parse(storedInvoices);
      }
    } catch (error) {
      console.error("Error loading invoices from localStorage:", error);
    }
    return [];
  };

  // Fetch subscription data
  const fetchSubscription = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log("Fetching subscription for user:", user.id);
      
      // First try to load from localStorage
      const storedSubscription = loadSubscriptionFromLocalStorage();
      const storedPaymentMethods = loadPaymentMethodsFromLocalStorage();
      const storedInvoices = loadInvoicesFromLocalStorage();
      
      if (storedSubscription) {
        console.log("Loaded subscription from localStorage");
        setSubscription(storedSubscription);
        setPaymentMethods(storedPaymentMethods);
        setInvoices(storedInvoices);
        setLoading(false);
        return;
      }
      
      // If no stored subscription, initialize with empty data
      console.log("No subscription data found");
      
      setSubscription(null);
      setPaymentMethods([]);
      setInvoices([]);
      
    } catch (error) {
      console.error("Error fetching subscription:", error);
      toast({
        title: "Erro ao carregar assinatura",
        description: "Não foi possível carregar os dados da sua assinatura.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Subscribe to a plan
  const subscribeToPlan = async (planId: string, paymentMethodId?: string) => {
    if (!user) return false;
    
    setProcessingPayment(true);
    try {
      console.log(`Subscribing to plan ${planId} with payment method ${paymentMethodId}`);
      
      // Find the plan
      const plan = availablePlans.find(p => p.id === planId);
      if (!plan) {
        throw new Error("Plano não encontrado");
      }
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a new subscription
      const newSubscription: UserSubscription = {
        id: `sub_${Date.now()}`,
        userId: user.id,
        planId: planId,
        status: "active",
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        cancelAtPeriodEnd: false,
        createdAt: new Date().toISOString()
      };
      
      // Create a new invoice
      const newInvoice: Invoice = {
        id: `inv_${Date.now()}`,
        userId: user.id,
        subscriptionId: newSubscription.id,
        amount: plan.price,
        status: "paid",
        dueDate: new Date().toISOString(),
        paidAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      // Update state
      setSubscription(newSubscription);
      setInvoices([newInvoice, ...invoices]);
      
      // Save to localStorage
      saveSubscriptionToLocalStorage(newSubscription);
      saveInvoicesToLocalStorage([newInvoice, ...invoices]);
      
      toast({
        title: "Assinatura realizada com sucesso",
        description: `Você assinou o plano ${plan.name}!`,
      });
      
      return true;
    } catch (error) {
      console.error("Error subscribing to plan:", error);
      toast({
        title: "Erro ao assinar plano",
        description: "Não foi possível processar sua assinatura. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setProcessingPayment(false);
    }
  };

  // Cancel subscription
  const cancelSubscription = async (atPeriodEnd: boolean = true) => {
    if (!subscription) return false;
    
    try {
      console.log(`Canceling subscription ${subscription.id}, atPeriodEnd: ${atPeriodEnd}`);
      
      // Update subscription
      const updatedSubscription: UserSubscription = {
        ...subscription,
        status: atPeriodEnd ? "active" : "canceled",
        cancelAtPeriodEnd: atPeriodEnd
      };
      
      setSubscription(updatedSubscription);
      saveSubscriptionToLocalStorage(updatedSubscription);
      
      toast({
        title: atPeriodEnd ? "Assinatura será cancelada" : "Assinatura cancelada",
        description: atPeriodEnd 
          ? "Sua assinatura será cancelada ao final do período atual." 
          : "Sua assinatura foi cancelada imediatamente.",
      });
      
      return true;
    } catch (error) {
      console.error("Error canceling subscription:", error);
      toast({
        title: "Erro ao cancelar assinatura",
        description: "Não foi possível cancelar sua assinatura. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Add payment method
  const addPaymentMethod = async (paymentMethod: Omit<PaymentMethod, 'id'>) => {
    try {
      console.log("Adding payment method:", paymentMethod);
      
      // Create a new payment method
      const newPaymentMethod: PaymentMethod = {
        ...paymentMethod,
        id: `pm_${Date.now()}`
      };
      
      // If this is the first payment method or marked as default, set it as default
      if (paymentMethods.length === 0 || newPaymentMethod.isDefault) {
        // Set all existing payment methods as not default
        const updatedPaymentMethods = paymentMethods.map(pm => ({
          ...pm,
          isDefault: false
        }));
        
        // Add the new payment method
        const newPaymentMethods = [...updatedPaymentMethods, newPaymentMethod];
        setPaymentMethods(newPaymentMethods);
        savePaymentMethodsToLocalStorage(newPaymentMethods);
      } else {
        // Add the new payment method without changing defaults
        const newPaymentMethods = [...paymentMethods, newPaymentMethod];
        setPaymentMethods(newPaymentMethods);
        savePaymentMethodsToLocalStorage(newPaymentMethods);
      }
      
      toast({
        title: "Forma de pagamento adicionada",
        description: "Sua nova forma de pagamento foi adicionada com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error("Error adding payment method:", error);
      toast({
        title: "Erro ao adicionar forma de pagamento",
        description: "Não foi possível adicionar sua forma de pagamento. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Remove payment method
  const removePaymentMethod = async (paymentMethodId: string) => {
    try {
      console.log("Removing payment method:", paymentMethodId);
      
      // Check if this is the default payment method
      const isDefault = paymentMethods.find(pm => pm.id === paymentMethodId)?.isDefault;
      
      // Remove the payment method
      const updatedPaymentMethods = paymentMethods.filter(pm => pm.id !== paymentMethodId);
      
      // If the removed payment method was the default, set a new default
      if (isDefault && updatedPaymentMethods.length > 0) {
        updatedPaymentMethods[0].isDefault = true;
      }
      
      setPaymentMethods(updatedPaymentMethods);
      savePaymentMethodsToLocalStorage(updatedPaymentMethods);
      
      toast({
        title: "Forma de pagamento removida",
        description: "Sua forma de pagamento foi removida com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error("Error removing payment method:", error);
      toast({
        title: "Erro ao remover forma de pagamento",
        description: "Não foi possível remover sua forma de pagamento. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Set default payment method
  const setDefaultPaymentMethod = async (paymentMethodId: string) => {
    try {
      console.log("Setting default payment method:", paymentMethodId);
      
      // Update all payment methods
      const updatedPaymentMethods = paymentMethods.map(pm => ({
        ...pm,
        isDefault: pm.id === paymentMethodId
      }));
      
      setPaymentMethods(updatedPaymentMethods);
      savePaymentMethodsToLocalStorage(updatedPaymentMethods);
      
      toast({
        title: "Forma de pagamento padrão atualizada",
        description: "Sua forma de pagamento padrão foi atualizada com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error("Error setting default payment method:", error);
      toast({
        title: "Erro ao definir forma de pagamento padrão",
        description: "Não foi possível definir sua forma de pagamento padrão. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Change subscription plan
  const changePlan = async (newPlanId: string) => {
    if (!subscription) return false;
    
    setProcessingPayment(true);
    try {
      console.log(`Changing subscription from ${subscription.planId} to ${newPlanId}`);
      
      // Find the new plan
      const plan = availablePlans.find(p => p.id === newPlanId);
      if (!plan) {
        throw new Error("Plano não encontrado");
      }
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update subscription
      const updatedSubscription: UserSubscription = {
        ...subscription,
        planId: newPlanId
      };
      
      // Create a new invoice for the plan change
      const newInvoice: Invoice = {
        id: `inv_${Date.now()}`,
        userId: user?.id || 'anonymous',
        subscriptionId: subscription.id,
        amount: plan.price,
        status: "paid",
        dueDate: new Date().toISOString(),
        paidAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      // Update state
      setSubscription(updatedSubscription);
      setInvoices([newInvoice, ...invoices]);
      
      // Save to localStorage
      saveSubscriptionToLocalStorage(updatedSubscription);
      saveInvoicesToLocalStorage([newInvoice, ...invoices]);
      
      toast({
        title: "Plano alterado com sucesso",
        description: `Seu plano foi alterado para ${plan.name}!`,
      });
      
      return true;
    } catch (error) {
      console.error("Error changing plan:", error);
      toast({
        title: "Erro ao alterar plano",
        description: "Não foi possível alterar seu plano. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setProcessingPayment(false);
    }
  };

  // Get current plan details
  const getCurrentPlan = useCallback((): PricingPlan | null => {
    if (!subscription) return null;
    const foundPlan = availablePlans.find(p => p.id === subscription.planId);
    // Ensure description is provided to match PricingPlan interface
    return foundPlan ? { ...foundPlan, description: foundPlan.description || '' } : null;
  }, [subscription, availablePlans]);

  // Initialize subscription data when component mounts
  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user, fetchSubscription]);

  // Pricing plans are automatically loaded by React Query

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
    fetchSubscription
  };
}