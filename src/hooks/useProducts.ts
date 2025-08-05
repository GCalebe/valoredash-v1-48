// @ts-nocheck
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Product, ProductFormData } from '@/types/product';

// Query keys
export const productsKeys = {
  all: ['products'] as const,
  lists: () => ['products', 'list'] as const,
  list: (filters: string) => ['products', 'list', { filters }] as const,
  byCategory: (category: string) => ['products', 'category', category] as const,
};

// Fetch products - now filters by user_id for security
const fetchProducts = async (): Promise<Product[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  return (data as Product[]) || [];
};

// Fetch products by category - now filters by user_id for security
const fetchProductsByCategory = async (category: string): Promise<Product[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products by category:', error);
    throw new Error(`Failed to fetch products by category: ${error.message}`);
  }

  return (data as Product[]) || [];
};

// Create product - now includes user_id for security
const createProduct = async (productData: ProductFormData): Promise<Product> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

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
    user_id: user.id,
    created_by: user.id,
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

  const createdProduct = data;

  // Salvar dados condicionais se os switches estiverem ativados
  try {
    // Salvar promoção se ativada
    if (productData.has_promotion && productData.promotion_name) {
      const promotionData = {
        product_id: createdProduct.id,
        name: productData.promotion_name,
        description: productData.promotion_description,
        discount_percentage: productData.discount_percentage,
        discount_amount: productData.discount_amount,
        start_date: productData.promotion_start_date ? new Date(productData.promotion_start_date).toISOString() : null,
        end_date: productData.promotion_end_date ? new Date(productData.promotion_end_date).toISOString() : null,
        is_active: true
      };

      const { error: promotionError } = await supabase
        .from('product_promotions')
        .insert([promotionData]);

      if (promotionError) {
        console.warn('Warning: Failed to save promotion data:', promotionError);
      }
    }

    // Salvar combo se ativado
    if (productData.has_combo && productData.combo_name) {
      const comboData = {
        name: productData.combo_name,
        description: productData.combo_description,
        discount_percentage: productData.combo_discount_percentage
      };

      const { data: comboResult, error: comboError } = await supabase
        .from('product_combos')
        .insert([comboData])
        .select()
        .single();

      if (comboError) {
        console.warn('Warning: Failed to save combo data:', comboError);
      } else if (comboResult) {
        // Associar produto ao combo
        const { error: comboItemError } = await supabase
          .from('product_combo_items')
          .insert([{
            combo_id: comboResult.id,
            product_id: createdProduct.id
          }]);

        if (comboItemError) {
          console.warn('Warning: Failed to associate product with combo:', comboItemError);
        }
      }
    }

    // Salvar upgrade se ativado
    if (productData.has_upgrade && productData.upgrade_name) {
      const upgradeData = {
        base_product_id: createdProduct.id,
        upgrade_product_id: productData.upgrade_target_product || createdProduct.id,
        name: productData.upgrade_name,
        description: productData.upgrade_description,
        upgrade_price: productData.upgrade_price,
        benefits: productData.upgrade_benefits || [],
        is_active: true
      };

      const { error: upgradeError } = await supabase
        .from('product_upgrades')
        .insert([upgradeData]);

      if (upgradeError) {
        console.warn('Warning: Failed to save upgrade data:', upgradeError);
      }
    }
  } catch (relatedDataError) {
    console.warn('Warning: Some related data could not be saved:', relatedDataError);
    // Não falha a criação do produto principal por causa de dados relacionados
  }

  return createdProduct;
};

// Update product
const updateProduct = async ({ id, ...updates }: ProductFormData & { id: string }): Promise<Product> => {
  console.log('🔍 useProducts updateProduct called');
  console.log('📝 Product ID:', id);
  console.log('📦 Raw updates:', updates);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  
  // Remove undefined values
  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([_, value]) => value !== undefined)
  );
  
  console.log('🧹 Clean updates:', cleanUpdates);
  console.log('🚀 Calling Supabase update...');

  const { data, error } = await supabase
    .from('products')
    .update(cleanUpdates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('❌ Supabase error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw new Error(`Failed to update product: ${error.message}`);
  }

  console.log('✅ Supabase update successful:', data);
  return data;
};

// Delete product
const deleteProduct = async (id: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

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