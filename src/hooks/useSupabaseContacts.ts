import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import type { Database } from '../integrations/supabase/types';

type Contact = Database['public']['Tables']['contacts']['Row'];
type ContactInsert = Database['public']['Tables']['contacts']['Insert'];
type ContactUpdate = Database['public']['Tables']['contacts']['Update'];

export const useSupabaseContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
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
        query = query.eq('kanban_stage', stage);
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
      const { data, error } = await supabase
        .from('contacts')
        .insert(contactData)
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