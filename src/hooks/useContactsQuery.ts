import { useQuery } from '@tanstack/react-query';
import { contactsService, ContactFilters } from '@/lib/contactsService';
import { contactsKeys } from '@/lib/contactsQueryKeys';

// Import Contact from centralized types
import type { Contact } from '@/types/client';

// Export Contact for other modules
export type { Contact };

// Re-export for backward compatibility
export type { ContactFilters };
export { contactsKeys };
export { contactsUtils } from '@/lib/contactsUtils';

// Re-export mutations
export {
  useCreateContactMutation,
  useUpdateContactMutation,
  useDeleteContactMutation,
} from './contactsMutations';

// Hook for fetching contacts
export const useContactsQuery = (filters: ContactFilters = {}) => {
  return useQuery({
    queryKey: contactsKeys.list(filters),
    queryFn: () => contactsService.fetchContacts(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for fetching contacts by kanban stage
export const useContactsByStageQuery = (stage: string) => {
  return useQuery({
    queryKey: contactsKeys.byStage(stage),
    queryFn: () => contactsService.fetchContactsByKanbanStage(stage),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: !!stage,
  });
};
