/**
 * Módulo de visualização hierárquica de agendas
 * 
 * Este módulo fornece uma implementação completa e modular para exibir agendas
 * organizadas hierarquicamente por categorias, com funcionalidades avançadas de
 * busca, filtro, ordenação e interação.
 */

// Componente principal
export { default as AgendaHierarchicalView } from './AgendaHierarchicalView';
export { AgendaHierarchicalView as AgendaHierarchicalViewRefactored } from './AgendaHierarchicalView';

// Componentes individuais
export {
  CategoryHeader,
  AgendaDetails,
  AgendaActions,
  AgendaItem,
  CategorySection,
  EmptyState,
  LoadingSkeleton,
} from './components';

// Hooks customizados
export {
  useAgendaHierarchy,
  useAgendaFilter,
  useAgendaSort,
  useAgendaSearch,
  useAgendaStats,
  useAgendaActions,
  useAgendaKeyboard,
  useAgendaExport,
  useAgendaHierarchyComplete,
} from './hooks';

// Utilitários
export {
  formatUtils,
  groupingUtils,
  filterUtils,
  sortUtils,
  categoryUtils,
  validationUtils,
  performanceUtils,
  accessibilityUtils,
  exportUtils,
  generalUtils,
} from './utils';

// Configurações e constantes
export {
  CATEGORY_CONFIG,
  DEFAULT_CATEGORY_CONFIG,
  CATEGORY_COLORS,
  SORT_OPTIONS,
  DISPLAY_MODES,
  FILTER_OPTIONS,
  PAGINATION_CONFIG,
  SEARCH_CONFIG,
  ANIMATION_CONFIG,
  RESPONSIVE_CONFIG,
  ACCESSIBILITY_CONFIG,
  EXPORT_CONFIG,
  CACHE_CONFIG,
  PERFORMANCE_CONFIG,
  THEME_CONFIG,
  MESSAGES,
  VALIDATION_CONFIG,
  FORMAT_CONFIG,
} from './config';

// Tipos e interfaces
export type {
  // Props dos componentes
  AgendaHierarchicalViewProps,
  CategoryHeaderProps,
  AgendaItemProps,
  CategorySectionProps,
  AgendaActionsProps,
  AgendaDetailsProps,
  EmptyStateProps,
  
  // Tipos de dados
  CategoryKey,
  CategoryConfig,
  CategoryConfigMap,
  GroupedAgendas,
  AgendaItem as AgendaItemType,
  AgendaStatistics,
  
  // Configurações
  FilterConfig,
  SortConfig,
  DisplayConfig,
  AccessibilityConfig,
  PerformanceConfig,
  ComponentContext,
  
  // Hooks
  UseAgendaHierarchyReturn,
  UseAgendaFilterReturn,
  UseAgendaSortReturn,
  UseAgendaSearchReturn,
  UseAgendaStatsReturn,
  UseAgendaActionsReturn,
  UseAgendaKeyboardReturn,
  UseAgendaExportReturn,
  
  // Configurações avançadas
  ThemeConfig,
  AnimationConfig,
  ResponsiveConfig,
  ExportConfig,
  ValidationResult,
  EventInfo,
  NewClientData,
  EventTag,
  EventFormConstants,
  EventHandlers,
  ValidationFunctions,
  HelperFunctions,
  UseEventFormDialogReturn,
  EventProcessor,
  ContactFilter,
  DurationConfig,
  AttendanceInfo,
  DateBlockInfo,
  EventStatus,
  FormTab,
} from './types';

// Re-exportações para compatibilidade com versão anterior
export { AgendaHierarchicalView as default } from './AgendaHierarchicalView';

// Constantes úteis
export const HIERARCHICAL_VIEW_VERSION = '2.0.0';
export const SUPPORTED_CATEGORIES = Object.keys(CATEGORY_CONFIG) as CategoryKey[];

// Funções de conveniência
export const createDefaultFilter = (): FilterConfig => ({});

export const createDefaultSort = (): SortConfig => ({
  field: 'title',
  direction: 'asc',
});

export const createDefaultDisplayConfig = (): DisplayConfig => ({
  compact: false,
  showActions: true,
  showCategoryCount: true,
  showEmptyCategories: false,
  itemsPerPage: 25,
  enableVirtualization: false,
});

export const createDefaultAccessibilityConfig = (): AccessibilityConfig => ({
  enableKeyboardNavigation: true,
  enableScreenReader: true,
  enableFocusManagement: true,
  announceChanges: true,
  highContrast: false,
  reducedMotion: false,
});

export const createDefaultPerformanceConfig = (): PerformanceConfig => ({
  enableMemoization: true,
  enableVirtualization: false,
  enableLazyLoading: true,
  debounceMs: 300,
  throttleMs: 100,
  cacheSize: 100,
});

// Validadores
export const isValidCategoryKey = (key: string): key is CategoryKey => {
  return categoryUtils.isCategoryValid(key);
};

export const isValidSortField = (field: string): field is SortConfig['field'] => {
  return ['title', 'category', 'duration', 'price'].includes(field);
};

export const isValidSortDirection = (direction: string): direction is SortConfig['direction'] => {
  return ['asc', 'desc'].includes(direction);
};

// Helpers para desenvolvimento
export const createMockAgenda = (overrides: Partial<LocalAgenda> = {}): LocalAgenda => {
  return {
    id: `agenda-${Math.random().toString(36).substr(2, 9)}`,
    title: 'Agenda de Exemplo',
    description: 'Descrição da agenda de exemplo',
    category: 'consulta',
    duration: 60,
    price: 100,
    maxParticipants: 1,
    breakTime: 15,
    ...overrides,
  };
};

export const createMockAgendas = (count: number = 5): LocalAgenda[] => {
  const categories: CategoryKey[] = ['consulta', 'evento', 'classes', 'workshop'];
  
  return Array.from({ length: count }, (_, index) => {
    const category = categories[index % categories.length];
    return createMockAgenda({
      id: `agenda-${index + 1}`,
      title: `Agenda ${index + 1}`,
      category,
      duration: 30 + (index * 15),
      price: 50 + (index * 25),
    });
  });
};

// Debugging helpers (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  (window as any).__AGENDA_HIERARCHICAL_DEBUG__ = {
    formatUtils,
    groupingUtils,
    filterUtils,
    sortUtils,
    categoryUtils,
    validationUtils,
    performanceUtils,
    accessibilityUtils,
    exportUtils,
    generalUtils,
    CATEGORY_CONFIG,
    createMockAgenda,
    createMockAgendas,
  };
}