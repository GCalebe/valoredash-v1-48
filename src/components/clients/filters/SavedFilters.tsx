import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { FilterGroup } from "./FilterGroup";

interface SavedFiltersProps {
  savedFilters: { id: string; name: string; filter: FilterGroup }[];
  onApplySavedFilter: (filter: FilterGroup) => void;
  onDeleteSavedFilter: (id: string) => void;
}

export const SavedFilters: React.FC<SavedFiltersProps> = ({
  savedFilters,
  onApplySavedFilter,
  onDeleteSavedFilter,
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Filtros Salvos</Label>
      {savedFilters.length === 0 ? (
        <div className="text-sm text-muted-foreground py-2">
          Nenhum filtro salvo. Crie e salve filtros para uso futuro.
        </div>
      ) : (
        <div className="space-y-2">
          {savedFilters.map((filter) => (
            <div
              key={filter.id}
              className="flex items-center justify-between p-2 bg-muted/30 rounded-md"
            >
              <span className="font-medium">{filter.name}</span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onApplySavedFilter(filter.filter)}
                  className="h-7 px-2 text-xs"
                >
                  Aplicar
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteSavedFilter(filter.id)}
                  className="h-7 w-7 text-destructive hover:text-destructive/80"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};