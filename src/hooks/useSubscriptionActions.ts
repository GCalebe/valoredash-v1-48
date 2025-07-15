import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { UserSubscription, Invoice } from "@/types/pricing";
import { usePricingQuery } from "@/hooks/usePricingQuery";
import { useSubscriptionLocalStorage } from "./useSubscriptionLocalStorage";

interface SubscriptionActionsProps {
  subscription: UserSubscription | null;
  invoices: Invoice[];
  setSubscription: (subscription: UserSubscription) => void;
  setInvoices: (invoices: Invoice[]) => void;
  availablePlans: ReturnType<typeof usePricingQuery>["data"];
}

export const useSubscriptionActions = ({
  subscription,
  invoices,
  setSubscription,
  setInvoices,
  availablePlans,
}: SubscriptionActionsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { saveSubscription, saveInvoices } = useSubscriptionLocalStorage();
  const [processingPayment, setProcessingPayment] = useState(false);

  const subscribeToPlan = async (planId: string, paymentMethodId?: string) => {
    if (!user) return false;

    setProcessingPayment(true);
    try {
      const plan = availablePlans?.find((p) => p.id === planId);
      if (!plan) {
        throw new Error("Plano não encontrado");
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const newSubscription: UserSubscription = {
        id: `sub_${Date.now()}`,
        userId: user.id,
        planId,
        status: "active",
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        cancelAtPeriodEnd: false,
        createdAt: new Date().toISOString(),
      };

      const newInvoice: Invoice = {
        id: `inv_${Date.now()}`,
        userId: user.id,
        subscriptionId: newSubscription.id,
        amount: plan.price,
        status: "paid",
        dueDate: new Date().toISOString(),
        paidAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      setSubscription(newSubscription);
      setInvoices([newInvoice, ...invoices]);

      saveSubscription(newSubscription);
      saveInvoices([newInvoice, ...invoices]);

      toast({
        title: "Assinatura realizada com sucesso",
        description: `Você assinou o plano ${plan.name}!`,
      });

      return true;
    } catch (error) {
      console.error("Error subscribing to plan:", error);
      toast({
        title: "Erro ao assinar plano",
        description:
          "Não foi possível processar sua assinatura. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setProcessingPayment(false);
    }
  };

  const cancelSubscription = async (atPeriodEnd: boolean = true) => {
    if (!subscription) return false;

    try {
      const updatedSubscription: UserSubscription = {
        ...subscription,
        status: atPeriodEnd ? "active" : "canceled",
        cancelAtPeriodEnd: atPeriodEnd,
      };

      setSubscription(updatedSubscription);
      saveSubscription(updatedSubscription);

      toast({
        title: atPeriodEnd
          ? "Assinatura será cancelada"
          : "Assinatura cancelada",
        description: atPeriodEnd
          ? "Sua assinatura será cancelada ao final do período atual."
          : "Sua assinatura foi cancelada imediatamente.",
      });

      return true;
    } catch (error) {
      console.error("Error canceling subscription:", error);
      toast({
        title: "Erro ao cancelar assinatura",
        description:
          "Não foi possível cancelar sua assinatura. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  const changePlan = async (newPlanId: string) => {
    if (!subscription) return false;

    setProcessingPayment(true);
    try {
      const plan = availablePlans?.find((p) => p.id === newPlanId);
      if (!plan) {
        throw new Error("Plano não encontrado");
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const updatedSubscription: UserSubscription = {
        ...subscription,
        planId: newPlanId,
      };

      const newInvoice: Invoice = {
        id: `inv_${Date.now()}`,
        userId: user?.id || "anonymous",
        subscriptionId: subscription.id,
        amount: plan.price,
        status: "paid",
        dueDate: new Date().toISOString(),
        paidAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      setSubscription(updatedSubscription);
      setInvoices([newInvoice, ...invoices]);

      saveSubscription(updatedSubscription);
      saveInvoices([newInvoice, ...invoices]);

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

  return {
    processingPayment,
    subscribeToPlan,
    cancelSubscription,
    changePlan,
  };
};
