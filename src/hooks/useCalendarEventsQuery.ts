import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth } from 'date-fns';

// Interface para eventos do calendário
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day?: boolean;
  location?: string;
  event_type: 'meeting' | 'call' | 'task' | 'reminder' | 'other';
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  priority: 'low' | 'medium' | 'high';
  recurrence_rule?: string;
  contact_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
  // Campos calculados para compatibilidade com o componente
  date: Date;
  time: string;
  salesperson: string;
  color: string;
  contact_name?: string;
}

// Interface para filtros
export interface CalendarFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  event_type?: string;
  status?: string;
  contact_id?: string;
  priority?: string;
}

// Chaves de query
const calendarKeys = {
  all: ['calendar'] as const,
  events: () => [...calendarKeys.all, 'events'] as const,
  eventsByRange: (start: string, end: string) => [...calendarKeys.events(), 'range', start, end] as const,
  eventsByMonth: (month: string) => [...calendarKeys.events(), 'month', month] as const,
  event: (id: string) => [...calendarKeys.events(), id] as const,
};

// Cores para diferentes tipos de eventos
const eventTypeColors = {
  meeting: '#4f46e5',
  call: '#10b981',
  task: '#f59e0b',
  reminder: '#ef4444',
  other: '#8b5cf6'
};

// Cores para diferentes prioridades
const priorityColors = {
  low: '#6b7280',
  medium: '#3b82f6',
  high: '#ef4444'
};

// Função para transformar dados do Supabase para o formato do componente
const transformEventData = (event: Record<string, unknown>): CalendarEvent => {
  const startDate = new Date(event.start_time as string);
  const color = priorityColors[event.priority as keyof typeof priorityColors] || eventTypeColors[event.event_type as keyof typeof eventTypeColors] || '#6b7280';
  
  return {
    ...event,
    date: startDate,
    time: format(startDate, 'HH:mm'),
    salesperson: (event.contact_name as string) || 'Sistema',
    color: color
  } as CalendarEvent;
};

// Buscar eventos por período
const fetchEventsByDateRange = async (startDate: string, endDate: string): Promise<CalendarEvent[]> => {
  const { data, error } = await supabase
    .from('calendar_events')
    .select(`
      *,
      contacts!calendar_events_contact_id_fkey(name)
    `)
    .gte('start_time', startDate)
    .lte('start_time', endDate)
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching calendar events:', error);
    throw new Error(`Failed to fetch calendar events: ${error.message}`);
  }

  return (data || []).map(event => transformEventData({
    ...event,
    contact_name: event.contacts?.name
  }));
};

// Buscar eventos por mês
const fetchEventsByMonth = async (date: Date): Promise<CalendarEvent[]> => {
  const startDate = format(startOfMonth(date), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(date), 'yyyy-MM-dd');
  
  return fetchEventsByDateRange(startDate, endDate);
};

// Criar novo evento
const createCalendarEvent = async (eventData: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at' | 'date' | 'time' | 'salesperson' | 'color'>): Promise<CalendarEvent> => {
  // Get the current user from the auth session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const cleanEventData = {
    title: eventData.title,
    description: eventData.description,
    start_time: eventData.start_time,
    end_time: eventData.end_time,
    all_day: eventData.all_day,
    location: eventData.location,
    event_type: eventData.event_type,
    status: eventData.status,
    priority: eventData.priority,
    recurrence_rule: eventData.recurrence_rule,
    contact_id: eventData.contact_id,
    metadata: eventData.metadata as any,
    user_id: user.id
  };

  const { data, error } = await supabase
    .from('calendar_events')
    .insert([cleanEventData])
    .select(`
      *,
      contacts!calendar_events_contact_id_fkey(name)
    `)
    .single();

  if (error) {
    console.error('Error creating calendar event:', error);
    throw new Error(`Failed to create calendar event: ${error.message}`);
  }

  return transformEventData({
    ...data,
    contact_name: data.contacts?.name
  });
};

// Atualizar evento
const updateCalendarEvent = async ({ id, ...updates }: Partial<CalendarEvent> & { id: string }): Promise<CalendarEvent> => {
  const cleanUpdates = {
    ...updates,
    metadata: updates.metadata as any
  };
  
  const { data, error } = await supabase
    .from('calendar_events')
    .update(cleanUpdates)
    .eq('id', id)
    .select(`
      *,
      contacts!calendar_events_contact_id_fkey(name)
    `)
    .single();

  if (error) {
    console.error('Error updating calendar event:', error);
    throw new Error(`Failed to update calendar event: ${error.message}`);
  }

  return transformEventData({
    ...data,
    contact_name: data.contacts?.name
  });
};

// Deletar evento
const deleteCalendarEvent = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting calendar event:', error);
    throw new Error(`Failed to delete calendar event: ${error.message}`);
  }
};

// Hook para buscar eventos por mês
export const useCalendarEventsByMonth = (date: Date) => {
  const monthKey = format(date, 'yyyy-MM');
  
  return useQuery({
    queryKey: calendarKeys.eventsByMonth(monthKey),
    queryFn: () => fetchEventsByMonth(date),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook para buscar eventos por período
export const useCalendarEventsByRange = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: calendarKeys.eventsByRange(startDate, endDate),
    queryFn: () => fetchEventsByDateRange(startDate, endDate),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: !!startDate && !!endDate,
  });
};

// Hook para criar evento
export const useCreateCalendarEventMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCalendarEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
      toast({
        title: "Sucesso",
        description: "Evento criado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook para atualizar evento
export const useUpdateCalendarEventMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCalendarEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
      toast({
        title: "Sucesso",
        description: "Evento atualizado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook para deletar evento
export const useDeleteCalendarEventMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCalendarEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
      toast({
        title: "Sucesso",
        description: "Evento deletado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};