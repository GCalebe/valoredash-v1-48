import { useState, useEffect } from 'react';
import { format, parse, parseISO } from 'date-fns';
import { Contact } from '@/types/client';
import { EventFormData, CalendarEvent } from '@/hooks/useCalendarEvents';
import { useContactsData } from '@/hooks/useContactsData';

// Constants moved outside the hook to reduce complexity
const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#14b8a6",
  "#0ea5e9",
  "#6366f1",
  "#8b5cf6",
  "#d946ef",
  "#ec4899",
  "#78716c",
];

const SERVICES = [
  "Manutenção de Casco",
  "Revisão de Motor",
  "Inspeção de Segurança",
  "Vistoria Completa",
  "Limpeza e Enceramento",
  "Manutenção Preventiva",
  "Vistoria de Segurança",
  "Consultoria Náutica",
  "Avaliação de Embarcação",
  "Instalação de Equipamentos",
  "Reparo Elétrico",
  "Reparo Hidráulico"
];

const COLLABORATORS = [
  "João Silva",
  "Maria Oliveira",
  "Pedro Santos",
  "Ana Costa",
];

const DURATIONS = [
  { label: "30 minutos", value: 30 },
  { label: "1 hora", value: 60 },
  { label: "1 hora e 30 minutos", value: 90 },
  { label: "2 horas", value: 120 },
  { label: "3 horas", value: 180 },
  { label: "4 horas", value: 240 },
];

const ATTENDANCE_TYPES = [
  { label: "Presencial", value: "presencial" },
  { label: "Online", value: "online" },
];

interface Tag {
  id: string;
  text: string;
  color: string;
}

interface NewClientData {
  name: string;
  email: string;
  phone: string;
}

interface EventFormState {
  activeTab: string;
  summary: string;
  automation: string;
  collaborator: string;
  eventDescription: string;
  email: string;
  startDateTime: string;
  endDateTime: string;
  selectedColor: string;
  selectedService: string;
  selectedDuration: number;
  attendanceType: string;
  location: string;
  meetingLink: string;
  searchTerm: string;
  selectedClient: Contact | null;
  isNewClient: boolean;
  newClientData: NewClientData;
  isBlockingDate: boolean;
  blockReason: string;
  tags: Tag[];
  newTag: string;
  newTagColor: string;
  initialStatus: "confirmado" | "pendente";
  isDeleteDialogOpen: boolean;
  errors: Record<string, string>;
}

interface UseEventFormDialogProps {
  event?: CalendarEvent;
  open: boolean;
}

export const useEventFormDialog = ({ event, open }: UseEventFormDialogProps) => {
  const { contacts } = useContactsData();
  
  // Initialize state with default values
  const [state, setState] = useState<EventFormState>({
    activeTab: "client",
    summary: "",
    automation: "",
    collaborator: "",
    eventDescription: "",
    email: "",
    startDateTime: "",
    endDateTime: "",
    selectedColor: COLORS[0],
    selectedService: SERVICES[0],
    selectedDuration: 60,
    attendanceType: "presencial",
    location: "",
    meetingLink: "",
    searchTerm: "",
    selectedClient: null,
    isNewClient: false,
    newClientData: {
      name: "",
      email: "",
      phone: "",
    },
    isBlockingDate: false,
    blockReason: "",
    tags: [],
    newTag: "",
    newTagColor: "#3b82f6",
    initialStatus: "confirmado",
    isDeleteDialogOpen: false,
    errors: {},
  });

  // Helper function to update state
  const updateState = (updates: Partial<EventFormState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Filter contacts based on search term
  const filteredContacts = contacts.filter(
    contact => 
      contact.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      (contact.email && contact.email.toLowerCase().includes(state.searchTerm.toLowerCase())) ||
      (contact.phone && contact.phone.includes(state.searchTerm))
  );

  // Reset form to initial state
  const resetForm = () => {
    setState({
      activeTab: "client",
      summary: "",
      automation: "",
      collaborator: "",
      eventDescription: "",
      email: "",
      startDateTime: "",
      endDateTime: "",
      selectedColor: COLORS[0],
      selectedService: SERVICES[0],
      selectedDuration: 60,
      attendanceType: "presencial",
      location: "",
      meetingLink: "",
      searchTerm: "",
      selectedClient: null,
      isNewClient: false,
      newClientData: {
        name: "",
        email: "",
        phone: "",
      },
      isBlockingDate: false,
      blockReason: "",
      tags: [],
      newTag: "",
      newTagColor: "#3b82f6",
      initialStatus: "confirmado",
      isDeleteDialogOpen: false,
      errors: {},
    });
  };

  // Set basic event information from existing event
  const setBasicEventInfo = (event: CalendarEvent) => {
    const start = parseISO(event.start);
    const end = parseISO(event.end);
    const durationInMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    
    updateState({
      summary: event.summary || "",
      automation: "",
      collaborator: event.hostName || "",
      eventDescription: event.description || "",
      email: event.attendees?.find((a) => a?.email)?.email || "",
      startDateTime: format(start, "yyyy-MM-dd'T'HH:mm"),
      endDateTime: format(end, "yyyy-MM-dd'T'HH:mm"),
      selectedColor: COLORS[0],
      selectedDuration: durationInMinutes,
    });
  };

  // Find service information from event description
  const findServiceInfo = (event: CalendarEvent) => {
    const foundService = SERVICES.find(service => 
      event.summary?.includes(service) || event.description?.includes(service)
    );
    
    if (foundService) {
      updateState({ selectedService: foundService });
    }
  };

  // Find client information from event attendees
  const findClientInfo = (event: CalendarEvent) => {
    const clientEmail = event.attendees?.find((a) => a?.email)?.email;
    if (clientEmail) {
      const foundClient = contacts.find(c => c.email === clientEmail);
      if (foundClient) {
        updateState({
          selectedClient: foundClient,
          isNewClient: false,
        });
      }
    }
  };

  // Determine attendance type and location/link from event description
  const determineAttendanceInfo = (event: CalendarEvent) => {
    if (event.description?.toLowerCase().includes("online") || 
        event.description?.toLowerCase().includes("zoom") || 
        event.description?.toLowerCase().includes("meet")) {
      // Try to extract meeting link
      const linkMatch = event.description?.match(/(https?:\/\/[^\s]+)/);
      
      updateState({
        attendanceType: "online",
        meetingLink: linkMatch ? linkMatch[0] : "",
      });
    } else {
      // Try to extract location
      const locationLines = event.description?.split('\n').filter(line => 
        line.toLowerCase().includes("local") || 
        line.toLowerCase().includes("endereço") ||
        line.toLowerCase().includes("localização")
      );
      
      updateState({
        attendanceType: "presencial",
        location: locationLines && locationLines.length > 0 ?
          locationLines[0].replace(/local|endereço|localização/i, "").trim() : "",
      });
    }
  };

  // Check if date is blocked and extract reason
  const checkBlockedDate = (event: CalendarEvent) => {
    if (event.summary?.toLowerCase().includes("bloqueado") || 
        event.description?.toLowerCase().includes("bloqueado")) {
      // Try to extract block reason
      const reasonLines = event.description?.split('\n').filter(line => 
        line.toLowerCase().includes("motivo") || 
        line.toLowerCase().includes("razão")
      );
      
      updateState({
        isBlockingDate: true,
        blockReason: reasonLines && reasonLines.length > 0 ?
          reasonLines[0].replace(/motivo|razão/i, "").trim() : "",
      });
    }
  };

  // Extract tags from event description
  const extractTags = (event: CalendarEvent) => {
    const tagRegex = /#([a-zA-Z0-9]+)/g;
    const foundTags = event.description?.match(tagRegex);
    
    if (foundTags) {
      const extractedTags = foundTags.map((tag: string, index: number) => ({
        id: `tag-${index}`,
        text: tag.substring(1),
        color: COLORS[index % COLORS.length]
      }));
      
      updateState({ tags: extractedTags });
    }
  };

  // Determine initial status from event status
  const determineInitialStatus = (event: CalendarEvent) => {
    if (event.status === "confirmed") {
      updateState({ initialStatus: "confirmado" });
    } else if (event.status === "tentative") {
      updateState({ initialStatus: "pendente" });
    }
  };

  // Validation functions
  const validateBlockedDate = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    
    if (!state.startDateTime) {
      newErrors.startDateTime = "A data e hora de início são obrigatórias";
    }
    
    if (!state.blockReason.trim()) {
      newErrors.blockReason = "O motivo do bloqueio é obrigatório";
    }
    
    return newErrors;
  };
  
  const validateClientFields = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    
    if (!state.selectedClient && !state.isNewClient) {
      newErrors.client = "Selecione um cliente ou crie um novo";
    }
    
    if (state.isNewClient) {
      if (!state.newClientData.name.trim()) {
        newErrors.newClientName = "O nome do cliente é obrigatório";
      }
      if (!state.newClientData.phone.trim()) {
        newErrors.newClientPhone = "O telefone do cliente é obrigatório";
      }
    }
    
    return newErrors;
  };
  
  const validateServiceFields = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    
    if (!state.selectedService) {
      newErrors.service = "O serviço é obrigatório";
    }
    
    if (!state.collaborator) {
      newErrors.collaborator = "O responsável é obrigatório";
    }
    
    return newErrors;
  };
  
  const validateAttendanceFields = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    
    if (!state.startDateTime) {
      newErrors.startDateTime = "A data e hora de início são obrigatórias";
    }
    
    if (state.attendanceType === "presencial" && !state.location.trim()) {
      newErrors.location = "O local é obrigatório para atendimento presencial";
    }
    
    if (state.attendanceType === "online" && !state.meetingLink.trim()) {
      newErrors.meetingLink = "O link da reunião é obrigatório para atendimento online";
    }
    
    return newErrors;
  };

  const validateForm = (): boolean => {
    let newErrors: Record<string, string> = {};
    
    if (state.isBlockingDate) {
      newErrors = validateBlockedDate();
    } else {
      newErrors = {
        ...validateClientFields(),
        ...validateServiceFields(),
        ...validateAttendanceFields()
      };
    }
    
    updateState({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  };

  // Helper functions for creating event descriptions
  const createClientInfoDescription = (): string => {
    let clientInfo = "";
    
    if (state.selectedClient) {
      clientInfo += `Cliente: ${state.selectedClient.name}\n`;
      clientInfo += `Telefone: ${state.selectedClient.phone || "Não informado"}\n`;
      if (state.selectedClient.email) {
        clientInfo += `Email: ${state.selectedClient.email}\n`;
      }
    } else if (state.isNewClient) {
      clientInfo += `Cliente: ${state.newClientData.name}\n`;
      clientInfo += `Telefone: ${state.newClientData.phone}\n`;
      if (state.newClientData.email) {
        clientInfo += `Email: ${state.newClientData.email}\n`;
      }
    }
    
    return clientInfo;
  };
  
  const createAttendanceInfoDescription = (): string => {
    let attendanceInfo = `Tipo de Atendimento: ${state.attendanceType === "presencial" ? "Presencial" : "Online"}\n`;
    
    if (state.attendanceType === "presencial") {
      attendanceInfo += `Local: ${state.location}\n`;
    } else {
      attendanceInfo += `Link da Reunião: ${state.meetingLink}\n`;
    }
    
    return attendanceInfo;
  };
  
  const createBlockedDateDescription = (): { summary: string, description: string } => {
    const summary = `BLOQUEADO: ${state.blockReason}`;
    let description = `Data bloqueada\nMotivo: ${state.blockReason}\n`;
    
    if (state.tags.length > 0) {
      description += "\nTags: " + state.tags.map(tag => `#${tag.text}`).join(" ");
    }
    
    return { summary, description };
  };
  
  const createRegularEventDescription = (): { summary: string, description: string } => {
    let description = `Serviço: ${state.selectedService}\n`;
    description += `Responsável: ${state.collaborator}\n`;
    description += createClientInfoDescription();
    description += createAttendanceInfoDescription();
    description += `Status: ${state.initialStatus}\n`;
    
    if (state.tags.length > 0) {
      description += `\nTags: ${state.tags.map(tag => `#${tag.text}`).join(" ")}\n`;
    }
    
    if (state.eventDescription) {
      description += `\nObservações:\n${state.eventDescription}`;
    }
    
    // Build summary
    const clientName = state.selectedClient ? state.selectedClient.name : 
                      state.isNewClient ? state.newClientData.name : "Cliente";
    const summary = `${state.selectedService} - ${clientName}`;
    
    return { summary, description };
  };

  // Prepare form data for submission
  const prepareFormData = (summary: string, description: string, startDate: Date, endDate: Date): EventFormData => {
    // Get email
    const clientEmail = state.selectedClient ? state.selectedClient.email : 
                       state.isNewClient ? state.newClientData.email : state.email;

    return {
      summary,
      description,
      email: clientEmail || "",
      date: startDate,
      startTime: format(startDate, "HH:mm"),
      endTime: format(endDate, "HH:mm"),
      hostName: state.collaborator,
      automation: state.automation,
      colorId: state.selectedColor,
    };
  };

  // Event handlers
  const handleSubmit = (e: React.FormEvent): EventFormData | null => {
    e.preventDefault();
    
    if (!validateForm()) {
      return null;
    }
    
    const startDate = state.startDateTime ? 
      parse(state.startDateTime, "yyyy-MM-dd'T'HH:mm", new Date()) : new Date();
    const endDate = new Date(startDate.getTime() + state.selectedDuration * 60 * 1000);
    
    let eventInfo;
    if (state.isBlockingDate) {
      eventInfo = createBlockedDateDescription();
    } else {
      eventInfo = createRegularEventDescription();
    }
    
    return prepareFormData(eventInfo.summary, eventInfo.description, startDate, endDate);
  };

  const handleSelectClient = (contact: Contact) => {
    updateState({
      selectedClient: contact,
      isNewClient: false,
      email: contact.email || "",
      searchTerm: "",
      activeTab: "service"
    });
  };

  const handleNewClient = () => {
    updateState({
      isNewClient: true,
      selectedClient: null
    });
  };

  const validateNewClientData = (): boolean => {
    const hasErrors = !state.newClientData.name || !state.newClientData.phone;
    
    if (hasErrors) {
      updateState({
        errors: {
          ...state.errors,
          newClientName: !state.newClientData.name ? "Nome é obrigatório" : "",
          newClientPhone: !state.newClientData.phone ? "Telefone é obrigatório" : "",
        }
      });
    }
    
    return !hasErrors;
  };

  const handleSaveNewClient = () => {
    if (validateNewClientData()) {
      updateState({
        email: state.newClientData.email,
        activeTab: "service"
      });
    }
  };

  const validateServiceSelection = (): boolean => {
    const hasErrors = !state.selectedService || !state.collaborator;
    
    if (hasErrors) {
      updateState({
        errors: {
          ...state.errors,
          service: !state.selectedService ? "Serviço é obrigatório" : "",
          collaborator: !state.collaborator ? "Responsável é obrigatório" : "",
        }
      });
    }
    
    return !hasErrors;
  };

  const handleServiceNext = () => {
    if (validateServiceSelection()) {
      updateState({ activeTab: "datetime" });
    }
  };

  const validateDateTimeSelection = (): boolean => {
    const hasError = !state.startDateTime;
    
    if (hasError) {
      updateState({
        errors: {
          ...state.errors,
          startDateTime: "Data e hora são obrigatórias",
        }
      });
    }
    
    return !hasError;
  };

  const handleDateTimeNext = () => {
    if (validateDateTimeSelection()) {
      updateState({ activeTab: "attendance" });
    }
  };

  const updateEndTime = () => {
    if (state.startDateTime) {
      const startDate = parse(state.startDateTime, "yyyy-MM-dd'T'HH:mm", new Date());
      const endDate = new Date(startDate.getTime() + state.selectedDuration * 60 * 1000);
      updateState({ endDateTime: format(endDate, "yyyy-MM-dd'T'HH:mm") });
    }
  };

  const addTag = () => {
    if (state.newTag.trim()) {
      const tag = {
        id: `tag-${Date.now()}`,
        text: state.newTag.trim(),
        color: state.newTagColor
      };
      updateState({
        tags: [...state.tags, tag],
        newTag: ""
      });
    }
  };

  const removeTag = (id: string) => {
    updateState({
      tags: state.tags.filter(tag => tag.id !== id)
    });
  };

  const handleDeleteDialogOpen = () => {
    updateState({ isDeleteDialogOpen: true });
  };

  const handleDeleteDialogClose = () => {
    updateState({ isDeleteDialogOpen: false });
  };

  // Load event data when event changes or dialog opens
  useEffect(() => {
    if (event && open) {
      setBasicEventInfo(event);
      findServiceInfo(event);
      findClientInfo(event);
      determineAttendanceInfo(event);
      checkBlockedDate(event);
      extractTags(event);
      determineInitialStatus(event);
    } else if (!open) {
      resetForm();
    }
  }, [event, open, contacts]);

  // Update end time when start time or duration changes
  useEffect(() => {
    updateEndTime();
  }, [state.startDateTime, state.selectedDuration]);

  return {
    // State
    state,
    updateState,
    filteredContacts,
    constants: {
      COLORS,
      SERVICES,
      COLLABORATORS,
      DURATIONS,
      ATTENDANCE_TYPES,
    },
    
    // Validation
    validateForm,
    validateNewClientData,
    validateServiceSelection,
    validateDateTimeSelection,
    
    // Event handlers
    handleSubmit,
    handleSelectClient,
    handleNewClient,
    handleSaveNewClient,
    handleServiceNext,
    handleDateTimeNext,
    addTag,
    removeTag,
    handleDeleteDialogOpen,
    handleDeleteDialogClose,
    
    // Helper functions
    resetForm,
    updateEndTime,
    createBlockedDateDescription,
    createRegularEventDescription,
  };
};

export default useEventFormDialog;