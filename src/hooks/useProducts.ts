import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Simplified product interface using ai_products table
interface SimpleProduct {
  id: string;
  name: string;
  description?: string;
  category?: string;
  features?: string[];
  icon?: string;
  image?: string;
  new?: boolean;
  popular?: boolean;
  price?: number;
  has_promotion?: boolean;
  created_at?: string;
}

// Query keys
export const productsKeys = {
  all: ['products'] as const,
  lists: () => [...productsKeys.all, 'list'] as const,
  list: (filters: string) => [...productsKeys.lists(), { filters }] as const,
  byCategory: (category: string) => [...productsKeys.all, 'category', category] as const,
};

// Fetch AI products
const fetchAIProducts = async (): Promise<SimpleProduct[]> => {
  const { data, error } = await supabase
    .from('ai_products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching AI products:', error);
    throw new Error(`Failed to fetch AI products: ${error.message}`);
  }

  return data || [];
};

// Fetch products by category
const fetchProductsByCategory = async (category: string): Promise<SimpleProduct[]> => {
  const { data, error } = await supabase
    .from('ai_products')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products by category:', error);
    throw new Error(`Failed to fetch products by category: ${error.message}`);
  }

  return data || [];
};

// Create product
const createProduct = async (product: Omit<SimpleProduct, 'id' | 'created_at'>): Promise<SimpleProduct> => {
  const { data, error } = await supabase
    .from('ai_products')
    .insert([{
      id: crypto.randomUUID(),
      name: product.name,
      description: product.description,
      category: product.category,
      features: product.features,
      icon: product.icon,
      image: product.image,
      new: product.new,
      popular: product.popular,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw new Error(`Failed to create product: ${error.message}`);
  }

  return data;
};

// Update product
const updateProduct = async ({ id, ...updates }: Partial<SimpleProduct> & { id: string }): Promise<SimpleProduct> => {
  const { data, error } = await supabase
    .from('ai_products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw new Error(`Failed to update product: ${error.message}`);
  }

  return data;
};

// Delete product
const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('ai_products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    throw new Error(`Failed to delete product: ${error.message}`);
  }
};

// Hook for fetching all products
export const useProductsQuery = () => {
  return useQuery({
    queryKey: productsKeys.lists(),
    queryFn: fetchAIProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for fetching products by category
export const useProductsByCategory = (category: string) => {
  return useQuery({
    queryKey: productsKeys.byCategory(category),
    queryFn: () => fetchProductsByCategory(category),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    enabled: !!category,
  });
};

// Hook for creating product
export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.all });
      toast({
        title: "Success",
        description: "Product created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for updating product
export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.all });
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for deleting product
export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.all });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Utility functions for manual cache management
export const productsUtils = {
  invalidateAll: (queryClient: ReturnType<typeof useQueryClient>) => {
    queryClient.invalidateQueries({ queryKey: productsKeys.all });
  },
  prefetchProducts: (queryClient: ReturnType<typeof useQueryClient>) => {
    queryClient.prefetchQuery({
      queryKey: productsKeys.lists(),
      queryFn: fetchAIProducts,
      staleTime: 5 * 60 * 1000,
    });
  },
  prefetchProductsByCategory: (queryClient: ReturnType<typeof useQueryClient>, category: string) => {
    queryClient.prefetchQuery({
      queryKey: productsKeys.byCategory(category),
      queryFn: () => fetchProductsByCategory(category),
      staleTime: 5 * 60 * 1000,
    });
  },
};

// Legacy hook for backward compatibility
export function useProducts() {
  const { data: products = [], isLoading: loading, refetch } = useProductsQuery();
  
  return {
    products,
    combos: [], // Empty for now since no combo table exists
    loading,
    refreshing: false,
    fetchProducts: refetch,
    refreshProducts: refetch,
    addProduct: () => Promise.resolve(undefined),
    updateProduct: () => Promise.resolve(false),
    deleteProduct: () => Promise.resolve(false),
    addCombo: () => Promise.resolve(undefined),
    deleteCombo: () => Promise.resolve(false),
    fetchClientProducts: (clientId: string) => {
      console.log('Mock fetchClientProducts called with clientId:', clientId);
      return Promise.resolve({ clientProducts: [], availableProducts: [] });
    },
    addProductToClient: (clientId: string, productId: string) => {
      console.log('Mock addProductToClient called with:', { clientId, productId });
      return Promise.resolve(true);
    },
    removeProductFromClient: (clientId: string, productId: string) => {
      console.log('Mock removeProductFromClient called with:', { clientId, productId });
      return Promise.resolve(true);
    },
  };
}