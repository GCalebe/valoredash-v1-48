import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Types for schedule
export interface ScheduleEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  event_type: 'meeting' | 'call' | 'task' | 'reminder' | 'other';
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  client_id?: string;
  contact_id?: string;
  location?: string;
  meeting_link?: string;
  attendees?: string[];
  reminders?: {
    time: number; // minutes before event
    type: 'email' | 'notification';
  }[];
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface ScheduleFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  event_type?: string;
  status?: string;
  client_id?: string;
  contact_id?: string;
}

export interface ScheduleMetrics {
  total_events: number;
  completed_events: number;
  cancelled_events: number;
  upcoming_events: number;
  completion_rate: number;
  events_by_type: Record<string, number>;
  events_by_status: Record<string, number>;
}

// Query keys
export const scheduleKeys = {
  all: ['schedule'] as const,
  lists: () => [...scheduleKeys.all, 'list'] as const,
  list: (filters: ScheduleFilters) => [...scheduleKeys.lists(), { filters }] as const,
  byDateRange: (start: string, end: string) => [...scheduleKeys.all, 'dateRange', { start, end }] as const,
  byClient: (clientId: string) => [...scheduleKeys.all, 'client', clientId] as const,
  byContact: (contactId: string) => [...scheduleKeys.all, 'contact', contactId] as const,
  upcoming: () => [...scheduleKeys.all, 'upcoming'] as const,
  metrics: () => [...scheduleKeys.all, 'metrics'] as const,
  metricsFiltered: (filters: ScheduleFilters) => [...scheduleKeys.metrics(), { filters }] as const,
  details: () => [...scheduleKeys.all, 'detail'] as const,
  detail: (id: string) => [...scheduleKeys.details(), id] as const,
};

// Fetch schedule events
const fetchScheduleEvents = async (filters: ScheduleFilters = {}): Promise<ScheduleEvent[]> => {
  let query = supabase
    .from('schedule_events')
    .select('*')
    .order('start_time', { ascending: true });

  // Apply filters
  if (filters.dateRange) {
    query = query
      .gte('start_time', filters.dateRange.start)
      .lte('start_time', filters.dateRange.end);
  }

  if (filters.event_type) {
    query = query.eq('event_type', filters.event_type);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.client_id) {
    query = query.eq('client_id', filters.client_id);
  }

  if (filters.contact_id) {
    query = query.eq('contact_id', filters.contact_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching schedule events:', error);
    throw new Error(`Failed to fetch schedule events: ${error.message}`);
  }

  return data || [];
};

// Fetch upcoming events
const fetchUpcomingEvents = async (): Promise<ScheduleEvent[]> => {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('schedule_events')
    .select('*')
    .gte('start_time', now)
    .eq('status', 'scheduled')
    .order('start_time', { ascending: true })
    .limit(10);

  if (error) {
    console.error('Error fetching upcoming events:', error);
    throw new Error(`Failed to fetch upcoming events: ${error.message}`);
  }

  return data || [];
};

// Fetch events by date range
const fetchEventsByDateRange = async (startDate: string, endDate: string): Promise<ScheduleEvent[]> => {
  const { data, error } = await supabase
    .from('schedule_events')
    .select('*')
    .gte('start_time', startDate)
    .lte('start_time', endDate)
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching events by date range:', error);
    throw new Error(`Failed to fetch events by date range: ${error.message}`);
  }

  return data || [];
};

// Calculate schedule metrics
const calculateScheduleMetrics = async (filters: ScheduleFilters = {}): Promise<ScheduleMetrics> => {
  const events = await fetchScheduleEvents(filters);
  
  const total_events = events.length;
  const completed_events = events.filter(e => e.status === 'completed').length;
  const cancelled_events = events.filter(e => e.status === 'cancelled').length;
  const upcoming_events = events.filter(e => e.status === 'scheduled' && new Date(e.start_time) > new Date()).length;
  const completion_rate = total_events > 0 ? (completed_events / total_events) * 100 : 0;

  const events_by_type = events.reduce((acc, event) => {
    acc[event.event_type] = (acc[event.event_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const events_by_status = events.reduce((acc, event) => {
    acc[event.status] = (acc[event.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total_events,
    completed_events,
    cancelled_events,
    upcoming_events,
    completion_rate,
    events_by_type,
    events_by_status,
  };
};

// Create schedule event
const createScheduleEvent = async (event: Omit<ScheduleEvent, 'id' | 'created_at' | 'updated_at'>): Promise<ScheduleEvent> => {
  const { data, error } = await supabase
    .from('schedule_events')
    .insert([event])
    .select()
    .single();

  if (error) {
    console.error('Error creating schedule event:', error);
    throw new Error(`Failed to create schedule event: ${error.message}`);
  }

  return data;
};

// Update schedule event
const updateScheduleEvent = async ({ id, ...updates }: Partial<ScheduleEvent> & { id: string }): Promise<ScheduleEvent> => {
  const { data, error } = await supabase
    .from('schedule_events')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating schedule event:', error);
    throw new Error(`Failed to update schedule event: ${error.message}`);
  }

  return data;
};

// Delete schedule event
const deleteScheduleEvent = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('schedule_events')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting schedule event:', error);
    throw new Error(`Failed to delete schedule event: ${error.message}`);
  }
};

// Hook for fetching schedule events
export const useScheduleQuery = (filters: ScheduleFilters = {}) => {
  return useQuery({
    queryKey: scheduleKeys.list(filters),
    queryFn: () => fetchScheduleEvents(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for fetching upcoming events
export const useUpcomingEventsQuery = () => {
  return useQuery({
    queryKey: scheduleKeys.upcoming(),
    queryFn: fetchUpcomingEvents,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// Hook for fetching events by date range
export const useEventsByDateRangeQuery = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: scheduleKeys.byDateRange(startDate, endDate),
    queryFn: () => fetchEventsByDateRange(startDate, endDate),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: !!startDate && !!endDate,
  });
};

// Hook for calculating schedule metrics
export const useScheduleMetricsQuery = (filters: ScheduleFilters = {}) => {
  return useQuery({
    queryKey: scheduleKeys.metricsFiltered(filters),
    queryFn: () => calculateScheduleMetrics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for creating schedule event
export const useCreateScheduleEventMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createScheduleEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      toast({
        title: "Success",
        description: "Event scheduled successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for updating schedule event
export const useUpdateScheduleEventMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateScheduleEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for deleting schedule event
export const useDeleteScheduleEventMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteScheduleEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Utility functions for manual cache management
export const scheduleUtils = {
  invalidateAll: (queryClient: ReturnType<typeof useQueryClient>) => {
    queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
  },
  prefetchSchedule: (queryClient: ReturnType<typeof useQueryClient>, filters: ScheduleFilters = {}) => {
    queryClient.prefetchQuery({
      queryKey: scheduleKeys.list(filters),
      queryFn: () => fetchScheduleEvents(filters),
      staleTime: 2 * 60 * 1000,
    });
  },
  prefetchUpcoming: (queryClient: ReturnType<typeof useQueryClient>) => {
    queryClient.prefetchQuery({
      queryKey: scheduleKeys.upcoming(),
      queryFn: fetchUpcomingEvents,
      staleTime: 1 * 60 * 1000,
    });
  },
};