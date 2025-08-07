// Enhanced contactsService with improved data architecture
// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';
import { getCurrentAuthUser } from '@/hooks/useAuthUser';
import { Contact } from '@/types/client';

// Enhanced Contact Data Interface with all fields
export interface EnhancedContactData extends Contact {
  // Ensure all Contact fields are included
  user_id: string;
}

export interface ContactInput {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  client_name?: string;
  client_size?: string;
  client_type?: string;
  cpf_cnpj?: string;
  asaas_customer_id?: string;
  status?: string;
  notes?: string;
  tags?: string[];
  responsible_user?: string;
  responsible_hosts?: string[];
  sales?: number;
  budget?: number;
  payment_method?: string;
  client_objective?: string;
  loss_reason?: string;
  contract_number?: string;
  contract_date?: string;
  payment?: string;
  uploaded_files?: string[];
  consultation_stage?: string;
  kanban_stage_id?: string;
  session_id?: string;
  user_id: string;
  client_sector?: string;
}

export interface ContactUpdate extends Partial<ContactInput> {
  id: string;
}

export interface ContactFilters {
  kanban_stage_id?: string;
  lead_source?: string;
  search?: string;
  tags?: string[];
  status?: string;
  consultation_stage?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  responsibleUser?: string;
  limit?: number;
  offset?: number;
}

// Optimized SELECT queries with specific field selection
const BASIC_CONTACT_FIELDS = 'id, name, email, phone, status, created_at, updated_at';
const EXTENDED_CONTACT_FIELDS = `
  id, name, email, phone, address, client_name, client_size, client_type,
  cpf_cnpj, asaas_customer_id, status, notes, tags, responsible_user,
  responsible_hosts, sales, budget, payment_method, client_objective,
  loss_reason, contract_number, contract_date, payment, uploaded_files,
  consultation_stage, kanban_stage_id, session_id, client_sector,
  created_at, updated_at, last_contact, last_message_time, unread_count,
  files_metadata
`;

export const optimizedContactsService = {
  // Fast fetch for lists (minimal fields)
  async fetchContactsList(filters: ContactFilters = {}): Promise<Contact[]> {
    const user = await getCurrentAuthUser();
    
    let query = supabase
      .from('contacts')
      .select(BASIC_CONTACT_FIELDS)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    // Apply optimized filters
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
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
    }

    if (filters.dateRange) {
      query = query
        .gte('created_at', filters.dateRange.start)
        .lte('created_at', filters.dateRange.end);
    }

    // Pagination support
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching contacts list:', error);
      throw new Error(`Failed to fetch contacts: ${error.message}`);
    }

    return data || [];
  },

  // Detailed fetch for single contact or edit views
  async fetchContactDetails(contactId: string): Promise<Contact | null> {
    const user = await getCurrentAuthUser();
    
    const { data, error } = await supabase
      .from('contacts')
      .select(EXTENDED_CONTACT_FIELDS)
      .eq('id', contactId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching contact details:', error);
      return null;
    }

    return data;
  },

  // Batch operations for better performance
  async batchCreateContacts(contacts: ContactInput[]): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .insert(contacts)
      .select(EXTENDED_CONTACT_FIELDS);

    if (error) {
      console.error('Error batch creating contacts:', error);
      throw new Error(`Failed to create contacts: ${error.message}`);
    }

    return data || [];
  },

  async batchUpdateContacts(updates: ContactUpdate[]): Promise<Contact[]> {
    const results: Contact[] = [];
    
    // Process in chunks of 10 for optimal performance
    const chunks = [];
    for (let i = 0; i < updates.length; i += 10) {
      chunks.push(updates.slice(i, i + 10));
    }

    for (const chunk of chunks) {
      const promises = chunk.map(({ id, ...updateData }) =>
        supabase
          .from('contacts')
          .update({ ...updateData, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select(EXTENDED_CONTACT_FIELDS)
          .single()
      );

      const responses = await Promise.allSettled(promises);
      
      responses.forEach((response, index) => {
        if (response.status === 'fulfilled' && response.value.data) {
          results.push(response.value.data);
        } else {
          console.error(`Failed to update contact ${chunk[index].id}:`, response);
        }
      });
    }

    return results;
  },

  // Legacy compatibility methods
  async fetchContacts(filters: ContactFilters = {}): Promise<Contact[]> {
    return this.fetchContactsList(filters);
  },

  async fetchContactsByKanbanStage(stage: string): Promise<Contact[]> {
    return this.fetchContactsList({ kanban_stage_id: stage });
  },

  async createContact(contact: ContactInput): Promise<Contact> {
    const results = await this.batchCreateContacts([contact]);
    return results[0];
  },

  async updateContact(update: ContactUpdate): Promise<Contact> {
    const results = await this.batchUpdateContacts([update]);
    return results[0];
  },

  async deleteContact(id: string): Promise<void> {
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

  // Analytics and aggregation queries
  async getContactsStats(userId?: string): Promise<{
    total: number;
    byStage: Record<string, number>;
    byStatus: Record<string, number>;
    recentCount: number;
  }> {
    const user = userId ? { id: userId } : await getCurrentAuthUser();
    
    const { data: total } = await supabase
      .from('contacts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const { data: byStage } = await supabase
      .from('contacts')
      .select('kanban_stage_id')
      .eq('user_id', user.id);

    const { data: byStatus } = await supabase
      .from('contacts')
      .select('status')
      .eq('user_id', user.id);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const { data: recent } = await supabase
      .from('contacts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', oneWeekAgo.toISOString());

    // Process aggregations
    const stageStats: Record<string, number> = {};
    byStage?.forEach(contact => {
      const stage = contact.kanban_stage_id || 'unassigned';
      stageStats[stage] = (stageStats[stage] || 0) + 1;
    });

    const statusStats: Record<string, number> = {};
    byStatus?.forEach(contact => {
      const status = contact.status || 'unknown';
      statusStats[status] = (statusStats[status] || 0) + 1;
    });

    return {
      total: total?.length || 0,
      byStage: stageStats,
      byStatus: statusStats,
      recentCount: recent?.length || 0,
    };
  },
};

// Export both services for backward compatibility
export const contactsService = optimizedContactsService;