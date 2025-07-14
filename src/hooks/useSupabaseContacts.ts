
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

// Use the database types directly from Supabase
type DatabaseContact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  client_name: string | null;
  client_size: string | null;
  client_type: string | null;
  cpf_cnpj: string | null;
  asaas_customer_id: string | null;
  status: string | null;
  notes: string | null;
  last_contact: string | null;
  kanban_stage_id: string | null;
  last_message: string | null;
  last_message_time: string | null;
  unread_count: number | null;
  session_id: string | null;
  tags: string[] | null;
  responsible_user: string | null;
  sales: number | null;
  client_sector: string | null;
  budget: number | null;
  payment_method: string | null;
  client_objective: string | null;
  loss_reason: string | null;
  contract_number: string | null;
  contract_date: string | null;
  payment: string | null;
  uploaded_files: string[] | null;
  consultation_stage: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type ContactInsert = Partial<DatabaseContact> & {
  name: string;
};

type ContactUpdate = Partial<DatabaseContact>;

export const useSupabaseContacts = () => {
  const [contacts, setContacts] = useState<DatabaseContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar contatos');
    } finally {
      setLoading(false);
    }
  };

  const getContactsByKanbanStage = async (stage?: string) => {
    try {
      let query = supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (stage) {
        query = query.eq('kanban_stage_id', stage);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar contatos por estágio:', err);
      return [];
    }
  };

  const createContact = async (contactData: ContactInsert) => {
    try {
      // Get the current user from the auth session
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('contacts')
        .insert({ ...contactData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      await fetchContacts(); // Refresh the list
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar contato');
      throw err;
    }
  };

  const updateContact = async (id: string, updates: ContactUpdate) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchContacts(); // Refresh the list
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar contato');
      throw err;
    }
  };

  const deleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchContacts(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar contato');
      throw err;
    }
  };

  const getContactById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Erro ao buscar contato:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return {
    contacts,
    loading,
    error,
    refetch: fetchContacts,
    getContactsByKanbanStage,
    createContact,
    updateContact,
    deleteContact,
    getContactById
  };
};
