import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterSuggestionsTabs } from "./FilterSuggestionsTabs";
import { FilterGroupComponent, FilterGroup } from "./FilterGroup";
import { Settings, Save } from "lucide-react";

interface FilterBuilderProps {
  advancedFilter: FilterGroup;
  updateAdvancedFilter: (id: string, filter: FilterGroup) => void;
  filterName: string;
  setFilterName: (name: string) => void;
  onSaveFilter: () => void;
  hasAdvancedRules: boolean;
  onAddField: (fieldId: string) => void;
}

export const FilterBuilder: React.FC<FilterBuilderProps> = ({
  advancedFilter,
  updateAdvancedFilter,
  filterName,
  setFilterName,
  onSaveFilter,
  hasAdvancedRules,
  onAddField,
}) => {
  return (
    <div className="space-y-4">
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