import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  TrendingUp, 
  Receipt, 
  Smartphone,
  FileText,
  CheckCircle,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { useSupabaseSubscription } from '@/hooks/useSupabaseSubscription';

export function PaymentTab() {
  const { subscription, paymentMethods, invoices, loading } = useSupabaseSubscription();

  const accountHealth = {
    status: subscription?.status === 'active' ? 'healthy' : 'attention',
    score: subscription?.status === 'active' ? 95 : 60,
    lastPayment: '2024-01-15',
    nextPayment: subscription?.currentPeriodEnd || '2024-02-15'
  };

  const paidInvoices = invoices?.filter(invoice => invoice.status === 'paid') || [];
  const totalPaid = paidInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Saúde da Conta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center ${
                accountHealth.status === 'healthy' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
              }`}>
                {accountHealth.status === 'healthy' ? 
                  <CheckCircle className="h-8 w-8" /> : 
                  <AlertCircle className="h-8 w-8" />
                }
              </div>
              <h3 className="font-semibold">Status</h3>
              <Badge variant={accountHealth.status === 'healthy' ? 'default' : 'secondary'}>
                {accountHealth.status === 'healthy' ? 'Saudável' : 'Atenção'}
              </Badge>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {accountHealth.score}%
              </div>
              <h3 className="font-semibold">Score</h3>
              <p className="text-sm text-muted-foreground">Pontuação geral</p>
            </div>

            <div className="text-center">
              <div className="text-xl font-semibold mb-2">
                {new Date(accountHealth.lastPayment).toLocaleDateString('pt-BR')}
              </div>
              <h3 className="font-semibold">Último Pagamento</h3>
              <p className="text-sm text-muted-foreground">Data do pagamento</p>
            </div>

            <div className="text-center">
              <div className="text-xl font-semibold mb-2">
                {new Date(accountHealth.nextPayment).toLocaleDateString('pt-BR')}
              </div>
              <h3 className="font-semibold">Próximo Pagamento</h3>
              <p className="text-sm text-muted-foreground">Data da cobrança</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Paid Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Faturas Pagas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-600">
                  {paidInvoices.length}
                </span>
                <span className="text-sm text-muted-foreground">faturas</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-semibold">
                  R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Ver Histórico
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Credit Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Cartão de Crédito
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentMethods?.filter(pm => pm.type === 'credit_card').length > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">
                      **** {paymentMethods?.find(pm => pm.isDefault)?.lastFour || '****'}
                    </span>
                    <Badge variant="secondary">Padrão</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {paymentMethods?.find(pm => pm.isDefault)?.brand || 'Visa'}
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Nenhum cartão cadastrado
                  </p>
                </div>
              )}
              <Button variant="outline" size="sm" className="w-full">
                Gerenciar Cartões
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* PIX & Boleto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              PIX & Boleto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <span className="text-sm">PIX</span>
                </div>
                <Badge variant="outline">Disponível</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">Boleto</span>
                </div>
                <Badge variant="outline">Disponível</Badge>
              </div>

              <p className="text-xs text-muted-foreground">
                Métodos disponíveis para pagamento
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Faturas Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices?.slice(0, 5).map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    invoice.status === 'paid' ? 'bg-green-500' : 
                    invoice.status === 'open' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="font-medium">Fatura #{invoice.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(invoice.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    R$ {invoice.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <Badge variant={
                    invoice.status === 'paid' ? 'default' : 
                    invoice.status === 'open' ? 'secondary' : 'destructive'
                  }>
                    {invoice.status === 'paid' ? 'Pago' : 
                     invoice.status === 'open' ? 'Pendente' : 'Vencido'}
                  </Badge>
                </div>
              </div>
            ))}
            
            {(!invoices || invoices.length === 0) && (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Nenhuma fatura encontrada</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}