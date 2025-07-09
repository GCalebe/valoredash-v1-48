import { useQueryClient } from '@tanstack/react-query';
import { contactsService, ContactFilters } from './contactsService';
import { contactsKeys } from './contactsQueryKeys';

export const contactsUtils = {
  invalidateAll: (queryClient: ReturnType<typeof useQueryClient>) => {
    queryClient.invalidateQueries({ queryKey: contactsKeys.all });
  },
  
  prefetchContacts: (queryClient: ReturnType<typeof useQueryClient>, filters: ContactFilters = {}) => {
    queryClient.prefetchQuery({
      queryKey: contactsKeys.list(filters),
      queryFn: () => contactsService.fetchContacts(filters),
      staleTime: 2 * 60 * 1000,
    });
  },
  
  prefetchContactsByStage: (queryClient: ReturnType<typeof useQueryClient>, stage: string) => {
    queryClient.prefetchQuery({
      queryKey: contactsKeys.byStage(stage),
      queryFn: () => contactsService.fetchContactsByKanbanStage(stage),
      staleTime: 2 * 60 * 1000,
    });
  },
};