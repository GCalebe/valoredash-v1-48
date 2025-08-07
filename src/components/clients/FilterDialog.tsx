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
import { Filter, X, Save, ChevronDown, ChevronUp, Search, Tags } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { CustomFieldFilter } from "@/hooks/useClientsFilters";
import { QuickFilters } from "./filters/QuickFilters";
import { FilterGroupComponent } from "./filters/FilterGroup";
import { SavedFilters } from "./filters/SavedFilters";
import { useFilterDialog } from "@/hooks/useFilterDialog";
import { FieldPicker } from "./filters/FieldPicker";
import { FilterSuggestionsTabs } from "./filters/FilterSuggestionsTabs";

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

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl h-[82vh] p-0 flex flex-col">
          {/* Header estilo Kommo */}
          <div className="px-6 pt-5 pb-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
            <DialogHeader className="p-0">
              <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                <Filter className="h-5 w-5" /> Filtros
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Monte regras combinando campos. Pesquise um campo abaixo para adicionar rapidamente.
              </DialogDescription>
            </DialogHeader>
            {/* Barra de busca global de campos */}
            <div className="mt-3">
              <Command className="rounded-md border">
                <CommandInput placeholder="Buscar campo (ex.: email, status, tags, tamanho)..." />
                <CommandList>
                  <CommandEmpty>Nenhum campo encontrado.</CommandEmpty>
                </CommandList>
              </Command>
            </div>
          </div>
          <ScrollArea className="flex-1 min-h-0 px-6 py-4">
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

            <div className="space-y-4">
              {/* Picker + Abas de sugestões (estilo Kommo) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="border rounded-md">
                  <div className="flex items-center justify-between px-3 py-2 bg-muted/40 border-b">
                    <div className="flex items-center gap-2 text-sm font-medium"><Search className="h-4 w-4"/> Adicionar regra por campo</div>
                  </div>
                  <div className="p-3">
                    <FieldPicker
                      onPick={(fieldId) => {
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
                      }}
                    />
                  </div>
                </div>
                <FilterSuggestionsTabs
                  onPick={(fieldId) => {
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
                  }}
                  context="clients"
                />
              </div>

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

          <DialogFooter className="px-6 py-3 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky bottom-0 z-10">
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
                <Button size="sm" onClick={() => {
                  // emite evento para hook unificado aplicar filtros
                  window.dispatchEvent(new CustomEvent('clients-apply-advanced-filter', { detail: advancedFilter }));
                  handleClose();
                }}>
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