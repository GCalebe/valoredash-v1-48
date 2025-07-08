import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AIMessage {
  id: string;
  category: string;
  name: string;
  content: string;
  variables: string[];
  context: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface AIMessageInsert {
  category: string;
  name: string;
  content: string;
  variables: string[];
  context: string;
  is_active?: boolean;
}

interface AIMessageUpdate {
  category?: string;
  name?: string;
  content?: string;
  variables?: string[];
  context?: string;
  is_active?: boolean;
}

// Query keys
export const aiMessagesKeys = {
  all: ['aiMessages'] as const,
  lists: () => [...aiMessagesKeys.all, 'list'] as const,
  list: (filters: string) => [...aiMessagesKeys.lists(), { filters }] as const,
  details: () => [...aiMessagesKeys.all, 'detail'] as const,
  detail: (id: string) => [...aiMessagesKeys.details(), id] as const,
  byCategory: (category: string) => [...aiMessagesKeys.all, 'category', category] as const,
};

// Fetch AI messages
const fetchAIMessages = async (): Promise<AIMessage[]> => {
  const { data, error } = await supabase
    .from('ai_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Fetch AI messages by category
const fetchAIMessagesByCategory = async (category: string): Promise<AIMessage[]> => {
  const { data, error } = await supabase
    .from('ai_messages')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Create AI message
const createAIMessage = async (message: AIMessageInsert): Promise<AIMessage> => {
  const { data, error } = await supabase
    .from('ai_messages')
    .insert(message)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update AI message
const updateAIMessage = async ({ id, ...updates }: { id: string } & AIMessageUpdate): Promise<AIMessage> => {
  const { data, error } = await supabase
    .from('ai_messages')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete AI message
const deleteAIMessage = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('ai_messages')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Hooks
export const useAIMessagesQuery = () => {
  return useQuery({
    queryKey: aiMessagesKeys.lists(),
    queryFn: fetchAIMessages,
  });
};

export const useAIMessagesByCategoryQuery = (category: string) => {
  return useQuery({
    queryKey: aiMessagesKeys.byCategory(category),
    queryFn: () => fetchAIMessagesByCategory(category),
    enabled: !!category,
  });
};

export const useCreateAIMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAIMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiMessagesKeys.all });
      toast({
        title: "Mensagem criada",
        description: "Nova mensagem de IA criada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar mensagem",
        description: "Não foi possível criar a mensagem de IA.",
        variant: "destructive",
      });
      console.error('Error creating AI message:', error);
    },
  });
};

export const useUpdateAIMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAIMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiMessagesKeys.all });
      toast({
        title: "Mensagem atualizada",
        description: "Mensagem de IA atualizada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar mensagem",
        description: "Não foi possível atualizar a mensagem de IA.",
        variant: "destructive",
      });
      console.error('Error updating AI message:', error);
    },
  });
};

export const useDeleteAIMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAIMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiMessagesKeys.all });
      toast({
        title: "Mensagem excluída",
        description: "Mensagem de IA excluída com sucesso!",
        variant: "destructive",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir mensagem",
        description: "Não foi possível excluir a mensagem de IA.",
        variant: "destructive",
      });
      console.error('Error deleting AI message:', error);
    },
  });
};