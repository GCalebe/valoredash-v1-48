// @ts-nocheck
import { useToast } from "@/hooks/use-toast";
import { PaymentMethod } from "@/types/pricing";
import { useSubscriptionLocalStorage } from "./useSubscriptionLocalStorage";

interface PaymentOperationsProps {
  paymentMethods: PaymentMethod[];
  setPaymentMethods: (methods: PaymentMethod[]) => void;
}

export const usePaymentMethodOperations = ({
  paymentMethods,
  setPaymentMethods,
}: PaymentOperationsProps) => {
  const { toast } = useToast();
  const { savePaymentMethods } = useSubscriptionLocalStorage();

  const addPaymentMethod = async (paymentMethod: Omit<PaymentMethod, "id">) => {
    try {
      const newPaymentMethod: PaymentMethod = {
        ...paymentMethod,
        id: `pm_${Date.now()}`,
      };

      if (paymentMethods.length === 0 || newPaymentMethod.isDefault) {
        const updated = paymentMethods.map((pm) => ({
          ...pm,
          isDefault: false,
        }));
        const newMethods = [...updated, newPaymentMethod];
        setPaymentMethods(newMethods);
        savePaymentMethods(newMethods);
      } else {
        const newMethods = [...paymentMethods, newPaymentMethod];
        setPaymentMethods(newMethods);
        savePaymentMethods(newMethods);
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
        description:
          "Não foi possível adicionar sua forma de pagamento. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  const removePaymentMethod = async (paymentMethodId: string) => {
    try {
      const isDefault = paymentMethods.find(
        (pm) => pm.id === paymentMethodId,
      )?.isDefault;
      const updatedMethods = paymentMethods.filter(
        (pm) => pm.id !== paymentMethodId,
      );

      if (isDefault && updatedMethods.length > 0) {
        updatedMethods[0].isDefault = true;
      }

      setPaymentMethods(updatedMethods);
      savePaymentMethods(updatedMethods);

      toast({
        title: "Forma de pagamento removida",
        description: "Sua forma de pagamento foi removida com sucesso.",
      });

      return true;
    } catch (error) {
      console.error("Error removing payment method:", error);
      toast({
        title: "Erro ao remover forma de pagamento",
        description:
          "Não foi possível remover sua forma de pagamento. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  const setDefaultPaymentMethod = async (paymentMethodId: string) => {
    try {
      const updatedMethods = paymentMethods.map((pm) => ({
        ...pm,
        isDefault: pm.id === paymentMethodId,
      }));

      setPaymentMethods(updatedMethods);
      savePaymentMethods(updatedMethods);

      toast({
        title: "Forma de pagamento padrão atualizada",
        description:
          "Sua forma de pagamento padrão foi atualizada com sucesso.",
      });

      return true;
    } catch (error) {
      console.error("Error setting default payment method:", error);
      toast({
        title: "Erro ao definir forma de pagamento padrão",
        description:
          "Não foi possível definir sua forma de pagamento padrão. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
  };
};
