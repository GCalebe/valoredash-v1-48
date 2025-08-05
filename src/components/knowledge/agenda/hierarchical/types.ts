import { LucideIcon } from 'lucide-react';
import { LocalAgenda } from '../tabs/AgendaTab';
import { Agenda } from '@/hooks/useAgendas';

/**
 * Props para o componente AgendaHierarchicalView
 */
export interface AgendaHierarchicalViewProps {
  agendas: LocalAgenda[];
  onEdit: (agenda: LocalAgenda) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
  searchTerm?: string;
  supabaseAgendas?: Agenda[];
}

/**
 * Configuração de categoria de agenda
 */
export interface CategoryConfig {
  label: string;
  icon: LucideIcon;
  color: string;
  description: string;
}

/**
 * Mapeamento de categorias para configurações
 */
export type CategoryConfigMap = Record<string, CategoryConfig>;

/**
 * Agendas agrupadas por categoria
 */
export type GroupedAgendas = Map<string, LocalAgenda[]>;

/**
 * Props para o item de agenda
 */
export interface AgendaItemProps {
  agenda: LocalAgenda;
  onEdit: (agenda: LocalAgenda) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
  formatPrice: (agendaId: string) => string;
  getMaxParticipants: (agendaId: string) => number;
}

/**
 * Props para a seção de categoria
 */
export interface CategorySectionProps {
  category: string;
  agendas: LocalAgenda[];
  config: CategoryConfig;
  onEdit: (agenda: LocalAgenda) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
  formatPrice: (agendaId: string) => string;
  getMaxParticipants: (agendaId: string) => number;
}

/**
 * Props para o cabeçalho da categoria
 */
export interface CategoryHeaderProps {
  config: CategoryConfig;
  count: number;
}

/**
 * Props para os detalhes da agenda
 */
export interface AgendaDetailsProps {
  agenda: LocalAgenda;
  formatPrice: (agendaId: string) => string;
  getMaxParticipants: (agendaId: string) => number;
}

/**
 * Props para as ações da agenda
 */
export interface AgendaActionsProps {
  agenda: LocalAgenda;
  onEdit: (agenda: LocalAgenda) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

/**
 * Props para o estado vazio
 */
export interface EmptyStateProps {
  searchTerm?: string;
}

/**
 * Configurações de filtro
 */
export interface FilterConfig {
  searchTerm: string;
  categories?: string[];
  sortBy?: 'name' | 'category' | 'duration' | 'price';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Resultado do filtro
 */
export interface FilterResult {
  filteredGroups: GroupedAgendas;
  totalCount: number;
  categoryCount: number;
}

/**
 * Configurações de exibição
 */
export interface DisplayConfig {
  showDescription: boolean;
  showPrice: boolean;
  showDuration: boolean;
  showMaxParticipants: boolean;
  showBreakTime: boolean;
  compactMode: boolean;
}

/**
 * Configurações de acessibilidade
 */
export interface AccessibilityConfig {
  enableKeyboardNavigation: boolean;
  enableScreenReader: boolean;
  ariaLabels: {
    categorySection: string;
    agendaItem: string;
    editButton: string;
    deleteButton: string;
    moreActions: string;
  };
}

/**
 * Configurações de performance
 */
export interface PerformanceConfig {
  enableVirtualization: boolean;
  itemsPerPage: number;
  lazyLoadThreshold: number;
  debounceSearchMs: number;
}

/**
 * Contexto do componente
 */
export interface AgendaHierarchicalContext {
  agendas: LocalAgenda[];
  supabaseAgendas: Agenda[];
  searchTerm: string;
  expandedCategories: string[];
  displayConfig: DisplayConfig;
  filterConfig: FilterConfig;
  setExpandedCategories: (categories: string[]) => void;
  setDisplayConfig: (config: Partial<DisplayConfig>) => void;
  setFilterConfig: (config: Partial<FilterConfig>) => void;
}

/**
 * Hook de retorno para gerenciamento de agendas
 */
export interface UseAgendaHierarchicalReturn {
  groupedAgendas: GroupedAgendas;
  filteredGroups: GroupedAgendas;
  expandedCategories: string[];
  categoryConfigs: CategoryConfigMap;
  formatPrice: (agendaId: string) => string;
  getMaxParticipants: (agendaId: string) => number;
  getCategoryConfig: (category: string) => CategoryConfig;
  handleAccordionChange: (value: string[]) => void;
  handleSearch: (term: string) => void;
  handleSort: (sortBy: FilterConfig['sortBy'], sortOrder: FilterConfig['sortOrder']) => void;
  totalCount: number;
  categoryCount: number;
}

/**
 * Estatísticas das agendas
 */
export interface AgendaStats {
  totalAgendas: number;
  categoriesCount: number;
  averageDuration: number;
  totalRevenue: number;
  mostPopularCategory: string;
  categoryDistribution: Record<string, number>;
}

/**
 * Configurações de tema
 */
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    muted: string;
    destructive: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
}

/**
 * Configurações de animação
 */
export interface AnimationConfig {
  duration: {
    fast: number;
    normal: number;
    slow: number;
  };
  easing: {
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
  enableAnimations: boolean;
}

/**
 * Configurações de responsividade
 */
export interface ResponsiveConfig {
  breakpoints: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  columnsPerBreakpoint: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

/**
 * Configurações de exportação
 */
export interface ExportConfig {
  formats: ('json' | 'csv' | 'pdf')[];
  includeMetadata: boolean;
  includeStats: boolean;
}

/**
 * Configurações completas do componente
 */
export interface AgendaHierarchicalConfig {
  display: DisplayConfig;
  accessibility: AccessibilityConfig;
  performance: PerformanceConfig;
  theme: ThemeConfig;
  animation: AnimationConfig;
  responsive: ResponsiveConfig;
  export: ExportConfig;
}

/**
 * Constantes padrão
 */
export const DEFAULT_DISPLAY_CONFIG: DisplayConfig = {
  showDescription: true,
  showPrice: true,
  showDuration: true,
  showMaxParticipants: true,
  showBreakTime: true,
  compactMode: false,
};

export const DEFAULT_FILTER_CONFIG: FilterConfig = {
  searchTerm: '',
  sortBy: 'name',
  sortOrder: 'asc',
};

export const DEFAULT_ACCESSIBILITY_CONFIG: AccessibilityConfig = {
  enableKeyboardNavigation: true,
  enableScreenReader: true,
  ariaLabels: {
    categorySection: 'Seção de categoria',
    agendaItem: 'Item de agenda',
    editButton: 'Editar agenda',
    deleteButton: 'Excluir agenda',
    moreActions: 'Mais ações',
  },
};

export const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  enableVirtualization: false,
  itemsPerPage: 50,
  lazyLoadThreshold: 10,
  debounceSearchMs: 300,
};