import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import type { Database } from '../integrations/supabase/types';

type AIProduct = Database['public']['Tables']['ai_products']['Row'];
type AIProductInsert = Database['public']['Tables']['ai_products']['Insert'];
type AIProductUpdate = Database['public']['Tables']['ai_products']['Update'];

export const useSupabaseAIProducts = () => {
  const [products, setProducts] = useState<AIProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ai_products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const getProductsByCategory = async (category?: string) => {
    try {
      let query = supabase
        .from('ai_products')
        .select('*')
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar produtos por categoria:', err);
      return [];
    }
  };

  const createProduct = async (productData: AIProductInsert) => {
    try {
      const { data, error } = await supabase
        .from('ai_products')
        .insert(productData)
        .select()
        .single();

      if (error) throw error;
      await fetchProducts(); // Refresh the list
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar produto');
      throw err;
    }
  };

  const updateProduct = async (id: string, updates: AIProductUpdate) => {
    try {
      const { data, error } = await supabase
        .from('ai_products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchProducts(); // Refresh the list
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar produto');
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ai_products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchProducts(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar produto');
      throw err;
    }
  };

  const getProductById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('ai_products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Erro ao buscar produto:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    getProductsByCategory,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById
  };
};