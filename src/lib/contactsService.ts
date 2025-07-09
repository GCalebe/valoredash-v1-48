import { supabase } from '@/integrations/supabase/client';

export interface ContactFilters {
  kanban_stage?: string;
  lead_source?: string;
  search?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export const contactsService = {
  async fetchContacts(filters: ContactFilters = {}): Promise<any[]> {
    let query = supabase
      .from('contacts')
      .select('id, name, email, phone, kanban_stage, created_at, updated_at, sales, budget')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.kanban_stage) {
      query = query.eq('kanban_stage', filters.kanban_stage);
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
  },

  async fetchContactsByKanbanStage(stage: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('id, name, email, phone, kanban_stage, created_at, updated_at')
      .eq('kanban_stage', stage)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contacts by stage:', error);
      throw new Error(`Failed to fetch contacts by stage: ${error.message}`);
    }

    return data || [];
  },

  async createContact(contact: any): Promise<any> {
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

  async updateContact({ id, ...updates }: any): Promise<any> {
    const { data, error } = await supabase
      .from('contacts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating contact:', error);
      throw new Error(`Failed to update contact: ${error.message}`);
    }

    return data;
  },

  async deleteContact(id: string): Promise<void> {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting contact:', error);
      throw new Error(`Failed to delete contact: ${error.message}`);
    }
  },
};