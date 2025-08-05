// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ServiceType {
  label: string;
  value: string;
}

export function useAgendaServiceTypes(agendaId?: string) {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!agendaId) {
      // Se não há agenda selecionada, usar tipos padrão
      setServiceTypes([
        { label: "Presencial", value: "presencial" },
        { label: "Online", value: "online" },
      ]);
      return;
    }

    const fetchServiceTypes = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('agendas')
          .select('*')
          .eq('id', agendaId)
          .single();

        if (error) {
          console.error('Erro ao buscar tipos de atendimento:', error);
          // Em caso de erro, usar tipos padrão
          setServiceTypes([
            { label: "Presencial", value: "presencial" },
            { label: "Online", value: "online" },
          ]);
          return;
        }

        // Since service_types column doesn't exist yet, use default types
        setServiceTypes([
          { label: "Presencial", value: "presencial" },
          { label: "Online", value: "online" },
        ]);
      } catch (error) {
        console.error('Erro ao buscar tipos de atendimento:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os tipos de atendimento.",
          variant: "destructive",
        });
        // Em caso de erro, usar tipos padrão
        setServiceTypes([
          { label: "Presencial", value: "presencial" },
          { label: "Online", value: "online" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceTypes();
  }, [agendaId, toast]);

  return { serviceTypes, loading };
}