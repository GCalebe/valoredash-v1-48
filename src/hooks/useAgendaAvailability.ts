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
  const agenda = agendas.find(a => a.id === agendaId) || null;

  // Fetch operating hours from Supabase
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
        title: "Erro ao buscar horários",
        description: "Não foi possível carregar os horários de funcionamento.",
      });
    }
  }, [agendaId, toast]);

  // Fetch available dates with exceptions from Supabase
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
        description: "Não foi possível carregar as exceções de data.",
      });
    }
  }, [agendaId, toast]);

  // Fetch existing bookings from Supabase
  const fetchBookings = useCallback(async (startDate: Date, endDate: Date) => {
    if (!agendaId) return;
    
    try {
      const { data, error } = await supabase
        .from('agenda_bookings')
        .select('*')
        .eq('agenda_name', agenda?.name || '')
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
  const getAvailableDatesForMonth = useCallback((year: number, month: number): Date[] => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    const availableDatesArray: Date[] = [];
    
    for (let date = new Date(startDate); date <= endDate; date = addDays(date, 1)) {
      // Don't include past dates
      if (isBefore(date, startOfDay(new Date()))) continue;
      
      if (isDateAvailable(date)) {
        availableDatesArray.push(new Date(date));
      }
    }
    
    return availableDatesArray;
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
    
    const operatingHoursForDate = getOperatingHoursForDate(date);
    if (!operatingHoursForDate) return [];
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayBookings = bookings.filter(booking => booking.booking_date === dateStr);
    
    // Check for date-specific capacity limits
    const dateException = availableDates.find(ad => ad.date === dateStr);
    const maxBookingsForDate = dateException?.max_bookings;
    
    const slots: TimeSlot[] = [];
    const startTime = parseISO(`${dateStr}T${operatingHoursForDate.start}:00`);
    const endTime = parseISO(`${dateStr}T${operatingHoursForDate.end}:00`);
    
    let currentTime = startTime;
    const duration = agenda.duration_minutes || 60;
    const bufferTime = agenda.buffer_time_minutes || 0;
    
    // Generate slots with correct duration and buffer calculation
    while (isBefore(addMinutes(currentTime, duration), endTime)) {
      const slotTime = format(currentTime, 'HH:mm');
      const slotEndTime = addMinutes(currentTime, duration);
      const slotEndWithBuffer = addMinutes(currentTime, duration + bufferTime);
      
      // Improved conflict detection considering buffer time
      const hasConflict = dayBookings.some(booking => {
        const bookingStart = parseISO(`${dateStr}T${booking.start_time}:00`);
        const bookingEnd = parseISO(`${dateStr}T${booking.end_time}:00`);
        
        // Check for overlaps including buffer time
        return !(
          // Slot ends (with buffer) before booking starts OR slot starts after booking ends
          isBefore(slotEndWithBuffer, bookingStart) || 
          isAfter(currentTime, bookingEnd)
        );
      });
      
      // Count participants for this exact time slot
      const exactSlotBookings = dayBookings.filter(booking => {
        return booking.start_time === slotTime;
      });
      
      const currentParticipants = exactSlotBookings.length;
      const maxParticipants = agenda.max_participants || 1;
      const isOverCapacity = currentParticipants >= maxParticipants;
      
      // Check total bookings for the day if there's a daily limit
      let isDayOverCapacity = false;
      if (maxBookingsForDate && maxBookingsForDate > 0) {
        isDayOverCapacity = dayBookings.length >= maxBookingsForDate;
      }
      
      // Determine availability and reason
      let available = true;
      let reason: string | undefined;
      
      if (hasConflict) {
        available = false;
        reason = 'Horário ocupado';
      } else if (isOverCapacity) {
        available = false;
        reason = `Capacidade máxima atingida (${currentParticipants}/${maxParticipants})`;
      } else if (isDayOverCapacity) {
        available = false;
        reason = 'Limite de agendamentos do dia atingido';
      }
      
      slots.push({
        time: slotTime,
        available,
        reason
      });
      
      // Advance to next slot (duration + buffer)
      currentTime = addMinutes(currentTime, duration + bufferTime);
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
  }, [agendaId, fetchOperatingHours, fetchAvailableDates]);

  return {
    agenda,
    operatingHours,
    availableDates,
    bookings,
    loading,
    isDateAvailable,
    getAvailableDatesForMonth,
    getOperatingHoursForDate,
    getAvailableTimeSlots,
    fetchBookings,
    refreshData: () => {
      fetchOperatingHours();
      fetchAvailableDates();
    }
  };
}