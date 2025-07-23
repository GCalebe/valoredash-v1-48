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
      
      // Since 'agendas' table doesn't exist in Supabase types, create mock data for now
      // TODO: Add agendas table to Supabase schema
      const mockData: Agenda[] = [
        {
          id: '1',
          name: 'Consulta Geral',
          description: 'Consulta médica geral',
          duration_minutes: 60,
          price: 150,
          category: 'Saúde',
          is_active: true,
          max_participants: 1,
          requires_approval: false,
          buffer_time_minutes: 15,
          cancellation_policy: 'Cancelamento com 24h de antecedência',
          preparation_notes: 'Trazer documentos',
          follow_up_notes: 'Agendar retorno em 30 dias',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: null,
          updated_by: null
        },
        {
          id: '2',
          name: 'Consultoria Empresarial',
          description: 'Consultoria para empresas',
          duration_minutes: 90,
          price: 300,
          category: 'Negócios',
          is_active: true,
          max_participants: 5,
          requires_approval: true,
          buffer_time_minutes: 30,
          cancellation_policy: 'Cancelamento com 48h de antecedência',
          preparation_notes: 'Preparar apresentação da empresa',
          follow_up_notes: 'Enviar relatório em 7 dias',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: null,
          updated_by: null
        }
      ];

      setAgendas(mockData);
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