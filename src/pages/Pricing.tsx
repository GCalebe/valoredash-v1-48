import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useThemeSettings } from "@/context/ThemeSettingsContext";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ShipWheel,
  LogOut,
  Check,
  X,
  CreditCard,
  Zap,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSupabaseSubscription } from "@/hooks/useSupabaseSubscription";
import { useToast } from "@/hooks/use-toast";
import { PricingPlan } from "@/types/pricing";
import { usePricingQuery, usePricingByPeriodQuery } from "@/hooks/usePricingQuery";
import { useAIProductsQuery } from "@/hooks/useAIProductsQuery";
// Mock data removed - using Supabase integration

const Pricing = () => {
  const { user, signOut } = useAuth();
  const { settings } = useThemeSettings();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscription, subscribeToPlan, getCurrentPlan, processingPayment } = useSupabaseSubscription();
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
              <Card
                key={plan.id}
                className={`relative overflow-hidden transition-all duration-300 ${plan.popular ? "border-blue-500 dark:border-blue-400 shadow-lg" : ""} ${currentPlan?.id === plan.id ? "ring-2 ring-blue-500 dark:ring-blue-400" : ""}`}
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
                    <span className="text-4xl font-bold">
                      R$ {plan.price.toFixed(2)}
                    </span>
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
                      {plan.aiProducts.slice(0, 5).map((aiId) => {
                        const ai = displayAIProducts?.find(p => p.id === aiId);
                        return (
                          <Badge key={aiId} variant="outline" className="text-xs">
                            {ai ? ai.name : aiId}
                          </Badge>
                        );
                      })}
                      {plan.aiProducts.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{plan.aiProducts.length - 5} mais
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  {currentPlan?.id === plan.id ? (
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => navigate("/subscription")}
                    >
                      Plano Atual
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleSelectPlan(plan as PricingPlan)}
                      disabled={processingPayment}
                    >
                      {processingPayment ? "Processando..." : "Assinar Plano"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
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

      {/* Payment Dialog */}
      {showPaymentDialog && selectedPlan !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Finalizar Assinatura
              </h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowPaymentDialog(false)}
                className="text-gray-500"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="mb-6">
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 dark:text-gray-300">Plano</span>
                  <span className="font-medium">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between mb-2">
                   <span className="text-gray-700 dark:text-gray-300">Período</span>
                   <span className="font-medium">
                     {selectedPlan.billing_period === "monthly" ? "Mensal" : "Anual"}
                   </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Total</span>
                  <span className="font-bold">
                    R$ {selectedPlan.price.toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Forma de Pagamento
                  </label>
                  <div className="flex items-center space-x-2 border rounded-md p-3 bg-white dark:bg-gray-700">
                    <CreditCard className="h-5 w-5 text-gray-500" />
                    <span>Cartão de Crédito</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Número do Cartão
                    </label>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded-md"
                      placeholder="**** **** **** ****"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nome no Cartão
                    </label>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded-md"
                      placeholder="Nome no cartão"
                      disabled
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Validade
                    </label>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded-md"
                      placeholder="MM/AA"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      CVV
                    </label>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded-md"
                      placeholder="***"
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowPaymentDialog(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSubscribe}
                disabled={processingPayment}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {processingPayment ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processando...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Shield className="mr-2 h-4 w-4" />
                    Finalizar Assinatura
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pricing;