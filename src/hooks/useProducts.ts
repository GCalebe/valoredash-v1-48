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

// Fetch product with related data for editing
const fetchProductWithRelatedData = async (productId: string): Promise<ProductFormData> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Fetch main product data
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('user_id', user.id)
    .single();

  if (productError) {
    console.error('Error fetching product:', productError);
    throw new Error(`Failed to fetch product: ${productError.message}`);
  }

  // Fetch related data in parallel
  const [promotionData, upsellData, downsellData, upgradeData] = await Promise.all([
    // Get promotion data
    supabase
      .from('product_promotions')
      .select('*')
      .eq('product_id', productId)
      .eq('user_id', user.id)
      .maybeSingle(),
    
    // Get upsell data
    supabase
      .from('product_upsells')
      .select('*')
      .eq('base_product_id', productId)
      .eq('user_id', user.id)
      .maybeSingle(),
    
    // Get downsell data
    supabase
      .from('product_downsells')
      .select('*')
      .eq('base_product_id', productId)
      .eq('user_id', user.id)
      .maybeSingle(),
    
    // Get upgrade data
    supabase
      .from('product_upgrades')
      .select('*')
      .eq('base_product_id', productId)
      .eq('user_id', user.id)
      .maybeSingle()
  ]);

  // Build complete product data with related information
  const productFormData: ProductFormData = {
    ...product,
    // Promotion data
    promotion_name: promotionData.data?.name,
    promotion_description: promotionData.data?.description,
    discount_type: promotionData.data?.discount_type,
    discount_percentage: promotionData.data?.discount_percentage,
    discount_amount: promotionData.data?.discount_amount,
    promotion_start_date: promotionData.data?.start_date ? new Date(promotionData.data.start_date).toISOString().split('T')[0] : undefined,
    promotion_end_date: promotionData.data?.end_date ? new Date(promotionData.data.end_date).toISOString().split('T')[0] : undefined,
    
    // Upsell data
    upsell_product: upsellData.data?.upsell_product_id,
    
    // Downsell data
    downsell_product: downsellData.data?.downsell_product_id,
    
    // Upgrade data
    upgrade_name: upgradeData.data?.name,
    upgrade_description: upgradeData.data?.description,
    upgrade_price: upgradeData.data?.upgrade_price,
    upgrade_benefits: upgradeData.data?.benefits,
    upgrade_target_product: upgradeData.data?.upgrade_product_id,
  };

  return productFormData;
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
    has_upsell: productData.has_upsell || false,
    has_downsell: productData.has_downsell || false,
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

    // Salvar dados relacionais se os switches estiverem ativados
  try {
    // Salvar promoção se ativada
    if (productData.has_promotion && productData.promotion_name) {
      const promotionData = {
        product_id: createdProduct.id,
        name: productData.promotion_name,
        description: productData.promotion_description,
        discount_type: productData.discount_type || 'percentage',
        discount_percentage: productData.discount_percentage,
        discount_amount: productData.discount_amount,
        start_date: productData.promotion_start_date ? new Date(productData.promotion_start_date).toISOString() : null,
        end_date: productData.promotion_end_date ? new Date(productData.promotion_end_date).toISOString() : null,
        is_active: true,
        user_id: user.id,
        created_by: user.id
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
        discount_percentage: productData.combo_discount_percentage,
        benefit: productData.combo_benefit,
        user_id: user.id,
        created_by: user.id
      };

      const { data: comboResult, error: comboError } = await supabase
        .from('product_combos')
        .insert([comboData])
        .select()
        .single();

      if (comboError) {
        console.warn('Warning: Failed to save combo data:', comboError);
      } else if (comboResult && productData.combo_products?.length) {
        // Associar produtos selecionados ao combo
        const comboItems = productData.combo_products.map(productId => ({
          combo_id: comboResult.id,
          product_id: productId,
          user_id: user.id
        }));

        const { error: comboItemError } = await supabase
          .from('product_combo_items')
          .insert(comboItems);

        if (comboItemError) {
          console.warn('Warning: Failed to associate products with combo:', comboItemError);
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
        is_active: true,
        user_id: user.id,
        created_by: user.id
      };

      const { error: upgradeError } = await supabase
        .from('product_upgrades')
        .insert([upgradeData]);

      if (upgradeError) {
        console.warn('Warning: Failed to save upgrade data:', upgradeError);
      }
    }

    // Salvar upsell se ativado
    if (productData.has_upsell && productData.upsell_product) {
      const upsellData = {
        base_product_id: createdProduct.id,
        upsell_product_id: productData.upsell_product,
        user_id: user.id,
        created_by: user.id
      };

      const { error: upsellError } = await supabase
        .from('product_upsells')
        .insert([upsellData]);

      if (upsellError) {
        console.warn('Warning: Failed to save upsell data:', upsellError);
      }
    }

    // Salvar downsell se ativado
    if (productData.has_downsell && productData.downsell_product) {
      const downsellData = {
        base_product_id: createdProduct.id,
        downsell_product_id: productData.downsell_product,
        user_id: user.id,
        created_by: user.id
      };

      const { error: downsellError } = await supabase
        .from('product_downsells')
        .insert([downsellData]);

      if (downsellError) {
        console.warn('Warning: Failed to save downsell data:', downsellError);
      }
    }
    // Save objections if provided in productData
    if (productData.localObjections && Array.isArray(productData.localObjections) && productData.localObjections.length > 0) {
      console.log('💾 Saving local objections to database for new product:', createdProduct.id);
      
      const objectionsToSave = productData.localObjections
        .filter(objection => objection.question && objection.answer) // Only save complete objections
        .map(objection => ({
          product_id: createdProduct.id,
          user_id: user.id,
          question: objection.question,
          answer: objection.answer,
          created_by: user.id
        }));

      if (objectionsToSave.length > 0) {
        const { error: objectionsError } = await supabase
          .from('product_objections')
          .insert(objectionsToSave);

        if (objectionsError) {
          console.warn('Warning: Failed to save objections data:', objectionsError);
        } else {
          console.log('✅ Successfully saved', objectionsToSave.length, 'objections for new product');
        }
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
  
  // Only include fields that exist in the products table
  const allowedFields = [
    'name', 'price', 'description', 'category', 'benefits', 'objections', 
    'differentials', 'success_cases', 'features', 'icon', 'image', 
    'has_combo', 'has_upgrade', 'has_promotion', 'has_upsell', 'has_downsell', 'new', 'popular'
  ];
  
  // Filter updates to only include allowed fields and remove undefined values
  const cleanUpdates = Object.fromEntries(
    Object.entries(updates)
      .filter(([key, value]) => allowedFields.includes(key) && value !== undefined)
  );
  
  console.log('🧹 Clean updates (only allowed fields):', cleanUpdates);
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
  
  // Update related data if switches are enabled
  try {
    // Handle promotion updates
    if (updates.has_promotion !== undefined) {
      if (updates.has_promotion && updates.promotion_name) {
        // Update or create promotion
        const promotionData = {
          product_id: id,
          name: updates.promotion_name,
          description: updates.promotion_description,
          discount_type: updates.discount_type || 'percentage',
          discount_percentage: updates.discount_percentage,
          discount_amount: updates.discount_amount,
          start_date: updates.promotion_start_date ? new Date(updates.promotion_start_date).toISOString() : null,
          end_date: updates.promotion_end_date ? new Date(updates.promotion_end_date).toISOString() : null,
          is_active: true,
          user_id: user.id,
          created_by: user.id
        };

        const { error: promotionError } = await supabase
          .from('product_promotions')
          .upsert(promotionData, { onConflict: 'product_id' });

        if (promotionError) {
          console.warn('Warning: Failed to update promotion data:', promotionError);
        }
      } else if (!updates.has_promotion) {
        // Remove promotion if switch is turned off
        const { error: deletePromotionError } = await supabase
          .from('product_promotions')
          .delete()
          .eq('product_id', id)
          .eq('user_id', user.id);

        if (deletePromotionError) {
          console.warn('Warning: Failed to delete promotion data:', deletePromotionError);
        }
      }
    }

    // Handle upsell updates
    if (updates.has_upsell !== undefined) {
      if (updates.has_upsell && updates.upsell_product) {
        const upsellData = {
          base_product_id: id,
          upsell_product_id: updates.upsell_product,
          user_id: user.id,
          created_by: user.id
        };

        const { error: upsellError } = await supabase
          .from('product_upsells')
          .upsert(upsellData, { onConflict: 'base_product_id' });

        if (upsellError) {
          console.warn('Warning: Failed to update upsell data:', upsellError);
        }
      } else if (!updates.has_upsell) {
        const { error: deleteUpsellError } = await supabase
          .from('product_upsells')
          .delete()
          .eq('base_product_id', id)
          .eq('user_id', user.id);

        if (deleteUpsellError) {
          console.warn('Warning: Failed to delete upsell data:', deleteUpsellError);
        }
      }
    }

    // Handle downsell updates
    if (updates.has_downsell !== undefined) {
      if (updates.has_downsell && updates.downsell_product) {
        const downsellData = {
          base_product_id: id,
          downsell_product_id: updates.downsell_product,
          user_id: user.id,
          created_by: user.id
        };

        const { error: downsellError } = await supabase
          .from('product_downsells')
          .upsert(downsellData, { onConflict: 'base_product_id' });

        if (downsellError) {
          console.warn('Warning: Failed to update downsell data:', downsellError);
        }
      } else if (!updates.has_downsell) {
        const { error: deleteDownsellError } = await supabase
          .from('product_downsells')
          .delete()
          .eq('base_product_id', id)
          .eq('user_id', user.id);

        if (deleteDownsellError) {
          console.warn('Warning: Failed to delete downsell data:', deleteDownsellError);
        }
      }
    }
  } catch (relatedDataError) {
    console.warn('Warning: Some related data could not be updated:', relatedDataError);
  }
  
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

// Hook for fetching product with related data for editing
export const useProductWithRelatedData = (productId: string) => {
  return useQuery({
    queryKey: [...productsKeys.all, 'related', productId],
    queryFn: () => fetchProductWithRelatedData(productId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    enabled: !!productId,
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