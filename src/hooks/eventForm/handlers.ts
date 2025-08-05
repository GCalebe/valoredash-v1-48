import { parse } from 'date-fns';
import { Contact } from '@/types/client';
import { EventFormData } from '@/hooks/useCalendarEvents';
import { EventFormState } from '@/types/eventForm';
import {
  createBlockedDateDescription,
  createRegularEventDescription,
  prepareFormData,
  addTag as addTagHelper,
  removeTag as removeTagHelper
} from '@/utils/eventFormHelpers';
import { EventHandlers, ValidationFunctions } from './types';

/**
 * Cria handlers para o formulário de eventos
 * @param state Estado atual do formulário
 * @param updateState Função para atualizar o estado
 * @param validation Funções de validação
 * @returns Objeto com handlers de eventos
 */
export const createEventHandlers = (
  state: EventFormState,
  updateState: (updates: Partial<EventFormState>) => void,
  validation: ValidationFunctions
): EventHandlers => {
  
  /**
   * Handler para submissão do formulário
   */
  const handleSubmit = (e: React.FormEvent): EventFormData | null => {
    e.preventDefault();
    
    if (!validation.validateForm()) {
      return null;
    }
    
    const startDate = state.startDateTime ? 
      parse(state.startDateTime, "yyyy-MM-dd'T'HH:mm", new Date()) : new Date();
    const endDate = new Date(startDate.getTime() + state.selectedDuration * 60 * 1000);
    
    let eventInfo;
    if (state.isBlockingDate) {
      eventInfo = createBlockedDateDescription(state);
    } else {
      eventInfo = createRegularEventDescription(state);
    }
    
    return prepareFormData(eventInfo.summary, eventInfo.description, startDate, endDate, state);
  };

  /**
   * Handler para seleção de cliente
   */
  const handleSelectClient = (contact: Contact) => {
    updateState({
      selectedClient: contact,
      isNewClient: false,
      email: contact.email || "",
      searchTerm: "",
      activeTab: "service"
    });
  };

  /**
   * Handler para novo cliente
   */
  const handleNewClient = () => {
    updateState({
      isNewClient: true,
      selectedClient: null
    });
  };

  /**
   * Handler para salvar novo cliente
   */
  const handleSaveNewClient = () => {
    if (validation.validateNewClientData()) {
      updateState({
        email: state.newClientData.email,
        activeTab: "service"
      });
    }
  };

  /**
   * Handler para avançar na aba de serviço
   */
  const handleServiceNext = () => {
    if (validation.validateServiceSelection()) {
      updateState({ activeTab: "datetime" });
    }
  };

  /**
   * Handler para avançar na aba de data/hora
   */
  const handleDateTimeNext = () => {
    if (validation.validateDateTimeSelection()) {
      updateState({ activeTab: "attendance" });
    }
  };

  /**
   * Handler para adicionar tag
   */
  const addTag = () => {
    addTagHelper(state, updateState);
  };

  /**
   * Handler para remover tag
   */
  const removeTag = (id: string) => {
    removeTagHelper(id, state, updateState);
  };

  /**
   * Handler para abrir diálogo de exclusão
   */
  const handleDeleteDialogOpen = () => {
    updateState({ isDeleteDialogOpen: true });
  };

  /**
   * Handler para fechar diálogo de exclusão
   */
  const handleDeleteDialogClose = () => {
    updateState({ isDeleteDialogOpen: false });
  };

  return {
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
  };
};

/**
 * Handlers específicos para diferentes seções do formulário
 */
export const sectionHandlers = {
  /**
   * Handlers para a seção de cliente
   */
  client: {
    /**
     * Filtra contatos baseado no termo de busca
     */
    filterContacts: (contacts: Contact[], searchTerm: string): Contact[] => {
      if (!searchTerm.trim()) return contacts;
      
      const term = searchTerm.toLowerCase();
      return contacts.filter(contact => 
        contact.name.toLowerCase().includes(term) ||
        (contact.email && contact.email.toLowerCase().includes(term)) ||
        (contact.phone && contact.phone.includes(searchTerm))
      );
    },

    /**
     * Atualiza dados do novo cliente
     */
    updateNewClientData: (
      field: keyof EventFormState['newClientData'],
      value: string,
      updateState: (updates: Partial<EventFormState>) => void
    ) => {
      updateState({
        newClientData: {
          ...updateState as any, // Temporary type fix
          [field]: value
        }
      });
    },

    /**
     * Limpa busca de cliente
     */
    clearSearch: (updateState: (updates: Partial<EventFormState>) => void) => {
      updateState({ searchTerm: "" });
    }
  },

  /**
   * Handlers para a seção de serviço
   */
  service: {
    /**
     * Seleciona um serviço
     */
    selectService: (
      service: string,
      updateState: (updates: Partial<EventFormState>) => void
    ) => {
      updateState({ selectedService: service });
    },

    /**
     * Seleciona duração
     */
    selectDuration: (
      duration: number,
      updateState: (updates: Partial<EventFormState>) => void
    ) => {
      updateState({ selectedDuration: duration });
    },

    /**
     * Seleciona colaborador
     */
    selectCollaborator: (
      collaborator: string,
      updateState: (updates: Partial<EventFormState>) => void
    ) => {
      updateState({ collaborator });
    }
  },

  /**
   * Handlers para a seção de data/hora
   */
  dateTime: {
    /**
     * Atualiza data/hora de início
     */
    updateStartDateTime: (
      startDateTime: string,
      selectedDuration: number,
      updateState: (updates: Partial<EventFormState>) => void
    ) => {
      const startDate = parse(startDateTime, "yyyy-MM-dd'T'HH:mm", new Date());
      const endDate = new Date(startDate.getTime() + selectedDuration * 60 * 1000);
      const endDateTime = endDate.toISOString().slice(0, 16);
      
      updateState({
        startDateTime,
        endDateTime
      });
    },

    /**
     * Atualiza duração e recalcula hora de fim
     */
    updateDuration: (
      duration: number,
      startDateTime: string,
      updateState: (updates: Partial<EventFormState>) => void
    ) => {
      if (startDateTime) {
        const startDate = parse(startDateTime, "yyyy-MM-dd'T'HH:mm", new Date());
        const endDate = new Date(startDate.getTime() + duration * 60 * 1000);
        const endDateTime = endDate.toISOString().slice(0, 16);
        
        updateState({
          selectedDuration: duration,
          endDateTime
        });
      } else {
        updateState({ selectedDuration: duration });
      }
    }
  },

  /**
   * Handlers para a seção de atendimento
   */
  attendance: {
    /**
     * Seleciona tipo de atendimento
     */
    selectAttendanceType: (
      type: 'online' | 'presencial',
      updateState: (updates: Partial<EventFormState>) => void
    ) => {
      updateState({
        attendanceType: type,
        // Limpa campos do tipo anterior
        meetingLink: type === 'online' ? updateState as any : "",
        location: type === 'presencial' ? updateState as any : ""
      });
    },

    /**
     * Atualiza link da reunião
     */
    updateMeetingLink: (
      meetingLink: string,
      updateState: (updates: Partial<EventFormState>) => void
    ) => {
      updateState({ meetingLink });
    },

    /**
     * Atualiza localização
     */
    updateLocation: (
      location: string,
      updateState: (updates: Partial<EventFormState>) => void
    ) => {
      updateState({ location });
    }
  },

  /**
   * Handlers para tags
   */
  tags: {
    /**
     * Adiciona nova tag
     */
    addTag: (
      tagText: string,
      state: EventFormState,
      updateState: (updates: Partial<EventFormState>) => void
    ) => {
      if (!tagText.trim()) return;
      
      const newTag = {
        id: Date.now().toString(),
        text: tagText.trim()
      };
      
      updateState({
        tags: [...state.tags, newTag],
        currentTag: ""
      });
    },

    /**
     * Remove tag por ID
     */
    removeTag: (
      tagId: string,
      state: EventFormState,
      updateState: (updates: Partial<EventFormState>) => void
    ) => {
      updateState({
        tags: state.tags.filter(tag => tag.id !== tagId)
      });
    },

    /**
     * Atualiza texto da tag atual
     */
    updateCurrentTag: (
      currentTag: string,
      updateState: (updates: Partial<EventFormState>) => void
    ) => {
      updateState({ currentTag });
    }
  },

  /**
   * Handlers para navegação entre abas
   */
  navigation: {
    /**
     * Navega para uma aba específica
     */
    goToTab: (
      tab: EventFormState['activeTab'],
      updateState: (updates: Partial<EventFormState>) => void
    ) => {
      updateState({ activeTab: tab });
    },

    /**
     * Avança para próxima aba
     */
    nextTab: (
      currentTab: EventFormState['activeTab'],
      updateState: (updates: Partial<EventFormState>) => void
    ) => {
      const tabOrder: EventFormState['activeTab'][] = ['client', 'service', 'datetime', 'attendance'];
      const currentIndex = tabOrder.indexOf(currentTab);
      
      if (currentIndex < tabOrder.length - 1) {
        updateState({ activeTab: tabOrder[currentIndex + 1] });
      }
    },

    /**
     * Volta para aba anterior
     */
    previousTab: (
      currentTab: EventFormState['activeTab'],
      updateState: (updates: Partial<EventFormState>) => void
    ) => {
      const tabOrder: EventFormState['activeTab'][] = ['client', 'service', 'datetime', 'attendance'];
      const currentIndex = tabOrder.indexOf(currentTab);
      
      if (currentIndex > 0) {
        updateState({ activeTab: tabOrder[currentIndex - 1] });
      }
    }
  }
};

/**
 * Utilitários para handlers
 */
export const handlerUtils = {
  /**
   * Cria um handler debounced
   */
  createDebouncedHandler: <T extends any[]>(
    handler: (...args: T) => void,
    delay: number = 300
  ) => {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: T) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => handler(...args), delay);
    };
  },

  /**
   * Cria um handler com loading state
   */
  createLoadingHandler: <T extends any[]>(
    handler: (...args: T) => Promise<void>,
    setLoading: (loading: boolean) => void
  ) => {
    return async (...args: T) => {
      setLoading(true);
      try {
        await handler(...args);
      } finally {
        setLoading(false);
      }
    };
  },

  /**
   * Cria um handler com tratamento de erro
   */
  createErrorHandler: <T extends any[]>(
    handler: (...args: T) => void,
    onError: (error: Error) => void
  ) => {
    return (...args: T) => {
      try {
        handler(...args);
      } catch (error) {
        onError(error as Error);
      }
    };
  }
};