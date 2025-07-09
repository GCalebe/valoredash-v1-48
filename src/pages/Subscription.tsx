import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  CreditCard,
  Download,
  Plus,
  Receipt,
  Settings,
  User,
  LogOut,
  Check,
  X,
  RefreshCw,
  CreditCard as CreditCardIcon,
  QrCode,
  Banknote,
  Building,
  Trash2,
  Star,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useThemeSettings } from "@/context/ThemeSettingsContext";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { usePricingQuery } from "@/hooks/usePricingQuery";
// Mock data removed - using Supabase integration
import type { PaymentMethod, UserSubscription, Invoice, PricingPlan } from "@/types/pricing";

// Utility functions
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const calculateDaysLeft = (endDate: string): number => {
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

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
  } = useSubscription();
  const { data: supabasePlans = [] } = usePricingQuery();

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

  // Pricing plans are automatically loaded by React Query

  // Derived data - use Supabase plans if available, fallback to empty array
  const availablePlans = supabasePlans.length > 0 ? supabasePlans : [];
  const currentPlan = availablePlans.find(
    plan => plan.id === subscription?.planId
  );
  const daysLeft = subscription
    ? calculateDaysLeft(subscription.currentPeriodEnd)
    : 0;

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

              {/* Payment Methods Tab */}
              <TabsContent value="payment-methods" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Formas de Pagamento</h3>
                  <Button onClick={() => setShowAddPaymentDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>

                {paymentMethods.length > 0 ? (
                  <div className="grid gap-4">
                    {paymentMethods.map(method => (
                      <Card key={method.id}>
                        <CardContent className="flex items-center justify-between p-6">
                          <div className="flex items-center space-x-4">
                            {method.type === "credit_card" ? (
                              <CreditCardIcon className="h-8 w-8 text-blue-600" />
                            ) : method.type === "pix" ? (
                              <QrCode className="h-8 w-8 text-green-600" />
                            ) : method.type === "boleto" ? (
                              <Banknote className="h-8 w-8 text-orange-600" />
                            ) : (
                              <Building className="h-8 w-8 text-purple-600" />
                            )}
                            <div>
                              <p className="font-medium">
                                {method.type === "credit_card"
                                  ? `${method.brand} •••• ${method.lastFour}`
                                  : method.type === "pix"
                                  ? "PIX"
                                  : method.type === "boleto"
                                  ? "Boleto Bancário"
                                  : "Transferência Bancária"}
                              </p>
                              {method.type === "credit_card" && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Expira em {method.expiryMonth.toString().padStart(2, "0")}/
                                  {method.expiryYear}
                                </p>
                              )}
                              {method.isDefault && (
                                <Badge className="mt-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                  Padrão
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {!method.isDefault && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSetDefaultPaymentMethod(method.id)}
                              >
                                Definir como padrão
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemovePaymentMethod(method.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <CreditCard className="h-16 w-16 mx-auto text-gray-400" />
                    <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-gray-100">
                      Nenhuma forma de pagamento cadastrada
                    </h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                      Adicione uma forma de pagamento para facilitar suas renovações.
                    </p>
                    <Button className="mt-6" onClick={() => setShowAddPaymentDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Forma de Pagamento
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Invoices Tab */}
              <TabsContent value="invoices" className="space-y-6">
                <h3 className="text-xl font-semibold">Histórico de Faturas</h3>

                {invoices.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoices.map(invoice => (
                          <TableRow key={invoice.id}>
                            <TableCell>{formatDate(invoice.date)}</TableCell>
                            <TableCell>R$ {invoice.amount.toFixed(2)}</TableCell>
                            <TableCell>
                              {invoice.status === "paid" ? (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                  Pago
                                </Badge>
                              ) : invoice.status === "open" ? (
                                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                  Pendente
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                  Atrasado
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDownloadInvoice(invoice.id)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <Receipt className="h-16 w-16 mx-auto text-gray-400" />
                    <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-gray-100">
                      Nenhuma fatura encontrada
                    </h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                      Você ainda não possui faturas em seu histórico.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Assinatura</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar sua assinatura?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">Ao cancelar sua assinatura:</p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>
                  Você continuará tendo acesso até o final do período atual (
                  {formatDate(subscription?.currentPeriodEnd || "")})
                </span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>Não haverá mais cobranças após este período</span>
              </li>
              <li className="flex items-start">
                <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                <span>
                  Você perderá acesso a todas as IAs após o término do período
                </span>
              </li>
            </ul>
            <p className="text-gray-600 dark:text-gray-400">
              Você pode reativar sua assinatura a qualquer momento antes do término
              do período atual.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Voltar
            </Button>
            <Button variant="destructive" onClick={handleCancelSubscription}>
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Payment Method Dialog */}
      <Dialog open={showAddPaymentDialog} onOpenChange={setShowAddPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Forma de Pagamento</DialogTitle>
            <DialogDescription>
              Escolha uma forma de pagamento para suas renovações.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={
                  newPaymentMethod.type === "credit_card" ? "default" : "outline"
                }
                className="flex flex-col items-center justify-center h-24 p-4"
                onClick={() =>
                  setNewPaymentMethod({ ...newPaymentMethod, type: "credit_card" })
                }
              >
                <CreditCardIcon className="h-8 w-8 mb-2" />
                <span>Cartão de Crédito</span>
              </Button>
              <Button
                variant={newPaymentMethod.type === "pix" ? "default" : "outline"}
                className="flex flex-col items-center justify-center h-24 p-4"
                onClick={() =>
                  setNewPaymentMethod({ ...newPaymentMethod, type: "pix" })
                }
              >
                <QrCode className="h-8 w-8 mb-2" />
                <span>PIX</span>
              </Button>
              <Button
                variant={
                  newPaymentMethod.type === "boleto" ? "default" : "outline"
                }
                className="flex flex-col items-center justify-center h-24 p-4"
                onClick={() =>
                  setNewPaymentMethod({ ...newPaymentMethod, type: "boleto" })
                }
              >
                <Banknote className="h-8 w-8 mb-2" />
                <span>Boleto Bancário</span>
              </Button>
              <Button
                variant={
                  newPaymentMethod.type === "bank_transfer" ? "default" : "outline"
                }
                className="flex flex-col items-center justify-center h-24 p-4"
                onClick={() =>
                  setNewPaymentMethod({
                    ...newPaymentMethod,
                    type: "bank_transfer",
                  })
                }
              >
                <Building className="h-8 w-8 mb-2" />
                <span>Transferência Bancária</span>
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="default-payment"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={newPaymentMethod.isDefault}
                onChange={e =>
                  setNewPaymentMethod({
                    ...newPaymentMethod,
                    isDefault: e.target.checked,
                  })
                }
              />
              <label
                htmlFor="default-payment"
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                Definir como forma de pagamento padrão
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddPaymentDialog(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleAddPaymentMethod}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Plan Dialog */}
      <Dialog open={showChangePlanDialog} onOpenChange={setShowChangePlanDialog}>
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
                  plan =>
                    plan.billingPeriod === (currentPlan?.billingPeriod || "monthly")
                )
                .map(plan => (
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
                      {selectedPlanId === plan.id && (
                        <Check className="h-5 w-5 text-blue-600" />
                      )}
                    </div>

                    <div className="mb-4">
                      <span className="text-2xl font-bold">
                        R$ {plan.price.toFixed(2)}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 ml-1">
                        /{plan.billingPeriod === "monthly" ? "mês" : "ano"}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <p className="font-medium mb-1">Instâncias:</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {plan.instances}
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <p className="font-medium mb-1">Mensagens:</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {!plan.messages || plan.messages === 0
                            ? "Ilimitadas"
                            : plan.messages}
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
            <Button
              variant="outline"
              onClick={() => setShowChangePlanDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleChangePlan}
              disabled={
                !selectedPlanId ||
                selectedPlanId === currentPlan?.id ||
                processingPayment
              }
            >
              {processingPayment ? (
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
    </div>
  );
};

export default Subscription;