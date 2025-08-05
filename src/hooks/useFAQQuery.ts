// @ts-nocheck
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface FAQInsert {
  question: string;
  answer: string;
  category: string;
  tags: string[];
  is_active?: boolean;
}

interface FAQUpdate {
  question?: string;
  answer?: string;
  category?: string;
  tags?: string[];
  is_active?: boolean;
}

// Query keys
export const faqKeys = {
  all: ['faq'] as const,
  lists: () => [...faqKeys.all, 'list'] as const,
  list: (filters: string) => [...faqKeys.lists(), { filters }] as const,
  details: () => [...faqKeys.all, 'detail'] as const,
  detail: (id: string) => [...faqKeys.details(), id] as const,
  byCategory: (category: string) => [...faqKeys.all, 'category', category] as const,
};

// Fetch FAQ items - now filters by user_id for security
const fetchFAQItems = async (): Promise<FAQItem[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('faq_items')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Fetch FAQ items by category - now filters by user_id for security
const fetchFAQItemsByCategory = async (category: string): Promise<FAQItem[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('faq_items')
    .select('*')
    .eq('category', category)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Create FAQ item
const createFAQItem = async (faqItem: FAQInsert): Promise<FAQItem> => {
  // Get the current user from the auth session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('faq_items')
    .insert({ ...faqItem, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update FAQ item
const updateFAQItem = async ({ id, ...updates }: { id: string } & FAQUpdate): Promise<FAQItem> => {
  const { data, error } = await supabase
    .from('faq_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete FAQ item
const deleteFAQItem = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('faq_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Hooks
export const useFAQItemsQuery = () => {
  return useQuery({
    queryKey: faqKeys.lists(),
    queryFn: fetchFAQItems,
  });
};

export const useFAQItemsByCategoryQuery = (category: string) => {
  return useQuery({
    queryKey: faqKeys.byCategory(category),
    queryFn: () => fetchFAQItemsByCategory(category),
    enabled: !!category,
  });
};

export const useCreateFAQItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFAQItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: faqKeys.all });
      toast({
        title: "FAQ criado",
        description: "Novo item de FAQ criado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar FAQ",
        description: "Não foi possível criar o item de FAQ.",
        variant: "destructive",
      });
      console.error('Error creating FAQ item:', error);
    },
  });
};

export const useUpdateFAQItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateFAQItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: faqKeys.all });
      toast({
        title: "FAQ atualizado",
        description: "Item de FAQ atualizado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar FAQ",
        description: "Não foi possível atualizar o item de FAQ.",
        variant: "destructive",
      });
      console.error('Error updating FAQ item:', error);
    },
  });
};

export const useDeleteFAQItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFAQItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: faqKeys.all });
      toast({
        title: "FAQ excluído",
        description: "Item de FAQ excluído com sucesso!",
        variant: "destructive",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir FAQ",
        description: "Não foi possível excluir o item de FAQ.",
        variant: "destructive",
      });
      console.error('Error deleting FAQ item:', error);
    },
  });
};

// Alias exports for backward compatibility
export const useFAQQuery = useFAQItemsQuery;
export const useCreateFAQMutation = useCreateFAQItemMutation;
export const useUpdateFAQMutation = useUpdateFAQItemMutation;
export const useDeleteFAQMutation = useDeleteFAQItemMutation;