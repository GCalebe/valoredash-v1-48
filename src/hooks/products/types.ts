// Types específicos para produtos
export interface ProductQueryFilters {
  category?: string;
  search?: string;
  userId?: string;
}

export interface ProductRelatedData {
  promotions?: ProductPromotion[];
  upsells?: ProductUpsell[];
  downsells?: ProductDownsell[];
  upgrades?: ProductUpgrade[];
  combos?: ProductCombo[];
}

export interface ProductPromotion {
  id: string;
  product_id: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_percentage?: number;
  discount_amount?: number;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  user_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProductUpsell {
  id: string;
  base_product_id: string;
  upsell_product_id: string;
  user_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProductDownsell {
  id: string;
  base_product_id: string;
  downsell_product_id: string;
  user_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProductUpgrade {
  id: string;
  base_product_id: string;
  upgrade_product_id: string;
  name: string;
  description?: string;
  upgrade_price?: number;
  benefits?: string[];
  is_active: boolean;
  user_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProductCombo {
  id: string;
  name: string;
  description?: string;
  discount_percentage?: number;
  benefit?: string;
  user_id: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProductComboItem {
  id: string;
  combo_id: string;
  product_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Query keys para React Query
export const productsKeys = {
  all: ['products'] as const,
  lists: () => ['products', 'list'] as const,
  list: (filters: ProductQueryFilters) => ['products', 'list', { filters }] as const,
  byCategory: (category: string) => ['products', 'category', category] as const,
  withRelated: (productId: string) => ['products', 'related', productId] as const,
} as const;

// Tipos para validação
export interface ProductValidationError {
  field: string;
  message: string;
}

export interface ProductValidationResult {
  isValid: boolean;
  errors: ProductValidationError[];
}

// Tipos para cache management
export interface ProductCacheOptions {
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
  enabled?: boolean;
}

export const DEFAULT_CACHE_OPTIONS: ProductCacheOptions = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: false,
};