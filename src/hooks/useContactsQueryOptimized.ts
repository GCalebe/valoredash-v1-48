
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Simplified contact interface to avoid type issues
interface SimpleContact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  kanban_stage_id?: string;
  created_at?: string;
  updated_at?: string;
  sales?: number;
  budget?: number;
}

interface ContactFilters {
  search?: string;
  kanban_stage?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

// Fetch contacts with simplified typing
const fetchContacts = async (filters: ContactFilters = {}): Promise<SimpleContact[]> => {
  let query = supabase
    .from('contacts')
    .select('id, name, email, phone, kanban_stage_id, created_at, sales, budget')
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters.kanban_stage) {
    query = query.eq('kanban_stage_id', filters.kanban_stage);
  }

  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
  }

  if (filters.dateRange) {
    query = query
      .gte('created_at', filters.dateRange.start)
      .lte('created_at', filters.dateRange.end);
  }

  const { data, error } = await query.limit(1000);

  if (error) {
    console.error('Error fetching contacts:', error);
    throw new Error(`Failed to fetch contacts: ${error.message}`);
  }

  return data || [];
};

// Hook for fetching contacts
export const useContactsOptimizedQuery = (filters: ContactFilters = {}) => {
  return useQuery({
    queryKey: ['contacts-optimized', filters],
    queryFn: () => fetchContacts(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for contacts by stage
export const useContactsByStageOptimized = (stage: string) => {
  return useQuery({
    queryKey: ['contacts-optimized', 'stage', stage],
    queryFn: async (): Promise<SimpleContact[]> => {
      const { data, error } = await supabase
        .from('contacts')
        .select('id, name, email, phone, kanban_stage_id, created_at, sales, budget')
        .eq('kanban_stage_id', stage)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        throw new Error(`Error fetching contacts by stage: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!stage,
  });
};

// Hook for contact stats
export const useContactsStatsOptimized = () => {
  return useQuery({
    queryKey: ['contacts-optimized', 'stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('kanban_stage_id, created_at')
        .limit(1000);

      if (error) {
        throw new Error(`Error fetching contact stats: ${error.message}`);
      }

      const contacts = data || [];
      
      const stats = {
        total: contacts.length,
        byStage: contacts.reduce((acc, contact) => {
          const stage = contact.kanban_stage_id || 'unknown';
          acc[stage] = (acc[stage] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        thisMonth: contacts.filter(c => {
          if (!c.created_at) return false;
          const created = new Date(c.created_at);
          const thisMonth = new Date();
          return created.getMonth() === thisMonth.getMonth() && created.getFullYear() === thisMonth.getFullYear();
        }).length,
      };

      return stats;
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

// Create contact mutation
export const useCreateContactOptimized = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newContact: Omit<SimpleContact, 'id' | 'created_at' | 'updated_at'>) => {
      // Get the current user from the auth session
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('contacts')
        .insert([{ ...newContact, user_id: user.id }])
        .select()
        .single();

      if (error) {
        throw new Error(`Error creating contact: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts-optimized'] });
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

// Update contact mutation
export const useUpdateContactOptimized = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SimpleContact> }) => {
      const { data, error } = await supabase
        .from('contacts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating contact: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts-optimized'] });
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
