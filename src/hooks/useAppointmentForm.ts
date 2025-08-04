import { useState } from "react";
import { Appointment, AppointmentFormData } from "@/types/calendar";

export function useAppointmentForm(appointments: Appointment[], setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>) {
  const [formData, setFormData] = useState<AppointmentFormData>({
    petName: "",
    ownerName: "",
    phone: "",
    date: new Date(),
    service: "Manutenção de Casco",
    status: "scheduled",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent, isEditDialogOpen: boolean, currentAppointment: Appointment | null, setIsEditDialogOpen: (isOpen: boolean) => void, setIsAddDialogOpen: (isOpen: boolean) => void) => {
    e.preventDefault();
    if (isEditDialogOpen && currentAppointment) {
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
    } else {
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
