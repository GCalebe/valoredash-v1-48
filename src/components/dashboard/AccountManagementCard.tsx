import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Settings, CreditCard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";

const AccountManagementCard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription, getCurrentPlan } = useSubscription();
  
  const currentPlan = getCurrentPlan();

  const handleClick = () => {
    navigate("/subscription");
  };

  return (
    <Card
      className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white h-full flex flex-col"
      onClick={handleClick}
    >
      <CardHeader className="pb-2 bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-700 dark:to-emerald-700 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4" />
          Gerenciamento
        </CardTitle>
        <CardDescription className="text-teal-100 text-xs">
          Assinatura e configurações
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2 flex-grow flex flex-col items-center justify-center">
        <div className="mb-2 flex justify-center">
          <div className="bg-teal-100 dark:bg-teal-900/30 p-3 rounded-full">
            <Settings className="h-8 w-8 text-teal-500 dark:text-teal-400" />
          </div>
        </div>
        
        <div className="space-y-1 text-center">
          <div className="flex items-center justify-center gap-1">
            <span className="text-xs text-gray-600 dark:text-gray-300">
              Status:
            </span>
            {subscription ? (
              <Badge className={
                subscription.status === "active"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs px-1.5 py-0"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 text-xs px-1.5 py-0"
              }>
                {subscription.status === "active"
                  ? "Ativo"
                  : "Pendente"}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs px-1.5 py-0">Sem assinatura</Badge>
            )}
          </div>
          
          <div className="flex items-center justify-center gap-1">
            <span className="text-xs text-gray-600 dark:text-gray-300">
              Plano:
            </span>
            <span className="text-xs font-medium">
              {currentPlan?.name || "Nenhum"}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-700/50 rounded-b-lg border-t dark:border-gray-700 flex justify-between py-2 mt-auto">
        <Badge
          variant="outline"
          className="bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-800/50 text-xs"
        >
          Gerenciar
        </Badge>
        
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <CreditCard className="h-3 w-3" />
          <span>{subscription ? "Ativo" : "Assinar"}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AccountManagementCard;