import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuickFilters } from "./QuickFilters";
import { SavedFilters } from "./SavedFilters";
import { FilterSuggestionsTabs } from "./FilterSuggestionsTabs";
import { FilterGroupComponent, FilterGroup } from "./FilterGroup";
import { Settings, Save, Clock, Bookmark } from "lucide-react";

interface FilterBuilderProps {
  advancedFilter: FilterGroup;
  updateAdvancedFilter: (id: string, filter: FilterGroup) => void;
  filterName: string;
  setFilterName: (name: string) => void;
  onSaveFilter: () => void;
  hasAdvancedRules: boolean;
  onAddField: (fieldId: string) => void;
  // Quick filters props
  statusFilter: string;
  segmentFilter: string;
  lastContactFilter: string;
  onStatusFilterChange: (value: string) => void;
  onSegmentFilterChange: (value: string) => void;
  onLastContactFilterChange: (value: string) => void;
  onApplyFilter: (filter: FilterGroup) => void;
  onFilterDeleted: () => void;
  activeFiltersCount: number;
}

export const FilterBuilder: React.FC<FilterBuilderProps> = ({
  advancedFilter,
  updateAdvancedFilter,
  filterName,
  setFilterName,
  onSaveFilter,
  hasAdvancedRules,
  onAddField,
  statusFilter,
  segmentFilter,
  lastContactFilter,
  onStatusFilterChange,
  onSegmentFilterChange,
  onLastContactFilterChange,
  onApplyFilter,
  onFilterDeleted,
  activeFiltersCount,
}) => {
  return (
    <div className="space-y-4">
      {/* Filtros Rápidos e Salvos no topo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              Filtros Rápidos
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <QuickFilters
              statusFilter={statusFilter}
              segmentFilter={segmentFilter}
              lastContactFilter={lastContactFilter}
              onStatusFilterChange={onStatusFilterChange}
              onSegmentFilterChange={onSegmentFilterChange}
              onLastContactFilterChange={onLastContactFilterChange}
            />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Bookmark className="h-4 w-4 text-primary" />
              Filtros Salvos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <SavedFilters
              onApplyFilter={onApplyFilter}
              onFilterDeleted={onFilterDeleted}
            />
          </CardContent>
        </Card>
      </div>

      {/* Field Selection */}
      <div className="grid grid-cols-1 gap-4">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Settings className="h-4 w-4 text-primary" />
              Sugestões por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <FilterSuggestionsTabs onPick={onAddField} context="clients" />
          </CardContent>
        </Card>
      </div>

      {/* Save Filter Controls */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Save className="h-4 w-4 text-primary" />
              Salvar Filtro
              {hasAdvancedRules && (
                <Badge variant="secondary" className="text-xs">
                  {advancedFilter.rules.length} regra(s)
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Input
              placeholder="Nome do filtro..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={onSaveFilter}
              disabled={!filterName.trim() || !hasAdvancedRules}
              size="sm"
            >
              <Save className="h-4 w-4 mr-1" />
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filter Rules */}
      {hasAdvancedRules && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Settings className="h-4 w-4 text-primary" />
              Regras do Filtro
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <FilterGroupComponent
              group={advancedFilter}
              onUpdate={updateAdvancedFilter}
              onRemove={() => {}}
              isRoot={true}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};