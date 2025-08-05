import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { Product, ProductFormData } from '@/types/product';
import { productsKeys, DEFAULT_CACHE_OPTIONS, ProductCacheOptions } from './types';
import {
  fetchProducts,
  fetchProductsByCategory,
  fetchProductWithRelatedData,
  fetchProductCombos
} from './queries';
import {
  createProduct,
  updateProduct,
  deleteProduct
} from './mutations';

/**
 * Hook para buscar todos os produtos
 */
export const useProductsQuery = (options?: ProductCacheOptions) => {
  const cacheOptions = { ...DEFAULT_CACHE_OPTIONS, ...options };
  
  return useQuery({
    queryKey: productsKeys.lists(),
    queryFn: fetchProducts,
    ...cacheOptions,
  });
};

/**
 * Hook para buscar produtos por categoria
 */
export const useProductsByCategory = (category: string, options?: ProductCacheOptions) => {
  const cacheOptions = { ...DEFAULT_CACHE_OPTIONS, ...options };
  
  return useQuery({
    queryKey: productsKeys.byCategory(category),
    queryFn: () => fetchProductsByCategory(category),
    enabled: !!category && (cacheOptions.enabled ?? true),
    ...cacheOptions,
  });
};

/**
 * Hook para buscar produto com dados relacionados para edição
 */
export const useProductWithRelatedData = (productId: string, options?: ProductCacheOptions) => {
  const cacheOptions = { ...DEFAULT_CACHE_OPTIONS, ...options };
  
  return useQuery({
    queryKey: productsKeys.withRelated(productId),
    queryFn: () => fetchProductWithRelatedData(productId),
    enabled: !!productId && (cacheOptions.enabled ?? true),
    ...cacheOptions,
  });
};

/**
 * Hook para buscar combos de produtos
 */
export const useProductCombosQuery = (options?: ProductCacheOptions) => {
  const cacheOptions = { ...DEFAULT_CACHE_OPTIONS, ...options };
  
  return useQuery({
    queryKey: [...productsKeys.all, 'combos'],
    queryFn: fetchProductCombos,
    ...cacheOptions,
  });
};

/**
 * Hook para criar produto
 */
export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: (newProduct) => {
      // Invalidar todas as queries relacionadas a produtos
      queryClient.invalidateQueries({ queryKey: productsKeys.all });
      
      // Adicionar o novo produto ao cache otimisticamente
      queryClient.setQueryData(productsKeys.lists(), (oldData: Product[] | undefined) => {
        if (!oldData) return [newProduct];
        return [newProduct, ...oldData];
      });
      
      toast({
        title: "Sucesso",
        description: "Produto criado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook para atualizar produto
 */
export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: (updatedProduct) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: productsKeys.all });
      
      // Atualizar o produto específico no cache
      queryClient.setQueryData(productsKeys.lists(), (oldData: Product[] | undefined) => {
        if (!oldData) return [updatedProduct];
        return oldData.map(product => 
          product.id === updatedProduct.id ? updatedProduct : product
        );
      });
      
      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook para excluir produto
 */
export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onMutate: async (productId: string) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: productsKeys.all });
      
      // Snapshot do estado anterior
      const previousProducts = queryClient.getQueryData(productsKeys.lists());
      
      // Atualização otimista
      queryClient.setQueryData(productsKeys.lists(), (oldData: Product[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter(product => product.id !== productId);
      });
      
      return { previousProducts };
    },
    onError: (error: Error, productId: string, context) => {
      // Reverter em caso de erro
      if (context?.previousProducts) {
        queryClient.setQueryData(productsKeys.lists(), context.previousProducts);
      }
      
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso",
      });
    },
    onSettled: () => {
      // Sempre invalidar após a operação
      queryClient.invalidateQueries({ queryKey: productsKeys.all });
    },
  });
};

/**
 * Hook utilitário para gerenciar cache de produtos
 */
export const useProductsCache = () => {
  const queryClient = useQueryClient();
  
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: productsKeys.all });
  };
  
  const invalidateByCategory = (category: string) => {
    queryClient.invalidateQueries({ queryKey: productsKeys.byCategory(category) });
  };
  
  const prefetchProduct = (productId: string) => {
    queryClient.prefetchQuery({
      queryKey: productsKeys.withRelated(productId),
      queryFn: () => fetchProductWithRelatedData(productId),
      ...DEFAULT_CACHE_OPTIONS,
    });
  };
  
  const removeFromCache = (productId: string) => {
    queryClient.removeQueries({ queryKey: productsKeys.withRelated(productId) });
  };
  
  const getProductFromCache = (productId: string): Product | undefined => {
    const products = queryClient.getQueryData<Product[]>(productsKeys.lists());
    return products?.find(product => product.id === productId);
  };
  
  return {
    invalidateAll,
    invalidateByCategory,
    prefetchProduct,
    removeFromCache,
    getProductFromCache,
  };
};

/**
 * Hook para estatísticas de produtos (exemplo de hook derivado)
 */
export const useProductsStats = () => {
  const { data: products = [], isLoading } = useProductsQuery();
  
  const stats = {
    total: products.length,
    active: products.filter(p => p.is_active).length,
    inactive: products.filter(p => !p.is_active).length,
    byCategory: products.reduce((acc, product) => {
      const category = product.category || 'Sem categoria';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    averagePrice: products.length > 0 
      ? products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length 
      : 0,
  };
  
  return {
    stats,
    isLoading,
  };
};