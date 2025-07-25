import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useProducts } from "@/hooks/useProducts";
import { Contact } from "@/types/client";
import { Product } from "@/types/product";

interface ClientProductsTabProps {
  client: Contact;
  onUpdate?: () => void;
}

const ClientProductsTab: React.FC<ClientProductsTabProps> = ({ client, onUpdate }) => {
  const { toast } = useToast();
  const { fetchClientProducts, addProductToClient, removeProductFromClient } = useProducts();
  const [clientProducts, setClientProducts] = useState<Product[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch client products and available products
  useEffect(() => {
    if (client?.id) {
      loadClientProducts();
    }
  }, [, loadClientProducts]);

  // Load client products - this function now returns different values based on the client
  const loadClientProducts = async () => {
    setIsLoading(true);
    try {
      // Fetch products associated with this client
      const { clientProducts, availableProducts } = await fetchClientProducts(client.id);
      setClientProducts(clientProducts || []);
      setAvailableProducts(availableProducts || []);
    } catch (error) {
      console.error("Error loading client products:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos do cliente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add product to client
  const handleAddProduct = async () => {
    if (!selectedProduct) {
      toast({
        title: "Selecione um produto",
        description: "Por favor, selecione um produto para adicionar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await addProductToClient(client.id, selectedProduct);
      toast({
        title: "Produto adicionado",
        description: "Produto adicionado com sucesso ao cliente.",
      });
      setSelectedProduct("");
      loadClientProducts();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error adding product to client:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o produto ao cliente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remove product from client
  const handleRemoveProduct = async (productId: string) => {
    setIsLoading(true);
    try {
      await removeProductFromClient(client.id, productId);
      toast({
        title: "Produto removido",
        description: "Produto removido com sucesso do cliente.",
      });
      loadClientProducts();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error removing product from client:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o produto do cliente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total value of client products - returns different values based on products
  const calculateTotalValue = () => {
    return clientProducts.reduce((total, product) => total + (product.price || 0), 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produtos do Cliente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add product form */}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor="product-select">Adicionar Produto</Label>
              <select
                id="product-select"
                className="w-full p-2 border rounded-md"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                disabled={isLoading}
              >
                <option value="">Selecione um produto</option>
                {availableProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - R$ {product.price?.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={handleAddProduct} disabled={isLoading || !selectedProduct}>
              Adicionar
            </Button>
          </div>

          {/* Client products list */}
          {clientProducts.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Este cliente não possui produtos associados.
            </div>
          ) : (
            <div className="space-y-2">
              {clientProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">
                      R$ {product.price?.toFixed(2)}
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveProduct(product.id)}
                    disabled={isLoading}
                  >
                    Remover
                  </Button>
                </div>
              ))}

              <div className="flex justify-between pt-4 font-medium">
                <span>Total:</span>
                <span>R$ {calculateTotalValue().toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientProductsTab;