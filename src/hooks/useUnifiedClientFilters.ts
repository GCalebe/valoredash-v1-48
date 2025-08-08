import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useFilterDialog } from "./useFilterDialog";
import { ContactFilters } from "@/lib/contactsService";
import type { FilterGroup } from "@/components/clients/filters/FilterGroup";

export interface CustomFieldFilter {
  fieldId: string;
  fieldName: string;
  value: string | number | boolean | null;
}

export interface UnifiedClientFilters {
  // Filtros básicos
  searchTerm: string;
  debouncedSearchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  segmentFilter: string;
  setSegmentFilter: (segment: string) => void;
  lastContactFilter: string;
  setLastContactFilter: (filter: string) => void;
  customFieldFilters: CustomFieldFilter[];
  addCustomFieldFilter: (filter: CustomFieldFilter) => void;
  removeCustomFieldFilter: (id: string) => void;
  
  // Filtros avançados
  advancedFilter: FilterGroup;
  updateAdvancedFilter: (filter: FilterGroup) => void;
  clearAdvancedFilter: () => void;
  hasAdvancedRules: boolean;
  
  // Estado unificado
  hasActiveFilters: boolean;
  clearAllFilters: () => void;
  
  // Filtros computados para o serviço
  getContactFilters: () => ContactFilters;
}

export function useUnifiedClientFilters(): UnifiedClientFilters {
  // Estados dos filtros básicos
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [lastContactFilter, setLastContactFilter] = useState("all");
  const [customFieldFilters, setCustomFieldFilters] = useState<CustomFieldFilter[]>([]);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Hook dos filtros avançados
  const { advancedFilter, updateAdvancedFilter, clearAdvancedFilter, hasAdvancedRules } = useFilterDialog();

  const updateAdvancedFilterWrapper = useCallback((filter: FilterGroup) => {
    updateAdvancedFilter(filter.id, filter);
  }, [updateAdvancedFilter]);
  // Implementa debounce para o searchTerm
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms de delay

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Cleanup do timeout quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Integração: ouvir evento global do modal para aplicar filtros avançados
  useEffect(() => {
    const handleApply = (e: any) => {
      const detail = e?.detail;
      if (detail && detail.id && Array.isArray(detail.rules)) {
        updateAdvancedFilter(detail.id, detail);
      }
    };
    const handleClear = () => {
      clearAdvancedFilter();
    };
    window.addEventListener('clients-apply-advanced-filter', handleApply as any);
    window.addEventListener('clients-clear-advanced-filter', handleClear as any);
    return () => {
      window.removeEventListener('clients-apply-advanced-filter', handleApply as any);
      window.removeEventListener('clients-clear-advanced-filter', handleClear as any);
    };
  }, [updateAdvancedFilter, clearAdvancedFilter]);

  // Verifica se há filtros ativos
  const hasActiveFilters = useMemo(
    () =>
      statusFilter !== "all" ||
      segmentFilter !== "all" ||
      lastContactFilter !== "all" ||
      searchTerm !== "" ||
      customFieldFilters.length > 0 ||
      hasAdvancedRules,
    [
      statusFilter,
      segmentFilter,
      lastContactFilter,
      searchTerm,
      customFieldFilters,
      hasAdvancedRules,
    ],
  );

  // Adiciona filtro de campo personalizado
  const addCustomFieldFilter = useCallback((filter: CustomFieldFilter) => {
    setCustomFieldFilters((prev) => {
      const exists = prev.some((f) => f.fieldId === filter.fieldId);
      if (exists) {
        return prev.map((f) => (f.fieldId === filter.fieldId ? filter : f));
      }
      return [...prev, filter];
    });
  }, []);

  // Remove filtro de campo personalizado
  const removeCustomFieldFilter = useCallback((fieldId: string) => {
    setCustomFieldFilters((prev) => prev.filter((f) => f.fieldId !== fieldId));
  }, []);

  // Limpa todos os filtros
  const clearAllFilters = useCallback(() => {
    setStatusFilter("all");
    setSegmentFilter("all");
    setLastContactFilter("all");
    setSearchTerm("");
    setCustomFieldFilters([]);
    clearAdvancedFilter();
  }, [clearAdvancedFilter]);

  // Converte filtros para o formato do ContactFilters
  const getContactFilters = useCallback((): ContactFilters => {
    const filters: ContactFilters = {};

    // Filtros básicos
    if (debouncedSearchTerm) {
      filters.search = debouncedSearchTerm;
    }

    if (statusFilter !== "all") {
      filters.status = statusFilter;
    }

    // Mapear statusFilter para kanban_stage_id
    if (statusFilter !== "all") {
      filters.kanban_stage_id = statusFilter;
    }

    // Mapear segmentFilter para responsible_hosts
    if (segmentFilter !== "all") {
      filters.responsible_hosts = [segmentFilter];
    }

    // Filtros avançados
    if (hasAdvancedRules) {
      filters.advancedFilters = advancedFilter;
    }

    return filters;
  }, [
    debouncedSearchTerm,
    statusFilter,
    segmentFilter,
    hasAdvancedRules,
    advancedFilter,
  ]);

  return {
    // Filtros básicos
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    segmentFilter,
    setSegmentFilter,
    lastContactFilter,
    setLastContactFilter,
    customFieldFilters,
    addCustomFieldFilter,
    removeCustomFieldFilter,
    
    // Filtros avançados
    advancedFilter,
    updateAdvancedFilter: updateAdvancedFilterWrapper,
    clearAdvancedFilter,
    hasAdvancedRules,
    
    // Estado unificado
    hasActiveFilters,
    clearAllFilters,
    getContactFilters,
  };
}