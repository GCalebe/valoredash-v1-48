import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

// Schedule event interface - compatível com ScheduleCard
export interface ScheduleEvent {
  id: string;
  title: string;
  date?: string;
  time?: string;
  start_time?: string;
  end_time?: string;
  clientName?: string;
  client_name?: string;
  description?: string;
  status?: "scheduled" | "completed" | "cancelled" | "rescheduled";
  phone?: string;
  service?: string;
  notes?: string;
  host_name?: string;
}

// Hook para gerenciar dados da agenda usando Supabase
export function useScheduleData() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Buscar eventos da data selecionada
  const fetchEventsByDate = useCallback(async (date: string) => {
    setIsLoading(true);
    try {
      const startDateTime = `${date}T00:00:00.000Z`;
      const endDateTime = `${date}T23:59:59.999Z`;

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('start_time', startDateTime)
        .lte('start_time', endDateTime)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Erro ao buscar eventos:', error);
        setEvents([]);
        return [];
      }

      const mappedEvents = (data || []).map(event => ({
        id: event.id,
        title: event.title || event.summary || 'Evento',
        date: event.start_time?.split('T')[0], // Formato YYYY-MM-DD
        start_time: event.start_time,
        end_time: event.end_time,
        status: (event.status === 'scheduled' || event.status === 'completed' || 
                event.status === 'cancelled' || event.status === 'rescheduled') 
                ? event.status as "scheduled" | "completed" | "cancelled" | "rescheduled"
                : 'scheduled' as const,
        clientName: event.host_name || 'Cliente',
        client_name: event.host_name || 'Cliente',
        phone: '', // Pode ser adicionado se necessário
        service: event.event_type || 'Serviço',
        notes: event.description,
        description: event.description,
        host_name: event.host_name,
      }));

      setEvents(mappedEvents);
      return mappedEvents;
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      setEvents([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Buscar eventos em um range de datas
  const getEventsInRange = useCallback(async (startDate: string, endDate: string) => {
    try {
      const startDateTime = `${startDate}T00:00:00.000Z`;
      const endDateTime = `${endDate}T23:59:59.999Z`;

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('start_time', startDateTime)
        .lte('start_time', endDateTime)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Erro ao buscar eventos em range:', error);
        return [];
      }

      return (data || []).map(event => ({
        id: event.id,
        title: event.title || event.summary || 'Evento',
        date: event.start_time?.split('T')[0], // Formato YYYY-MM-DD
        start_time: event.start_time,
        end_time: event.end_time,
        status: (event.status === 'scheduled' || event.status === 'completed' || 
                event.status === 'cancelled' || event.status === 'rescheduled') 
                ? event.status as "scheduled" | "completed" | "cancelled" | "rescheduled"
                : 'scheduled' as const,
        clientName: event.host_name || 'Cliente',
        client_name: event.host_name || 'Cliente',
        phone: '',
        service: event.event_type || 'Serviço',
        notes: event.description,
        description: event.description,
        host_name: event.host_name,
      }));
    } catch (error) {
      console.error('Erro ao buscar eventos em range:', error);
      return [];
    }
  }, []);

  // Refetch com feedback visual
  const refetch = useCallback(async () => {
    setRefreshing(true);
    await fetchEventsByDate(selectedDate);
    setRefreshing(false);
  }, [selectedDate, fetchEventsByDate]);

  // Buscar eventos quando a data selecionada muda
  useEffect(() => {
    fetchEventsByDate(selectedDate);
  }, [selectedDate, fetchEventsByDate]);

  return {
    events,
    selectedDate,
    setSelectedDate,
    isLoading,
    loading: isLoading,
    refreshing,
    refetch,
    refetchScheduleData: refetch,
    getEventsByDate: fetchEventsByDate,
    getEventsInRange,
  };
}