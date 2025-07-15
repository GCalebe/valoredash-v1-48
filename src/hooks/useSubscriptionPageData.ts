import { useMemo } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { usePricingQuery } from "@/hooks/usePricingQuery";
import { calculateDaysLeft } from "@/utils/subscriptionUtils";
import type { PricingPlan } from "@/types/pricing";

export const useSubscriptionPageData = () => {
  const subscriptionData = useSubscription();
  const { data: supabasePlans = [] } = usePricingQuery();

  const availablePlans = supabasePlans.length > 0 ? supabasePlans : [];

  const currentPlan = useMemo<PricingPlan | null>(() => {
    return (
      availablePlans.find((plan) => plan.id === subscriptionData.subscription?.planId) ||
      null
    );
  }, [availablePlans, subscriptionData.subscription]);

  const daysLeft = useMemo(() => {
    return subscriptionData.subscription
      ? calculateDaysLeft(subscriptionData.subscription.currentPeriodEnd)
      : 0;
  }, [subscriptionData.subscription]);

  return {
    ...subscriptionData,
    availablePlans,
    currentPlan,
    daysLeft,
  };
};
