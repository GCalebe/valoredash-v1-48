import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductSingleSelector } from '@/components/knowledge/products/components/ProductSelectors';
import { useClientProducts } from '@/hooks/useClientProducts';
import { useProducts } from '@/hooks/useProducts';
import { Plus, ShoppingCart, Heart, TrendingUp, Trash2, Edit, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface ClientProductsTabProps {
  clientId: string;
}

const ClientProductsTab: React.FC<ClientProductsTabProps> = ({ clientId }) => {
  const { interests, purchases, loading, addInterest, updateInterest, removeInterest, addPurchase, convertInterestToPurchase } = useClientProducts(clientId);
  const { toast } = useToast();
  
  const [isAddInterestOpen, setIsAddInterestOpen] = useState(false);
  const [isAddPurchaseOpen, setIsAddPurchaseOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [interestLevel, setInterestLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [notes, setNotes] = useState('');
  
  // Purchase form state
  const [purchaseForm, setPurchaseForm] = useState({
    product_id: '',
    purchase_date: new Date().toISOString().split('T')[0],
    purchase_value: '',
    quantity: '1',
    payment_method: '',
    notes: '',
  });

  const getInterestLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getInterestLevelLabel = (level: string) => {
    switch (level) {
      case 'high': return 'Alto';
      case 'medium': return 'Médio';
      case 'low': return 'Baixo';
      default: return level;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success text-success-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'cancelled': return 'bg-destructive text-destructive-foreground';
      case 'refunded': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelada';
      case 'refunded': return 'Reembolsada';
      default: return status;
    }
  };

  const handleAddInterest = async () => {
    if (!selectedProduct) {
      toast({
        title: "Erro",
        description: "Selecione um produto",
        variant: "destructive",
      });
      return;
    }

    try {
      await addInterest(selectedProduct, interestLevel, notes);
      setIsAddInterestOpen(false);
      setSelectedProduct('');
      setInterestLevel('medium');
      setNotes('');
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleAddPurchase = async () => {
    if (!purchaseForm.product_id) {
      toast({
        title: "Erro",
        description: "Selecione um produto",
        variant: "destructive",
      });
      return;
    }

    try {
      await addPurchase({
        product_id: purchaseForm.product_id,
        purchase_date: purchaseForm.purchase_date,
        purchase_value: purchaseForm.purchase_value ? parseFloat(purchaseForm.purchase_value) : undefined,
        quantity: parseInt(purchaseForm.quantity) || 1,
        payment_method: purchaseForm.payment_method || undefined,
        notes: purchaseForm.notes || undefined,
      });
      
      setIsAddPurchaseOpen(false);
      setPurchaseForm({
        product_id: '',
        purchase_date: new Date().toISOString().split('T')[0],
        purchase_value: '',
        quantity: '1',
        payment_method: '',
        notes: '',
      });
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleConvertToPurchase = async (interestId: string) => {
    try {
      await convertInterestToPurchase(interestId);
      toast({
        title: "Sucesso",
        description: "Interesse convertido em compra",
      });
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const totalPurchases = purchases.length;
  const totalValue = purchases.reduce((sum, purchase) => sum + (purchase.purchase_value || 0), 0);
  const completedPurchases = purchases.filter(p => p.status === 'completed').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Produtos de Interesse</p>
                <p className="text-2xl font-bold text-primary">{interests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4 text-success" />
              <div>
                <p className="text-sm font-medium">Compras Realizadas</p>
                <p className="text-2xl font-bold text-success">{completedPurchases}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-warning" />
              <div>
                <p className="text-sm font-medium">Valor Total</p>
                <p className="text-2xl font-bold text-warning">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(totalValue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products of Interest Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Produtos de Interesse
              </CardTitle>
              <CardDescription>
                Produtos que o cliente demonstrou interesse
              </CardDescription>
            </div>
            <Dialog open={isAddInterestOpen} onOpenChange={setIsAddInterestOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Interesse
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Produto de Interesse</DialogTitle>
                  <DialogDescription>
                    Selecione um produto que o cliente demonstrou interesse
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="product">Produto</Label>
                    <ProductSingleSelector
                      selectedProduct={selectedProduct}
                      onSelectionChange={setSelectedProduct}
                      placeholder="Selecione um produto..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="interest-level">Nível de Interesse</Label>
                    <Select value={interestLevel} onValueChange={(value: 'low' | 'medium' | 'high') => setInterestLevel(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixo</SelectItem>
                        <SelectItem value="medium">Médio</SelectItem>
                        <SelectItem value="high">Alto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Observações sobre o interesse..."
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddInterestOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddInterest}>
                      Adicionar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {interests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum produto de interesse cadastrado</p>
              <p className="text-sm">Adicione produtos que o cliente demonstrou interesse</p>
            </div>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {interests.map((interest) => (
                  <div key={interest.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{interest.product?.name}</h4>
                        <Badge className={getInterestLevelColor(interest.interest_level)}>
                          {getInterestLevelLabel(interest.interest_level)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {interest.product?.category} • {
                          new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          }).format(interest.product?.price || 0)
                        }
                      </p>
                      {interest.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{interest.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleConvertToPurchase(interest.id)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Comprar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeInterest(interest.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Purchase History Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-success" />
                Histórico de Compras
              </CardTitle>
              <CardDescription>
                Registro de todas as compras realizadas pelo cliente
              </CardDescription>
            </div>
            <Dialog open={isAddPurchaseOpen} onOpenChange={setIsAddPurchaseOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Compra
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Registrar Nova Compra</DialogTitle>
                  <DialogDescription>
                    Registre uma compra realizada pelo cliente
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="purchase-product">Produto</Label>
                    <ProductSingleSelector
                      selectedProduct={purchaseForm.product_id}
                      onSelectionChange={(productId) => setPurchaseForm(prev => ({ ...prev, product_id: productId }))}
                      placeholder="Selecione um produto..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="purchase-date">Data da Compra</Label>
                      <Input
                        id="purchase-date"
                        type="date"
                        value={purchaseForm.purchase_date}
                        onChange={(e) => setPurchaseForm(prev => ({ ...prev, purchase_date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="quantity">Quantidade</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={purchaseForm.quantity}
                        onChange={(e) => setPurchaseForm(prev => ({ ...prev, quantity: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="purchase-value">Valor da Compra</Label>
                    <Input
                      id="purchase-value"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={purchaseForm.purchase_value}
                      onChange={(e) => setPurchaseForm(prev => ({ ...prev, purchase_value: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="payment-method">Forma de Pagamento</Label>
                    <Input
                      id="payment-method"
                      placeholder="Ex: Cartão de crédito, PIX, Boleto..."
                      value={purchaseForm.payment_method}
                      onChange={(e) => setPurchaseForm(prev => ({ ...prev, payment_method: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="purchase-notes">Observações</Label>
                    <Textarea
                      id="purchase-notes"
                      placeholder="Observações sobre a compra..."
                      value={purchaseForm.notes}
                      onChange={(e) => setPurchaseForm(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddPurchaseOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddPurchase}>
                      Registrar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma compra registrada</p>
              <p className="text-sm">Registre as compras realizadas pelo cliente</p>
            </div>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {purchases.map((purchase) => (
                  <div key={purchase.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{purchase.product?.name}</h4>
                        <Badge className={getStatusColor(purchase.status)}>
                          {getStatusLabel(purchase.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(purchase.purchase_date), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                        <span>Qtd: {purchase.quantity}</span>
                        {purchase.purchase_value && (
                          <span className="font-medium text-foreground">
                            {new Intl.NumberFormat('pt-BR', { 
                              style: 'currency', 
                              currency: 'BRL' 
                            }).format(purchase.purchase_value)}
                          </span>
                        )}
                      </div>
                      {purchase.payment_method && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Pagamento: {purchase.payment_method}
                        </p>
                      )}
                      {purchase.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{purchase.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientProductsTab;