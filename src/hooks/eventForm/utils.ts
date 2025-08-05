import { format, parse } from 'date-fns';
import { Contact } from '@/types/client';
import { EventFormState } from '@/types/eventForm';
import { HelperFunctions, DurationConfig, ContactFilter } from './types';

/**
 * Cria funções auxiliares para o formulário de eventos
 * @param state Estado atual do formulário
 * @param updateState Função para atualizar o estado
 * @param resetFormState Função para resetar o formulário
 * @returns Objeto com funções auxiliares
 */
export const createHelperFunctions = (
  state: EventFormState,
  updateState: (updates: Partial<EventFormState>) => void,
  resetFormState: () => void
): HelperFunctions => {
  
  /**
   * Reseta o formulário para o estado inicial
   */
  const resetForm = () => {
    resetFormState();
  };

  /**
   * Atualiza a hora de fim baseada na hora de início e duração
   */
  const updateEndTime = () => {
    if (state.startDateTime) {
      const startDate = parse(state.startDateTime, "yyyy-MM-dd'T'HH:mm", new Date());
      const endDate = new Date(startDate.getTime() + state.selectedDuration * 60 * 1000);
      updateState({ endDateTime: format(endDate, "yyyy-MM-dd'T'HH:mm") });
    }
  };

  return {
    resetForm,
    updateEndTime,
  };
};

/**
 * Utilitários para manipulação de contatos
 */
export const contactUtils = {
  /**
   * Filtra contatos baseado no termo de busca
   */
  filterContacts: ({ searchTerm, contacts }: ContactFilter): Contact[] => {
    if (!searchTerm.trim()) return contacts;
    
    const term = searchTerm.toLowerCase();
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(term) ||
      (contact.email && contact.email.toLowerCase().includes(term)) ||
      (contact.phone && contact.phone.includes(searchTerm))
    );
  },

  /**
   * Encontra contato por email
   */
  findContactByEmail: (contacts: Contact[], email: string): Contact | undefined => {
    return contacts.find(contact => contact.email === email);
  },

  /**
   * Encontra contato por telefone
   */
  findContactByPhone: (contacts: Contact[], phone: string): Contact | undefined => {
    return contacts.find(contact => contact.phone === phone);
  },

  /**
   * Verifica se um contato já existe
   */
  contactExists: (contacts: Contact[], email: string): boolean => {
    return contacts.some(contact => contact.email === email);
  },

  /**
   * Formata nome do contato para exibição
   */
  formatContactName: (contact: Contact): string => {
    return contact.name || contact.email || 'Contato sem nome';
  },

  /**
   * Extrai iniciais do nome do contato
   */
  getContactInitials: (contact: Contact): string => {
    const name = contact.name || contact.email || 'SC';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }
};

/**
 * Utilitários para manipulação de data e hora
 */
export const dateTimeUtils = {
  /**
   * Calcula hora de fim baseada na configuração de duração
   */
  calculateEndTime: ({ startDateTime, selectedDuration }: DurationConfig): string => {
    if (!startDateTime) return '';
    
    const startDate = parse(startDateTime, "yyyy-MM-dd'T'HH:mm", new Date());
    const endDate = new Date(startDate.getTime() + selectedDuration * 60 * 1000);
    return format(endDate, "yyyy-MM-dd'T'HH:mm");
  },

  /**
   * Formata duração em texto legível
   */
  formatDuration: (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${remainingMinutes}min`;
  },

  /**
   * Verifica se uma data está no passado
   */
  isInPast: (dateString: string): boolean => {
    const date = new Date(dateString);
    return date < new Date();
  },

  /**
   * Verifica se uma data está no futuro
   */
  isInFuture: (dateString: string): boolean => {
    const date = new Date(dateString);
    return date > new Date();
  },

  /**
   * Calcula diferença em minutos entre duas datas
   */
  getDifferenceInMinutes: (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
  },

  /**
   * Formata data para exibição
   */
  formatDateForDisplay: (dateString: string): string => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy 'às' HH:mm");
  },

  /**
   * Gera slots de horário disponíveis
   */
  generateTimeSlots: (startHour: number = 8, endHour: number = 18, intervalMinutes: number = 30): string[] => {
    const slots: string[] = [];
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    
    return slots;
  }
};

/**
 * Utilitários para manipulação de tags
 */
export const tagUtils = {
  /**
   * Cria uma nova tag
   */
  createTag: (text: string): { id: string; text: string } => {
    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text: text.trim()
    };
  },

  /**
   * Valida texto de tag
   */
  isValidTagText: (text: string): boolean => {
    return text.trim().length > 0 && text.trim().length <= 50;
  },

  /**
   * Remove duplicatas de tags
   */
  removeDuplicateTags: (tags: Array<{ id: string; text: string }>): Array<{ id: string; text: string }> => {
    const seen = new Set<string>();
    return tags.filter(tag => {
      const normalizedText = tag.text.toLowerCase().trim();
      if (seen.has(normalizedText)) {
        return false;
      }
      seen.add(normalizedText);
      return true;
    });
  },

  /**
   * Converte tags para string
   */
  tagsToString: (tags: Array<{ id: string; text: string }>): string => {
    return tags.map(tag => tag.text).join(', ');
  },

  /**
   * Converte string para tags
   */
  stringToTags: (tagString: string): Array<{ id: string; text: string }> => {
    return tagString
      .split(',')
      .map(text => text.trim())
      .filter(text => text.length > 0)
      .map(text => tagUtils.createTag(text));
  }
};

/**
 * Utilitários para formatação de texto
 */
export const textUtils = {
  /**
   * Capitaliza primeira letra
   */
  capitalize: (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  /**
   * Capitaliza cada palavra
   */
  capitalizeWords: (text: string): string => {
    return text
      .split(' ')
      .map(word => textUtils.capitalize(word))
      .join(' ');
  },

  /**
   * Remove acentos
   */
  removeAccents: (text: string): string => {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  },

  /**
   * Trunca texto
   */
  truncate: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
  },

  /**
   * Limpa espaços extras
   */
  cleanSpaces: (text: string): string => {
    return text.replace(/\s+/g, ' ').trim();
  },

  /**
   * Extrai números de um texto
   */
  extractNumbers: (text: string): string => {
    return text.replace(/\D/g, '');
  },

  /**
   * Formata telefone brasileiro
   */
  formatPhone: (phone: string): string => {
    const numbers = textUtils.extractNumbers(phone);
    
    if (numbers.length === 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    }
    
    if (numbers.length === 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    }
    
    return phone;
  }
};

/**
 * Utilitários para validação de formulário
 */
export const formUtils = {
  /**
   * Verifica se todos os campos obrigatórios estão preenchidos
   */
  hasRequiredFields: (state: EventFormState): boolean => {
    const requiredFields = [
      state.summary,
      state.collaborator,
      state.selectedService,
      state.startDateTime,
      state.endDateTime
    ];
    
    return requiredFields.every(field => Boolean(field?.toString().trim()));
  },

  /**
   * Conta campos preenchidos
   */
  countFilledFields: (state: EventFormState): number => {
    const fields = [
      state.summary,
      state.collaborator,
      state.selectedService,
      state.startDateTime,
      state.endDateTime,
      state.selectedClient || state.newClientData.name,
      state.attendanceType,
      state.location || state.meetingLink
    ];
    
    return fields.filter(field => Boolean(field?.toString().trim())).length;
  },

  /**
   * Calcula progresso do formulário (0-100)
   */
  calculateProgress: (state: EventFormState): number => {
    const totalFields = 8;
    const filledFields = formUtils.countFilledFields(state);
    return Math.round((filledFields / totalFields) * 100);
  },

  /**
   * Verifica se o formulário está completo
   */
  isFormComplete: (state: EventFormState): boolean => {
    return formUtils.calculateProgress(state) === 100;
  },

  /**
   * Obtém próximo campo obrigatório vazio
   */
  getNextRequiredField: (state: EventFormState): string | null => {
    const requiredFields = [
      { key: 'summary', label: 'Título do evento' },
      { key: 'collaborator', label: 'Colaborador' },
      { key: 'selectedService', label: 'Serviço' },
      { key: 'startDateTime', label: 'Data e hora de início' },
      { key: 'endDateTime', label: 'Data e hora de fim' }
    ];
    
    for (const field of requiredFields) {
      const value = (state as any)[field.key];
      if (!value?.toString().trim()) {
        return field.label;
      }
    }
    
    return null;
  }
};

/**
 * Utilitários para cores e temas
 */
export const colorUtils = {
  /**
   * Converte cor hex para RGB
   */
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  /**
   * Verifica se uma cor é clara
   */
  isLightColor: (hex: string): boolean => {
    const rgb = colorUtils.hexToRgb(hex);
    if (!rgb) return false;
    
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128;
  },

  /**
   * Obtém cor de texto baseada no fundo
   */
  getTextColor: (backgroundColor: string): string => {
    return colorUtils.isLightColor(backgroundColor) ? '#000000' : '#FFFFFF';
  }
};

/**
 * Utilitários gerais
 */
export const generalUtils = {
  /**
   * Gera ID único
   */
  generateId: (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  /**
   * Debounce function
   */
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * Throttle function
   */
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Deep clone object
   */
  deepClone: <T>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj));
  },

  /**
   * Verifica se objeto está vazio
   */
  isEmpty: (obj: any): boolean => {
    return Object.keys(obj).length === 0;
  }
};