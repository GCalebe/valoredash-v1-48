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
    const fetchServiceTypes = async () => {
      setLoading(true);
      try {
        if (!agendaId) {
          // Use default service types when no agenda is selected
          setServiceTypes([
            { label: "Presencial", value: "presencial" },
            { label: "Online", value: "online" },
          ]);
          return;
        }

        const { data, error } = await supabase
          .from('agendas')
          .select('service_types')
          .eq('id', agendaId)
          .single();

        if (error) {
          console.error('Erro ao buscar tipos de atendimento:', error);
          // Fall back to default types on error
          setServiceTypes([
            { label: "Presencial", value: "presencial" },
            { label: "Online", value: "online" },
          ]);
          return;
        }

        // Use dynamic service types from agenda if available
        if (data?.service_types && Array.isArray(data.service_types)) {
          const dynamicTypes = data.service_types.map((type: string) => ({
            label: type,
            value: type.toLowerCase().replace(/\s+/g, '_')
          }));
          setServiceTypes(dynamicTypes);
        } else {
          // Fall back to default types if no service types configured
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
        // Fall back to default types on error
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