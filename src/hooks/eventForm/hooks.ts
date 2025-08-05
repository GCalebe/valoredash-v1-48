import { useEffect } from 'react';
import { Contact } from '@/types/client';
import { useOptimizedContactsData } from '@/hooks/useOptimizedContactsData';
import { useEventFormState } from '@/hooks/useEventFormState';
import { COLORS, SERVICES, COLLABORATORS, DURATIONS, ATTENDANCE_TYPES } from '@/constants/eventFormConstants';
import { UseEventFormDialogProps, UseEventFormDialogReturn } from './types';
import { processEvent } from './eventProcessor';
import { createValidationFunctions } from './validation';
import { createEventHandlers } from './handlers';
import { createHelperFunctions, contactUtils } from './utils';

/**
 * Hook principal para gerenciar formulário de eventos
 * Versão refatorada do useEventFormDialog original
 */
export const useEventFormDialog = ({ event, open }: UseEventFormDialogProps): UseEventFormDialogReturn => {
  // Hooks de dados
  const { contacts } = useOptimizedContactsData();
  const { state, updateState, resetForm: resetFormState } = useEventFormState();

  // Criar funções especializadas
  const validation = createValidationFunctions(state);
  const handlers = createEventHandlers(state, updateState, validation);
  const helpers = createHelperFunctions(state, updateState, resetFormState);

  // Filtrar contatos baseado no termo de busca
  const filteredContacts = contactUtils.filterContacts({
    contacts,
    searchTerm: state.searchTerm
  });

  // Carregar dados do evento quando evento muda ou diálogo abre
  useEffect(() => {
    if (event && open) {
      processEvent(event, contacts, updateState);
    } else if (!open) {
      resetFormState();
    }
  }, [event, open, contacts, updateState, resetFormState]);

  // Atualizar hora de fim quando hora de início ou duração muda
  useEffect(() => {
    helpers.updateEndTime();
  }, [state.startDateTime, state.selectedDuration]);

  return {
    // Estado
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
    
    // Validação
    validateForm: validation.validateForm,
    validateNewClientData: validation.validateNewClientData,
    validateServiceSelection: validation.validateServiceSelection,
    validateDateTimeSelection: validation.validateDateTimeSelection,
    
    // Handlers de eventos
    handleSubmit: handlers.handleSubmit,
    handleSelectClient: handlers.handleSelectClient,
    handleNewClient: handlers.handleNewClient,
    handleSaveNewClient: handlers.handleSaveNewClient,
    handleServiceNext: handlers.handleServiceNext,
    handleDateTimeNext: handlers.handleDateTimeNext,
    addTag: handlers.addTag,
    removeTag: handlers.removeTag,
    handleDeleteDialogOpen: handlers.handleDeleteDialogOpen,
    handleDeleteDialogClose: handlers.handleDeleteDialogClose,
    
    // Funções auxiliares
    resetForm: helpers.resetForm,
    updateEndTime: helpers.updateEndTime,
  };
};

/**
 * Hook para validação específica de seções do formulário
 */
export const useEventFormValidation = (state: any) => {
  const validation = createValidationFunctions(state);
  
  return {
    validateForm: validation.validateForm,
    validateNewClientData: validation.validateNewClientData,
    validateServiceSelection: validation.validateServiceSelection,
    validateDateTimeSelection: validation.validateDateTimeSelection,
  };
};

/**
 * Hook para handlers específicos de seções do formulário
 */
export const useEventFormHandlers = (state: any, updateState: any) => {
  const validation = createValidationFunctions(state);
  const handlers = createEventHandlers(state, updateState, validation);
  
  return {
    handleSubmit: handlers.handleSubmit,
    handleSelectClient: handlers.handleSelectClient,
    handleNewClient: handlers.handleNewClient,
    handleSaveNewClient: handlers.handleSaveNewClient,
    handleServiceNext: handlers.handleServiceNext,
    handleDateTimeNext: handlers.handleDateTimeNext,
    addTag: handlers.addTag,
    removeTag: handlers.removeTag,
    handleDeleteDialogOpen: handlers.handleDeleteDialogOpen,
    handleDeleteDialogClose: handlers.handleDeleteDialogClose,
  };
};

/**
 * Hook para processamento de eventos do calendário
 */
export const useEventProcessor = (contacts: Contact[], updateState: any) => {
  return {
    processEvent: (event: any) => processEvent(event, contacts, updateState)
  };
};

/**
 * Hook para filtros de contatos
 */
export const useContactFilter = (contacts: Contact[], searchTerm: string) => {
  return contactUtils.filterContacts({ contacts, searchTerm });
};

/**
 * Hook para constantes do formulário
 */
export const useEventFormConstants = () => {
  return {
    COLORS,
    SERVICES,
    COLLABORATORS,
    DURATIONS,
    ATTENDANCE_TYPES,
  };
};

/**
 * Hook para utilitários do formulário
 */
export const useEventFormUtils = (state: any, updateState: any, resetFormState: any) => {
  const helpers = createHelperFunctions(state, updateState, resetFormState);
  
  return {
    resetForm: helpers.resetForm,
    updateEndTime: helpers.updateEndTime,
  };
};

/**
 * Hook composto para funcionalidades específicas de cliente
 */
export const useEventFormClient = (contacts: Contact[], state: any, updateState: any) => {
  const filteredContacts = contactUtils.filterContacts({
    contacts,
    searchTerm: state.searchTerm
  });

  const selectClient = (contact: Contact) => {
    updateState({
      selectedClient: contact,
      isNewClient: false,
      email: contact.email || "",
      searchTerm: "",
      activeTab: "service"
    });
  };

  const newClient = () => {
    updateState({
      isNewClient: true,
      selectedClient: null
    });
  };

  return {
    filteredContacts,
    selectClient,
    newClient,
  };
};

/**
 * Hook composto para funcionalidades específicas de serviço
 */
export const useEventFormService = (state: any, updateState: any) => {
  const selectService = (service: string) => {
    updateState({ selectedService: service });
  };

  const selectDuration = (duration: number) => {
    updateState({ selectedDuration: duration });
  };

  const selectCollaborator = (collaborator: string) => {
    updateState({ collaborator });
  };

  return {
    selectService,
    selectDuration,
    selectCollaborator,
    services: SERVICES,
    durations: DURATIONS,
    collaborators: COLLABORATORS,
  };
};

/**
 * Hook composto para funcionalidades específicas de data/hora
 */
export const useEventFormDateTime = (state: any, updateState: any) => {
  const updateStartDateTime = (startDateTime: string) => {
    const startDate = new Date(startDateTime);
    const endDate = new Date(startDate.getTime() + state.selectedDuration * 60 * 1000);
    const endDateTime = endDate.toISOString().slice(0, 16);
    
    updateState({
      startDateTime,
      endDateTime
    });
  };

  const updateDuration = (duration: number) => {
    if (state.startDateTime) {
      const startDate = new Date(state.startDateTime);
      const endDate = new Date(startDate.getTime() + duration * 60 * 1000);
      const endDateTime = endDate.toISOString().slice(0, 16);
      
      updateState({
        selectedDuration: duration,
        endDateTime
      });
    } else {
      updateState({ selectedDuration: duration });
    }
  };

  return {
    updateStartDateTime,
    updateDuration,
    durations: DURATIONS,
  };
};

/**
 * Hook composto para funcionalidades específicas de atendimento
 */
export const useEventFormAttendance = (state: any, updateState: any) => {
  const selectAttendanceType = (type: 'online' | 'presencial') => {
    updateState({
      attendanceType: type,
      meetingLink: type === 'online' ? state.meetingLink : "",
      location: type === 'presencial' ? state.location : ""
    });
  };

  const updateMeetingLink = (meetingLink: string) => {
    updateState({ meetingLink });
  };

  const updateLocation = (location: string) => {
    updateState({ location });
  };

  return {
    selectAttendanceType,
    updateMeetingLink,
    updateLocation,
    attendanceTypes: ATTENDANCE_TYPES,
  };
};

/**
 * Hook composto para funcionalidades específicas de tags
 */
export const useEventFormTags = (state: any, updateState: any) => {
  const addTag = () => {
    if (!state.currentTag?.trim()) return;
    
    const newTag = {
      id: Date.now().toString(),
      text: state.currentTag.trim()
    };
    
    updateState({
      tags: [...state.tags, newTag],
      currentTag: ""
    });
  };

  const removeTag = (tagId: string) => {
    updateState({
      tags: state.tags.filter((tag: any) => tag.id !== tagId)
    });
  };

  const updateCurrentTag = (currentTag: string) => {
    updateState({ currentTag });
  };

  return {
    addTag,
    removeTag,
    updateCurrentTag,
    tags: state.tags,
  };
};

/**
 * Hook para navegação entre abas do formulário
 */
export const useEventFormNavigation = (state: any, updateState: any) => {
  const goToTab = (tab: any) => {
    updateState({ activeTab: tab });
  };

  const nextTab = () => {
    const tabOrder = ['client', 'service', 'datetime', 'attendance'];
    const currentIndex = tabOrder.indexOf(state.activeTab);
    
    if (currentIndex < tabOrder.length - 1) {
      updateState({ activeTab: tabOrder[currentIndex + 1] });
    }
  };

  const previousTab = () => {
    const tabOrder = ['client', 'service', 'datetime', 'attendance'];
    const currentIndex = tabOrder.indexOf(state.activeTab);
    
    if (currentIndex > 0) {
      updateState({ activeTab: tabOrder[currentIndex - 1] });
    }
  };

  return {
    goToTab,
    nextTab,
    previousTab,
    currentTab: state.activeTab,
  };
};