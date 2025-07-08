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
import { CreditCard, AlertCircle, CheckCircle } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

// Componente para exibir o estado de carregamento
const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-4">
    <div className="h-8 w-8 border-4 border-t-transparent border-purple-600 rounded-full animate-spin mb-2"></div>
    <p className="text-gray-500 dark:text-gray-400">Carregando...</p>
  </div>
);

// Componente para exibir quando não há assinatura
const NoSubscriptionState = () => (
  <div className="text-center py-4">
    <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-2" />
    <h3 className="font-medium mb-1">Sem assinatura ativa</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
      Assine um plano para acessar nossas IAs
    </p>
  </div>
);

// Mapas de status para classes e textos
const STATUS_CLASS_MAP = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  past_due: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  default: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
};

const STATUS_TEXT_MAP = {
  active: "Ativo",
  past_due: "Pagamento Pendente",
  trialing: "Em Teste",
  default: "Cancelado"
};

// Componente para exibir o status da assinatura
const SubscriptionStatusBadge = ({ status }) => {
  const statusClass = STATUS_CLASS_MAP[status] || STATUS_CLASS_MAP.default;
  const statusText = STATUS_TEXT_MAP[status] || STATUS_TEXT_MAP.default;
  
  return <Badge className={statusClass}>{statusText}</Badge>;
};

// Componente para exibir informações de renovação
const RenewalInfo = ({ cancelAtPeriodEnd, daysLeft }) => {
  // Configurações baseadas no status de cancelamento
  const config = cancelAtPeriodEnd
    ? {
        className: "text-orange-600 dark:text-orange-400",
        icon: <AlertCircle className="h-4 w-4 mr-1" />,
        text: `Assinatura será cancelada em ${daysLeft} dias`
      }
    : {
        className: "text-green-600 dark:text-green-400",
        icon: <CheckCircle className="h-4 w-4 mr-1" />,
        text: "Renovação automática ativada"
      };
  
  return (
    <div className={`flex items-center ${config.className} text-sm`}>
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
};

// Componente para exibir detalhes da assinatura ativa
const ActiveSubscriptionDetails = ({ subscription, currentPlan, daysLeft }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <div>
        <h3 className="font-semibold text-lg">
          Plano {currentPlan?.name || "Desconhecido"}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {currentPlan?.billingPeriod === "monthly" ? "Mensal" : "Anual"}
        </p>
      </div>
      <SubscriptionStatusBadge status={subscription.status} />
    </div>
    
    <div className="flex justify-between items-center">
      <span className="text-gray-600 dark:text-gray-400">Próxima cobrança:</span>
      <span className="font-medium">
        {new Date(subscription.currentPeriodEnd).toLocaleDateString("pt-BR")}
      </span>
    </div>
    
    <div className="flex justify-between items-center">
      <span className="text-gray-600 dark:text-gray-400">Valor:</span>
      <span className="font-medium">
        R$ {currentPlan?.price.toFixed(2) || "0.00"}
      </span>
    </div>
    
    <div className="flex items-center mt-2">
      <RenewalInfo 
        cancelAtPeriodEnd={subscription.cancelAtPeriodEnd} 
        daysLeft={daysLeft} 
      />
    </div>
  </div>
);

// Função auxiliar para calcular dias restantes até o fim do período
const calculateDaysLeft = (endDateString) => {
  if (!endDateString) return 0;
  
  const endDate = new Date(endDateString).getTime();
  const today = Date.now();
  return Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
};

// Componente para renderizar o conteúdo com base no estado da assinatura
const SubscriptionContent = ({ loading, subscription, currentPlan, daysLeft }) => {
  if (loading) return <LoadingState />;
  if (subscription) {
    return (
      <ActiveSubscriptionDetails 
        subscription={subscription} 
        currentPlan={currentPlan} 
        daysLeft={daysLeft} 
      />
    );
  }
  return <NoSubscriptionState />;
};

// Componente principal do cartão de assinatura
const SubscriptionCard = () => {
  const navigate = useNavigate();
  const { subscription, loading, getCurrentPlan } = useSubscription();
  
  const currentPlan = getCurrentPlan();
  const daysLeft = calculateDaysLeft(subscription?.currentPeriodEnd);

  const handleClick = () => {
    navigate("/subscription");
  };

  // Texto do rodapé baseado no status da assinatura
  const footerText = subscription ? "Gerenciar Assinatura" : "Ver Planos";
  
  return (
    <Card
      className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white"
      onClick={handleClick}
    >
      <CardHeader className="pb-2 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-6 w-6" />
          Assinatura
        </CardTitle>
        <CardDescription className="text-purple-100">
          Gerencie seu plano
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <SubscriptionContent
          loading={loading}
          subscription={subscription}
          currentPlan={currentPlan}
          daysLeft={daysLeft}
        />
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-700/50 rounded-b-lg border-t dark:border-gray-700 flex justify-center py-3">
        <Badge
          variant="outline"
          className="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-800/50"
        >
          {footerText}
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default SubscriptionCard;