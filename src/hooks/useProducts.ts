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

  const updateProduct = async (id: string, product: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar produto/serviço:', error);
        throw error;
      }

      setProducts(prev => prev.map(p => p.id === id ? data : p));
      toast({
        title: "Sucesso",
        description: "Produto/serviço atualizado com sucesso.",
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao atualizar produto/serviço:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o produto/serviço.",
      });
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar produto/serviço:', error);
        throw error;
      }

      setProducts(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Sucesso",
        description: "Produto/serviço deletado com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao deletar produto/serviço:', error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar o produto/serviço.",
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
    updateProduct,
    deleteProduct,
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

// Export mutation hooks for backward compatibility
export const useCreateProductMutation = () => {
  const { addProduct } = useProducts();
  
  return {
    mutate: addProduct,
    isLoading: false, // You can enhance this with proper loading state if needed
  };
};

export const useUpdateProductMutation = () => {
  const { updateProduct } = useProducts();
  
  return {
    mutate: updateProduct,
    isLoading: false,
  };
};

export const useDeleteProductMutation = () => {
  const { deleteProduct } = useProducts();
  
  return {
    mutate: deleteProduct,
    isLoading: false,
  };
};