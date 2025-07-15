
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import DaySelector from "./DaySelector";
import { Database } from "@/integrations/supabase/types";

type Product = Database['public']['Tables']['ai_products']['Row'];

interface ProductSelectorProps {
  selectedProducts: Array<{
    product_id: string;
    available_days: string[];
  }>;
  onSelectionChange: (products: Array<{
    product_id: string;
    available_days: string[];
  }>) => void;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({ selectedProducts, onSelectionChange }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_products")
        .select("*")
        .order("name");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos.",
        variant: "destructive",
      });
    }
  };

  const toggleProduct = (productId: string) => {
    const isSelected = selectedProducts.find(p => p.product_id === productId);
    
    if (isSelected) {
      // Remove product
      onSelectionChange(selectedProducts.filter(p => p.product_id !== productId));
    } else {
      // Add product with empty days selection
      onSelectionChange([...selectedProducts, { product_id: productId, available_days: [] }]);
    }
  };

  const updateProductDays = (productId: string, days: string[]) => {
    onSelectionChange(
      selectedProducts.map(p => 
        p.product_id === productId 
          ? { ...p, available_days: days }
          : p
      )
    );
  };

  return (
    <div className="space-y-4">
      <Label>Produtos/Serviços</Label>
      <div className="space-y-3">
        {products.map((product) => {
          const selectedProduct = selectedProducts.find(p => p.product_id === product.id);
          const isSelected = !!selectedProduct;
          
          return (
            <Card key={product.id} className={`${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium">{product.name}</h4>
                    {product.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {product.description}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleProduct(product.id)}
                  >
                    {isSelected ? "Selecionado" : "Selecionar"}
                  </Button>
                </div>
                
                {isSelected && (
                  <DaySelector
                    selectedDays={selectedProduct.available_days}
                    onSelectionChange={(days) => updateProductDays(product.id, days)}
                    label="Dias disponíveis para este produto/serviço"
                  />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ProductSelector;
