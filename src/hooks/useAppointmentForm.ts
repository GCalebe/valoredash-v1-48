import { useState } from "react";
import { Appointment, AppointmentFormData } from "@/types/calendar";
import { useCommercialBookings, CommercialBookingFormData } from "@/hooks/useCommercialBookings";

export function useAppointmentForm(appointments: Appointment[], setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>) {
  const { createBooking, updateBooking } = useCommercialBookings();
  
  const [formData, setFormData] = useState<AppointmentFormData>({
    petName: "",
    ownerName: "",
    phone: "",
    date: new Date(),
    service: "Manutenção de Casco",
    status: "scheduled",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent, isEditDialogOpen: boolean, currentAppointment: Appointment | null, setIsEditDialogOpen: (isOpen: boolean) => void, setIsAddDialogOpen: (isOpen: boolean) => void) => {
    e.preventDefault();
    
    // Converter dados do formulário para o formato do Supabase
    const bookingData: CommercialBookingFormData = {
      agenda_name: formData.service,
      client_name: formData.ownerName,
      client_phone: formData.phone,
      booking_date: formData.date,
      start_time: "09:00", // Valor padrão, pode ser customizado
      end_time: "10:00", // Valor padrão, pode ser customizado
      duration_minutes: 60,
      status: formData.status === "scheduled" ? "confirmed" : formData.status as any,
      notes: formData.notes,
      booking_type: "commercial",
    };

    if (isEditDialogOpen && currentAppointment) {
      // Atualizar no Supabase
      const success = await updateBooking(currentAppointment.id.toString(), bookingData);
      if (success) {
        // Atualizar estado local para compatibilidade
        setAppointments(
          appointments.map((app) =>
            app.id === currentAppointment.id
              ? {
                  ...formData,
                  id: app.id,
                }
              : app,
          ),
        );
        setIsEditDialogOpen(false);
      }
    } else {
      // Criar no Supabase
      const success = await createBooking(bookingData);
      if (success) {
        // Adicionar ao estado local para compatibilidade
        const newId = Math.max(0, ...appointments.map((a) => a.id)) + 1;
        setAppointments([
          ...appointments,
          {
            ...formData,
            id: newId,
          },
        ]);
        setIsAddDialogOpen(false);
      }
    }
    
    // Limpar formulário
    setFormData({
      petName: "",
      ownerName: "",
      phone: "",
      date: new Date(),
      service: "Manutenção de Casco",
      status: "scheduled",
      notes: "",
    });
  };

  return {
    formData,
    setFormData,
    handleSubmit,
  };
}
