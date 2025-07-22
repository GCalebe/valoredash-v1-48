import { useState } from "react";
import { addDays, addHours, addMinutes, subDays } from "date-fns";
import { Appointment, AppointmentFormData } from "@/types/calendar";
import { CalendarEvent } from "@/hooks/useCalendarEvents";

// Appointments will be fetched from Supabase - mock data removed

export function useScheduleState() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(), // Set today as default selected date
  );
  const [appointments, setAppointments] =
    useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("day");
  
  // Agenda selection states
  const [selectedAgendaId, setSelectedAgendaId] = useState<string | null>(null);
  const [selectedAgendaName, setSelectedAgendaName] = useState<string | null>(null);
  const [showAgendaSelection, setShowAgendaSelection] = useState(false);
  
  // DateTime selection states
  const [showDateTimeSelection, setShowDateTimeSelection] = useState(false);
  const [selectedAppointmentDate, setSelectedAppointmentDate] = useState<Date | null>(null);
  const [selectedAppointmentTime, setSelectedAppointmentTime] = useState<string | null>(null);

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentAppointment, setCurrentAppointment] =
    useState<Appointment | null>(null);

  // Event dialog states
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [isEditEventDialogOpen, setIsEditEventDialogOpen] = useState(false);
  const [isDeleteEventDialogOpen, setIsDeleteEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );

  // Form data
  const [formData, setFormData] = useState<AppointmentFormData>({
    petName: "",
    ownerName: "",
    phone: "",
    date: new Date(),
    service: "Manutenção de Casco",
    status: "scheduled",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
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

  const handleEditClick = (appointment: Appointment) => {
    setCurrentAppointment(appointment);
    setFormData({
      petName: appointment.petName,
      ownerName: appointment.ownerName,
      phone: appointment.phone,
      date: appointment.date,
      service: appointment.service,
      status: appointment.status,
      notes: appointment.notes,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (appointment: Appointment) => {
    setCurrentAppointment(appointment);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (currentAppointment) {
      setAppointments(
        appointments.filter((app) => app.id !== currentAppointment.id),
      );
      setIsDeleteDialogOpen(false);
      setCurrentAppointment(null);
    }
  };

  // Agenda selection handlers
  const handleAgendaSelect = (agendaId: string, agendaName: string) => {
    setSelectedAgendaId(agendaId);
    setSelectedAgendaName(agendaName);
  };

  const handleProceedWithAgenda = () => {
    if (selectedAgendaId) {
      setShowAgendaSelection(false);
      setShowDateTimeSelection(true);
    }
  };

  const handleBackToAgendaSelection = () => {
    setShowAgendaSelection(true);
    setSelectedAgendaId(null);
    setSelectedAgendaName(null);
  };

  // DateTime selection handlers
  const handleBackToAgendaFromDateTime = () => {
    setShowDateTimeSelection(false);
    setShowAgendaSelection(true);
    setSelectedAppointmentDate(null);
    setSelectedAppointmentTime(null);
  };

  const handleTimeSelect = (date: Date, time: string) => {
    setSelectedAppointmentDate(date);
    setSelectedAppointmentTime(time);
    // Aqui você pode adicionar lógica para prosseguir para o próximo passo
    // Por exemplo, abrir um formulário de dados do cliente
    setShowDateTimeSelection(false);
    setIsAddEventDialogOpen(true);
  };

  return {
    // State
    selectedDate,
    setSelectedDate,
    appointments,
    searchTerm,
    setSearchTerm,
    selectedTab,
    setSelectedTab,

    // Dialog states
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    currentAppointment,

    // Event dialog states
    isAddEventDialogOpen,
    setIsAddEventDialogOpen,
    isEditEventDialogOpen,
    setIsEditEventDialogOpen,
    isDeleteEventDialogOpen,
    setIsDeleteEventDialogOpen,
    selectedEvent,
    setSelectedEvent,

    // Form data
    formData,
    setFormData,

    // Handlers
    handleSubmit,
    handleEditClick,
    handleDeleteClick,
    confirmDelete,

    // Agenda selection
    selectedAgendaId,
    selectedAgendaName,
    showAgendaSelection,
    setShowAgendaSelection,
    handleAgendaSelect,
    handleProceedWithAgenda,
    handleBackToAgendaSelection,
    
    // DateTime selection
    showDateTimeSelection,
    setShowDateTimeSelection,
    selectedAppointmentDate,
    selectedAppointmentTime,
    handleBackToAgendaFromDateTime,
    handleTimeSelect,
  };
}