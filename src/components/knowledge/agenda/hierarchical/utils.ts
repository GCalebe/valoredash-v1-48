import { LocalAgenda } from '@/types/LocalAgenda';
import {
  GroupedAgendas,
  CategoryConfig,
  AgendaStatistics,
  FilterConfig,
  SortConfig,
  AgendaItem,
  CategoryKey,
} from './types';
import {
  CATEGORY_CONFIG,
  DEFAULT_CATEGORY_CONFIG,
  FORMAT_CONFIG,
  SEARCH_CONFIG,
} from './config';

/**
 * Utilitários para formatação de dados
 */
export const formatUtils = {
  /**
   * Formata preço em moeda brasileira
   */
  formatPrice: (price: number | undefined): string => {
    if (price === undefined || price === null) return 'Gratuito';
    if (price === 0) return 'Gratuito';
    
    return new Intl.NumberFormat(FORMAT_CONFIG.currency.locale, {
      style: 'currency',
      currency: FORMAT_CONFIG.currency.currency,
      minimumFractionDigits: FORMAT_CONFIG.currency.minimumFractionDigits,
    }).format(price);
  },

  /**
   * Formata duração em minutos para texto legível
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
   * Formata número de participantes
   */
  formatParticipants: (max: number | undefined): string => {
    if (!max || max === 0) return 'Ilimitado';
    if (max === 1) return '1 pessoa';
    return `${max} pessoas`;
  },

  /**
   * Formata texto truncando se necessário
   */
  truncateText: (text: string, maxLength: number = 100): string => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  },

  /**
   * Formata categoria para exibição
   */
  formatCategory: (category: string): string => {
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  },
};

/**
 * Utilitários para agrupamento de agendas
 */
export const groupingUtils = {
  /**
   * Agrupa agendas por categoria
   */
  groupAgendasByCategory: (agendas: LocalAgenda[]): GroupedAgendas => {
    const grouped: GroupedAgendas = {};
    
    agendas.forEach((agenda) => {
      const category = (agenda.category || 'outros') as CategoryKey;
      
      if (!grouped[category]) {
        grouped[category] = [];
      }
      
      grouped[category].push({
        ...agenda,
        category,
      });
    });
    
    // Ordena agendas dentro de cada categoria por título
    Object.keys(grouped).forEach((category) => {
      grouped[category as CategoryKey].sort((a, b) => 
        a.title.localeCompare(b.title, 'pt-BR')
      );
    });
    
    return grouped;
  },

  /**
   * Obtém estatísticas das agendas agrupadas
   */
  getAgendaStatistics: (grouped: GroupedAgendas): AgendaStatistics => {
    const stats: AgendaStatistics = {
      totalAgendas: 0,
      categoriesCount: 0,
      averageDuration: 0,
      totalRevenue: 0,
      categoryBreakdown: {},
    };
    
    let totalDuration = 0;
    let totalRevenue = 0;
    
    Object.entries(grouped).forEach(([category, agendas]) => {
      const categoryKey = category as CategoryKey;
      stats.categoriesCount++;
      stats.totalAgendas += agendas.length;
      
      const categoryDuration = agendas.reduce((sum, agenda) => sum + (agenda.duration || 0), 0);
      const categoryRevenue = agendas.reduce((sum, agenda) => sum + (agenda.price || 0), 0);
      
      totalDuration += categoryDuration;
      totalRevenue += categoryRevenue;
      
      stats.categoryBreakdown[categoryKey] = {
        count: agendas.length,
        averageDuration: agendas.length > 0 ? categoryDuration / agendas.length : 0,
        totalRevenue: categoryRevenue,
        averagePrice: agendas.length > 0 ? categoryRevenue / agendas.length : 0,
      };
    });
    
    stats.averageDuration = stats.totalAgendas > 0 ? totalDuration / stats.totalAgendas : 0;
    stats.totalRevenue = totalRevenue;
    
    return stats;
  },
};

/**
 * Utilitários para filtragem de agendas
 */
export const filterUtils = {
  /**
   * Filtra agendas agrupadas por termo de busca
   */
  filterGroupedAgendas: (
    grouped: GroupedAgendas,
    searchTerm: string,
    filterConfig?: FilterConfig
  ): GroupedAgendas => {
    if (!searchTerm.trim() && !filterConfig) return grouped;
    
    const filtered: GroupedAgendas = {};
    const normalizedSearch = searchTerm.toLowerCase().trim();
    
    Object.entries(grouped).forEach(([category, agendas]) => {
      const categoryKey = category as CategoryKey;
      
      // Aplica filtro de categoria se especificado
      if (filterConfig?.categories && filterConfig.categories.length > 0) {
        if (!filterConfig.categories.includes(categoryKey)) {
          return;
        }
      }
      
      const filteredAgendas = agendas.filter((agenda) => {
        // Filtro por termo de busca
        if (normalizedSearch) {
          const matchesSearch = SEARCH_CONFIG.fields.some(field => {
            const value = agenda[field];
            return value && value.toString().toLowerCase().includes(normalizedSearch);
          });
          
          if (!matchesSearch) return false;
        }
        
        // Filtro por duração
        if (filterConfig?.duration) {
          const duration = agenda.duration || 0;
          if (filterConfig.duration.min && duration < filterConfig.duration.min) return false;
          if (filterConfig.duration.max && duration > filterConfig.duration.max) return false;
        }
        
        // Filtro por preço
        if (filterConfig?.price) {
          const price = agenda.price || 0;
          if (filterConfig.price.min !== undefined && price < filterConfig.price.min) return false;
          if (filterConfig.price.max !== undefined && price > filterConfig.price.max) return false;
        }
        
        // Filtro por participantes
        if (filterConfig?.maxParticipants) {
          const maxParticipants = agenda.maxParticipants || 0;
          if (filterConfig.maxParticipants.min && maxParticipants < filterConfig.maxParticipants.min) return false;
          if (filterConfig.maxParticipants.max && maxParticipants > filterConfig.maxParticipants.max) return false;
        }
        
        return true;
      });
      
      if (filteredAgendas.length > 0) {
        filtered[categoryKey] = filteredAgendas;
      }
    });
    
    return filtered;
  },

  /**
   * Verifica se há resultados de busca em uma categoria
   */
  hasSearchResults: (agendas: AgendaItem[], searchTerm: string): boolean => {
    if (!searchTerm.trim()) return false;
    
    const normalizedSearch = searchTerm.toLowerCase().trim();
    return agendas.some(agenda => 
      SEARCH_CONFIG.fields.some(field => {
        const value = agenda[field];
        return value && value.toString().toLowerCase().includes(normalizedSearch);
      })
    );
  },
};

/**
 * Utilitários para ordenação de agendas
 */
export const sortUtils = {
  /**
   * Ordena agendas agrupadas
   */
  sortGroupedAgendas: (
    grouped: GroupedAgendas,
    sortConfig: SortConfig
  ): GroupedAgendas => {
    const sorted: GroupedAgendas = {};
    
    Object.entries(grouped).forEach(([category, agendas]) => {
      const categoryKey = category as CategoryKey;
      const sortedAgendas = [...agendas].sort((a, b) => {
        const { field, direction } = sortConfig;
        
        let aValue: any = a[field];
        let bValue: any = b[field];
        
        // Tratamento especial para diferentes tipos de campos
        if (field === 'price') {
          aValue = aValue || 0;
          bValue = bValue || 0;
        } else if (field === 'duration') {
          aValue = aValue || 0;
          bValue = bValue || 0;
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        let comparison = 0;
        if (aValue < bValue) comparison = -1;
        else if (aValue > bValue) comparison = 1;
        
        return direction === 'desc' ? -comparison : comparison;
      });
      
      sorted[categoryKey] = sortedAgendas;
    });
    
    return sorted;
  },

  /**
   * Ordena categorias por critério específico
   */
  sortCategories: (
    categories: CategoryKey[],
    grouped: GroupedAgendas,
    sortBy: 'name' | 'count' | 'alphabetical' = 'alphabetical'
  ): CategoryKey[] => {
    return [...categories].sort((a, b) => {
      switch (sortBy) {
        case 'count':
          return (grouped[b]?.length || 0) - (grouped[a]?.length || 0);
        case 'name':
          const configA = CATEGORY_CONFIG[a] || DEFAULT_CATEGORY_CONFIG;
          const configB = CATEGORY_CONFIG[b] || DEFAULT_CATEGORY_CONFIG;
          return configA.label.localeCompare(configB.label, 'pt-BR');
        case 'alphabetical':
        default:
          return a.localeCompare(b, 'pt-BR');
      }
    });
  },
};

/**
 * Utilitários para configuração de categorias
 */
export const categoryUtils = {
  /**
   * Obtém configuração de uma categoria
   */
  getCategoryConfig: (category: string): CategoryConfig => {
    return CATEGORY_CONFIG[category as CategoryKey] || DEFAULT_CATEGORY_CONFIG;
  },

  /**
   * Obtém máximo de participantes de uma agenda
   */
  getMaxParticipants: (agenda: LocalAgenda): number => {
    return agenda.maxParticipants || 0;
  },

  /**
   * Verifica se uma categoria existe
   */
  isCategoryValid: (category: string): category is CategoryKey => {
    return category in CATEGORY_CONFIG;
  },

  /**
   * Obtém todas as categorias disponíveis
   */
  getAllCategories: (): CategoryKey[] => {
    return Object.keys(CATEGORY_CONFIG) as CategoryKey[];
  },

  /**
   * Obtém categorias com agendas
   */
  getCategoriesWithAgendas: (grouped: GroupedAgendas): CategoryKey[] => {
    return Object.keys(grouped).filter(category => 
      grouped[category as CategoryKey].length > 0
    ) as CategoryKey[];
  },
};

/**
 * Utilitários para validação
 */
export const validationUtils = {
  /**
   * Valida se uma agenda é válida
   */
  isValidAgenda: (agenda: any): agenda is LocalAgenda => {
    return (
      agenda &&
      typeof agenda === 'object' &&
      typeof agenda.id === 'string' &&
      typeof agenda.title === 'string' &&
      agenda.title.trim().length > 0
    );
  },

  /**
   * Valida configuração de filtro
   */
  isValidFilterConfig: (config: any): config is FilterConfig => {
    if (!config || typeof config !== 'object') return false;
    
    // Validação opcional de categorias
    if (config.categories && !Array.isArray(config.categories)) return false;
    
    // Validação opcional de duração
    if (config.duration) {
      if (typeof config.duration !== 'object') return false;
      if (config.duration.min !== undefined && typeof config.duration.min !== 'number') return false;
      if (config.duration.max !== undefined && typeof config.duration.max !== 'number') return false;
    }
    
    // Validação opcional de preço
    if (config.price) {
      if (typeof config.price !== 'object') return false;
      if (config.price.min !== undefined && typeof config.price.min !== 'number') return false;
      if (config.price.max !== undefined && typeof config.price.max !== 'number') return false;
    }
    
    return true;
  },

  /**
   * Valida configuração de ordenação
   */
  isValidSortConfig: (config: any): config is SortConfig => {
    return (
      config &&
      typeof config === 'object' &&
      typeof config.field === 'string' &&
      ['title', 'category', 'duration', 'price'].includes(config.field) &&
      typeof config.direction === 'string' &&
      ['asc', 'desc'].includes(config.direction)
    );
  },
};

/**
 * Utilitários para performance
 */
export const performanceUtils = {
  /**
   * Debounce para otimizar chamadas frequentes
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
   * Throttle para limitar frequência de execução
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
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Memoização simples para cache de resultados
   */
  memoize: <T extends (...args: any[]) => any>(
    func: T,
    keyGenerator?: (...args: Parameters<T>) => string
  ): T => {
    const cache = new Map<string, ReturnType<T>>();
    
    return ((...args: Parameters<T>): ReturnType<T> => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key)!;
      }
      
      const result = func(...args);
      cache.set(key, result);
      
      return result;
    }) as T;
  },
};

/**
 * Utilitários para acessibilidade
 */
export const accessibilityUtils = {
  /**
   * Gera ID único para elementos
   */
  generateId: (prefix: string = 'agenda'): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Gera aria-label para categoria
   */
  getCategoryAriaLabel: (category: CategoryKey, count: number): string => {
    const config = categoryUtils.getCategoryConfig(category);
    return `${config.label}: ${count} ${count === 1 ? 'agenda' : 'agendas'}`;
  },

  /**
   * Gera aria-label para agenda
   */
  getAgendaAriaLabel: (agenda: AgendaItem): string => {
    const parts = [agenda.title];
    
    if (agenda.duration) {
      parts.push(`duração ${formatUtils.formatDuration(agenda.duration)}`);
    }
    
    if (agenda.price !== undefined) {
      parts.push(`preço ${formatUtils.formatPrice(agenda.price)}`);
    }
    
    return parts.join(', ');
  },

  /**
   * Verifica se elemento está visível
   */
  isElementVisible: (element: HTMLElement): boolean => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },
};

/**
 * Utilitários para exportação
 */
export const exportUtils = {
  /**
   * Converte agendas para CSV
   */
  toCSV: (agendas: LocalAgenda[]): string => {
    const headers = ['ID', 'Título', 'Categoria', 'Duração (min)', 'Preço', 'Máx. Participantes', 'Descrição'];
    const rows = agendas.map(agenda => [
      agenda.id,
      agenda.title,
      agenda.category || 'outros',
      agenda.duration || 0,
      agenda.price || 0,
      agenda.maxParticipants || 0,
      (agenda.description || '').replace(/"/g, '""'), // Escape aspas duplas
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    return csvContent;
  },

  /**
   * Converte agendas para JSON
   */
  toJSON: (agendas: LocalAgenda[]): string => {
    return JSON.stringify(agendas, null, 2);
  },

  /**
   * Gera nome de arquivo para exportação
   */
  generateFilename: (format: string, prefix: string = 'agendas'): string => {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
    return `${prefix}_${timestamp}.${format}`;
  },

  /**
   * Baixa arquivo
   */
  downloadFile: (content: string, filename: string, mimeType: string): void => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  },
};

/**
 * Utilitários gerais
 */
export const generalUtils = {
  /**
   * Clona objeto profundamente
   */
  deepClone: <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
    if (obj instanceof Array) return obj.map(item => generalUtils.deepClone(item)) as unknown as T;
    if (typeof obj === 'object') {
      const cloned = {} as T;
      Object.keys(obj).forEach(key => {
        (cloned as any)[key] = generalUtils.deepClone((obj as any)[key]);
      });
      return cloned;
    }
    return obj;
  },

  /**
   * Verifica se dois objetos são iguais
   */
  isEqual: (a: any, b: any): boolean => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;
    
    if (typeof a === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      
      if (keysA.length !== keysB.length) return false;
      
      return keysA.every(key => generalUtils.isEqual(a[key], b[key]));
    }
    
    return false;
  },

  /**
   * Remove propriedades undefined de um objeto
   */
  removeUndefined: <T extends Record<string, any>>(obj: T): Partial<T> => {
    const result: Partial<T> = {};
    
    Object.keys(obj).forEach(key => {
      if (obj[key] !== undefined) {
        result[key as keyof T] = obj[key];
      }
    });
    
    return result;
  },

  /**
   * Converte string para slug
   */
  toSlug: (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .trim();
  },
};