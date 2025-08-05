import { supabase } from '@/integrations/supabase/client';
import { Product, ProductFormData } from '@/types/product';
import { ProductPromotion, ProductUpsell, ProductDownsell, ProductUpgrade } from './types';

/**
 * Cria um novo produto com dados relacionados
 */
export const createProduct = async (productData: ProductFormData): Promise<Product> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Preparar dados do produto principal
  const productToInsert = {
    name: productData.name,
    description: productData.description,
    price: productData.price,
    category: productData.category,
    image_url: productData.image_url,
    is_active: productData.is_active ?? true,
    user_id: user.id,
    created_by: user.id,
    updated_by: user.id,
  };

  // Inserir produto principal
  const { data: product, error: productError } = await supabase
    .from('products')
    .insert(productToInsert)
    .select()
    .single();

  if (productError) {
    throw new Error(`Failed to create product: ${productError.message}`);
  }

  // Salvar dados relacionados se ativados
  const savePromises: Promise<any>[] = [];

  if (productData.hasPromotions && productData.promotions) {
    savePromises.push(saveProductPromotion(product.id, productData.promotions, user.id));
  }

  if (productData.hasUpsells && productData.upsells?.length) {
    savePromises.push(saveProductUpsells(product.id, productData.upsells, user.id));
  }

  if (productData.hasDownsells && productData.downsells?.length) {
    savePromises.push(saveProductDownsells(product.id, productData.downsells, user.id));
  }

  if (productData.hasUpgrades && productData.upgrades) {
    savePromises.push(saveProductUpgrade(product.id, productData.upgrades, user.id));
  }

  // Executar todas as operações relacionadas
  if (savePromises.length > 0) {
    const results = await Promise.allSettled(savePromises);
    const failures = results.filter(result => result.status === 'rejected');
    
    if (failures.length > 0) {
      console.warn('Some related data failed to save:', failures);
    }
  }

  return product;
};

/**
 * Atualiza um produto existente
 */
export const updateProduct = async ({ id, ...updates }: ProductFormData & { id: string }): Promise<Product> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Preparar dados para atualização
  const productUpdates = {
    name: updates.name,
    description: updates.description,
    price: updates.price,
    category: updates.category,
    image_url: updates.image_url,
    is_active: updates.is_active,
    updated_by: user.id,
  };

  // Atualizar produto principal
  const { data: product, error: productError } = await supabase
    .from('products')
    .update(productUpdates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (productError) {
    throw new Error(`Failed to update product: ${productError.message}`);
  }

  // Atualizar dados relacionados
  const updatePromises: Promise<any>[] = [];

  // Gerenciar promoções
  if (updates.hasPromotions && updates.promotions) {
    updatePromises.push(updateProductPromotion(id, updates.promotions, user.id));
  } else {
    updatePromises.push(deleteProductPromotions(id, user.id));
  }

  // Gerenciar upsells
  if (updates.hasUpsells && updates.upsells?.length) {
    updatePromises.push(updateProductUpsells(id, updates.upsells, user.id));
  } else {
    updatePromises.push(deleteProductUpsells(id, user.id));
  }

  // Gerenciar downsells
  if (updates.hasDownsells && updates.downsells?.length) {
    updatePromises.push(updateProductDownsells(id, updates.downsells, user.id));
  } else {
    updatePromises.push(deleteProductDownsells(id, user.id));
  }

  // Gerenciar upgrades
  if (updates.hasUpgrades && updates.upgrades) {
    updatePromises.push(updateProductUpgrade(id, updates.upgrades, user.id));
  } else {
    updatePromises.push(deleteProductUpgrades(id, user.id));
  }

  // Executar todas as atualizações relacionadas
  if (updatePromises.length > 0) {
    const results = await Promise.allSettled(updatePromises);
    const failures = results.filter(result => result.status === 'rejected');
    
    if (failures.length > 0) {
      console.warn('Some related data failed to update:', failures);
    }
  }

  return product;
};

/**
 * Exclui um produto e todos os dados relacionados
 */
export const deleteProduct = async (id: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Excluir dados relacionados primeiro
  const deletePromises = [
    deleteProductPromotions(id, user.id),
    deleteProductUpsells(id, user.id),
    deleteProductDownsells(id, user.id),
    deleteProductUpgrades(id, user.id),
  ];

  await Promise.allSettled(deletePromises);

  // Excluir produto principal
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to delete product: ${error.message}`);
  }
};

// Funções auxiliares para dados relacionados

/**
 * Salva promoção do produto
 */
const saveProductPromotion = async (productId: string, promotion: any, userId: string): Promise<void> => {
  const promotionData = {
    product_id: productId,
    name: promotion.name,
    description: promotion.description,
    discount_type: promotion.discount_type,
    discount_percentage: promotion.discount_percentage,
    discount_amount: promotion.discount_amount,
    start_date: promotion.start_date,
    end_date: promotion.end_date,
    is_active: promotion.is_active ?? true,
    user_id: userId,
    created_by: userId,
  };

  const { error } = await supabase
    .from('product_promotions')
    .insert(promotionData);

  if (error) {
    throw new Error(`Failed to save product promotion: ${error.message}`);
  }
};

/**
 * Salva upsells do produto
 */
const saveProductUpsells = async (productId: string, upsellIds: string[], userId: string): Promise<void> => {
  const upsellsData = upsellIds.map(upsellId => ({
    base_product_id: productId,
    upsell_product_id: upsellId,
    user_id: userId,
    created_by: userId,
  }));

  const { error } = await supabase
    .from('product_upsells')
    .insert(upsellsData);

  if (error) {
    throw new Error(`Failed to save product upsells: ${error.message}`);
  }
};

/**
 * Salva downsells do produto
 */
const saveProductDownsells = async (productId: string, downsellIds: string[], userId: string): Promise<void> => {
  const downsellsData = downsellIds.map(downsellId => ({
    base_product_id: productId,
    downsell_product_id: downsellId,
    user_id: userId,
    created_by: userId,
  }));

  const { error } = await supabase
    .from('product_downsells')
    .insert(downsellsData);

  if (error) {
    throw new Error(`Failed to save product downsells: ${error.message}`);
  }
};

/**
 * Salva upgrade do produto
 */
const saveProductUpgrade = async (productId: string, upgrade: any, userId: string): Promise<void> => {
  const upgradeData = {
    base_product_id: productId,
    upgrade_product_id: upgrade.upgrade_product_id,
    name: upgrade.name,
    description: upgrade.description,
    upgrade_price: upgrade.upgrade_price,
    benefits: upgrade.benefits,
    is_active: upgrade.is_active ?? true,
    user_id: userId,
    created_by: userId,
  };

  const { error } = await supabase
    .from('product_upgrades')
    .insert(upgradeData);

  if (error) {
    throw new Error(`Failed to save product upgrade: ${error.message}`);
  }
};

// Funções de atualização

const updateProductPromotion = async (productId: string, promotion: any, userId: string): Promise<void> => {
  // Primeiro, deletar promoções existentes
  await deleteProductPromotions(productId, userId);
  // Depois, criar nova promoção
  await saveProductPromotion(productId, promotion, userId);
};

const updateProductUpsells = async (productId: string, upsellIds: string[], userId: string): Promise<void> => {
  // Primeiro, deletar upsells existentes
  await deleteProductUpsells(productId, userId);
  // Depois, criar novos upsells
  await saveProductUpsells(productId, upsellIds, userId);
};

const updateProductDownsells = async (productId: string, downsellIds: string[], userId: string): Promise<void> => {
  // Primeiro, deletar downsells existentes
  await deleteProductDownsells(productId, userId);
  // Depois, criar novos downsells
  await saveProductDownsells(productId, downsellIds, userId);
};

const updateProductUpgrade = async (productId: string, upgrade: any, userId: string): Promise<void> => {
  // Primeiro, deletar upgrades existentes
  await deleteProductUpgrades(productId, userId);
  // Depois, criar novo upgrade
  await saveProductUpgrade(productId, upgrade, userId);
};

// Funções de exclusão

const deleteProductPromotions = async (productId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('product_promotions')
    .delete()
    .eq('product_id', productId)
    .eq('user_id', userId);

  if (error) {
    console.warn(`Failed to delete product promotions: ${error.message}`);
  }
};

const deleteProductUpsells = async (productId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('product_upsells')
    .delete()
    .eq('base_product_id', productId)
    .eq('user_id', userId);

  if (error) {
    console.warn(`Failed to delete product upsells: ${error.message}`);
  }
};

const deleteProductDownsells = async (productId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('product_downsells')
    .delete()
    .eq('base_product_id', productId)
    .eq('user_id', userId);

  if (error) {
    console.warn(`Failed to delete product downsells: ${error.message}`);
  }
};

const deleteProductUpgrades = async (productId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('product_upgrades')
    .delete()
    .eq('base_product_id', productId)
    .eq('user_id', userId);

  if (error) {
    console.warn(`Failed to delete product upgrades: ${error.message}`);
  }
};