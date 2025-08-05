import {
  Calendar,
  Clock,
  Users,
  Repeat,
  Settings,
  Star,
  Zap,
  Target,
} from 'lucide-react';
import { CategoryConfigMap, CategoryConfig } from './types';

/**
 * Configuração de categorias de agenda com ícones, cores e descrições
 */
export const CATEGORY_CONFIG: CategoryConfigMap = {
  consulta: {
    label: 'Consultas',
    icon: Calendar,
    color: 'bg-blue-100 text-blue-800',
    description: 'Agendamentos individuais para consultas',
  },
  evento: {
    label: 'Eventos',
    icon: Users,
    color: 'bg-green-100 text-green-800',
    description: 'Eventos com múltiplos participantes',
  },
  classes: {
    label: 'Classes',
    icon: Clock,
    color: 'bg-purple-100 text-purple-800',
    description: 'Aulas e sessões em grupo',
  },
  recorrente: {
    label: 'Recorrentes',
    icon: Repeat,
    color: 'bg-orange-100 text-orange-800',
    description: 'Agendamentos com recorrência',
  },
  workshop: {
    label: 'Workshops',
    icon: Zap,
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Workshops e treinamentos intensivos',
  },
  vip: {
    label: 'VIP',
    icon: Star,
    color: 'bg-pink-100 text-pink-800',
    description: 'Atendimentos premium e exclusivos',
  },
  mentoria: {
    label: 'Mentorias',
    icon: Target,
    color: 'bg-indigo-100 text-indigo-800',
    description: 'Sessões de mentoria e coaching',
  },
  outros: {
    label: 'Outros',
    icon: Settings,
    color: 'bg-gray-100 text-gray-800',
    description: 'Outras categorias',
  },
};

/**
 * Configuração padrão para categoria desconhecida
 */
export const DEFAULT_CATEGORY_CONFIG: CategoryConfig = {
  label: 'Outros',
  icon: Settings,
  color: 'bg-gray-100 text-gray-800',
  description: 'Categoria não especificada',
};

/**
 * Cores disponíveis para categorias
 */
export const CATEGORY_COLORS = {
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-800',
  purple: 'bg-purple-100 text-purple-800',
  orange: 'bg-orange-100 text-orange-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  pink: 'bg-pink-100 text-pink-800',
  indigo: 'bg-indigo-100 text-indigo-800',
  red: 'bg-red-100 text-red-800',
  gray: 'bg-gray-100 text-gray-800',
} as const;

/**
 * Configurações de ordenação
 */
export const SORT_OPTIONS = {
  name: {
    label: 'Nome',
    key: 'title' as const,
  },
  category: {
    label: 'Categoria',
    key: 'category' as const,
  },
  duration: {
    label: 'Duração',
    key: 'duration' as const,
  },
  price: {
    label: 'Preço',
    key: 'price' as const,
  },
} as const;

/**
 * Configurações de exibição
 */
export const DISPLAY_MODES = {
  compact: {
    label: 'Compacto',
    description: 'Exibição compacta com informações essenciais',
  },
  detailed: {
    label: 'Detalhado',
    description: 'Exibição completa com todas as informações',
  },
  grid: {
    label: 'Grade',
    description: 'Exibição em grade para melhor visualização',
  },
} as const;

/**
 * Configurações de filtro
 */
export const FILTER_OPTIONS = {
  categories: Object.keys(CATEGORY_CONFIG),
  durations: [
    { label: 'Até 30 min', value: 30 },
    { label: '30-60 min', value: 60 },
    { label: '60-120 min', value: 120 },
    { label: 'Mais de 120 min', value: 999 },
  ],
  prices: [
    { label: 'Gratuito', value: 0 },
    { label: 'Até R$ 50', value: 50 },
    { label: 'R$ 50-100', value: 100 },
    { label: 'R$ 100-200', value: 200 },
    { label: 'Mais de R$ 200', value: 999 },
  ],
} as const;

/**
 * Configurações de paginação
 */
export const PAGINATION_CONFIG = {
  itemsPerPage: {
    options: [10, 25, 50, 100],
    default: 25,
  },
  maxVisiblePages: 5,
} as const;

/**
 * Configurações de busca
 */
export const SEARCH_CONFIG = {
  debounceMs: 300,
  minLength: 2,
  placeholder: 'Buscar agendas...',
  fields: ['title', 'description', 'category'] as const,
} as const;

/**
 * Configurações de animação
 */
export const ANIMATION_CONFIG = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
  transitions: {
    accordion: 'all 0.3s ease-in-out',
    hover: 'all 0.2s ease-in-out',
    focus: 'all 0.15s ease-in-out',
  },
} as const;

/**
 * Configurações de responsividade
 */
export const RESPONSIVE_CONFIG = {
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
  columnsPerBreakpoint: {
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
  },
  gridGaps: {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  },
} as const;

/**
 * Configurações de acessibilidade
 */
export const ACCESSIBILITY_CONFIG = {
  ariaLabels: {
    categorySection: 'Seção de categoria de agendas',
    agendaItem: 'Item de agenda',
    editButton: 'Editar agenda',
    deleteButton: 'Excluir agenda',
    moreActions: 'Mais ações para agenda',
    expandCategory: 'Expandir categoria',
    collapseCategory: 'Recolher categoria',
    searchInput: 'Campo de busca de agendas',
    sortSelect: 'Selecionar ordenação',
    filterSelect: 'Selecionar filtro',
  },
  keyboardShortcuts: {
    search: 'Ctrl+F',
    expandAll: 'Ctrl+E',
    collapseAll: 'Ctrl+C',
    nextItem: 'ArrowDown',
    previousItem: 'ArrowUp',
    selectItem: 'Enter',
    editItem: 'F2',
    deleteItem: 'Delete',
  },
} as const;

/**
 * Configurações de exportação
 */
export const EXPORT_CONFIG = {
  formats: {
    json: {
      label: 'JSON',
      extension: '.json',
      mimeType: 'application/json',
    },
    csv: {
      label: 'CSV',
      extension: '.csv',
      mimeType: 'text/csv',
    },
    pdf: {
      label: 'PDF',
      extension: '.pdf',
      mimeType: 'application/pdf',
    },
  },
  filename: {
    prefix: 'agendas_',
    dateFormat: 'yyyy-MM-dd_HH-mm-ss',
  },
} as const;

/**
 * Configurações de cache
 */
export const CACHE_CONFIG = {
  ttl: 5 * 60 * 1000, // 5 minutos
  maxSize: 100,
  keys: {
    groupedAgendas: 'hierarchical_grouped_agendas',
    filteredAgendas: 'hierarchical_filtered_agendas',
    categoryStats: 'hierarchical_category_stats',
  },
} as const;

/**
 * Configurações de performance
 */
export const PERFORMANCE_CONFIG = {
  virtualization: {
    enabled: false,
    itemHeight: 120,
    overscan: 5,
  },
  lazyLoading: {
    enabled: true,
    threshold: 10,
    rootMargin: '100px',
  },
  debounce: {
    search: 300,
    filter: 200,
    resize: 100,
  },
} as const;

/**
 * Configurações de tema
 */
export const THEME_CONFIG = {
  colors: {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    accent: 'hsl(var(--accent))',
    muted: 'hsl(var(--muted))',
    destructive: 'hsl(var(--destructive))',
    border: 'hsl(var(--border))',
    background: 'hsl(var(--background))',
    foreground: 'hsl(var(--foreground))',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
} as const;

/**
 * Mensagens de erro e sucesso
 */
export const MESSAGES = {
  errors: {
    loadFailed: 'Erro ao carregar agendas',
    deleteFailed: 'Erro ao excluir agenda',
    updateFailed: 'Erro ao atualizar agenda',
    networkError: 'Erro de conexão',
    unknownError: 'Erro desconhecido',
  },
  success: {
    deleteSuccess: 'Agenda excluída com sucesso',
    updateSuccess: 'Agenda atualizada com sucesso',
    exportSuccess: 'Agendas exportadas com sucesso',
  },
  empty: {
    noAgendas: 'Nenhuma agenda encontrada',
    noResults: 'Nenhum resultado encontrado para sua busca',
    noCategory: 'Nenhuma agenda nesta categoria',
  },
  loading: {
    loadingAgendas: 'Carregando agendas...',
    deletingAgenda: 'Excluindo agenda...',
    exportingData: 'Exportando dados...',
  },
} as const;

/**
 * Configurações de validação
 */
export const VALIDATION_CONFIG = {
  agenda: {
    title: {
      minLength: 3,
      maxLength: 100,
      required: true,
    },
    description: {
      maxLength: 500,
      required: false,
    },
    duration: {
      min: 15,
      max: 480, // 8 horas
      required: true,
    },
    breakTime: {
      min: 0,
      max: 60,
      required: false,
    },
  },
} as const;

/**
 * Configurações de formatação
 */
export const FORMAT_CONFIG = {
  currency: {
    locale: 'pt-BR',
    currency: 'BRL',
    minimumFractionDigits: 2,
  },
  date: {
    locale: 'pt-BR',
    dateStyle: 'short' as const,
    timeStyle: 'short' as const,
  },
  number: {
    locale: 'pt-BR',
    maximumFractionDigits: 2,
  },
} as const;