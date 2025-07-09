import { EventFormState } from '@/types/eventForm';

export const validateBlockedDate = (state: EventFormState): Record<string, string> => {
  const newErrors: Record<string, string> = {};
  
  if (!state.startDateTime) {
    newErrors.startDateTime = "A data e hora de início são obrigatórias";
  }
  
  if (!state.blockReason.trim()) {
    newErrors.blockReason = "O motivo do bloqueio é obrigatório";
  }
  
  return newErrors;
};

export const validateClientFields = (state: EventFormState): Record<string, string> => {
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

export const validateServiceFields = (state: EventFormState): Record<string, string> => {
  const newErrors: Record<string, string> = {};
  
  if (!state.selectedService) {
    newErrors.service = "O serviço é obrigatório";
  }
  
  if (!state.collaborator) {
    newErrors.collaborator = "O responsável é obrigatório";
  }
  
  return newErrors;
};

export const validateAttendanceFields = (state: EventFormState): Record<string, string> => {
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

export const validateForm = (state: EventFormState): boolean => {
  let newErrors: Record<string, string> = {};
  
  if (state.isBlockingDate) {
    newErrors = validateBlockedDate(state);
  } else {
    newErrors = {
      ...validateClientFields(state),
      ...validateServiceFields(state),
      ...validateAttendanceFields(state)
    };
  }
  
  return Object.keys(newErrors).length === 0;
};

export const validateNewClientData = (state: EventFormState): boolean => {
  return !(!state.newClientData.name || !state.newClientData.phone);
};

export const validateServiceSelection = (state: EventFormState): boolean => {
  return !(!state.selectedService || !state.collaborator);
};

export const validateDateTimeSelection = (state: EventFormState): boolean => {
  return !!state.startDateTime;
};