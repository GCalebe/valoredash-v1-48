import React from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CustomFieldFilter } from "@/hooks/useClientsFilters";
import { useFilterDialog } from "@/hooks/useFilterDialog";
import { FilterHeader } from "./filters/FilterHeader";
import { FilterBuilder } from "./filters/FilterBuilder";
import { FilterActions } from "./filters/FilterActions";

interface FilterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  statusFilter: string;
  segmentFilter: string;
  lastContactFilter: string;
  customFieldFilters: CustomFieldFilter[];
  onStatusFilterChange: (value: string) => void;
  onSegmentFilterChange: (value: string) => void;
  onLastContactFilterChange: (value: string) => void;
  onAddCustomFieldFilter: (filter: CustomFieldFilter) => void;
  onRemoveCustomFieldFilter: (fieldId: string) => void;
  onClearFilters: () => void;
  onClearCustomFieldFilters: () => void;
  hasActiveFilters: boolean;
}

const FilterDialog = ({
  isOpen,
  onOpenChange,
  statusFilter,
  segmentFilter,
  lastContactFilter,
  customFieldFilters,
  onStatusFilterChange,
  onSegmentFilterChange,
  onLastContactFilterChange,
  onAddCustomFieldFilter,
  onRemoveCustomFieldFilter,
  onClearFilters,
  onClearCustomFieldFilters,
  hasActiveFilters,
}: FilterDialogProps) => {
  const {
    filterName,
    setFilterName,
    showAdvanced,
    setShowAdvanced,
    savedFilters,
    advancedFilter,
    updateAdvancedFilter,
    saveFilter,
    applySavedFilter,
    deleteSavedFilter,
    loadSavedFilters,
    clearAdvancedFilter,
    hasAdvancedRules,
  } = useFilterDialog('clients');

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleClearFilters = () => {
    onClearFilters();
    clearAdvancedFilter();
    window.dispatchEvent(new CustomEvent('clients-clear-advanced-filter'));
  };

  const handleAddField = (fieldId: string) => {
    updateAdvancedFilter(advancedFilter.id, {
      ...advancedFilter,
      rules: [
        ...advancedFilter.rules,
        {
          id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          field: fieldId,
          operator: "equals",
          value: "",
        },
      ],
    });
  };

  const activeFiltersCount = [
    statusFilter !== "all",
    segmentFilter !== "all", 
    lastContactFilter !== "all"
  ].filter(Boolean).length;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh] p-0 flex flex-col">
        <FilterHeader />
        
        <div className="flex-1 min-h-0">
          {/* Main content com construtor de filtros */}
          <div className="flex-1 p-6 overflow-y-auto">
            <FilterBuilder
              advancedFilter={advancedFilter}
              updateAdvancedFilter={updateAdvancedFilter}
              filterName={filterName}
              setFilterName={setFilterName}
              onSaveFilter={() => saveFilter(filterName)}
              hasAdvancedRules={hasAdvancedRules}
              onAddField={handleAddField}
              statusFilter={statusFilter}
              segmentFilter={segmentFilter}
              lastContactFilter={lastContactFilter}
              onStatusFilterChange={onStatusFilterChange}
              onSegmentFilterChange={onSegmentFilterChange}
              onLastContactFilterChange={onLastContactFilterChange}
              onApplyFilter={applySavedFilter}
              onFilterDeleted={loadSavedFilters}
              activeFiltersCount={activeFiltersCount}
            />
          </div>
        </div>

        <FilterActions
          hasActiveFilters={hasActiveFilters}
          hasAdvancedRules={hasAdvancedRules}
          activeFiltersCount={activeFiltersCount}
          onClearFilters={handleClearFilters}
          onApplyFilters={() => {
            window.dispatchEvent(new CustomEvent('clients-apply-advanced-filter', { detail: advancedFilter }));
            handleClose();
          }}
          onClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default FilterDialog;