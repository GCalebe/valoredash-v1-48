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
import { ConversationCustomFieldFilter } from "@/hooks/useConversationFilters";
import { ConversationQuickFilters } from "./ConversationQuickFilters";
import { FilterGroupComponent } from "../clients/filters/FilterGroup";
import { SavedFilters } from "../clients/filters/SavedFilters";
import { useFilterDialog } from "@/hooks/useFilterDialog";

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
              Filtros de Conversas
            </DialogTitle>
            <DialogDescription>
              Configure filtros personalizados para refinar sua busca por conversas.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
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

export default ConversationFilterDialog;