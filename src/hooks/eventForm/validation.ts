import { EventFormState } from '@/types/eventForm';
import { 
  validateForm as validateFormUtil, 
  validateNewClientData as validateNewClientDataUtil, 
  validateServiceSelection as validateServiceSelectionUtil, 
  validateDateTimeSelection as validateDateTimeSelectionUtil 
} from '@/utils/eventFormValidation';
import { ValidationResult, ValidationFunctions } from './types';

/**
 * Cria funções de validação para o formulário de eventos
 * @param state Estado atual do formulário
 * @returns Objeto com funções de validação
 */
export const createValidationFunctions = (state: EventFormState): ValidationFunctions => {
  
  /**
   * Valida o formulário completo
   */
  const validateForm = (): boolean => {
    return validateFormUtil(state);
  };

  /**
   * Valida dados de novo cliente
   */
  const validateNewClientData = (): boolean => {
    return validateNewClientDataUtil(state);
  };

  /**
   * Valida seleção de serviço
   */
  const validateServiceSelection = (): boolean => {
    return validateServiceSelectionUtil(state);
  };

  /**
   * Valida seleção de data e hora
   */
  const validateDateTimeSelection = (): boolean => {
    return validateDateTimeSelectionUtil(state);
  };

  return {
    validateForm,
    validateNewClientData,
    validateServiceSelection,
    validateDateTimeSelection,
  };
};

/**
 * Validações específicas com retorno detalhado
 */
export const detailedValidations = {
  /**
   * Valida informações básicas do evento
   */
  validateBasicInfo: (state: EventFormState): ValidationResult => {
    const errors: string[] = [];
    
    if (!state.summary?.trim()) {
      errors.push('Título do evento é obrigatório');
    }
    
    if (!state.collaborator?.trim()) {
      errors.push('Colaborador é obrigatório');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Valida informações do cliente
   */
  validateClientInfo: (state: EventFormState): ValidationResult => {
    const errors: string[] = [];
    
    if (!state.selectedClient && !state.isNewClient) {
      errors.push('Selecione um cliente ou cadastre um novo');
    }
    
    if (state.isNewClient) {
      if (!state.newClientData.name?.trim()) {
        errors.push('Nome do cliente é obrigatório');
      }
      
      if (!state.newClientData.email?.trim()) {
        errors.push('Email do cliente é obrigatório');
      } else if (!isValidEmail(state.newClientData.email)) {
        errors.push('Email inválido');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Valida informações do serviço
   */
  validateServiceInfo: (state: EventFormState): ValidationResult => {
    const errors: string[] = [];
    
    if (!state.selectedService?.trim()) {
      errors.push('Serviço é obrigatório');
    }
    
    if (!state.selectedDuration || state.selectedDuration <= 0) {
      errors.push('Duração deve ser maior que zero');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Valida informações de data e hora
   */
  validateDateTimeInfo: (state: EventFormState): ValidationResult => {
    const errors: string[] = [];
    
    if (!state.startDateTime) {
      errors.push('Data e hora de início são obrigatórias');
    }
    
    if (!state.endDateTime) {
      errors.push('Data e hora de fim são obrigatórias');
    }
    
    if (state.startDateTime && state.endDateTime) {
      const start = new Date(state.startDateTime);
      const end = new Date(state.endDateTime);
      
      if (start >= end) {
        errors.push('Data de fim deve ser posterior à data de início');
      }
      
      if (start < new Date()) {
        errors.push('Data de início não pode ser no passado');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Valida informações de atendimento
   */
  validateAttendanceInfo: (state: EventFormState): ValidationResult => {
    const errors: string[] = [];
    
    if (!state.attendanceType) {
      errors.push('Tipo de atendimento é obrigatório');
    }
    
    if (state.attendanceType === 'online' && !state.meetingLink?.trim()) {
      errors.push('Link da reunião é obrigatório para atendimento online');
    }
    
    if (state.attendanceType === 'presencial' && !state.location?.trim()) {
      errors.push('Localização é obrigatória para atendimento presencial');
    }
    
    if (state.meetingLink && !isValidUrl(state.meetingLink)) {
      errors.push('Link da reunião inválido');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Valida informações de bloqueio de data
   */
  validateBlockInfo: (state: EventFormState): ValidationResult => {
    const errors: string[] = [];
    
    if (state.isBlockingDate && !state.blockReason?.trim()) {
      errors.push('Motivo do bloqueio é obrigatório');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

/**
 * Utilitários de validação
 */
export const validationUtils = {
  /**
   * Valida formato de email
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Valida formato de URL
   */
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Valida formato de telefone brasileiro
   */
  isValidPhone: (phone: string): boolean => {
    const phoneRegex = /^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  },

  /**
   * Valida se uma data está no futuro
   */
  isFutureDate: (dateString: string): boolean => {
    const date = new Date(dateString);
    return date > new Date();
  },

  /**
   * Valida se uma duração é válida (em minutos)
   */
  isValidDuration: (duration: number): boolean => {
    return duration > 0 && duration <= 1440; // Máximo 24 horas
  },

  /**
   * Valida se um texto não está vazio
   */
  isNotEmpty: (text?: string): boolean => {
    return Boolean(text?.trim());
  },

  /**
   * Valida comprimento mínimo de texto
   */
  hasMinLength: (text: string, minLength: number): boolean => {
    return text.trim().length >= minLength;
  },

  /**
   * Valida comprimento máximo de texto
   */
  hasMaxLength: (text: string, maxLength: number): boolean => {
    return text.trim().length <= maxLength;
  }
};

// Exporta funções utilitárias individualmente para facilitar importação
export const { isValidEmail, isValidUrl, isValidPhone, isFutureDate, isValidDuration, isNotEmpty, hasMinLength, hasMaxLength } = validationUtils;

/**
 * Valida o formulário completo com retorno detalhado
 */
export const validateCompleteForm = (state: EventFormState): ValidationResult => {
  const allErrors: string[] = [];
  
  const basicValidation = detailedValidations.validateBasicInfo(state);
  const clientValidation = detailedValidations.validateClientInfo(state);
  const serviceValidation = detailedValidations.validateServiceInfo(state);
  const dateTimeValidation = detailedValidations.validateDateTimeInfo(state);
  const attendanceValidation = detailedValidations.validateAttendanceInfo(state);
  const blockValidation = detailedValidations.validateBlockInfo(state);
  
  allErrors.push(...basicValidation.errors);
  allErrors.push(...clientValidation.errors);
  allErrors.push(...serviceValidation.errors);
  allErrors.push(...dateTimeValidation.errors);
  allErrors.push(...attendanceValidation.errors);
  allErrors.push(...blockValidation.errors);
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
};