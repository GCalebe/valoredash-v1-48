import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: number;
  name: string;
  price: number;
  isPromotion: boolean;
}

const ProductsTab = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState<Omit<Product, "id">>({
    name: "",
    price: 0,
    isPromotion: false,
  });

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome do produto/serviço e preço são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const product: Product = {
      id: Date.now(),
      ...newProduct,
    };

    setProducts([...products, product]);
    setNewProduct({ name: "", price: 0, isPromotion: false });

    toast({
      title: "Produto adicionado",
      description: "Produto/serviço cadastrado com sucesso!",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Produto/Serviço</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-12 gap-4 items-end">
            <div className="col-span-5 grid gap-2">
              <Label htmlFor="name">Produto ou Serviço</Label>
              <Input
                id="name"
                placeholder="Ex., Consultoria"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
              />
            </div>
            <div className="col-span-3 grid gap-2">
              <Label htmlFor="price">Preço</Label>
              <Input
                id="price"
                type="number"
                placeholder="Ex. 100,00"
                value={newProduct.price || ""}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    price: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div className="col-span-2 flex items-center space-x-2 h-10">
              <Checkbox
                id="promotion"
                checked={newProduct.isPromotion}
                onCheckedChange={(checked) =>
                  setNewProduct({
                    ...newProduct,
                    isPromotion: checked as boolean,
                  })
                }
              />
              <Label htmlFor="promotion">Promoção</Label>
            </div>
            <Button
              onClick={handleAddProduct}
              className="col-span-2 bg-black text-white hover:bg-black/90 h-10"
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Produtos e Serviços</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-gray-500">
                    R$ {product.price.toFixed(2)}
                  </p>
                </div>
                {product.isPromotion && (
                  <span className="px-2 py-1 text-xs font-medium text-white bg-green-500 rounded-full">
                    Promoção
                  </span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductsTab;
