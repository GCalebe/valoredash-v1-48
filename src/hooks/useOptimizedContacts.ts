import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactsService } from '@/lib/contactsService';
import { Contact } from '@/types/client';
import type { ContactFilters, ContactInput, ContactUpdate, PaginatedContactsResult } from '@/lib/contactsService';
import { useCallback, useMemo } from 'react';
import { toast } from '@/hooks/use-toast';

// Chaves de query otimizadas
export const contactsQueryKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactsQueryKeys.all, 'list'] as const,
  list: (filters: ContactFilters) => [...contactsQueryKeys.lists(), filters] as const,
  paginated: (filters: ContactFilters, cursor?: string) => 
    [...contactsQueryKeys.lists(), 'paginated', filters, cursor] as const,
  byStage: (stageId: string) => [...contactsQueryKeys.all, 'stage', stageId] as const,
  stats: () => [...contactsQueryKeys.all, 'stats'] as const,
  minimal: () => [...contactsQueryKeys.all, 'minimal'] as const,
};

// Hook para buscar contatos com paginação otimizada
export const useOptimizedContacts = (filters: ContactFilters = {}, cursor?: { created_at: string; id: string }) => {
  return useQuery({
    queryKey: contactsQueryKeys.paginated(filters, cursor ? `${cursor.created_at}:${cursor.id}` : undefined),
    queryFn: () => contactsService.fetchContactsPaginated(filters, cursor),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook para buscar contatos por estágio do Kanban
export const useContactsByKanbanStage = (stageId?: string) => {
  return useQuery({
    queryKey: contactsQueryKeys.byStage(stageId || ''),
    queryFn: () => stageId 
      ? contactsService.fetchContactsByKanbanStage(stageId) 
      : Promise.resolve({ data: [], nextCursor: null, hasMore: false } as PaginatedContactsResult),
    enabled: !!stageId,
    staleTime: 2 * 60 * 1000, // 2 minutos para dados do Kanban
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

// Hook para buscar contatos mínimos (carregamento inicial rápido)
export const useContactsMinimal = () => {
  return useQuery({
    queryKey: contactsQueryKeys.minimal(),
    queryFn: () => contactsService.fetchContactsMinimal(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    refetchOnWindowFocus: false,
  });
};

// Hook para estatísticas de contatos
export const useContactStats = () => {
  return useQuery({
    queryKey: contactsQueryKeys.stats(),
    queryFn: () => contactsService.fetchContactStats(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
    refetchOnWindowFocus: false,
  });
};

// Hook para mutações otimizadas
export const useOptimizedContactMutations = () => {
  const queryClient = useQueryClient();

  // Função para invalidar caches relacionados
  const invalidateContactCaches = useCallback((contactId?: string, stageId?: string) => {
    // Invalidar todas as listas de contatos
    queryClient.invalidateQueries({ queryKey: contactsQueryKeys.lists() });
    
    // Invalidar estatísticas
    queryClient.invalidateQueries({ queryKey: contactsQueryKeys.stats() });
    
    // Se temos um stageId, invalidar cache específico do estágio
    if (stageId) {
      queryClient.invalidateQueries({ queryKey: contactsQueryKeys.byStage(stageId) });
    }
  }, [queryClient]);

  // Mutação para criar contato
  const createContactMutation = useMutation({
    mutationFn: (contactData: ContactInput) => contactsService.createContact(contactData),
    onSuccess: (newContact) => {
      // Atualização otimista do cache
      queryClient.setQueryData(
        contactsQueryKeys.byStage(newContact.kanban_stage_id || ''),
        (oldData: Contact[] | undefined) => {
          if (!oldData) return [newContact];
          return [newContact, ...oldData];
        }
      );
      
      invalidateContactCaches(newContact.id, newContact.kanban_stage_id);
      
      toast({
        title: "Contato criado",
        description: "Contato criado com sucesso",
      });
    },
    onError: (error) => {
      console.error('Erro ao criar contato:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar contato",
      });
    },
  });

  // Mutação para atualizar contato
  const updateContactMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ContactUpdate }) => 
      contactsService.updateContact({ id, ...updates }),
    onMutate: async ({ id, updates }) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: contactsQueryKeys.all });
      
      // Snapshot do estado anterior
      const previousContacts = queryClient.getQueryData(contactsQueryKeys.all);
      
      // Atualização otimista
      queryClient.setQueriesData(
        { queryKey: contactsQueryKeys.lists() },
        (oldData: any) => {
          if (!oldData?.data) return oldData;
          return {
            ...oldData,
            data: oldData.data.map((contact: Contact) => 
              contact.id === id ? { ...contact, ...updates } : contact
            ),
          };
        }
      );
      
      return { previousContacts };
    },
    onError: (error, variables, context) => {
      // Reverter em caso de erro
      if (context?.previousContacts) {
        queryClient.setQueryData(contactsQueryKeys.all, context.previousContacts);
      }
      
      console.error('Erro ao atualizar contato:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar contato",
      });
    },
    onSuccess: (updatedContact) => {
      invalidateContactCaches(updatedContact.id, updatedContact.kanban_stage_id);
      
      toast({
        title: "Contato atualizado",
        description: "Contato atualizado com sucesso",
      });
    },
  });

  // Mutação para deletar contato
  const deleteContactMutation = useMutation({
    mutationFn: (id: string) => contactsService.deleteContact(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: contactsQueryKeys.all });
      
      const previousContacts = queryClient.getQueryData(contactsQueryKeys.all);
      
      // Remover otimisticamente
      queryClient.setQueriesData(
        { queryKey: contactsQueryKeys.lists() },
        (oldData: any) => {
          if (!oldData?.data) return oldData;
          return {
            ...oldData,
            data: oldData.data.filter((contact: Contact) => contact.id !== id),
          };
        }
      );
      
      return { previousContacts };
    },
    onError: (error, id, context) => {
      if (context?.previousContacts) {
        queryClient.setQueryData(contactsQueryKeys.all, context.previousContacts);
      }
      
      console.error('Erro ao deletar contato:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar contato",
      });
    },
    onSuccess: () => {
      invalidateContactCaches();
      
      toast({
        title: "Contato deletado",
        description: "Contato deletado com sucesso",
      });
    },
  });

  // Mutação para mudança de estágio (drag and drop)
  const updateStageMutation = useMutation({
    mutationFn: ({ contactId, newStageId }: { contactId: string; newStageId: string }) => 
      contactsService.updateContact({ id: contactId, kanban_stage_id: newStageId }),
    onMutate: async ({ contactId, newStageId }) => {
      // Cancelar queries relacionadas
      await queryClient.cancelQueries({ queryKey: contactsQueryKeys.all });
      
      // Snapshot dos dados anteriores
      const previousData = {
        allContacts: queryClient.getQueryData(contactsQueryKeys.all),
        stats: queryClient.getQueryData(contactsQueryKeys.stats()),
      };
      
      // Atualização otimista nos caches de estágio
      const contact = queryClient.getQueryData<Contact[]>(
        contactsQueryKeys.byStage(contactId)
      )?.find(c => c.id === contactId);
      
      if (contact) {
        // Remover do estágio anterior
        queryClient.setQueryData(
          contactsQueryKeys.byStage(contact.kanban_stage_id || ''),
          (oldData: Contact[] | undefined) => 
            oldData?.filter(c => c.id !== contactId) || []
        );
        
        // Adicionar ao novo estágio
        queryClient.setQueryData(
          contactsQueryKeys.byStage(newStageId),
          (oldData: Contact[] | undefined) => {
            const updatedContact = { ...contact, kanban_stage_id: newStageId };
            return oldData ? [updatedContact, ...oldData] : [updatedContact];
          }
        );
      }
      
      return previousData;
    },
    onError: (error, { contactId, newStageId }, context) => {
      // Reverter mudanças em caso de erro
      if (context) {
        queryClient.setQueryData(contactsQueryKeys.all, context.allContacts);
        queryClient.setQueryData(contactsQueryKeys.stats(), context.stats);
      }
      
      console.error('Erro ao mover contato:', error);
      toast({
        title: "Erro",
        description: "Erro ao mover contato entre estágios",
      });
    },
    onSuccess: (updatedContact, { newStageId }) => {
      // Invalidar caches relevantes
      invalidateContactCaches(updatedContact.id, newStageId);
      invalidateContactCaches(updatedContact.id, updatedContact.kanban_stage_id);
    },
  });

  return {
    createContact: createContactMutation,
    updateContact: updateContactMutation,
    deleteContact: deleteContactMutation,
    updateStage: updateStageMutation,
    invalidateContactCaches,
  };
};

// Hook para prefetch de dados
export const useContactsPrefetch = () => {
  const queryClient = useQueryClient();

  const prefetchContacts = useCallback((filters: ContactFilters = {}) => {
    queryClient.prefetchQuery({
      queryKey: contactsQueryKeys.list(filters),
      queryFn: () => contactsService.fetchContacts(filters),
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);

  const prefetchContactsByStage = useCallback((stageId: string) => {
    queryClient.prefetchQuery({
      queryKey: contactsQueryKeys.byStage(stageId),
      queryFn: () => contactsService.fetchContactsByKanbanStage(stageId),
      staleTime: 2 * 60 * 1000,
    });
  }, [queryClient]);

  return {
    prefetchContacts,
    prefetchContactsByStage,
  };
};