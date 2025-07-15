import { useAuth } from "@/context/AuthContext";
import { UserSubscription, PaymentMethod, Invoice } from "@/types/pricing";

export const useSubscriptionLocalStorage = () => {
  const { user } = useAuth();
  const userId = user?.id || "anonymous";

  const saveSubscription = (subscription: UserSubscription | null) => {
    try {
      localStorage.setItem(
        `subscription_${userId}`,
        JSON.stringify(subscription),
      );
    } catch (error) {
      console.error("Error saving subscription to localStorage:", error);
    }
  };

  const loadSubscription = (): UserSubscription | null => {
    try {
      const storedSubscription = localStorage.getItem(`subscription_${userId}`);
      if (storedSubscription) {
        return JSON.parse(storedSubscription);
      }
    } catch (error) {
      console.error("Error loading subscription from localStorage:", error);
    }
    return null;
  };

  const savePaymentMethods = (methods: PaymentMethod[]) => {
    try {
      localStorage.setItem(
        `payment_methods_${userId}`,
        JSON.stringify(methods),
      );
    } catch (error) {
      console.error("Error saving payment methods to localStorage:", error);
    }
  };

  const loadPaymentMethods = (): PaymentMethod[] => {
    try {
      const storedMethods = localStorage.getItem(`payment_methods_${userId}`);
      if (storedMethods) {
        return JSON.parse(storedMethods);
      }
    } catch (error) {
      console.error("Error loading payment methods from localStorage:", error);
    }
    return [];
  };

  const saveInvoices = (invoices: Invoice[]) => {
    try {
      localStorage.setItem(`invoices_${userId}`, JSON.stringify(invoices));
    } catch (error) {
      console.error("Error saving invoices to localStorage:", error);
    }
  };

  const loadInvoices = (): Invoice[] => {
    try {
      const storedInvoices = localStorage.getItem(`invoices_${userId}`);
      if (storedInvoices) {
        return JSON.parse(storedInvoices);
      }
    } catch (error) {
      console.error("Error loading invoices from localStorage:", error);
    }
    return [];
  };

  return {
    saveSubscription,
    loadSubscription,
    savePaymentMethods,
    loadPaymentMethods,
    saveInvoices,
    loadInvoices,
  };
};
