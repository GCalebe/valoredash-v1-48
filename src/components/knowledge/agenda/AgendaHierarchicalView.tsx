/**
 * AgendaHierarchicalView - Wrapper de compatibilidade
 * 
 * Este arquivo mantém a compatibilidade com a versão anterior do componente,
 * importando a implementação refatorada do módulo hierarchical.
 * 
 * @deprecated Use a importação direta do módulo hierarchical para novos desenvolvimentos:
 * import { AgendaHierarchicalView } from './hierarchical';
 */

// Importa a implementação refatorada
export { default } from './hierarchical';
export type { AgendaHierarchicalViewProps } from './hierarchical';

// Re-exporta componentes e utilitários para compatibilidade
export {
  CategoryHeader,
  AgendaDetails,
  AgendaActions,
  AgendaItem,
  CategorySection,
  EmptyState,
  LoadingSkeleton,
  useAgendaHierarchy,
  useAgendaFilter,
  useAgendaSort,
  useAgendaSearch,
  useAgendaStats,
  useAgendaActions,
  useAgendaKeyboard,
  useAgendaExport,
  useAgendaHierarchyComplete,
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
} from './hierarchical';