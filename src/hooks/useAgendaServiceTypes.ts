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
          .select('service_types')
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

        if (data?.service_types && Array.isArray(data.service_types)) {
          // Converter os tipos da agenda para o formato esperado
          const types = data.service_types.map((type: string) => ({
            label: type,
            value: type.toLowerCase()
          }));
          setServiceTypes(types);
        } else {
          // Se não há tipos definidos, usar padrão
          setServiceTypes([
            { label: "Presencial", value: "presencial" },
            { label: "Online", value: "online" },
          ]);
        }
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