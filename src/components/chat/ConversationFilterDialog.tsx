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
import { Filter, X, Save, ChevronDown, ChevronUp, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Command, CommandEmpty, CommandInput, CommandList } from "@/components/ui/command";
import { ConversationCustomFieldFilter } from "@/hooks/useConversationFilters";
import { ConversationQuickFilters } from "./ConversationQuickFilters";
import { FilterGroupComponent } from "../clients/filters/FilterGroup";
import { SavedFilters } from "../clients/filters/SavedFilters";
import { useFilterDialog } from "@/hooks/useFilterDialog";
import { FieldPicker } from "../clients/filters/FieldPicker";
import { FilterSuggestionsTabs } from "../clients/filters/FilterSuggestionsTabs";

interface ConversationFilterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  statusFilter: string;
  segmentFilter: string;
  lastContactFilter: string;
  unreadFilter: string;
  lastMessageFilter: string;
  clientTypeFilter: string;
  customFieldFilters: ConversationCustomFieldFilter[];
  onStatusFilterChange: (value: string) => void;
  onSegmentFilterChange: (value: string) => void;
  onLastContactFilterChange: (value: string) => void;
  onUnreadFilterChange: (value: string) => void;
  onLastMessageFilterChange: (value: string) => void;
  onClientTypeFilterChange: (value: string) => void;
  onAddCustomFieldFilter: (filter: ConversationCustomFieldFilter) => void;
  onRemoveCustomFieldFilter: (fieldId: string) => void;
  onClearFilters: () => void;
  onClearCustomFieldFilters: () => void;
  hasActiveFilters: boolean;
}

const ConversationFilterDialog = ({
  isOpen,
  onOpenChange,
  statusFilter,
  segmentFilter,
  lastContactFilter,
  unreadFilter,
  lastMessageFilter,
  clientTypeFilter,
  customFieldFilters,
  onStatusFilterChange,
  onSegmentFilterChange,
  onLastContactFilterChange,
  onUnreadFilterChange,
  onLastMessageFilterChange,
  onClientTypeFilterChange,
  onAddCustomFieldFilter,
  onRemoveCustomFieldFilter,
  onClearFilters,
  onClearCustomFieldFilters,
  hasActiveFilters,
}: ConversationFilterDialogProps) => {
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
    clearAdvancedFilter,
    hasAdvancedRules,
  } = useFilterDialog('conversations');

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleClearFilters = () => {
    onClearFilters();
    clearAdvancedFilter();
    window.dispatchEvent(new CustomEvent('conversations-clear-advanced-filter'));
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl h-[82vh] p-0 flex flex-col">
          <div className="px-6 pt-5 pb-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
            <DialogHeader className="p-0">
              <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                <Filter className="h-5 w-5" /> Filtros de Conversas
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Pesquise campos e adicione regras rapidamente.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-3">
              <Command className="rounded-md border">
                <CommandInput placeholder="Buscar campo..." />
                <CommandList>
                  <CommandEmpty>Nenhum campo encontrado.</CommandEmpty>
                </CommandList>
              </Command>
            </div>
          </div>

          <ScrollArea className="flex-1 min-h-0 px-6 py-4">
            <SavedFilters
              onApplyFilter={applySavedFilter}
            />

            <Separator />

            <ConversationQuickFilters
              statusFilter={statusFilter}
              segmentFilter={segmentFilter}
              lastContactFilter={lastContactFilter}
              unreadFilter={unreadFilter}
              lastMessageFilter={lastMessageFilter}
              clientTypeFilter={clientTypeFilter}
              onStatusFilterChange={onStatusFilterChange}
              onSegmentFilterChange={onSegmentFilterChange}
              onLastContactFilterChange={onLastContactFilterChange}
              onUnreadFilterChange={onUnreadFilterChange}
              onLastMessageFilterChange={onLastMessageFilterChange}
              onClientTypeFilterChange={onClientTypeFilterChange}
            />

            <Separator />

            <div className="space-y-3">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="border rounded-md p-3">
                  <div className="text-sm font-medium mb-2">Adicionar regra por campo</div>
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
                  context="conversations"
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
                  window.dispatchEvent(new CustomEvent('conversations-apply-advanced-filter', { detail: advancedFilter }));
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

export default ConversationFilterDialog;