import { AIMessage } from '@/types/ai';
import { useToast } from '@/hooks/use-toast';
import {
  useCreateAIMessageMutation,
  useUpdateAIMessageMutation,
  useDeleteAIMessageMutation,
} from '@/hooks/useAIMessagesQuery';

export function useAIMessagesCrud() {
  const { toast } = useToast();
  const createMutation = useCreateAIMessageMutation();
  const updateMutation = useUpdateAIMessageMutation();
  const deleteMutation = useDeleteAIMessageMutation();

  const extractVariables = (content: string) => {
    const matches = content.match(/\{([^}]+)\}/g);
    return matches ? matches.map((m) => m.slice(1, -1)) : [];
  };

  const addMessage = async (data: {
    category: string;
    name: string;
    content: string;
    context: string;
  }) => {
    const payload = {
      ...data,
      variables: extractVariables(data.content),
      is_active: true,
    };
    try {
      await createMutation.mutateAsync(payload as any);
      toast({
        title: 'Mensagem adicionada',
        description: 'Nova mensagem criada com sucesso!',
      });
    } catch {
      toast({
        title: 'Erro',
        description: 'Erro ao criar mensagem.',
        variant: 'destructive',
      });
    }
  };

  const updateMessage = async (
    id: string,
    data: { category: string; name: string; content: string; context: string },
  ) => {
    const payload = {
      ...data,
      variables: extractVariables(data.content),
    };
    try {
      await updateMutation.mutateAsync({ id, ...payload });
      toast({
        title: 'Mensagem atualizada',
        description: 'Mensagem atualizada com sucesso!',
      });
    } catch {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar mensagem.',
        variant: 'destructive',
      });
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: 'Mensagem excluída',
        description: 'Mensagem removida com sucesso!',
        variant: 'destructive',
      });
    } catch {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir mensagem.',
        variant: 'destructive',
      });
    }
  };

  const toggleMessage = async (message: AIMessage) => {
    try {
      await updateMutation.mutateAsync({
        id: message.id,
        is_active: !message.is_active,
      });
    } catch {
      toast({
        title: 'Erro',
        description: 'Erro ao alterar status da mensagem.',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copiado!',
      description: 'Conteúdo copiado para a área de transferência.',
    });
  };

  return {
    addMessage,
    updateMessage,
    deleteMessage,
    toggleMessage,
    copyToClipboard,
    createPending: createMutation.isPending,
    updatePending: updateMutation.isPending,
  };
}

