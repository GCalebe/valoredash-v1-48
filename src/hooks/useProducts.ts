import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Product interface matching the unified products table
export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  benefits?: string[];
  objections?: string[];
  differentials?: string[];
  success_cases?: string[];
  features?: string[];
  icon?: string;
  image?: string;
  has_combo: boolean;
  has_upgrade: boolean;
  has_promotion: boolean;
  new?: boolean;
  popular?: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// Form data interface for creating/updating products
export interface ProductFormData {
  name: string;
  price?: number;
  description?: string;
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
  new?: boolean;
  popular?: boolean;
}

// Query keys
export const productsKeys = {
  all: ['products'] as const,
  lists: () => ['products', 'list'] as const,
  list: (filters: string) => ['products', 'list', { filters }] as const,
  byCategory: (category: string) => ['products', 'category', category] as const,
};

// Fetch products
const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  return (data as Product[]) || [];
};

// Fetch products by category
const fetchProductsByCategory = async (category: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products by category:', error);
    throw new Error(`Failed to fetch products by category: ${error.message}`);
  }

  return (data as Product[]) || [];
};

// Create product
const createProduct = async (productData: ProductFormData): Promise<Product> => {
  // Set default values for required fields
  const product = {
    name: productData.name,
    price: productData.price || 0,
    description: productData.description,
    category: productData.category,
    benefits: productData.benefits || [],
    objections: productData.objections || [],
    differentials: productData.differentials || [],
    success_cases: productData.success_cases || [],
    features: productData.features || [],
    icon: productData.icon,
    image: productData.image,
    has_combo: productData.has_combo || false,
    has_upgrade: productData.has_upgrade || false,
    has_promotion: productData.has_promotion || false,
    new: productData.new || false,
    popular: productData.popular || false,
  };

  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw new Error(`Failed to create product: ${error.message}`);
  }

  return data;
};

// Update product
const updateProduct = async ({ id, ...updates }: ProductFormData & { id: string }): Promise<Product> => {
  // Remove undefined values
  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([_, value]) => value !== undefined)
  );

  const { data, error } = await supabase
    .from('products')
    .update(cleanUpdates)
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
    .from('products')
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
    queryFn: fetchProducts,
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