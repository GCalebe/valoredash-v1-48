import { useState } from "react";
import { type FilterGroup, type FilterRule } from "@/components/clients/filters/FilterGroup";
import { clientProperties, operatorsByType } from "@/components/clients/filters/filterConstants";

interface SavedFilter {
  id: string;
  name: string;
  filter: FilterGroup;
}

export const useFilterDialog = () => {
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

  const saveFilter = () => {
    if (filterName.trim() === "") return;

    const newSavedFilter: SavedFilter = {
      id: `saved-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: filterName,
      filter: advancedFilter,
    };

    setSavedFilters([...savedFilters, newSavedFilter]);
    setFilterName("");
  };

  const applySavedFilter = (filter: FilterGroup) => {
    setAdvancedFilter(filter);
  };

  const deleteSavedFilter = (id: string) => {
    setSavedFilters(savedFilters.filter((f) => f.id !== id));
  };

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
    clearAdvancedFilter,
    hasAdvancedRules,
  };
};