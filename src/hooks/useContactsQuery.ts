import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Import Contact from centralized types
import type { Contact } from '@/types/client';

export interface ContactFilters {
  kanban_stage?: string;
  lead_source?: string;
  search?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

// Query keys
export const contactsKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactsKeys.all, 'list'] as const,
  list: (filters: ContactFilters) => [...contactsKeys.lists(), { filters }] as const,
  byStage: (stage: string) => [...contactsKeys.all, 'stage', stage] as const,
  bySource: (source: string) => [...contactsKeys.all, 'source', source] as const,
  details: () => [...contactsKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactsKeys.details(), id] as const,
};

// Fetch contacts
const fetchContacts = async (filters: ContactFilters = {}): Promise<Contact[]> => {
  let query = supabase
    .from('dados_cliente')
    .select('*')
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters.kanban_stage) {
    query = query.eq('kanban_stage', filters.kanban_stage);
  }

  if (filters.lead_source) {
    query = query.eq('lead_source', filters.lead_source);
  }

  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
  }

  if (filters.dateRange) {
    query = query
      .gte('created_at', filters.dateRange.start)
      .lte('created_at', filters.dateRange.end);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching contacts:', error);
    throw new Error(`Failed to fetch contacts: ${error.message}`);
  }

  return data || [];
};

// Fetch contacts by kanban stage
const fetchContactsByKanbanStage = async (stage: string): Promise<Contact[]> => {
  const { data, error } = await supabase
    .from('dados_cliente')
    .select('*')
    .eq('kanban_stage', stage)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching contacts by stage:', error);
    throw new Error(`Failed to fetch contacts by stage: ${error.message}`);
  }

  return data || [];
};

// Create contact
const createContact = async (contact: Omit<Contact, 'id' | 'created_at' | 'updated_at'>): Promise<Contact> => {
  const { data, error } = await supabase
    .from('dados_cliente')
    .insert([contact])
    .select()
    .single();

  if (error) {
    console.error('Error creating contact:', error);
    throw new Error(`Failed to create contact: ${error.message}`);
  }

  return data;
};

// Update contact
const updateContact = async ({ id, ...updates }: Partial<Contact> & { id: string }): Promise<Contact> => {
  const { data, error } = await supabase
    .from('dados_cliente')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating contact:', error);
    throw new Error(`Failed to update contact: ${error.message}`);
  }

  return data;
};

// Delete contact
const deleteContact = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('dados_cliente')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting contact:', error);
    throw new Error(`Failed to delete contact: ${error.message}`);
  }
};

// Hook for fetching contacts
export const useContactsQuery = (filters: ContactFilters = {}) => {
  return useQuery({
    queryKey: contactsKeys.list(filters),
    queryFn: () => fetchContacts(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for fetching contacts by kanban stage
export const useContactsByStageQuery = (stage: string) => {
  return useQuery({
    queryKey: contactsKeys.byStage(stage),
    queryFn: () => fetchContactsByKanbanStage(stage),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: !!stage,
  });
};

// Hook for creating contact
export const useCreateContactMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactsKeys.all });
      toast({
        title: "Success",
        description: "Contact created successfully",
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

// Hook for updating contact
export const useUpdateContactMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactsKeys.all });
      toast({
        title: "Success",
        description: "Contact updated successfully",
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

// Hook for deleting contact
export const useDeleteContactMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactsKeys.all });
      toast({
        title: "Success",
        description: "Contact deleted successfully",
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
export const contactsUtils = {
  invalidateAll: (queryClient: ReturnType<typeof useQueryClient>) => {
    queryClient.invalidateQueries({ queryKey: contactsKeys.all });
  },
  prefetchContacts: (queryClient: ReturnType<typeof useQueryClient>, filters: ContactFilters = {}) => {
    queryClient.prefetchQuery({
      queryKey: contactsKeys.list(filters),
      queryFn: () => fetchContacts(filters),
      staleTime: 2 * 60 * 1000,
    });
  },
  prefetchContactsByStage: (queryClient: ReturnType<typeof useQueryClient>, stage: string) => {
    queryClient.prefetchQuery({
      queryKey: contactsKeys.byStage(stage),
      queryFn: () => fetchContactsByKanbanStage(stage),
      staleTime: 2 * 60 * 1000,
    });
  },
};