import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreditCard,
  Settings,
  User,
  LogOut,
  Star,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useThemeSettings } from "@/context/ThemeSettingsContext";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionPageData } from "@/hooks/useSubscriptionPageData";
import CancelSubscriptionDialog from "@/components/subscription/CancelSubscriptionDialog";
import AddPaymentMethodDialog from "@/components/subscription/AddPaymentMethodDialog";
import ChangePlanDialog from "@/components/subscription/ChangePlanDialog";
import PaymentMethodsSection from "@/components/subscription/PaymentMethodsSection";
import InvoicesTable from "@/components/subscription/InvoicesTable";
import { formatDate } from "@/utils/formatters";
import { calculateDaysLeft } from "@/utils/subscriptionUtils";
// Mock data removed - using Supabase integration
import type { PaymentMethod } from "@/types/pricing";

const Subscription: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { settings } = useThemeSettings();
  const { toast } = useToast();
  const {
    subscription,
    paymentMethods,
    invoices,
    loading,
    processingPayment,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    cancelSubscription,
    changePlan,
    availablePlans,
    currentPlan,
    daysLeft,
  } = useSubscriptionPageData();

  // State management
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false);
  const [showChangePlanDialog, setShowChangePlanDialog] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [newPaymentMethod, setNewPaymentMethod] = useState<
    Omit<PaymentMethod, "id">
  >({
    type: "credit_card",
    lastFour: "",
    brand: "",
    expiryMonth: 1,
    expiryYear: new Date().getFullYear(),
    isDefault: false,
  });

  // Pricing plans are automatically loaded by React Query via hook

  // Event handlers
  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription();
      setShowCancelDialog(false);
      toast({
        title: "Assinatura cancelada",
        description: "Sua assinatura foi cancelada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível cancelar a assinatura.",
        variant: "destructive",
      });
    }
  };

  const handleAddPaymentMethod = async () => {
    try {
      await addPaymentMethod(newPaymentMethod);
      setShowAddPaymentDialog(false);
      setNewPaymentMethod({
        type: "credit_card",
        lastFour: "",
        brand: "",
        expiryMonth: 1,
        expiryYear: new Date().getFullYear(),
        isDefault: false,
      });
      toast({
        title: "Método de pagamento adicionado",
        description: "Seu método de pagamento foi adicionado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o método de pagamento.",
        variant: "destructive",
      });
    }
  };

  const handleRemovePaymentMethod = async (id: string) => {
    try {
      await removePaymentMethod(id);
      toast({
        title: "Método removido",
        description: "Método de pagamento removido com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o método de pagamento.",
        variant: "destructive",
      });
    }
  };

  const handleSetDefaultPaymentMethod = async (id: string) => {
    try {
      await setDefaultPaymentMethod(id);
      toast({
        title: "Método padrão definido",
        description: "Método de pagamento padrão atualizado.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível definir o método padrão.",
        variant: "destructive",
      });
    }
  };

  const handleChangePlan = async () => {
    try {
      await changePlan(selectedPlanId);
      setShowChangePlanDialog(false);
      setSelectedPlanId("");
      toast({
        title: "Plano alterado",
        description: "Seu plano foi alterado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar o plano.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast({
      title: "Download iniciado",
      description: `Fatura #${invoiceId} está sendo baixada.`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">V</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Valore
                </h1>
              </div>
              <span className="text-gray-500 dark:text-gray-400">/</span>
              <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Assinatura
              </h2>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/settings")}
              >
                <Settings className="h-5 w-5" />
              </Button>

              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.user_metadata?.name || "Usuário"}
                </span>
              </div>

              <Button variant="ghost" size="icon" onClick={signOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {!subscription ? (
          <div className="text-center py-12">
            <CreditCard className="h-16 w-16 mx-auto text-gray-400" />
            <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-gray-100">
              Nenhuma assinatura ativa
            </h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Você não possui uma assinatura ativa. Escolha um plano para começar a usar todas as funcionalidades.
            </p>
            <Button className="mt-6" onClick={() => navigate("/pricing")}>
              Ver Planos
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Subscription Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Assinatura Atual
                  </span>
                  <Badge
                    className={`${
                      subscription.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : subscription.status === "canceled"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                    }`}
                  >
                    {subscription.status === "active"
                      ? "Ativa"
                      : subscription.status === "canceled"
                      ? "Cancelada"
                      : "Pendente"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      Plano
                    </h4>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {currentPlan?.name || "Plano Desconhecido"}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      R$ {currentPlan?.price.toFixed(2) || "0.00"}/
                      {currentPlan?.billingPeriod === "monthly" ? "mês" : "ano"}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      Próxima cobrança
                    </h4>
                    <p className="text-lg font-semibold">
                      {formatDate(subscription.currentPeriodEnd)}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {daysLeft > 0 ? `${daysLeft} dias restantes` : "Vencido"}
                    </p>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowChangePlanDialog(true);
                        setSelectedPlanId(currentPlan?.id || "");
                      }}
                    >
                      Alterar Plano
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setShowCancelDialog(true)}
                    >
                      Cancelar Assinatura
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="payment-methods" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="payment-methods">Formas de Pagamento</TabsTrigger>
                <TabsTrigger value="invoices">Faturas</TabsTrigger>
              </TabsList>

              <TabsContent value="payment-methods" className="space-y-6">
                <PaymentMethodsSection
                  paymentMethods={paymentMethods}
                  onAdd={() => setShowAddPaymentDialog(true)}
                  onRemove={handleRemovePaymentMethod}
                  onSetDefault={handleSetDefaultPaymentMethod}
                />
              </TabsContent>

              <TabsContent value="invoices" className="space-y-6">
                <InvoicesTable invoices={invoices} onDownload={handleDownloadInvoice} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      <CancelSubscriptionDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={handleCancelSubscription}
        subscription={subscription}
      />

      <AddPaymentMethodDialog
        open={showAddPaymentDialog}
        onOpenChange={setShowAddPaymentDialog}
        paymentMethod={newPaymentMethod}
        setPaymentMethod={setNewPaymentMethod}
        onAdd={handleAddPaymentMethod}
      />

      <ChangePlanDialog
        open={showChangePlanDialog}
        onOpenChange={setShowChangePlanDialog}
        availablePlans={availablePlans}
        currentPlan={currentPlan}
        selectedPlanId={selectedPlanId}
        setSelectedPlanId={setSelectedPlanId}
        onConfirm={handleChangePlan}
        processing={processingPayment}
      />
    </div>
  );
};

export default Subscription;
