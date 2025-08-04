import { useMemo } from "react";
import { useSupabaseSubscription } from "@/hooks/useSupabaseSubscription";
import { calculateDaysLeft } from "@/utils/subscriptionUtils";
import type { PricingPlan } from "@/types/pricing";

export const useSubscriptionPageData = () => {
  const subscriptionData = useSupabaseSubscription();

  const currentPlan = useMemo<PricingPlan | null>(() => {
    const plan = subscriptionData.availablePlans.find((plan) => plan.id === subscriptionData.subscription?.planId);
    if (!plan) return null;
    
    // Ensure the plan has required description field
    return {
      ...plan,
      description: plan.description || 'Plan description not available'
    } as PricingPlan;
  }, [subscriptionData.availablePlans, subscriptionData.subscription]);

  const daysLeft = useMemo(() => {
    return subscriptionData.subscription
      ? calculateDaysLeft(subscriptionData.subscription.currentPeriodEnd)
      : 0;
  }, [subscriptionData.subscription]);

  return {
    ...subscriptionData,
    currentPlan,
    daysLeft,
  };
};
