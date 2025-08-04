import React, { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { usePricingQuery } from "@/hooks/usePricingQuery";

// Define AIProduct interface locally to avoid mock dependency
interface AIProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  features: string[];
  image: string;
  icon: string;
  popular: boolean;
  new: boolean;
  rating: number;
  reviews: number;
}

interface AIProductPriceTagProps {
  product: AIProduct;
  showButton?: boolean;
  size?: "sm" | "md" | "lg";
}

const AIProductPriceTag: React.FC<AIProductPriceTagProps> = ({
  product,
  showButton = true,
  size = "md",
}) => {
  const navigate = useNavigate();
  const { subscription, getCurrentPlan } = useSubscription();
  const { data: supabasePlans = [] } = usePricingQuery();
  
  const currentPlan = getCurrentPlan();
  const hasAccess = currentPlan?.ai_products?.includes(product.id) || false;
  
  // Use Supabase plans if available
  const availablePlans = supabasePlans || [];
  
  // Find the cheapest plan that includes this AI product
  const cheapestPlan = availablePlans
    .filter(plan => plan.billing_period === "monthly" && (plan as unknown as {ai_products?: string[]}).ai_products?.includes(product.id))
    .sort((a, b) => a.price - b.price)[0];
    
  // Plans are automatically loaded by React Query
  
  const handleClick = () => {
    if (hasAccess) {
      navigate(`/knowledge?aiProduct=${product.id}`);
    } else {
      navigate("/pricing");
    }
  };
  
  return (
    <div className={`flex ${size === "sm" ? "flex-col items-start gap-1" : "items-center justify-between"}`}>
      <div className="flex items-center gap-2">
        {hasAccess ? (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            Incluída no seu plano
          </Badge>
        ) : (
          <div className="flex items-center gap-1">
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              A partir de R$ {cheapestPlan?.price.toFixed(2) || "99.90"}/mês
            </Badge>
            <Badge variant="outline" className="text-xs">
              Plano {cheapestPlan?.name || "Básico"}
            </Badge>
          </div>
        )}
      </div>
      
      {showButton && (
        <Button 
          onClick={handleClick}
          className={size === "sm" ? "mt-2" : ""}
          variant={hasAccess ? "default" : "outline"}
          size={size === "sm" ? "sm" : "default"}
        >
          {hasAccess ? "Acessar" : "Ver Planos"}
        </Button>
      )}
    </div>
  );
};

export default AIProductPriceTag;