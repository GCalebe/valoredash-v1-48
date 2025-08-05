import { Contact } from '@/types/client';
import { EventFormData, CalendarEvent } from '@/hooks/useCalendarEvents';
import { EventFormState } from '@/types/eventForm';

// Props para o hook principal
export interface UseEventFormDialogProps {
  event?: CalendarEvent;
  open: boolean;
}

// Tipos para validação
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Tipos para manipulação de eventos
export interface EventInfo {
  summary: string;
  description: string;
}

// Tipos para dados de cliente
export interface NewClientData {
  name: string;
  email: string;
  phone?: string;
}

// Tipos para tags
export interface EventTag {
  id: string;
  text: string;
}

// Tipos para constantes do formulário
export interface EventFormConstants {
  COLORS: string[];
  SERVICES: string[];
  COLLABORATORS: string[];
  DURATIONS: number[];
  ATTENDANCE_TYPES: string[];
}

// Tipos para handlers de eventos
export interface EventHandlers {
  handleSubmit: (e: React.FormEvent) => EventFormData | null;
  handleSelectClient: (contact: Contact) => void;
  handleNewClient: () => void;
  handleSaveNewClient: () => void;
  handleServiceNext: () => void;
  handleDateTimeNext: () => void;
  addTag: () => void;
  removeTag: (id: string) => void;
  handleDeleteDialogOpen: () => void;
  handleDeleteDialogClose: () => void;
}

// Tipos para funções de validação
export interface ValidationFunctions {
  validateForm: () => boolean;
  validateNewClientData: () => boolean;
  validateServiceSelection: () => boolean;
  validateDateTimeSelection: () => boolean;
}

// Tipos para funções auxiliares
export interface HelperFunctions {
  resetForm: () => void;
  updateEndTime: () => void;
}

// Tipo de retorno do hook principal
export interface UseEventFormDialogReturn {
  // Estado
  state: EventFormState;
  updateState: (updates: Partial<EventFormState>) => void;
  filteredContacts: Contact[];
  constants: EventFormConstants;
  
  // Validação
  validateForm: () => boolean;
  validateNewClientData: () => boolean;
  validateServiceSelection: () => boolean;
  validateDateTimeSelection: () => boolean;
  
  // Handlers de eventos
  handleSubmit: (e: React.FormEvent) => EventFormData | null;
  handleSelectClient: (contact: Contact) => void;
  handleNewClient: () => void;
  handleSaveNewClient: () => void;
  handleServiceNext: () => void;
  handleDateTimeNext: () => void;
  addTag: () => void;
  removeTag: (id: string) => void;
  handleDeleteDialogOpen: () => void;
  handleDeleteDialogClose: () => void;
  
  // Funções auxiliares
  resetForm: () => void;
  updateEndTime: () => void;
}

// Tipos para processamento de eventos
export interface EventProcessor {
  setBasicEventInfo: (event: CalendarEvent) => void;
  findServiceInfo: (event: CalendarEvent) => void;
  findClientInfo: (event: CalendarEvent) => void;
  determineAttendanceInfo: (event: CalendarEvent) => void;
  checkBlockedDate: (event: CalendarEvent) => void;
  determineInitialStatus: (event: CalendarEvent) => void;
}

// Tipos para filtros de contatos
export interface ContactFilter {
  searchTerm: string;
  contacts: Contact[];
}

// Tipos para configurações de duração
export interface DurationConfig {
  startDateTime: string;
  selectedDuration: number;
}

// Tipos para informações de atendimento
export interface AttendanceInfo {
  attendanceType: 'online' | 'presencial';
  meetingLink?: string;
  location?: string;
}

// Tipos para bloqueio de data
export interface DateBlockInfo {
  isBlockingDate: boolean;
  blockReason?: string;
}

// Tipos para status do evento
export type EventStatus = 'confirmado' | 'pendente' | 'cancelado';

// Tipos para abas do formulário
export type FormTab = 'client' | 'service' | 'datetime' | 'attendance';