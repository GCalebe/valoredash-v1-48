import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, startOfDay, addMinutes, isAfter, isBefore, isSameDay, parseISO } from 'date-fns';
import { useAgendas, type Agenda } from './useAgendas';

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

  // Mock operating hours - TODO: Replace with actual Supabase queries when tables are ready
  const fetchOperatingHours = useCallback(async () => {
    if (!agendaId) return;
    
    setLoading(true);
    try {
      // Mock data - Default business hours for all weekdays
      const mockOperatingHours: AgendaOperatingHours[] = [
        { id: '1', agenda_id: agendaId, day_of_week: 1, start_time: '09:00', end_time: '18:00', is_active: true },
        { id: '2', agenda_id: agendaId, day_of_week: 2, start_time: '09:00', end_time: '18:00', is_active: true },
        { id: '3', agenda_id: agendaId, day_of_week: 3, start_time: '09:00', end_time: '18:00', is_active: true },
        { id: '4', agenda_id: agendaId, day_of_week: 4, start_time: '09:00', end_time: '18:00', is_active: true },
        { id: '5', agenda_id: agendaId, day_of_week: 5, start_time: '09:00', end_time: '18:00', is_active: true },
      ];
      setOperatingHours(mockOperatingHours);
    } catch (error) {
      console.error('Error fetching operating hours:', error);
    } finally {
      setLoading(false);
    }
  }, [agendaId]);

  // Mock available dates - TODO: Replace with actual Supabase queries
  const fetchAvailableDates = useCallback(async () => {
    if (!agendaId) return;
    
    try {
      // Mock data - No special date exceptions for now
      setAvailableDates([]);
    } catch (error) {
      console.error('Error fetching available dates:', error);
    }
  }, [agendaId]);

  // Mock existing bookings - TODO: Replace with actual Supabase queries
  const fetchBookings = useCallback(async (startDate: Date, endDate: Date) => {
    if (!agendaId || !agenda) return;
    
    try {
      // Mock data - Some sample bookings
      const mockBookings: AgendaBooking[] = [
        {
          id: '1',
          agenda_name: agenda.name,
          booking_date: format(new Date(), 'yyyy-MM-dd'),
          start_time: '10:00',
          end_time: '11:00',
          status: 'confirmed'
        },
        {
          id: '2',
          agenda_name: agenda.name,
          booking_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
          start_time: '14:00',
          end_time: '15:00',
          status: 'confirmed'
        }
      ];
      
      setBookings(mockBookings.filter(booking => 
        booking.booking_date >= format(startDate, 'yyyy-MM-dd') &&
        booking.booking_date <= format(endDate, 'yyyy-MM-dd')
      ));
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  }, [agendaId, agenda]);

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
    
    const slots: TimeSlot[] = [];
    const startTime = parseISO(`${dateStr}T${operatingHoursForDate.start}:00`);
    const endTime = parseISO(`${dateStr}T${operatingHoursForDate.end}:00`);
    
    let currentTime = startTime;
    const slotDuration = agenda.duration_minutes + agenda.buffer_time_minutes;
    
    while (isBefore(addMinutes(currentTime, agenda.duration_minutes), endTime)) {
      const slotTime = format(currentTime, 'HH:mm');
      const slotEndTime = addMinutes(currentTime, agenda.duration_minutes);
      
      // Check if this slot conflicts with existing bookings
      const hasConflict = dayBookings.some(booking => {
        const bookingStart = parseISO(`${dateStr}T${booking.start_time}:00`);
        const bookingEnd = parseISO(`${dateStr}T${booking.end_time}:00`);
        
        return (
          (isAfter(currentTime, bookingStart) && isBefore(currentTime, bookingEnd)) ||
          (isAfter(slotEndTime, bookingStart) && isBefore(slotEndTime, bookingEnd)) ||
          (isBefore(currentTime, bookingStart) && isAfter(slotEndTime, bookingEnd))
        );
      });
      
      // Check if we've reached max participants for this time slot
      const slotBookingsCount = dayBookings.filter(booking => {
        const bookingStart = parseISO(`${dateStr}T${booking.start_time}:00`);
        return isSameDay(bookingStart, currentTime) && format(bookingStart, 'HH:mm') === slotTime;
      }).length;
      
      const isOverCapacity = slotBookingsCount >= (agenda.max_participants || 1);
      
      slots.push({
        time: slotTime,
        available: !hasConflict && !isOverCapacity,
        reason: hasConflict ? 'Horário ocupado' : isOverCapacity ? 'Capacidade máxima atingida' : undefined
      });
      
      currentTime = addMinutes(currentTime, slotDuration);
    }
    
    return slots;
  }, [agenda, getOperatingHoursForDate, bookings]);

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