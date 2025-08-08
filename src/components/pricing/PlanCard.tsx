import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { PricingPlan } from "@/types/pricing";

interface PlanCardProps {
  plan: PricingPlan & { popular?: boolean };
  billingPeriod: "monthly" | "yearly";
  currentPlanId?: string;
  aiProducts: { id: string; name: string }[];
  processingPayment?: boolean;
  onSelect: (plan: PricingPlan) => void;
  onGoToSubscription: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, billingPeriod, currentPlanId, aiProducts, processingPayment, onSelect, onGoToSubscription }) => {
  const isCurrent = currentPlanId === plan.id;
  const displayAIProducts = aiProducts || [];
  return (
    <Card className={`relative overflow-hidden transition-all duration-300 ${plan.popular ? "border-blue-500 dark:border-blue-400 shadow-lg" : ""} ${isCurrent ? "ring-2 ring-blue-500 dark:ring-blue-400" : ""}`}>
      {plan.popular && (
        <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-lg font-medium text-sm">Mais Popular</div>
      )}
      <CardHeader>
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <span className="text-4xl font-bold">R$ {plan.price.toFixed(2)}</span>
          <span className="text-gray-500 dark:text-gray-400">/{billingPeriod === "monthly" ? "mês" : "ano"}</span>
        </div>
        <div className="space-y-3">
          {plan.features.map((feature) => (
            <div key={feature} className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">IAs incluídas:</p>
          <div className="flex flex-wrap gap-2">
            {plan.aiProducts.slice(0, 5).map((aiId) => {
              const ai = displayAIProducts.find((p) => p.id === aiId);
              return (
                <Badge key={aiId} variant="outline" className="text-xs">
                  {ai ? ai.name : aiId}
                </Badge>
              );
            })}
            {plan.aiProducts.length > 5 && (
              <Badge variant="outline" className="text-xs">+{plan.aiProducts.length - 5} mais</Badge>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {isCurrent ? (
          <Button className="w-full" variant="outline" onClick={onGoToSubscription}>Plano Atual</Button>
        ) : (
          <Button className="w-full" onClick={() => onSelect(plan)} disabled={processingPayment}>
            {processingPayment ? "Processando..." : "Assinar Plano"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PlanCard;


