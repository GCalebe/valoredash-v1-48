import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, cacheConfig } from '@/lib/queryClient';

// Import Contact from centralized types
import type { Contact } from '@/types/client';

interface ContactFilters {
  search?: string;
  kanban_stage?: string;
  lead_source?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

interface ContactsPage {
  data: Contact[];
  nextCursor?: string;
  hasMore: boolean;
  total: number;
}

/**
 * Hook otimizado para busca de contatos com paginação infinita
 * Utiliza cache inteligente e prefetch automático
 */
export const useContactsInfiniteQuery = (filters: ContactFilters = {}, pageSize = 50) => {
  return useInfiniteQuery({
    queryKey: queryKeys.contacts(filters),
    queryFn: async ({ pageParam = 0 }): Promise<ContactsPage> => {
      const offset = typeof pageParam === 'string' ? parseInt(pageParam) : 0;
      let query = supabase
        .from('contacts')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      // Aplicar filtros
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
      }

      if (filters.kanban_stage) {
        query = query.eq('kanban_stage', filters.kanban_stage);
      }

      if (filters.lead_source) {
        query = query.eq('lead_source', filters.lead_source);
      }

      if (filters.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.start)
          .lte('created_at', filters.dateRange.end);
      }

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Erro ao buscar contatos: ${error.message}`);
      }

      const contacts = data || [];
      const total = count || 0;
      const hasMore = (offset + pageSize) < total;
      const nextCursor = hasMore ? (offset + pageSize).toString() : undefined;

      return {
        data: contacts,
        nextCursor,
        hasMore,
        total,
      };
    },
    initialPageParam: '0',
    getNextPageParam: (lastPage: ContactsPage) => lastPage.nextCursor,
    ...cacheConfig.dynamic,
    staleTime: 2 * 60 * 1000, // 2 minutos para contatos
  });
};

/**
 * Hook otimizado para busca de contatos com paginação tradicional
 */
export const useContactsQuery = (filters: ContactFilters = {}, page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: [...queryKeys.contacts(filters), 'page', page, pageSize],
    queryFn: async (): Promise<ContactsPage> => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('contacts')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      // Aplicar filtros
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
      }

      if (filters.kanban_stage) {
        query = query.eq('kanban_stage', filters.kanban_stage);
      }

      if (filters.lead_source) {
        query = query.eq('lead_source', filters.lead_source);
      }

      if (filters.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.start)
          .lte('created_at', filters.dateRange.end);
      }

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Erro ao buscar contatos: ${error.message}`);
      }

      const contacts = data || [];
      const total = count || 0;
      const totalPages = Math.ceil(total / pageSize);
      const hasMore = page < totalPages;

      return {
        data: contacts,
        hasMore,
        total,
      };
    },
    ...cacheConfig.dynamic,
    enabled: true,
  });
};

/**
 * Hook para contatos por estágio do kanban (cache mais longo por ser menos dinâmico)
 */
export const useContactsByStageQuery = (stage: string) => {
  return useQuery({
    queryKey: ['contacts', 'by-stage', stage],
    queryFn: async (): Promise<Contact[]> => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('kanban_stage', stage)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        throw new Error(`Erro ao buscar contatos por estágio: ${error.message}`);
      }

      return data || [];
    },
    ...cacheConfig.static,
    staleTime: 5 * 60 * 1000, // 5 minutos para dados por estágio
  });
};

/**
 * Hook para estatísticas rápidas de contatos
 */
export const useContactsStatsQuery = () => {
  return useQuery({
    queryKey: ['contacts', 'stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('kanban_stage, created_at')
        .limit(1000);

      if (error) {
        throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
      }

      const contacts = data || [];
      
      // Calcular estatísticas de forma eficiente
      const stats = {
        total: contacts.length,
        byStage: contacts.reduce((acc, contact) => {
          const stage = contact.kanban_stage || 'unknown';
          acc[stage] = (acc[stage] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        bySource: {}, // Removed since lead_source doesn't exist
        avgConversion: 0, // Removed since conversion_probability doesn't exist
        thisMonth: contacts.filter(c => {
          const created = new Date(c.created_at);
          const thisMonth = new Date();
          return created.getMonth() === thisMonth.getMonth() && created.getFullYear() === thisMonth.getFullYear();
        }).length,
      };

      return stats;
    },
    ...cacheConfig.metrics,
    staleTime: 3 * 60 * 1000, // 3 minutos para stats
  });
};

/**
 * Mutations otimizadas para contatos
 */
export const useCreateContactMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newContact: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('contacts')
        .insert(newContact)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar contato: ${error.message}`);
      }

      return data;
    },
    onSuccess: (newContact) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contacts', 'stats'] });
      
      // Update otimista nas queries existentes
      queryClient.setQueryData(['contacts', 'by-stage', newContact.kanban_stage], (old: Contact[] = []) => {
        return [newContact, ...old];
      });
    },
    onError: (error) => {
      console.error('Erro ao criar contato:', error);
    },
  });
};

export const useUpdateContactMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Contact> }) => {
      const { data, error } = await supabase
        .from('contacts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar contato: ${error.message}`);
      }

      return data;
    },
    onSuccess: (updatedContact) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contacts', 'stats'] });
      
      // Update específico por ID
      queryClient.setQueryData(['contact', updatedContact.id], updatedContact);
    },
    onError: (error) => {
      console.error('Erro ao atualizar contato:', error);
    },
  });
};

export const useDeleteContactMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Erro ao deletar contato: ${error.message}`);
      }

      return id;
    },
    onSuccess: (deletedId) => {
      // Invalidar todas as queries de contatos
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
    onError: (error) => {
      console.error('Erro ao deletar contato:', error);
    },
  });
};

/**
 * Utilitários para cache e prefetch
 */
export const useContactsUtils = () => {
  const queryClient = useQueryClient();

  return {
    prefetchContactsByStage: (stage: string) => {
      queryClient.prefetchQuery({
        queryKey: ['contacts', 'by-stage', stage],
        staleTime: cacheConfig.static.staleTime,
      });
    },
    
    invalidateAllContacts: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
    
    refetchStats: () => {
      queryClient.refetchQueries({ queryKey: ['contacts', 'stats'] });
    },
  };
};