
// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';
import { getCurrentAuthUser } from '@/hooks/useAuthUser';
import { AdvancedFiltersService } from '@/services/advancedFiltersService';

export interface ContactData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  kanban_stage_id?: string;
  created_at: string;
  updated_at: string;
  sales?: number;
  budget?: number;
  company?: string;
  user_id: string;
  client_name?: string;
  status?: string;
  tags?: string[];
}

export interface ContactInput {
  name: string;
  email?: string;
  phone?: string;
  kanban_stage_id?: string;
  sales?: number;
  budget?: number;
  company?: string;
  user_id: string;
  client_name?: string;
  status?: string;
  tags?: string[];
}

export interface ContactUpdate {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  kanban_stage_id?: string;
  sales?: number;
  budget?: number;
  company?: string;
  client_name?: string;
  status?: string;
  tags?: string[];
}

export interface ContactFilters {
  kanban_stage_id?: string;
  lead_source?: string;
  search?: string;
  status?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  advancedFilters?: FilterGroup;
}

export interface PaginatedContactsResult {
  data: ContactData[];
  nextCursor: { created_at: string; id: string } | null;
  hasMore: boolean;
}

export interface ContactStats {
  total: number;
  byStage: Record<string, number>;
  byStatus: Record<string, number>;
  recent: number;
}

export const contactsService = {
  // Método otimizado com paginação por cursor
  async fetchContactsPaginated(
    filters: ContactFilters = {},
    cursor?: { created_at: string; id: string },
    limit: number = 50
  ): Promise<PaginatedContactsResult> {
    const user = await getCurrentAuthUser();
    
    let query = supabase
      .from('contacts')
      .select('id, name, email, phone, kanban_stage_id, created_at, updated_at, sales, budget, client_name, status, tags')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit + 1); // +1 para verificar se há mais dados

    // Aplicar cursor para paginação
    if (cursor) {
      query = query.or(`created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`);
    }

    // Aplicar filtros otimizados
    if (filters.kanban_stage_id) {
      query = query.eq('kanban_stage_id', filters.kanban_stage_id);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    if (filters.search) {
      // Usar índice GIN para busca de texto
      query = query.textSearch('search_vector', filters.search, {
        type: 'websearch',
        config: 'portuguese'
      });
    }

    if (filters.dateRange) {
      query = query
        .gte('created_at', filters.dateRange.start)
        .lte('created_at', filters.dateRange.end);
    }

    if (filters.advancedFilters) {
      query = AdvancedFiltersService.attachAdvancedFilters(query, filters.advancedFilters);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching contacts:', error);
      throw new Error(`Failed to fetch contacts: ${error.message}`);
    }

    const contacts = data || [];
    const hasMore = contacts.length > limit;
    const resultData = hasMore ? contacts.slice(0, limit) : contacts;
    const nextCursor = hasMore && resultData.length > 0 
      ? { created_at: resultData[resultData.length - 1].created_at, id: resultData[resultData.length - 1].id }
      : null;

    return {
      data: resultData,
      nextCursor,
      hasMore
    };
  },

  // Método legado mantido para compatibilidade
  async fetchContacts(filters: ContactFilters = {}): Promise<ContactData[]> {
    const result = await this.fetchContactsPaginated(filters, undefined, 1000);
    return result.data;
  },

  // Método otimizado para buscar contatos por estágio com paginação
  async fetchContactsByKanbanStage(
    stage: string,
    cursor?: { created_at: string; id: string },
    limit: number = 50
  ): Promise<PaginatedContactsResult> {
    const user = await getCurrentAuthUser();
    
    let query = supabase
      .from('contacts')
      .select('id, name, email, phone, kanban_stage_id, created_at, updated_at, client_name, status, tags, sales, budget')
      .eq('user_id', user.id)
      .eq('kanban_stage_id', stage)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      query = query.or(`created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching contacts by stage:', error);
      throw new Error(`Failed to fetch contacts by stage: ${error.message}`);
    }

    const contacts = data || [];
    const hasMore = contacts.length > limit;
    const resultData = hasMore ? contacts.slice(0, limit) : contacts;
    const nextCursor = hasMore && resultData.length > 0 
      ? { created_at: resultData[resultData.length - 1].created_at, id: resultData[resultData.length - 1].id }
      : null;

    return {
      data: resultData,
      nextCursor,
      hasMore
    };
  },

  // Método para buscar apenas IDs e dados essenciais (carregamento inicial rápido)
  async fetchContactsMinimal(stageId?: string): Promise<Pick<ContactData, 'id' | 'name' | 'kanban_stage_id' | 'created_at'>[]> {
    const user = await getCurrentAuthUser();
    
    let query = supabase
      .from('contacts')
      .select('id, name, kanban_stage_id, created_at')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (stageId) {
      query = query.eq('kanban_stage_id', stageId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching minimal contacts:', error);
      throw new Error(`Failed to fetch minimal contacts: ${error.message}`);
    }

    return data || [];
  },

  // Método para obter estatísticas dos contatos
  async fetchContactStats(): Promise<ContactStats> {
    const user = await getCurrentAuthUser();
    
    const { data, error } = await supabase
      .from('contacts')
      .select('kanban_stage_id, status, created_at')
      .eq('user_id', user.id)
      .is('deleted_at', null);

    if (error) {
      console.error('Error fetching contact stats:', error);
      throw new Error(`Failed to fetch contact stats: ${error.message}`);
    }

    const contacts = data || [];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const stats: ContactStats = {
      total: contacts.length,
      byStage: {},
      byStatus: {},
      recent: 0
    };

    contacts.forEach(contact => {
      // Contar por estágio
      if (contact.kanban_stage_id) {
        stats.byStage[contact.kanban_stage_id] = (stats.byStage[contact.kanban_stage_id] || 0) + 1;
      }

      // Contar por status
      if (contact.status) {
        stats.byStatus[contact.status] = (stats.byStatus[contact.status] || 0) + 1;
      }

      // Contar recentes (últimos 7 dias)
      if (new Date(contact.created_at) >= sevenDaysAgo) {
        stats.recent++;
      }
    });

    return stats;
  },

  async createContact(contact: ContactInput): Promise<ContactData> {
    const { data, error } = await supabase
      .from('contacts')
      .insert([contact])
      .select()
      .single();

    if (error) {
      console.error('Error creating contact:', error);
      throw new Error(`Failed to create contact: ${error.message}`);
    }

    return data;
  },

  async updateContact({ id, ...updates }: ContactUpdate): Promise<ContactData> {
    // Verify user authentication and ownership
    const user = await getCurrentAuthUser();
    
    const { data, error } = await supabase
      .from('contacts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating contact:', error);
      throw new Error(`Failed to update contact: ${error.message}`);
    }

    return data;
  },

  async deleteContact(id: string): Promise<void> {
    // Verify user authentication and ownership
    const user = await getCurrentAuthUser();
    
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting contact:', error);
      throw new Error(`Failed to delete contact: ${error.message}`);
    }
  },
};
