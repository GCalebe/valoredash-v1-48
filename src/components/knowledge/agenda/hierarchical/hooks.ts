import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { LocalAgenda } from '@/types/LocalAgenda';
import {
  GroupedAgendas,
  FilterConfig,
  SortConfig,
  AgendaStatistics,
  CategoryKey,
  UseAgendaHierarchyReturn,
  UseAgendaFilterReturn,
  UseAgendaSortReturn,
  UseAgendaSearchReturn,
  UseAgendaStatsReturn,
  UseAgendaActionsReturn,
  UseAgendaKeyboardReturn,
  UseAgendaExportReturn,
} from './types';
import {
  groupingUtils,
  filterUtils,
  sortUtils,
  categoryUtils,
  performanceUtils,
  accessibilityUtils,
  exportUtils,
} from './utils';
import { SEARCH_CONFIG, PERFORMANCE_CONFIG } from './config';

/**
 * Hook principal para gerenciar a hierarquia de agendas
 */
export const useAgendaHierarchy = (
  agendas: LocalAgenda[],
  initialExpanded: string[] = []
): UseAgendaHierarchyReturn => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(initialExpanded)
  );

  // Agrupa agendas por categoria
  const groupedAgendas = useMemo(() => {
    return groupingUtils.groupAgendasByCategory(agendas);
  }, [agendas]);

  // Obtém categorias disponíveis
  const availableCategories = useMemo(() => {
    return categoryUtils.getCategoriesWithAgendas(groupedAgendas);
  }, [groupedAgendas]);

  // Funções para controlar expansão
  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedCategories(new Set(availableCategories));
  }, [availableCategories]);

  const collapseAll = useCallback(() => {
    setExpandedCategories(new Set());
  }, []);

  const isCategoryExpanded = useCallback((category: string) => {
    return expandedCategories.has(category);
  }, [expandedCategories]);

  return {
    groupedAgendas,
    availableCategories,
    expandedCategories: Array.from(expandedCategories),
    toggleCategory,
    expandAll,
    collapseAll,
    isCategoryExpanded,
  };
};

/**
 * Hook para gerenciar filtros de agendas
 */
export const useAgendaFilter = (
  groupedAgendas: GroupedAgendas,
  initialFilter?: FilterConfig
): UseAgendaFilterReturn => {
  const [filterConfig, setFilterConfig] = useState<FilterConfig | undefined>(initialFilter);
  const [isFilterActive, setIsFilterActive] = useState(false);

  // Aplica filtros
  const filteredAgendas = useMemo(() => {
    if (!filterConfig) return groupedAgendas;
    
    const filtered = filterUtils.filterGroupedAgendas(groupedAgendas, '', filterConfig);
    setIsFilterActive(Object.keys(filtered).length !== Object.keys(groupedAgendas).length);
    
    return filtered;
  }, [groupedAgendas, filterConfig]);

  // Funções de controle de filtro
  const updateFilter = useCallback((newFilter: Partial<FilterConfig>) => {
    setFilterConfig(prev => ({ ...prev, ...newFilter }));
  }, []);

  const clearFilter = useCallback(() => {
    setFilterConfig(undefined);
    setIsFilterActive(false);
  }, []);

  const setCategories = useCallback((categories: CategoryKey[]) => {
    updateFilter({ categories });
  }, [updateFilter]);

  const setDurationRange = useCallback((min?: number, max?: number) => {
    updateFilter({ duration: { min, max } });
  }, [updateFilter]);

  const setPriceRange = useCallback((min?: number, max?: number) => {
    updateFilter({ price: { min, max } });
  }, [updateFilter]);

  return {
    filteredAgendas,
    filterConfig,
    isFilterActive,
    updateFilter,
    clearFilter,
    setCategories,
    setDurationRange,
    setPriceRange,
  };
};

/**
 * Hook para gerenciar ordenação de agendas
 */
export const useAgendaSort = (
  groupedAgendas: GroupedAgendas,
  initialSort: SortConfig = { field: 'title', direction: 'asc' }
): UseAgendaSortReturn => {
  const [sortConfig, setSortConfig] = useState<SortConfig>(initialSort);

  // Aplica ordenação
  const sortedAgendas = useMemo(() => {
    return sortUtils.sortGroupedAgendas(groupedAgendas, sortConfig);
  }, [groupedAgendas, sortConfig]);

  // Funções de controle de ordenação
  const updateSort = useCallback((field: SortConfig['field'], direction?: SortConfig['direction']) => {
    setSortConfig(prev => ({
      field,
      direction: direction || (prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'),
    }));
  }, []);

  const toggleSortDirection = useCallback(() => {
    setSortConfig(prev => ({
      ...prev,
      direction: prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  return {
    sortedAgendas,
    sortConfig,
    updateSort,
    toggleSortDirection,
  };
};

/**
 * Hook para gerenciar busca de agendas
 */
export const useAgendaSearch = (
  groupedAgendas: GroupedAgendas,
  debounceMs: number = SEARCH_CONFIG.debounceMs
): UseAgendaSearchReturn => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce da busca
  const debouncedSetSearch = useMemo(
    () => performanceUtils.debounce(setDebouncedSearchTerm, debounceMs),
    [debounceMs]
  );

  // Atualiza termo de busca com debounce
  useEffect(() => {
    debouncedSetSearch(searchTerm);
  }, [searchTerm, debouncedSetSearch]);

  // Aplica busca
  const searchResults = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return groupedAgendas;
    
    return filterUtils.filterGroupedAgendas(groupedAgendas, debouncedSearchTerm);
  }, [groupedAgendas, debouncedSearchTerm]);

  // Verifica se há resultados
  const hasResults = useMemo(() => {
    return Object.keys(searchResults).length > 0;
  }, [searchResults]);

  // Conta total de resultados
  const totalResults = useMemo(() => {
    return Object.values(searchResults).reduce((sum, agendas) => sum + agendas.length, 0);
  }, [searchResults]);

  // Funções de controle
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  }, []);

  const focusSearch = useCallback(() => {
    searchInputRef.current?.focus();
  }, []);

  return {
    searchTerm,
    debouncedSearchTerm,
    searchResults,
    hasResults,
    totalResults,
    searchInputRef,
    setSearchTerm,
    clearSearch,
    focusSearch,
  };
};

/**
 * Hook para estatísticas de agendas
 */
export const useAgendaStats = (
  groupedAgendas: GroupedAgendas
): UseAgendaStatsReturn => {
  // Calcula estatísticas
  const statistics = useMemo(() => {
    return groupingUtils.getAgendaStatistics(groupedAgendas);
  }, [groupedAgendas]);

  // Estatísticas derivadas
  const derivedStats = useMemo(() => {
    const { totalAgendas, totalRevenue, averageDuration } = statistics;
    
    return {
      averagePrice: totalAgendas > 0 ? totalRevenue / totalAgendas : 0,
      totalDuration: totalAgendas * averageDuration,
      revenuePerHour: averageDuration > 0 ? (totalRevenue / (averageDuration / 60)) : 0,
      mostPopularCategory: Object.entries(statistics.categoryBreakdown)
        .sort(([, a], [, b]) => b.count - a.count)[0]?.[0] as CategoryKey,
      highestRevenueCategory: Object.entries(statistics.categoryBreakdown)
        .sort(([, a], [, b]) => b.totalRevenue - a.totalRevenue)[0]?.[0] as CategoryKey,
    };
  }, [statistics]);

  return {
    statistics,
    derivedStats,
  };
};

/**
 * Hook para ações de agendas (editar, excluir, etc.)
 */
export const useAgendaActions = (
  onEdit?: (agenda: LocalAgenda) => void,
  onDelete?: (agenda: LocalAgenda) => void
): UseAgendaActionsReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ação de editar
  const handleEdit = useCallback(async (agenda: LocalAgenda) => {
    if (!onEdit) return;
    
    try {
      setIsLoading(true);
      setError(null);
      await onEdit(agenda);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao editar agenda');
    } finally {
      setIsLoading(false);
    }
  }, [onEdit]);

  // Ação de excluir
  const handleDelete = useCallback(async (agenda: LocalAgenda) => {
    if (!onDelete) return;
    
    try {
      setIsLoading(true);
      setError(null);
      await onDelete(agenda);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir agenda');
    } finally {
      setIsLoading(false);
    }
  }, [onDelete]);

  // Limpa erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    handleEdit,
    handleDelete,
    clearError,
  };
};

/**
 * Hook para navegação por teclado
 */
export const useAgendaKeyboard = (
  groupedAgendas: GroupedAgendas,
  onEdit?: (agenda: LocalAgenda) => void,
  onDelete?: (agenda: LocalAgenda) => void
): UseAgendaKeyboardReturn => {
  const [focusedItem, setFocusedItem] = useState<string | null>(null);
  const [focusedCategory, setFocusedCategory] = useState<string | null>(null);

  // Obtém todas as agendas em ordem
  const allAgendas = useMemo(() => {
    const agendas: Array<{ agenda: LocalAgenda; category: string }> = [];
    
    Object.entries(groupedAgendas).forEach(([category, categoryAgendas]) => {
      categoryAgendas.forEach(agenda => {
        agendas.push({ agenda, category });
      });
    });
    
    return agendas;
  }, [groupedAgendas]);

  // Navega para próximo item
  const focusNext = useCallback(() => {
    if (!focusedItem) {
      if (allAgendas.length > 0) {
        setFocusedItem(allAgendas[0].agenda.id);
        setFocusedCategory(allAgendas[0].category);
      }
      return;
    }
    
    const currentIndex = allAgendas.findIndex(item => item.agenda.id === focusedItem);
    if (currentIndex < allAgendas.length - 1) {
      const nextItem = allAgendas[currentIndex + 1];
      setFocusedItem(nextItem.agenda.id);
      setFocusedCategory(nextItem.category);
    }
  }, [focusedItem, allAgendas]);

  // Navega para item anterior
  const focusPrevious = useCallback(() => {
    if (!focusedItem) return;
    
    const currentIndex = allAgendas.findIndex(item => item.agenda.id === focusedItem);
    if (currentIndex > 0) {
      const previousItem = allAgendas[currentIndex - 1];
      setFocusedItem(previousItem.agenda.id);
      setFocusedCategory(previousItem.category);
    }
  }, [focusedItem, allAgendas]);

  // Executa ação no item focado
  const executeAction = useCallback((action: 'edit' | 'delete') => {
    if (!focusedItem) return;
    
    const focusedAgenda = allAgendas.find(item => item.agenda.id === focusedItem)?.agenda;
    if (!focusedAgenda) return;
    
    if (action === 'edit' && onEdit) {
      onEdit(focusedAgenda);
    } else if (action === 'delete' && onDelete) {
      onDelete(focusedAgenda);
    }
  }, [focusedItem, allAgendas, onEdit, onDelete]);

  // Handler de teclado
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusNext();
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusPrevious();
        break;
      case 'Enter':
        event.preventDefault();
        executeAction('edit');
        break;
      case 'Delete':
        event.preventDefault();
        executeAction('delete');
        break;
      case 'F2':
        event.preventDefault();
        executeAction('edit');
        break;
      case 'Escape':
        setFocusedItem(null);
        setFocusedCategory(null);
        break;
    }
  }, [focusNext, focusPrevious, executeAction]);

  // Registra listener de teclado
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    focusedItem,
    focusedCategory,
    setFocusedItem,
    setFocusedCategory,
    focusNext,
    focusPrevious,
    executeAction,
  };
};

/**
 * Hook para exportação de agendas
 */
export const useAgendaExport = (
  agendas: LocalAgenda[]
): UseAgendaExportReturn => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Exporta para CSV
  const exportToCSV = useCallback(async (filename?: string) => {
    try {
      setIsExporting(true);
      setExportError(null);
      
      const csvContent = exportUtils.toCSV(agendas);
      const finalFilename = filename || exportUtils.generateFilename('csv', 'agendas');
      
      exportUtils.downloadFile(csvContent, finalFilename, 'text/csv');
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Erro ao exportar CSV');
    } finally {
      setIsExporting(false);
    }
  }, [agendas]);

  // Exporta para JSON
  const exportToJSON = useCallback(async (filename?: string) => {
    try {
      setIsExporting(true);
      setExportError(null);
      
      const jsonContent = exportUtils.toJSON(agendas);
      const finalFilename = filename || exportUtils.generateFilename('json', 'agendas');
      
      exportUtils.downloadFile(jsonContent, finalFilename, 'application/json');
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Erro ao exportar JSON');
    } finally {
      setIsExporting(false);
    }
  }, [agendas]);

  // Limpa erro de exportação
  const clearExportError = useCallback(() => {
    setExportError(null);
  }, []);

  return {
    isExporting,
    exportError,
    exportToCSV,
    exportToJSON,
    clearExportError,
  };
};

/**
 * Hook composto que combina funcionalidades principais
 */
export const useAgendaHierarchyComplete = (
  agendas: LocalAgenda[],
  options: {
    initialExpanded?: string[];
    initialFilter?: FilterConfig;
    initialSort?: SortConfig;
    onEdit?: (agenda: LocalAgenda) => void;
    onDelete?: (agenda: LocalAgenda) => void;
    enableKeyboard?: boolean;
    enableExport?: boolean;
  } = {}
) => {
  const {
    initialExpanded = [],
    initialFilter,
    initialSort = { field: 'title', direction: 'asc' },
    onEdit,
    onDelete,
    enableKeyboard = true,
    enableExport = true,
  } = options;

  // Hooks principais
  const hierarchy = useAgendaHierarchy(agendas, initialExpanded);
  const filter = useAgendaFilter(hierarchy.groupedAgendas, initialFilter);
  const sort = useAgendaSort(filter.filteredAgendas, initialSort);
  const search = useAgendaSearch(sort.sortedAgendas);
  const stats = useAgendaStats(search.searchResults);
  const actions = useAgendaActions(onEdit, onDelete);
  
  // Hooks opcionais
  const keyboard = enableKeyboard 
    ? useAgendaKeyboard(search.searchResults, onEdit, onDelete)
    : null;
  
  const exportHook = enableExport 
    ? useAgendaExport(agendas)
    : null;

  // Estado combinado
  const isLoading = actions.isLoading || (exportHook?.isExporting ?? false);
  const hasError = Boolean(actions.error || exportHook?.exportError);
  const errorMessage = actions.error || exportHook?.exportError || null;

  // Função para limpar todos os erros
  const clearAllErrors = useCallback(() => {
    actions.clearError();
    exportHook?.clearExportError();
  }, [actions, exportHook]);

  return {
    // Dados
    agendas: search.searchResults,
    originalAgendas: agendas,
    statistics: stats.statistics,
    derivedStats: stats.derivedStats,
    
    // Hierarquia
    availableCategories: hierarchy.availableCategories,
    expandedCategories: hierarchy.expandedCategories,
    toggleCategory: hierarchy.toggleCategory,
    expandAll: hierarchy.expandAll,
    collapseAll: hierarchy.collapseAll,
    isCategoryExpanded: hierarchy.isCategoryExpanded,
    
    // Filtros
    filterConfig: filter.filterConfig,
    isFilterActive: filter.isFilterActive,
    updateFilter: filter.updateFilter,
    clearFilter: filter.clearFilter,
    setCategories: filter.setCategories,
    setDurationRange: filter.setDurationRange,
    setPriceRange: filter.setPriceRange,
    
    // Ordenação
    sortConfig: sort.sortConfig,
    updateSort: sort.updateSort,
    toggleSortDirection: sort.toggleSortDirection,
    
    // Busca
    searchTerm: search.searchTerm,
    debouncedSearchTerm: search.debouncedSearchTerm,
    hasSearchResults: search.hasResults,
    totalSearchResults: search.totalResults,
    searchInputRef: search.searchInputRef,
    setSearchTerm: search.setSearchTerm,
    clearSearch: search.clearSearch,
    focusSearch: search.focusSearch,
    
    // Ações
    handleEdit: actions.handleEdit,
    handleDelete: actions.handleDelete,
    
    // Teclado (opcional)
    focusedItem: keyboard?.focusedItem || null,
    focusedCategory: keyboard?.focusedCategory || null,
    setFocusedItem: keyboard?.setFocusedItem || (() => {}),
    focusNext: keyboard?.focusNext || (() => {}),
    focusPrevious: keyboard?.focusPrevious || (() => {}),
    
    // Exportação (opcional)
    exportToCSV: exportHook?.exportToCSV || (() => Promise.resolve()),
    exportToJSON: exportHook?.exportToJSON || (() => Promise.resolve()),
    
    // Estado geral
    isLoading,
    hasError,
    errorMessage,
    clearAllErrors,
  };
};