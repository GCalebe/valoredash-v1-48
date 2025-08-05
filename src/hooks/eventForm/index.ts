// Tipos e interfaces
export * from './types';

// Processamento de eventos
export * from './eventProcessor';

// Validação
export * from './validation';

// Handlers de eventos
export * from './handlers';

// Utilitários
export * from './utils';

// Hooks principais
export * from './hooks';

// Re-exportações para compatibilidade
export {
  useEventFormDialog as default,
  useEventFormDialog,
  useEventFormValidation,
  useEventFormHandlers,
  useEventProcessor,
  useContactFilter,
  useEventFormConstants,
  useEventFormUtils,
  useEventFormClient,
  useEventFormService,
  useEventFormDateTime,
  useEventFormAttendance,
  useEventFormTags,
  useEventFormNavigation,
} from './hooks';

// Constantes comumente usadas
export {
  COLORS,
  SERVICES,
  COLLABORATORS,
  DURATIONS,
  ATTENDANCE_TYPES,
} from '@/constants/eventFormConstants';

// Utilitários específicos
export {
  contactUtils,
  dateTimeUtils,
  tagUtils,
  textUtils,
  formUtils,
  colorUtils,
  generalUtils,
} from './utils';

// Processadores específicos
export {
  createEventProcessor,
  eventProcessorUtils,
} from './eventProcessor';

// Validadores específicos
export {
  createValidationFunctions,
  detailedValidations,
  validationUtils,
  validateCompleteForm,
} from './validation';

// Handlers específicos
export {
  createEventHandlers,
  sectionHandlers,
  handlerUtils,
} from './handlers';

// Helpers específicos
export {
  createHelperFunctions,
} from './utils';

// Aliases para hooks mais usados
export {
  useEventFormDialog as useEventDialog,
  useEventFormValidation as useFormValidation,
  useEventFormHandlers as useFormHandlers,
  useEventFormClient as useClientForm,
  useEventFormService as useServiceForm,
  useEventFormDateTime as useDateTimeForm,
  useEventFormAttendance as useAttendanceForm,
  useEventFormTags as useTagsForm,
  useEventFormNavigation as useFormNavigation,
} from './hooks';

/**
 * Hook legado para compatibilidade com código existente
 * @deprecated Use useEventFormDialog from './hooks' instead
 */
export const useEventFormDialogLegacy = useEventFormDialog;

/**
 * Configuração padrão para o formulário de eventos
 */
export const DEFAULT_EVENT_FORM_CONFIG = {
  defaultTab: 'client' as const,
  defaultDuration: 60,
  defaultAttendanceType: 'presencial' as const,
  enableValidation: true,
  enableOptimisticUpdates: true,
  maxTags: 10,
  maxDescriptionLength: 500,
  dateFormat: 'yyyy-MM-dd HH:mm',
  timeZone: 'America/Sao_Paulo',
};

/**
 * Tipos de formulário disponíveis
 */
export const FORM_TYPES = {
  CREATE: 'create',
  EDIT: 'edit',
  VIEW: 'view',
  DUPLICATE: 'duplicate',
} as const;

/**
 * Estados do formulário
 */
export const FORM_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUBMITTING: 'submitting',
  SUCCESS: 'success',
  ERROR: 'error',
  VALIDATING: 'validating',
} as const;

/**
 * Prioridades de validação
 */
export const VALIDATION_PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

/**
 * Tipos de erro do formulário
 */
export const ERROR_TYPES = {
  VALIDATION: 'validation',
  NETWORK: 'network',
  SERVER: 'server',
  CLIENT: 'client',
  UNKNOWN: 'unknown',
} as const;

/**
 * Configurações de cache
 */
export const CACHE_CONFIG = {
  TTL: 5 * 60 * 1000, // 5 minutos
  MAX_SIZE: 100,
  ENABLE_PERSISTENCE: true,
  STORAGE_KEY: 'eventForm_cache',
} as const;

/**
 * Configurações de debounce
 */
export const DEBOUNCE_CONFIG = {
  SEARCH: 300,
  VALIDATION: 500,
  SAVE: 1000,
  API_CALL: 800,
} as const;

/**
 * Configurações de throttle
 */
export const THROTTLE_CONFIG = {
  SCROLL: 100,
  RESIZE: 250,
  MOUSE_MOVE: 50,
  KEY_PRESS: 200,
} as const;

/**
 * Mensagens de erro padrão
 */
export const DEFAULT_ERROR_MESSAGES = {
  REQUIRED_FIELD: 'Este campo é obrigatório',
  INVALID_EMAIL: 'Email inválido',
  INVALID_PHONE: 'Telefone inválido',
  INVALID_URL: 'URL inválida',
  INVALID_DATE: 'Data inválida',
  INVALID_TIME: 'Hora inválida',
  INVALID_DURATION: 'Duração inválida',
  TEXT_TOO_LONG: 'Texto muito longo',
  TEXT_TOO_SHORT: 'Texto muito curto',
  NETWORK_ERROR: 'Erro de conexão',
  SERVER_ERROR: 'Erro do servidor',
  UNKNOWN_ERROR: 'Erro desconhecido',
} as const;

/**
 * Mensagens de sucesso padrão
 */
export const DEFAULT_SUCCESS_MESSAGES = {
  EVENT_CREATED: 'Evento criado com sucesso',
  EVENT_UPDATED: 'Evento atualizado com sucesso',
  EVENT_DELETED: 'Evento excluído com sucesso',
  CLIENT_CREATED: 'Cliente criado com sucesso',
  FORM_SAVED: 'Formulário salvo com sucesso',
  VALIDATION_PASSED: 'Validação concluída com sucesso',
} as const;

/**
 * Configurações de acessibilidade
 */
export const ACCESSIBILITY_CONFIG = {
  ENABLE_KEYBOARD_NAVIGATION: true,
  ENABLE_SCREEN_READER: true,
  ENABLE_HIGH_CONTRAST: false,
  ENABLE_FOCUS_INDICATORS: true,
  ARIA_LABELS: {
    FORM: 'Formulário de evento',
    CLIENT_SECTION: 'Seção de cliente',
    SERVICE_SECTION: 'Seção de serviço',
    DATETIME_SECTION: 'Seção de data e hora',
    ATTENDANCE_SECTION: 'Seção de atendimento',
    TAGS_SECTION: 'Seção de tags',
    SUBMIT_BUTTON: 'Salvar evento',
    CANCEL_BUTTON: 'Cancelar',
    DELETE_BUTTON: 'Excluir evento',
  },
} as const;

/**
 * Configurações de performance
 */
export const PERFORMANCE_CONFIG = {
  ENABLE_MEMOIZATION: true,
  ENABLE_LAZY_LOADING: true,
  ENABLE_VIRTUAL_SCROLLING: false,
  BATCH_SIZE: 50,
  RENDER_THRESHOLD: 100,
  UPDATE_THRESHOLD: 10,
} as const;