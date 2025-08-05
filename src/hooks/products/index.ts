// Exportar tipos
export type {
  ProductQueryFilters,
  ProductRelatedData,
  ProductPromotion,
  ProductUpsell,
  ProductDownsell,
  ProductUpgrade,
  ProductCombo,
  ProductComboItem,
  ProductValidationError,
  ProductValidationResult,
  ProductCacheOptions,
} from './types';

// Exportar constantes
export {
  productsKeys,
  DEFAULT_CACHE_OPTIONS,
} from './types';

// Exportar funções de query
export {
  fetchProducts,
  fetchProductsByCategory,
  fetchProductWithRelatedData,
  fetchProductPromotions,
  fetchProductUpsells,
  fetchProductDownsells,
  fetchProductUpgrades,
  fetchProductCombos,
} from './queries';

// Exportar funções de mutation
export {
  createProduct,
  updateProduct,
  deleteProduct,
} from './mutations';

// Exportar hooks principais
export {
  useProductsQuery,
  useProductsByCategory,
  useProductWithRelatedData,
  useProductCombosQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useProductsCache,
  useProductsStats,
} from './hooks';

// Hook legado para compatibilidade com código existente
import { useProductsQuery } from './hooks';

/**
 * Hook legado para compatibilidade com o código existente
 * @deprecated Use useProductsQuery, useCreateProductMutation, etc. instead
 */
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

// Re-exportar hooks mais usados para facilitar importação
export {
  useProductsQuery as useProductsList,
  useCreateProductMutation as useCreateProduct,
  useUpdateProductMutation as useUpdateProduct,
  useDeleteProductMutation as useDeleteProduct,
};