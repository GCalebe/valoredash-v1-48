// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, startOfDay, addMinutes, isAfter, isBefore, isSameDay, parseISO } from 'date-fns';
import { useAgendas, type Agenda } from './useAgendas';
import { supabase } from '@/integrations/supabase/client';

export interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}

export interface AgendaOperatingHours {
  id: string;
  agenda_id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface AgendaAvailableDate {
  id: string;
  agenda_id: string;
  date: string;
  is_available: boolean;
  start_time?: string;
  end_time?: string;
  max_bookings?: number;
  reason?: string;
}

export interface AgendaBooking {
  id: string;
  agenda_name: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
}

export function useAgendaAvailability(agendaId?: string) {
  const { agendas } = useAgendas();
  const [operatingHours, setOperatingHours] = useState<AgendaOperatingHours[]>([]);
  const [availableDates, setAvailableDates] = useState<AgendaAvailableDate[]>([]);
  const [bookings, setBookings] = useState<AgendaBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Get current agenda from the agendas list
  const agenda = agendas.find(a => a.id === agendaId);

  // Fetch operating hours for the agenda
  const fetchOperatingHours = useCallback(async () => {
    if (!agendaId) return;
    
    try {
      const { data, error } = await supabase
        .from('agenda_operating_hours')
        .select('*')
        .eq('agenda_id', agendaId)
        .eq('is_active', true)
        .order('day_of_week');

      if (error) throw error;
      setOperatingHours(data || []);
    } catch (error) {
      console.error('Error fetching operating hours:', error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar horários de funcionamento",
        description: "Não foi possível carregar os horários de funcionamento.",
      });
    }
  }, [agendaId, toast]);

  // Fetch available dates for the agenda
  const fetchAvailableDates = useCallback(async () => {
    if (!agendaId) return;
    
    try {
      const { data, error } = await supabase
        .from('agenda_available_dates')
        .select('*')
        .eq('agenda_id', agendaId)
        .order('date');

      if (error) throw error;
      setAvailableDates(data || []);
    } catch (error) {
      console.error('Error fetching available dates:', error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar datas disponíveis",
        description: "Não foi possível carregar as datas disponíveis.",
      });
    }
  }, [agendaId, toast]);

  // Fetch bookings for a date range
  const fetchBookings = useCallback(async (startDate: Date, endDate: Date) => {
    if (!agendaId || !agenda?.name) return;
    
    try {
      const { data, error } = await supabase
        .from('agenda_bookings')
        .select('*')
        .eq('agenda_name', agenda.name)
        .gte('booking_date', format(startDate, 'yyyy-MM-dd'))
        .lte('booking_date', format(endDate, 'yyyy-MM-dd'))
        .neq('status', 'cancelled')
        .order('booking_date, start_time');

      if (error) throw error;

      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar agendamentos",
        description: "Não foi possível carregar os agendamentos existentes.",
      });
    }
  }, [agendaId, agenda?.name, toast]);

  // Check if a date is available based on operating hours and exceptions
  const isDateAvailable = useCallback((date: Date): boolean => {
    const dayOfWeek = date.getDay();
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Check for specific date exceptions first
    const dateException = availableDates.find(ad => ad.date === dateStr);
    if (dateException) {
      return dateException.is_available;
    }
    
    // Check regular operating hours
    const operatingHour = operatingHours.find(oh => oh.day_of_week === dayOfWeek);
    return !!operatingHour;
  }, [operatingHours, availableDates]);

  // Get available dates for a month
  const getAvailableDatesForMonth = useCallback((date: Date): Date[] => {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const dates: Date[] = [];
    
    for (let d = new Date(startOfMonth); d <= endOfMonth; d = addDays(d, 1)) {
      if (isDateAvailable(d)) {
        dates.push(new Date(d));
      }
    }
    
    return dates;
  }, [isDateAvailable]);

  // Get operating hours for a specific date
  const getOperatingHoursForDate = useCallback((date: Date): { start: string; end: string } | null => {
    const dayOfWeek = date.getDay();
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Check for specific date exceptions first
    const dateException = availableDates.find(ad => ad.date === dateStr);
    if (dateException) {
      if (!dateException.is_available) return null;
      if (dateException.start_time && dateException.end_time) {
        return {
          start: dateException.start_time,
          end: dateException.end_time
        };
      }
    }
    
    // Use regular operating hours
    const operatingHour = operatingHours.find(oh => oh.day_of_week === dayOfWeek);
    if (!operatingHour) return null;
    
    return {
      start: operatingHour.start_time,
      end: operatingHour.end_time
    };
  }, [operatingHours, availableDates]);

  // Get available time slots for a specific date
  const getAvailableTimeSlots = useCallback((date: Date): TimeSlot[] => {
    if (!agenda) return [];
    
    const operatingHours = getOperatingHoursForDate(date);
    if (!operatingHours) return [];
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayBookings = bookings.filter(booking => booking.booking_date === dateStr);
    
    const slots: TimeSlot[] = [];
    const duration = agenda.duration_minutes || 60;
    const bufferTime = agenda.buffer_time_minutes || 0;
    
    // Parse start and end times
    const [startHour, startMinute] = operatingHours.start.split(':').map(Number);
    const [endHour, endMinute] = operatingHours.end.split(':').map(Number);
    
    const startTime = new Date(date);
    startTime.setHours(startHour, startMinute, 0, 0);
    
    const endTime = new Date(date);
    endTime.setHours(endHour, endMinute, 0, 0);
    
    let currentTime = new Date(startTime);
    
    while (currentTime.getTime() + (duration * 60000) <= endTime.getTime()) {
      const timeStr = format(currentTime, 'HH:mm');
      
      // Check for conflicts with existing bookings
      const hasConflict = dayBookings.some(booking => {
        const [bookingStartHour, bookingStartMinute] = booking.start_time.split(':').map(Number);
        const [bookingEndHour, bookingEndMinute] = booking.end_time.split(':').map(Number);
        
        const bookingStart = new Date(date);
        bookingStart.setHours(bookingStartHour, bookingStartMinute, 0, 0);
        
        const bookingEnd = new Date(date);
        bookingEnd.setHours(bookingEndHour, bookingEndMinute, 0, 0);
        
        const slotEnd = new Date(currentTime.getTime() + (duration * 60000));
        
        // Check if slot overlaps with booking
        return currentTime < bookingEnd && slotEnd > bookingStart;
      });
      
      // Count existing bookings for this time slot
      const slotBookings = dayBookings.filter(booking => booking.start_time === timeStr);
      const maxParticipants = agenda.max_participants || 1;
      const isOverCapacity = slotBookings.length >= maxParticipants;
      
      let available = true;
      let reason: string | undefined;
      
      if (hasConflict) {
        available = false;
        reason = 'Horário ocupado';
      } else if (isOverCapacity) {
        available = false;
        reason = `Capacidade máxima atingida (${slotBookings.length}/${maxParticipants})`;
      }
      
      slots.push({
        time: timeStr,
        available,
        reason
      });
      
      // Move to next slot
      currentTime = new Date(currentTime.getTime() + ((duration + bufferTime) * 60000));
    }
    
    return slots;
  }, [agenda, getOperatingHoursForDate, bookings, availableDates]);

  // Load all data when agendaId changes
  useEffect(() => {
    if (agendaId) {
      setLoading(true);
      Promise.all([
        fetchOperatingHours(),
        fetchAvailableDates()
      ]).finally(() => {
        setLoading(false);
      });
    } else {
      // Clear data when no agenda is selected
      setOperatingHours([]);
      setAvailableDates([]);
      setBookings([]);
    }
  }, [agendaId]); // fetchOperatingHours e fetchAvailableDates removidas das dependências para evitar re-execuções desnecessárias

  return {
    agenda,
    operatingHours,
    availableDates,
    bookings,
    loading,
    fetchBookings,
    isDateAvailable,
    getAvailableDatesForMonth,
    getOperatingHoursForDate,
    getAvailableTimeSlots,
  };
}