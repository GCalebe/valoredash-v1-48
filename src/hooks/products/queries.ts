import { supabase } from '@/integrations/supabase/client';
import { Product, ProductFormData } from '@/types/product';
import { ProductRelatedData, ProductPromotion, ProductUpsell, ProductDownsell, ProductUpgrade, ProductCombo } from './types';

/**
 * Busca todos os produtos do usuário autenticado
 */
export const fetchProducts = async (): Promise<Product[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  return data || [];
};

/**
 * Busca produtos por categoria
 */
export const fetchProductsByCategory = async (category: string): Promise<Product[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', user.id)
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch products by category: ${error.message}`);
  }

  return data || [];
};

/**
 * Busca produto com todos os dados relacionados para edição
 */
export const fetchProductWithRelatedData = async (productId: string): Promise<ProductFormData> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Buscar produto principal
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('user_id', user.id)
    .single();

  if (productError) {
    throw new Error(`Failed to fetch product: ${productError.message}`);
  }

  // Buscar dados relacionados em paralelo
  const [promotionsResult, upsellsResult, downsellsResult, upgradesResult] = await Promise.allSettled([
    fetchProductPromotions(productId),
    fetchProductUpsells(productId),
    fetchProductDownsells(productId),
    fetchProductUpgrades(productId)
  ]);

  // Processar resultados
  const promotions = promotionsResult.status === 'fulfilled' ? promotionsResult.value : [];
  const upsells = upsellsResult.status === 'fulfilled' ? upsellsResult.value : [];
  const downsells = downsellsResult.status === 'fulfilled' ? downsellsResult.value : [];
  const upgrades = upgradesResult.status === 'fulfilled' ? upgradesResult.value : [];

  // Construir ProductFormData
  const productFormData: ProductFormData = {
    ...product,
    // Switches baseados na existência de dados
    hasPromotions: promotions.length > 0,
    hasUpsells: upsells.length > 0,
    hasDownsells: downsells.length > 0,
    hasUpgrades: upgrades.length > 0,
    hasCombos: false, // TODO: implementar quando necessário
    
    // Dados relacionados
    promotions: promotions.length > 0 ? promotions[0] : undefined,
    upsells: upsells.map(u => u.upsell_product_id),
    downsells: downsells.map(d => d.downsell_product_id),
    upgrades: upgrades.length > 0 ? upgrades[0] : undefined,
  };

  return productFormData;
};

/**
 * Busca promoções de um produto
 */
export const fetchProductPromotions = async (productId: string): Promise<ProductPromotion[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('product_promotions')
    .select('*')
    .eq('product_id', productId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to fetch product promotions: ${error.message}`);
  }

  return data || [];
};

/**
 * Busca upsells de um produto
 */
export const fetchProductUpsells = async (productId: string): Promise<ProductUpsell[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('product_upsells')
    .select('*')
    .eq('base_product_id', productId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to fetch product upsells: ${error.message}`);
  }

  return data || [];
};

/**
 * Busca downsells de um produto
 */
export const fetchProductDownsells = async (productId: string): Promise<ProductDownsell[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('product_downsells')
    .select('*')
    .eq('base_product_id', productId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to fetch product downsells: ${error.message}`);
  }

  return data || [];
};

/**
 * Busca upgrades de um produto
 */
export const fetchProductUpgrades = async (productId: string): Promise<ProductUpgrade[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('product_upgrades')
    .select('*')
    .eq('base_product_id', productId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to fetch product upgrades: ${error.message}`);
  }

  return data || [];
};

/**
 * Busca combos de produtos
 */
export const fetchProductCombos = async (): Promise<ProductCombo[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('product_combos')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch product combos: ${error.message}`);
  }

  return data || [];
};