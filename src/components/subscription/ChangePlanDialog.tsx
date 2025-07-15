import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, RefreshCw } from "lucide-react";
import type { PricingPlan } from "@/types/pricing";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availablePlans: PricingPlan[];
  currentPlan: PricingPlan | null | undefined;
  selectedPlanId: string;
  setSelectedPlanId: (id: string) => void;
  onConfirm: () => void;
  processing: boolean;
}

const ChangePlanDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  availablePlans,
  currentPlan,
  selectedPlanId,
  setSelectedPlanId,
  onConfirm,
  processing,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Alterar Plano</DialogTitle>
        <DialogDescription>
          Escolha o plano que melhor atende às suas necessidades.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availablePlans
            .filter(
              (plan) => plan.billing_period === (currentPlan?.billing_period || "monthly")
            )
            .map((plan) => (
              <div
                key={plan.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPlanId === plan.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                }`}
                onClick={() => setSelectedPlanId(plan.id)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{plan.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {plan.description}
                    </p>
                  </div>
                  {selectedPlanId === plan.id && <Check className="h-5 w-5 text-blue-600" />}
                </div>

                <div className="mb-4">
                  <span className="text-2xl font-bold">R$ {plan.price.toFixed(2)}</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">
                    /{plan.billing_period === "monthly" ? "mês" : "ano"}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <p className="font-medium mb-1">Instâncias:</p>
                    <p className="text-gray-600 dark:text-gray-400">{plan.instances}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="font-medium mb-1">Mensagens:</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {!plan.messages || plan.messages === 0 ? "Ilimitadas" : plan.messages}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="font-medium mb-1">IAs incluídas:</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {plan.aiProducts.length} inteligências artificiais
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          disabled={!selectedPlanId || selectedPlanId === currentPlan?.id || processing}
        >
          {processing ? (
            <span className="flex items-center">
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Processando...
            </span>
          ) : (
            "Confirmar Alteração"
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default ChangePlanDialog;
