import { Contact } from '@/types/client';

export interface Tag {
  id: string;
  text: string;
  color: string;
}

export interface NewClientData {
  name: string;
  email: string;
  phone: string;
}

export interface EventFormState {
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
  selectedDate?: Date;
  selectedTime?: string;
  selectedAgendaId?: string;
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
  [key: string]: any; // Add index signature for dynamic properties
}