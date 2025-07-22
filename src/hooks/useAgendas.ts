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
  }, []);

  const fetchAgendas = async () => {
    try {
      setAgendasLoading(true);
      
      const { data, error } = await supabase
        .from('agendas')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Erro ao buscar agendas:', error);
        toast({
          title: "Erro ao carregar agendas",
          description: "Não foi possível carregar a lista de agendas.",
          variant: "destructive",
        });
        return;
      }

      setAgendas(data || []);
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

  return {
    agendas,
    agendasLoading,
    refetchAgendas: fetchAgendas
  };
}