import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Filter, X, Save, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CustomFieldFilter } from "@/hooks/useClientsFilters";
import { QuickFilters } from "./filters/QuickFilters";
import { FilterGroupComponent } from "./filters/FilterGroup";
import { SavedFilters } from "./filters/SavedFilters";
import { useFilterDialog } from "@/hooks/useFilterDialog";

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
  } = useFilterDialog();

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleClearFilters = () => {
    onClearFilters();
    clearAdvancedFilter();
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros Avançados
            </DialogTitle>
            <DialogDescription>
              Configure filtros personalizados para refinar sua busca por clientes.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <SavedFilters
              onApplyFilter={applySavedFilter}
              onFilterDeleted={loadSavedFilters}
            />

            <Separator />

            <QuickFilters
              statusFilter={statusFilter}
              segmentFilter={segmentFilter}
              lastContactFilter={lastContactFilter}
              onStatusFilterChange={onStatusFilterChange}
              onSegmentFilterChange={onSegmentFilterChange}
              onLastContactFilterChange={onLastContactFilterChange}
            />

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={setShowAdvanced}
                  className="flex items-center gap-1"
                >
                  {showAdvanced ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  Filtros Avançados
                </Button>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Nome do filtro"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    className="w-[200px] h-8 text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={saveFilter}
                    disabled={filterName.trim() === "" || !hasAdvancedRules}
                    className="flex items-center gap-1 h-8"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Salvar
                  </Button>
                </div>
              </div>

              {showAdvanced && (
                <FilterGroupComponent
                  group={advancedFilter}
                  onUpdate={updateAdvancedFilter}
                  onRemove={() => {}}
                  isRoot={true}
                />
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="px-6 py-3">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Limpar Filtros
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleClose}>
                  <Filter className="h-4 w-4 mr-1" />
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FilterDialog;