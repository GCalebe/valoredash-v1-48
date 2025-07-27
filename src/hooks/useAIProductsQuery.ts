import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';
import { toast } from '@/hooks/use-toast';

// Query keys
export const aiProductsKeys = {
  all: ['aiProducts'] as const,
  lists: () => [...aiProductsKeys.all, 'list'] as const,
  list: (filters: string) => [...aiProductsKeys.lists(), { filters }] as const,
  details: () => [...aiProductsKeys.all, 'detail'] as const,
  detail: (id: string) => [...aiProductsKeys.details(), id] as const,
};

// Fetch AI products
const fetchAIProducts = async (): Promise<unknown[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching AI products:', error);
    throw new Error(`Failed to fetch AI products: ${error.message}`);
  }

  return data || [];
};

// Create AI product
const createAIProduct = async (product: { name: string; description?: string; category?: string; features?: string[]; icon?: string; image?: string; popular?: boolean; new?: boolean }): Promise<unknown> => {
  const { data, error } = await supabase
    .from('products')
    .insert([{ id: crypto.randomUUID(), ...product }])
    .select()
    .single();

  if (error) {
    console.error('Error creating AI product:', error);
    throw new Error(`Failed to create AI product: ${error.message}`);
  }

  return data;
};

// Update AI product
const updateAIProduct = async ({ id, ...updates }: { id: string } & Partial<{ name: string; description: string; category: string; features: string[]; icon: string; image: string; popular: boolean; new: boolean }>): Promise<unknown> => {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating AI product:', error);
    throw new Error(`Failed to update AI product: ${error.message}`);
  }

  return data;
};

// Delete AI product
const deleteAIProduct = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting AI product:', error);
    throw new Error(`Failed to delete AI product: ${error.message}`);
  }
};

// Hook for fetching AI products
export const useAIProductsQuery = () => {
  return useQuery({
    queryKey: aiProductsKeys.lists(),
    queryFn: fetchAIProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for creating AI product
export const useCreateAIProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAIProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiProductsKeys.all });
      toast({
        title: "Success",
        description: "AI product created successfully",
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

// Hook for updating AI product
export const useUpdateAIProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAIProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiProductsKeys.all });
      toast({
        title: "Success",
        description: "AI product updated successfully",
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

// Hook for deleting AI product
export const useDeleteAIProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAIProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiProductsKeys.all });
      toast({
        title: "Success",
        description: "AI product deleted successfully",
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
export const aiProductsUtils = {
  invalidateAll: (queryClient: ReturnType<typeof useQueryClient>) => {
    queryClient.invalidateQueries({ queryKey: aiProductsKeys.all });
  },
  prefetchProducts: (queryClient: ReturnType<typeof useQueryClient>) => {
    queryClient.prefetchQuery({
      queryKey: aiProductsKeys.lists(),
      queryFn: fetchAIProducts,
      staleTime: 5 * 60 * 1000,
    });
  },
};