import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  UserSubscription,
  PricingPlan,
  PaymentMethod,
  Invoice,
} from "@/types/pricing";
import { usePricingQuery } from "@/hooks/usePricingQuery";
import { useSubscriptionLocalStorage } from "./useSubscriptionLocalStorage";
import { useSubscriptionActions } from "./useSubscriptionActions";
import { usePaymentMethodOperations } from "./usePaymentMethodOperations";

export function useSubscription() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: supabasePlans = [] } = usePricingQuery();
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null,
  );
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const availablePlans =
    supabasePlans && supabasePlans.length > 0 ? supabasePlans : [];

  const {
    saveSubscription,
    loadSubscription,
    savePaymentMethods,
    loadPaymentMethods,
    saveInvoices,
    loadInvoices,
  } = useSubscriptionLocalStorage();

  const fetchSubscription = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const storedSubscription = loadSubscription();
      const storedPaymentMethods = loadPaymentMethods();
      const storedInvoices = loadInvoices();

      if (storedSubscription) {
        setSubscription(storedSubscription);
        setPaymentMethods(storedPaymentMethods);
        setInvoices(storedInvoices);
        setLoading(false);
        return;
      }

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
  }, [user, loadSubscription, loadPaymentMethods, loadInvoices, toast]);

  const { processingPayment, subscribeToPlan, cancelSubscription, changePlan } =
    useSubscriptionActions({
      subscription,
      invoices,
      setSubscription,
      setInvoices,
      availablePlans,
    });

  const { addPaymentMethod, removePaymentMethod, setDefaultPaymentMethod } =
    usePaymentMethodOperations({
      paymentMethods,
      setPaymentMethods,
    });

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
  }, [user, fetchSubscription]);

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
    saveSubscription,
    savePaymentMethods,
    saveInvoices,
  };
}
