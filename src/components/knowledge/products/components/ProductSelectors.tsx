// @ts-nocheck
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { useProductsQuery } from '@/hooks/useProducts';

export const ProductSingleSelector = ({ selectedProduct, onSelectionChange, placeholder = 'Selecione um produto...', excludeCurrentProduct }: any) => {
  const { data: products = [] } = useProductsQuery();
  const availableProducts = products.filter((p) => p.id !== excludeCurrentProduct);
  const selected = availableProducts.find((p) => p.id === selectedProduct);
  return (
    <Select value={selectedProduct} onValueChange={onSelectionChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder}>
          {selected ? (
            <div className="flex items-center justify-between w-full">
              <span>{selected.name}</span>
              {selected.price && <span className="text-xs text-green-600 font-medium">R$ {selected.price.toFixed(2)}</span>}
            </div>
          ) : (
            placeholder
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <ScrollArea className="h-48">
          {availableProducts.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground text-center">Nenhum produto disponível</div>
          ) : (
            availableProducts.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                <div className="flex items-center justify-between w-full">
                  <div>
                    <div className="font-medium">{product.name}</div>
                    {product.description && <div className="text-xs text-muted-foreground truncate max-w-xs">{product.description}</div>}
                  </div>
                  {product.price && <div className="text-xs text-green-600 font-medium ml-2">R$ {product.price.toFixed(2)}</div>}
                </div>
              </SelectItem>
            ))
          )}
        </ScrollArea>
      </SelectContent>
    </Select>
  );
};

export const ProductMultiSelector = ({ selectedProducts, onSelectionChange, placeholder = 'Selecione produtos...', excludeCurrentProduct }: any) => {
  const { data: products = [] } = useProductsQuery();
  const availableProducts = products.filter((p) => p.id !== excludeCurrentProduct);

  const toggle = (id: string) => {
    const isSelected = selectedProducts.includes(id);
    onSelectionChange(isSelected ? selectedProducts.filter((x: string) => x !== id) : [...selectedProducts, id]);
  };

  const getPlaceholder = () => {
    if (!selectedProducts?.length) return placeholder;
    if (selectedProducts.length === 1) {
      const product = availableProducts.find((p) => p.id === selectedProducts[0]);
      return product?.name || 'Produto selecionado';
    }
    return `${selectedProducts.length} produtos selecionados`;
  };

  return (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder={getPlaceholder()} />
      </SelectTrigger>
      <SelectContent>
        <ScrollArea className="h-48">
          {availableProducts.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground text-center">Nenhum produto disponível</div>
          ) : (
            availableProducts.map((product) => (
              <div key={product.id} className="flex items-center space-x-2 p-2 hover:bg-accent">
                <Checkbox id={`product-${product.id}`} checked={selectedProducts.includes(product.id)} onCheckedChange={() => toggle(product.id)} />
                <label htmlFor={`product-${product.id}`} className="flex-1 text-sm cursor-pointer">
                  <div className="font-medium">{product.name}</div>
                  {product.description && <div className="text-xs text-muted-foreground truncate">{product.description}</div>}
                  {product.price && <div className="text-xs text-green-600 font-medium">R$ {product.price.toFixed(2)}</div>}
                </label>
              </div>
            ))
          )}
        </ScrollArea>
      </SelectContent>
    </Select>
  );
};


