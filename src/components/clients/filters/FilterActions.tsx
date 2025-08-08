import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X, RotateCcw } from "lucide-react";

interface FilterActionsProps {
  hasActiveFilters: boolean;
  hasAdvancedRules: boolean;
  onClearFilters: () => void;
  onApplyFilters: () => void;
  onClose: () => void;
  activeFiltersCount?: number;
}

export const FilterActions: React.FC<FilterActionsProps> = ({
  hasActiveFilters,
  hasAdvancedRules,
  onClearFilters,
  onApplyFilters,
  onClose,
  activeFiltersCount = 0,
}) => {
  return (
    <div className="px-6 py-4 border-t bg-gradient-to-r from-background to-muted/30 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {hasActiveFilters && (
          <>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Filtros ativos:</span>
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount + (hasAdvancedRules ? 1 : 0)}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="text-destructive hover:text-destructive/80 border-destructive/20"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Limpar Todos
            </Button>
          </>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClose}
        >
          Cancelar
        </Button>
        <Button 
          size="sm" 
          onClick={onApplyFilters}
          className="bg-primary hover:bg-primary/90"
        >
          <Filter className="h-4 w-4 mr-1" />
          Aplicar Filtros
        </Button>
      </div>
    </div>
  );
};