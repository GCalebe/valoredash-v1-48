import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  benefits?: string[];
  objections?: string[];
  differentials?: string[];
  success_cases?: string[];
  features?: string[];
  icon?: string;
  image?: string;
  has_combo?: boolean;
  has_upgrade?: boolean;
  has_promotion?: boolean;
  has_upsell?: boolean;
  has_downsell?: boolean;
  new?: boolean;
  popular?: boolean;
  user_id: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) {
        console.error('Erro ao buscar produtos/serviços:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os produtos/serviços.",
        });
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos/serviços:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos/serviços.",
      });
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...product,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar produto/serviço:', error);
        throw error;
      }

      setProducts(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Produto/serviço adicionado com sucesso.",
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao adicionar produto/serviço:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o produto/serviço.",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    fetchProducts,
    addProduct,
  };
}

// Export alias for backward compatibility with existing components
export const useProductsQuery = () => {
  const { products, loading } = useProducts();
  
  return {
    data: products,
    isLoading: loading,
    error: null, // Add error handling if needed later
  };
};