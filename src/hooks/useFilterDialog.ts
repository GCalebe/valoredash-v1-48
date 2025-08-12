import { useState, useCallback } from "react";
import { toast } from "sonner";
import { type FilterGroup, type FilterRule } from "@/components/clients/filters/FilterGroup";
import { fixedClientProperties } from "@/components/clients/filters/filterConstants";
import { AdvancedFiltersService } from "../services/advancedFiltersService";
import { supabase } from "../integrations/supabase/client";

interface SavedFilter {
  id: string;
  name: string;
  filter: FilterGroup;
}

export const useFilterDialog = (filterType: 'clients' | 'conversations' = 'clients') => {
  const [filterName, setFilterName] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  // Criar filtro inicial
  const createInitialFilter = (): FilterGroup => ({
    id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    condition: "AND",
    rules: [],
  });

  const [advancedFilter, setAdvancedFilter] = useState<FilterGroup>(createInitialFilter);

  const updateAdvancedFilter = (id: string, updatedGroup: FilterGroup) => {
    const updateGroup = (group: FilterGroup): FilterGroup => {
      if (group.id === id) {
        return updatedGroup;
      }
      return {
        ...group,
        rules: group.rules.map((rule) =>
          "field" in rule ? rule : updateGroup(rule),
        ),
      };
    };

    setAdvancedFilter(updateGroup(advancedFilter));
  };

  const saveFilter = useCallback(async (name: string) => {
    if (!name.trim() || !advancedFilter) {
      toast.error('Nome do filtro e configurações são obrigatórios');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

      const { success, error } = await AdvancedFiltersService.saveFilter(
        name.trim(),
        advancedFilter,
        user.id,
        filterType
      );

      if (!success) {
        toast.error('Erro ao salvar filtro: ' + error);
        return;
      }

      toast.success('Filtro salvo com sucesso!');
      setFilterName("");
      
      // Recarrega a lista de filtros salvos
      loadSavedFilters();
    } catch (error) {
      console.error('Erro ao salvar filtro:', error);
      toast.error('Erro inesperado ao salvar filtro');
    }
  }, [advancedFilter, filterType]);

  const applySavedFilter = (filter: FilterGroup) => {
    setAdvancedFilter(filter);
  };

  const loadSavedFilters = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('Usuário não autenticado');
        return;
      }

      const { data, error } = await AdvancedFiltersService.loadSavedFilters(user.id, filterType);
      
      if (error) {
        console.error('Erro ao carregar filtros salvos:', error);
        return;
      }

      // Converte para o formato esperado pelo componente
      const convertedFilters: SavedFilter[] = data.map(filter => ({
        id: filter.id,
        name: filter.name,
        filter: filter.filter_data
      }));

      setSavedFilters(convertedFilters);
    } catch (error) {
      console.error('Erro inesperado ao carregar filtros:', error);
    }
  }, [filterType]);

  const deleteSavedFilter = useCallback(async (id: string) => {
    try {
      const { success, error } = await AdvancedFiltersService.deleteSavedFilter(id);
      
      if (!success) {
        toast.error('Erro ao deletar filtro: ' + error);
        return;
      }

      setSavedFilters(prev => prev.filter(filter => filter.id !== id));
      toast.success('Filtro deletado com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar filtro:', error);
      toast.error('Erro inesperado ao deletar filtro');
    }
  }, []);

  const clearAdvancedFilter = () => {
    setAdvancedFilter(createInitialFilter());
  };

  const toggleAdvanced = () => {
    setShowAdvanced(!showAdvanced);
  };

  const hasAdvancedRules = advancedFilter.rules.length > 0;

  return {
    filterName,
    setFilterName,
    showAdvanced,
    setShowAdvanced: toggleAdvanced,
    savedFilters,
    advancedFilter,
    updateAdvancedFilter,
    saveFilter,
    applySavedFilter,
    deleteSavedFilter,
    loadSavedFilters,
    clearAdvancedFilter,
    hasAdvancedRules,
  };
};