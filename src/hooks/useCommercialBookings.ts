import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface CommercialBooking {
  id: string;
  agenda_name: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  employee_name?: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  booking_type?: string;
  notes?: string;
  internal_notes?: string;
  price?: number;
  payment_status?: 'pending' | 'paid' | 'cancelled';
  payment_method?: string;
  confirmation_code?: string;
  reminder_sent?: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  cancelled_at?: string;
  cancelled_by?: string;
  cancellation_reason?: string;
}

export interface CommercialBookingFormData {
  agenda_name: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  employee_name?: string;
  booking_date: Date;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  booking_type?: string;
  notes?: string;
  internal_notes?: string;
  price?: number;
  payment_status?: 'pending' | 'paid' | 'cancelled';
  payment_method?: string;
}

export function useCommercialBookings() {
  const [bookings, setBookings] = useState<CommercialBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('agenda_bookings')
        .select('*')
        .order('booking_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setBookings(data || []);
    } catch (err) {
      console.error('Erro ao buscar agendamentos:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      toast({
        title: "Erro",
        description: "Não foi possível carregar os agendamentos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (bookingData: CommercialBookingFormData): Promise<boolean> => {
    try {
      const { error: insertError } = await supabase
        .from('agenda_bookings')
        .insert({
          ...bookingData,
          booking_date: bookingData.booking_date.toISOString().split('T')[0],
          created_by: user?.id || null,
        });

      if (insertError) {
        throw insertError;
      }

      toast({
        title: "Sucesso",
        description: "Agendamento criado com sucesso!",
      });

      await fetchBookings();
      return true;
    } catch (err) {
      console.error('Erro ao criar agendamento:', err);
      toast({
        title: "Erro",
        description: "Não foi possível criar o agendamento.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateBooking = async (id: string, bookingData: Partial<CommercialBookingFormData>): Promise<boolean> => {
    try {
      const updateData: any = { ...bookingData };
      
      if (bookingData.booking_date) {
        updateData.booking_date = bookingData.booking_date.toISOString().split('T')[0];
      }
      
      updateData.updated_at = new Date().toISOString();

      const { error: updateError } = await supabase
        .from('agenda_bookings')
        .update(updateData)
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Sucesso",
        description: "Agendamento atualizado com sucesso!",
      });

      await fetchBookings();
      return true;
    } catch (err) {
      console.error('Erro ao atualizar agendamento:', err);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o agendamento.",
        variant: "destructive",
      });
      return false;
    }
  };

  const cancelBooking = async (id: string, reason?: string): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('agenda_bookings')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancelled_by: user?.id || null,
          cancellation_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Sucesso",
        description: "Agendamento cancelado com sucesso!",
      });

      await fetchBookings();
      return true;
    } catch (err) {
      console.error('Erro ao cancelar agendamento:', err);
      toast({
        title: "Erro",
        description: "Não foi possível cancelar o agendamento.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteBooking = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('agenda_bookings')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      toast({
        title: "Sucesso",
        description: "Agendamento excluído com sucesso!",
      });

      await fetchBookings();
      return true;
    } catch (err) {
      console.error('Erro ao excluir agendamento:', err);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o agendamento.",
        variant: "destructive",
      });
      return false;
    }
  };

  const getBookingsByDate = (date: Date): CommercialBooking[] => {
    const dateString = date.toISOString().split('T')[0];
    return bookings.filter(booking => booking.booking_date === dateString);
  };

  const getBookingsByStatus = (status: string): CommercialBooking[] => {
    if (status === 'all') return bookings;
    return bookings.filter(booking => booking.status === status);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    createBooking,
    updateBooking,
    cancelBooking,
    deleteBooking,
    getBookingsByDate,
    getBookingsByStatus,
  };
}