import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AIMessage } from '@/types/ai';

// Since ai_messages table doesn't exist, we'll use a mock implementation
// This can be replaced with actual database calls when the table is created

// Fetch AI messages - using mock data for now
export const useAIMessagesQuery = () => {
  return useQuery({
    queryKey: ['ai-messages'],
    queryFn: async (): Promise<AIMessage[]> => {
      // Mock data - replace with actual database call when ai_messages table exists
      return [
        {
          id: '1',
          content: 'Olá! Como posso ajudá-lo hoje?',
          role: 'assistant',
          category: 'greeting',
          name: 'Saudação Inicial',
          variables: ['nome'],
          context: 'Mensagem de saudação padrão',
          is_active: true,
        },
        {
          id: '2', 
          content: 'Obrigado pelo seu interesse em nossos produtos!',
          role: 'assistant',
          category: 'response',
          name: 'Agradecimento',
          variables: ['produto'],
          context: 'Resposta de agradecimento',
          is_active: true,
        }
      ];
    },
  });
};

// Create AI message mutation
export const useCreateAIMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newMessage: Omit<AIMessage, 'id'>) => {
      // Mock implementation - replace with actual database call
      const mockMessage = {
        ...newMessage,
        id: Date.now().toString(),
      };
      return mockMessage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-messages'] });
      toast.success('Mensagem AI criada com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating AI message:', error);
      toast.error('Erro ao criar mensagem AI');
    },
  });
};

// Update AI message mutation
export const useUpdateAIMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AIMessage> & { id: string }) => {
      // Mock implementation - replace with actual database call
      return { id, ...updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-messages'] });
      toast.success('Mensagem AI atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating AI message:', error);
      toast.error('Erro ao atualizar mensagem AI');
    },
  });
};

// Delete AI message mutation
export const useDeleteAIMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Mock implementation - replace with actual database call
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-messages'] });
      toast.success('Mensagem AI removida com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting AI message:', error);
      toast.error('Erro ao remover mensagem AI');
    },
  });
};