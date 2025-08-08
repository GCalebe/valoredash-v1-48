// @ts-nocheck
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useThemeSettings } from "@/context/ThemeSettingsContext";
import { Button } from "@/components/ui/button";
import PaymentDialog from "@/components/pricing/PaymentDialog";
import { ArrowLeft, ShipWheel, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { PricingPlan } from "@/types/pricing";
import { usePricingByPeriodQuery } from "@/hooks/usePricingQuery";
import { useAIProductsQuery } from "@/hooks/useAIProductsQuery";
import PlanCard from "@/components/pricing/PlanCard";
// Mock data removed - using Supabase integration

const Pricing = () => {
  const { user, signOut } = useAuth();
  const { settings } = useThemeSettings();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscribeToPlan, getCurrentPlan, processingPayment } = useSubscription();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  
  const currentPlan = getCurrentPlan();
  
  // Use React Query hooks for data fetching
  const { data: plans = [], isLoading: plansLoading } = usePricingByPeriodQuery(billingPeriod);
  const { data: aiProducts = [] } = useAIProductsQuery();
  
  const displayAIProducts = aiProducts;

  const handleSelectPlan = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setShowPaymentDialog(true);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    
    const success = await subscribeToPlan(selectedPlan.id);
    if (success) {
      setShowPaymentDialog(false);
      navigate("/subscription");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <header
        className="text-white shadow-md transition-colors duration-300 rounded-b-xl"
        style={{ backgroundColor: settings.primaryColor }}
      >
        <div className="flex flex-row items-center justify-between min-h-[64px] w-full px-6 py-0">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="text-white hover:bg-white/20 focus-visible:ring-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            {settings.logo ? (
              <img
                src={settings.logo}
                alt="Logo"
                className="h-8 w-8 object-contain" />
            ) : (
              <ShipWheel
                className="h-8 w-8"
                style={{ color: settings.secondaryColor }} />
            )}
            <h1 className="text-2xl font-bold">{settings.brandName}</h1>
            <span className="text-lg ml-2">- Planos</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="bg-white/10 text-white border-0 px-3 py-1"
            >
              {user?.user_metadata?.name || user?.email}
            </Badge>
            <Button
              variant="outline"
              onClick={signOut}
              className="border-white text-white bg-transparent hover:bg-white/20"
              style={{ height: 40, borderRadius: 8, borderWidth: 1.4 }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Escolha o plano ideal para o seu negócio
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Acesse nossas inteligências artificiais e transforme sua empresa com automação inteligente
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm">
            <Tabs
              defaultValue="monthly"
              value={billingPeriod}
              onValueChange={(value) => setBillingPeriod(value as "monthly" | "yearly")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="monthly">Mensal</TabsTrigger>
                <TabsTrigger value="yearly">
                  Anual
                  <Badge className="ml-2 bg-green-500 text-white">-20%</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {plansLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Carregando planos...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan as any}
                billingPeriod={billingPeriod}
                currentPlanId={currentPlan?.id}
                aiProducts={displayAIProducts as any}
                processingPayment={processingPayment}
                onSelect={(p) => handleSelectPlan(p)}
                onGoToSubscription={() => navigate("/subscription")}
              />
            ))}
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            Perguntas Frequentes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold mb-2">Como funciona a cobrança?</h4>
              <p className="text-gray-600 dark:text-gray-400">
                A cobrança é feita mensalmente ou anualmente, dependendo do plano escolhido. Você pode alterar seu plano a qualquer momento.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2">Posso cancelar a qualquer momento?</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Sim, você pode cancelar sua assinatura a qualquer momento. O acesso permanecerá ativo até o final do período pago.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2">Como funciona o período de teste?</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Oferecemos um período de teste de 7 dias para novos usuários. Você pode cancelar a qualquer momento durante este período.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2">Quais formas de pagamento são aceitas?</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Aceitamos cartões de crédito, PIX e boleto bancário para todos os planos.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-lg shadow-md p-8 text-white mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Precisa de mais informações?</h3>
              <p className="text-blue-100 mb-4 md:mb-0">
                Entre em contato com nossa equipe para saber mais sobre nossos planos e como podemos ajudar seu negócio.
              </p>
            </div>
            <Button
              variant="outline"
              className="bg-white text-blue-600 hover:bg-blue-50"
              onClick={() => {
                toast({
                  title: "Contato",
                  description: "Em breve nossa equipe entrará em contato com você!",
                });
              }}
            >
              Falar com um Consultor
            </Button>
          </div>
        </div>
      </main>

      {showPaymentDialog && selectedPlan !== null && (
        <PaymentDialog plan={selectedPlan} processing={processingPayment} onClose={() => setShowPaymentDialog(false)} onConfirm={handleSubscribe} />
      )}
    </div>
  );
};

export default Pricing;