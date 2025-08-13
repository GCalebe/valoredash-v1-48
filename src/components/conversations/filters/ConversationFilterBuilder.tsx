import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FilterBuilder } from "@/components/clients/filters/FilterBuilder";
import { FilterActions } from "@/components/clients/filters/FilterActions";
import { UnifiedConversationFilters } from "@/hooks/useUnifiedConversationFilters";
import { useFilterDialog } from "@/hooks/useFilterDialog";
import { Filter } from "lucide-react";

interface ConversationFilterBuilderProps {
  filters: UnifiedConversationFilters;
  onClose: () => void;
  isOpen: boolean;
}

export const ConversationFilterBuilder: React.FC<ConversationFilterBuilderProps> = ({
  filters,
  onClose,
  isOpen,
}) => {
  const {
    filterName,
    setFilterName,
    advancedFilter,
    updateAdvancedFilter,
    saveFilter,
    applySavedFilter,
    deleteSavedFilter,
    hasAdvancedRules,
  } = useFilterDialog('conversations');

  const activeFiltersCount = [
    filters.statusFilter !== "all",
    filters.unreadFilter !== "all", 
    filters.lastMessageFilter !== "all",
    filters.clientTypeFilter !== "all",
    filters.segmentFilter !== "all",
    filters.lastContactFilter !== "all"
  ].filter(Boolean).length;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Conversas
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto p-6">
          <FilterBuilder
            advancedFilter={advancedFilter}
            updateAdvancedFilter={updateAdvancedFilter}
            filterName={filterName}
            setFilterName={setFilterName}
            onSaveFilter={() => saveFilter(filterName)}
            hasAdvancedRules={hasAdvancedRules}
            onAddField={handleAddField}
            statusFilter={filters.statusFilter}
            segmentFilter={filters.segmentFilter}
            lastContactFilter={filters.lastContactFilter}
            onStatusFilterChange={filters.setStatusFilter}
            onSegmentFilterChange={filters.setSegmentFilter}
            onLastContactFilterChange={filters.setLastContactFilter}
            onApplyFilter={applySavedFilter}
            onFilterDeleted={() => deleteSavedFilter('')}
            activeFiltersCount={activeFiltersCount}
          />
        </div>

        <FilterActions
          hasActiveFilters={filters.hasActiveFilters}
          hasAdvancedRules={hasAdvancedRules}
          onClearFilters={() => filters.clearAll()}
          onApplyFilters={onClose}
          onClose={onClose}
          activeFiltersCount={activeFiltersCount + (hasAdvancedRules ? 1 : 0)}
        />
      </DialogContent>
    </Dialog>
  );
};