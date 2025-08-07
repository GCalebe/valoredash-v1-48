import { format } from 'date-fns';
import { EventFormData } from '@/hooks/useCalendarEvents';
import { EventFormState, Tag } from '@/types/eventForm';
import { COLORS } from '@/constants/eventFormConstants';

export const createClientInfoDescription = (state: EventFormState): string => {
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

export const createAttendanceInfoDescription = (state: EventFormState): string => {
  let attendanceInfo = `Tipo de Atendimento: ${state.attendanceType === "presencial" ? "Presencial" : "Online"}\n`;
  
  if (state.attendanceType === "presencial") {
    attendanceInfo += `Local: ${state.location}\n`;
  } else {
    attendanceInfo += `Link da Reunião: ${state.meetingLink}\n`;
  }
  
  return attendanceInfo;
};

export const createBlockedDateDescription = (state: EventFormState): { summary: string, description: string } => {
  const summary = `BLOQUEADO: ${state.blockReason}`;
  let description = `Data bloqueada\nMotivo: ${state.blockReason}\n`;
  
  if (state.tags.length > 0) {
    description += "\nTags: " + state.tags.map(tag => `#${tag.text}`).join(" ");
  }
  
  return { summary, description };
};

export const createRegularEventDescription = (state: EventFormState): { summary: string, description: string } => {
  let description = `Serviço: ${state.selectedService}\n`;
  description += `Responsável: ${state.collaborator}\n`;
  description += createClientInfoDescription(state);
  description += createAttendanceInfoDescription(state);
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

export const prepareFormData = (
  summary: string, 
  description: string, 
  startDate: Date, 
  endDate: Date,
  state: EventFormState
): EventFormData => {
  // Get email and phone from client or new client data
  const clientEmail = state.selectedClient ? state.selectedClient.email : 
                     state.isNewClient ? state.newClientData.email : state.email;
  const clientPhone = state.selectedClient ? state.selectedClient.phone : 
                     state.isNewClient ? state.newClientData.phone : "";

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
    // Map new fields
    attendanceType: state.attendanceType,
    employeeId: state.employeeId,
    productId: state.productId,
    serviceName: state.selectedService,
    tags: state.tags,
    clientEmail: clientEmail || "",
    clientPhone: clientPhone || "",
    meetingLink: state.attendanceType === "online" ? state.meetingLink : "",
    location: state.attendanceType === "presencial" ? state.location : "",
  };
};

export const addTag = (state: EventFormState, updateState: (updates: Partial<EventFormState>) => void) => {
  if (state.newTag.trim()) {
    const tag: Tag = {
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

export const removeTag = (id: string, state: EventFormState, updateState: (updates: Partial<EventFormState>) => void) => {
  updateState({
    tags: state.tags.filter(tag => tag.id !== id)
  });
};

export const extractTags = (eventDescription: string | undefined): Tag[] => {
  if (!eventDescription) return [];
  
  const tagRegex = /#([a-zA-Z0-9]+)/g;
  const foundTags = eventDescription.match(tagRegex);
  
  if (foundTags) {
    return foundTags.map((tag: string, index: number) => ({
      id: `tag-${index}`,
      text: tag.substring(1),
      color: COLORS[index % COLORS.length]
    }));
  }
  
  return [];
};