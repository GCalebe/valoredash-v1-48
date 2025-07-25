import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Agenda {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number | null;
  category: string | null;
  is_active: boolean;
  max_participants: number | null;
  requires_approval: boolean;
  buffer_time_minutes: number;
  cancellation_policy: string | null;
  preparation_notes: string | null;
  follow_up_notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export function useAgendas() {
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [agendasLoading, setAgendasLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAgendas();
  }, [fetchAgendas]);

  const fetchAgendas = async () => {
    try {
      setAgendasLoading(true);
      
      const { data, error } = await supabase
        .from('agendas')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar agendas:', error);
        throw error;
      }

      setAgendas(data as unknown as Agenda[] || []);
    } catch (error) {
      console.error('Erro ao buscar agendas:', error);
      toast({
        title: "Erro ao carregar agendas",
        description: "Não foi possível carregar a lista de agendas.",
        variant: "destructive",
      });
    } finally {
      setAgendasLoading(false);
    }
  };

  const createAgenda = async (agendaData: Omit<Agenda, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>) => {
    try {
      const { data, error } = await supabase
        .from('agendas')
        .insert([agendaData])
        .select();

      if (error) {
        console.error('Erro ao criar agenda:', error);
        throw error;
      }

      toast({
        title: "Agenda criada com sucesso",
        description: "A nova agenda foi adicionada.",
      });

      await fetchAgendas(); // Refetch para atualizar a lista
      return data[0];
    } catch (error) {
      console.error('Erro ao criar agenda:', error);
      toast({
        title: "Erro ao criar agenda",
        description: "Não foi possível criar a agenda.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateAgenda = async (id: string, agendaData: Partial<Omit<Agenda, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>>) => {
    try {
      const { data, error } = await supabase
        .from('agendas')
        .update({ ...agendaData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select();

      if (error) {
        console.error('Erro ao atualizar agenda:', error);
        throw error;
      }

      toast({
        title: "Agenda atualizada com sucesso",
        description: "As alterações foram salvas.",
      });

      await fetchAgendas(); // Refetch para atualizar a lista
      return data[0];
    } catch (error) {
      console.error('Erro ao atualizar agenda:', error);
      toast({
        title: "Erro ao atualizar agenda",
        description: "Não foi possível atualizar a agenda.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteAgenda = async (id: string) => {
    try {
      const { error } = await supabase
        .from('agendas')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar agenda:', error);
        throw error;
      }

      toast({
        title: "Agenda removida com sucesso",
        description: "A agenda foi desativada.",
      });

      await fetchAgendas(); // Refetch para atualizar a lista
    } catch (error) {
      console.error('Erro ao deletar agenda:', error);
      toast({
        title: "Erro ao deletar agenda",
        description: "Não foi possível remover a agenda.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    agendas,
    agendasLoading,
    refetchAgendas: fetchAgendas,
    createAgenda,
    updateAgenda,
    deleteAgenda
  };
}