import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { PricingPlan } from "@/types/pricing";

interface PlanCardProps {
  plan: PricingPlan;
  billingPeriod: "monthly" | "yearly";
  aiProducts: { id: string; name: string }[];
  currentPlanId?: string;
  processingPayment: boolean;
  onSelectPlan: (plan: PricingPlan) => void;
  onManageCurrent: () => void;
}

export default function PlanCard({
  plan,
  billingPeriod,
  aiProducts,
  currentPlanId,
  processingPayment,
  onSelectPlan,
  onManageCurrent,
}: PlanCardProps) {
  const findAiName = (id: string) =>
    aiProducts.find((p) => p.id === id)?.name || id;

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-300 ${
        plan.popular ? "border-blue-500 dark:border-blue-400 shadow-lg" : ""
      } ${currentPlanId === plan.id ? "ring-2 ring-blue-500 dark:ring-blue-400" : ""}`}
    >
      {plan.popular && (
        <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-lg font-medium text-sm">
          Mais Popular
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <span className="text-4xl font-bold">R$ {plan.price.toFixed(2)}</span>
          <span className="text-gray-500 dark:text-gray-400">
            /{billingPeriod === "monthly" ? "mês" : "ano"}
          </span>
        </div>
        <div className="space-y-3">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            IAs incluídas:
          </p>
          <div className="flex flex-wrap gap-2">
            {plan.aiProducts.slice(0, 5).map((aiId) => (
              <Badge key={aiId} variant="outline" className="text-xs">
                {findAiName(aiId)}
              </Badge>
            ))}
            {plan.aiProducts.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{plan.aiProducts.length - 5} mais
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {currentPlanId === plan.id ? (
          <Button className="w-full" variant="outline" onClick={onManageCurrent}>
            Plano Atual
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={() => onSelectPlan(plan)}
            disabled={processingPayment}
          >
            {processingPayment ? "Processando..." : "Assinar Plano"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
