import React from "react";
import { EventFormDialog } from "@/components/EventFormDialog";
import { DeleteEventDialog } from "@/components/DeleteEventDialog";
import { AppointmentsSection } from "@/components/schedule/AppointmentsSection";
import { CalendarEvent, EventFormData } from "@/hooks/useCalendarEvents";
import { Appointment, AppointmentFormData } from "@/types/calendar";

interface ScheduleDialogsProps {
  // Event dialog props
  isAddEventDialogOpen: boolean;
  setIsAddEventDialogOpen: (open: boolean) => void;
  isEditEventDialogOpen: boolean;
  setIsEditEventDialogOpen: (open: boolean) => void;
  isDeleteEventDialogOpen: boolean;
  setIsDeleteEventDialogOpen: (open: boolean) => void;
  selectedEvent: CalendarEvent | null;
  isSubmitting: boolean;
  onAddEvent: (formData: EventFormData) => void;
  onEditEvent: (formData: EventFormData) => void;
  onDeleteEvent: () => void;

  // Appointment dialog props
  appointments: Appointment[];
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  currentAppointment: Appointment | null;
  formData: AppointmentFormData;
  setFormData: (data: AppointmentFormData) => void;
  handleSubmit: (e: React.FormEvent) => void;
  confirmDelete: () => void;
}

export function ScheduleDialogs({
  // Event dialog props
  isAddEventDialogOpen,
  setIsAddEventDialogOpen,
  isEditEventDialogOpen,
  setIsEditEventDialogOpen,
  isDeleteEventDialogOpen,
  setIsDeleteEventDialogOpen,
  selectedEvent,
  isSubmitting,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,

  // Appointment dialog props
  appointments,
  isAddDialogOpen,
  setIsAddDialogOpen,
  isEditDialogOpen,
  setIsEditDialogOpen,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  currentAppointment,
  formData,
  setFormData,
  handleSubmit,
  confirmDelete,
}: ScheduleDialogsProps) {
  return (
    <>
      <EventFormDialog
        open={isAddEventDialogOpen}
        onOpenChange={setIsAddEventDialogOpen}
        onSubmit={onAddEvent}
        isSubmitting={isSubmitting}
        title="Novo Evento"
        description=""
        submitLabel="Criar"
      />

      <EventFormDialog
        open={isEditEventDialogOpen}
        onOpenChange={setIsEditEventDialogOpen}
        onSubmit={onEditEvent}
        isSubmitting={isSubmitting}
        event={selectedEvent || undefined}
        title="Editar Evento"
        description=""
        submitLabel="Salvar Alterações"
      />

      <DeleteEventDialog
        open={isDeleteEventDialogOpen}
        onOpenChange={setIsDeleteEventDialogOpen}
        onConfirmDelete={onDeleteEvent}
        event={selectedEvent}
        isDeleting={isSubmitting}
      />

      <AppointmentsSection
        appointments={appointments}
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        currentAppointment={currentAppointment}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        confirmDelete={confirmDelete}
      />
    </>
  );
}
