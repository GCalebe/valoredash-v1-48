import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import type { Database } from '../integrations/supabase/types';
import { ScheduleEvent } from './useScheduleData';

type ScheduleRow = Database['public']['Tables']['schedule_events']['Row'];
type ScheduleInsert = Database['public']['Tables']['schedule_events']['Insert'];
type ScheduleUpdate = Database['public']['Tables']['schedule_events']['Update'];

export function useSupabaseSchedule() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Transform Supabase data to ScheduleEvent format
  const transformScheduleData = (data: ScheduleRow[]): ScheduleEvent[] => {
    return data.map(item => ({
      id: item.id,
      title: item.title || '',
      date: new Date(item.event_date),
      time: item.event_time || '',
      clientName: item.client_name || '',
      phone: item.phone || '',
      service: item.service || '',
      status: item.status || 'pending',
      notes: item.notes || undefined
    }));
  };

  // Fetch all schedule events
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('schedule_events')
        .select('*')
        .order('event_date', { ascending: true });
      
      if (error) throw error;
      
      const transformedEvents = transformScheduleData(data || []);
      setEvents(transformedEvents);
      
      return transformedEvents;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching schedule events:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch events by date range
  const fetchEventsByDateRange = useCallback(async (startDate: string, endDate: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('schedule_events')
        .select('*')
        .gte('event_date', startDate)
        .lte('event_date', endDate)
        .order('event_date', { ascending: true });
      
      if (error) throw error;
      
      const transformedEvents = transformScheduleData(data || []);
      setEvents(transformedEvents);
      
      return transformedEvents;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching schedule events by date range:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch events by status
  const fetchEventsByStatus = useCallback(async (status: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('schedule_events')
        .select('*')
        .eq('status', status)
        .order('event_date', { ascending: true });
      
      if (error) throw error;
      
      const transformedEvents = transformScheduleData(data || []);
      setEvents(transformedEvents);
      
      return transformedEvents;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching schedule events by status:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new schedule event
  const createEvent = useCallback(async (eventData: Omit<ScheduleEvent, 'id'>) => {
    try {
      setError(null);
      
      const insertData: ScheduleInsert = {
        title: eventData.title,
        event_date: eventData.date.toISOString().split('T')[0],
        event_time: eventData.time,
        client_name: eventData.clientName,
        phone: eventData.phone,
        service: eventData.service,
        status: eventData.status,
        notes: eventData.notes || null
      };
      
      const { data, error } = await supabase
        .from('schedule_events')
        .insert(insertData)
        .select()
        .single();
      
      if (error) throw error;
      
      const newEvent = transformScheduleData([data])[0];
      setEvents(prev => [...prev, newEvent]);
      
      return newEvent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error creating schedule event:', err);
      throw err;
    }
  }, []);

  // Update schedule event
  const updateEvent = useCallback(async (id: number, eventData: Partial<ScheduleEvent>) => {
    try {
      setError(null);
      
      const updateData: ScheduleUpdate = {};
      
      if (eventData.title !== undefined) updateData.title = eventData.title;
      if (eventData.date !== undefined) updateData.event_date = eventData.date.toISOString().split('T')[0];
      if (eventData.time !== undefined) updateData.event_time = eventData.time;
      if (eventData.clientName !== undefined) updateData.client_name = eventData.clientName;
      if (eventData.phone !== undefined) updateData.phone = eventData.phone;
      if (eventData.service !== undefined) updateData.service = eventData.service;
      if (eventData.status !== undefined) updateData.status = eventData.status;
      if (eventData.notes !== undefined) updateData.notes = eventData.notes || null;
      
      const { data, error } = await supabase
        .from('schedule_events')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      const updatedEvent = transformScheduleData([data])[0];
      setEvents(prev => prev.map(event => event.id === id ? updatedEvent : event));
      
      return updatedEvent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error updating schedule event:', err);
      throw err;
    }
  }, []);

  // Delete schedule event
  const deleteEvent = useCallback(async (id: number) => {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('schedule_events')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setEvents(prev => prev.filter(event => event.id !== id));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error deleting schedule event:', err);
      throw err;
    }
  }, []);

  // Get events for today
  const getTodayEvents = useCallback(() => {
    const today = new Date().toDateString();
    return events.filter(event => event.date.toDateString() === today);
  }, [events]);

  // Get events for this week
  const getWeekEvents = useCallback(() => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= startOfWeek && eventDate <= endOfWeek;
    });
  }, [events]);

  // Get events for this month
  const getMonthEvents = useCallback(() => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= startOfMonth && eventDate <= endOfMonth;
    });
  }, [events]);

  // Load events on mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    fetchEvents,
    fetchEventsByDateRange,
    fetchEventsByStatus,
    createEvent,
    updateEvent,
    deleteEvent,
    getTodayEvents,
    getWeekEvents,
    getMonthEvents
  };
}