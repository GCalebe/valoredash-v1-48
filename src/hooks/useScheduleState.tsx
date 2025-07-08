import { useState } from "react";
import { addDays, addHours, addMinutes } from "date-fns";
import { Appointment, AppointmentFormData } from "@/types/calendar";
import { CalendarEvent } from "@/hooks/useCalendarEvents";

// Mock appointments data for marketing agency
const mockAppointments: Appointment[] = [
  {
    id: 1,
    petName: "Estratégia Digital Premium",
    ownerName: "João Silva",
    phone: "(11) 98765-4321",
    date: new Date(2023, 5, 15, 10, 30),
    service: "Consultoria de Marketing Digital",
    status: "confirmado",
    notes: "Reunião para definir estratégia de redes sociais",
  },
  {
    id: 2,
    petName: "Campanha Publicitária Luna",
    ownerName: "Maria Oliveira",
    phone: "(11) 91234-5678",
    date: new Date(2023, 5, 15, 14, 0),
    service: "Criação de Campanha",
    status: "pendente",
    notes: "Definir conceito criativo da campanha",
  },
  {
    id: 3,
    petName: "Website Corporativo Toby",
    ownerName: "Pedro Santos",
    phone: "(11) 99876-5432",
    date: new Date(2023, 5, 16, 9, 0),
    service: "Desenvolvimento Web",
    status: "confirmado",
    notes: "Revisão final do layout do site",
  },
  {
    id: 4,
    petName: "Branding Bella Marine",
    ownerName: "Ana Costa",
    phone: "(11) 98765-1234",
    date: addDays(new Date(), 1),
    service: "Criação de Identidade Visual",
    status: "confirmado",
    notes: "Apresentação das propostas de logo",
  },
  {
    id: 5,
    petName: "SEO Optimization Thor",
    ownerName: "Lucas Ferreira",
    phone: "(11) 97654-3210",
    date: addDays(new Date(), 1),
    service: "Otimização SEO",
    status: "pendente",
    notes: "Auditoria técnica do website",
  },
  {
    id: 6,
    petName: "Social Media Nina",
    ownerName: "Carla Souza",
    phone: "(11) 98888-7777",
    date: addHours(new Date(), 3),
    service: "Gestão de Redes Sociais",
    status: "confirmado",
    notes: "Planejamento de conteúdo mensal",
  },
  {
    id: 7,
    petName: "E-commerce Rex",
    ownerName: "Roberto Almeida",
    phone: "(11) 99999-8888",
    date: addMinutes(new Date(), 90),
    service: "Desenvolvimento E-commerce",
    status: "confirmado",
    notes: "Configuração da plataforma de vendas",
  },
];

export function useScheduleState() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [appointments, setAppointments] =
    useState<Appointment[]>(mockAppointments);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("day");

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
    service: "Consultoria de Marketing Digital",
    status: "pendente",
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
      service: "Consultoria de Marketing Digital",
      status: "pendente",
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
  };
}
