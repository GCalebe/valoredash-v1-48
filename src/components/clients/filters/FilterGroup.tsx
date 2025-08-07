import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { FilterRuleComponent, type FilterRule } from "./FilterRule";

export type { FilterRule };
import { ConditionType, fixedClientProperties, operatorsByType } from "./filterConstants";
import { useFilterableFields } from "@/hooks/useFilterableFields";

export interface FilterGroup {
  id: string;
  condition: ConditionType;
  rules: (FilterRule | FilterGroup)[];
}

interface FilterGroupProps {
  group: FilterGroup;
  onUpdate: (id: string, updatedGroup: FilterGroup) => void;
  onRemove: (id: string) => void;
  level?: number;
  isRoot?: boolean;
}

export const FilterGroupComponent: React.FC<FilterGroupProps> = ({
  group,
  onUpdate,
  onRemove,
  level = 0,
  isRoot = false,
}) => {
  const { fields } = useFilterableFields();
  const addRule = () => {
    const newRule: FilterRule = {
      id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      field: (fields[0] || fixedClientProperties[0]).id,
      fieldName: (fields[0] || fixedClientProperties[0]).name,
      operator:
        operatorsByType[
          ((fields[0] || fixedClientProperties[0]).type) as keyof typeof operatorsByType
        ][0].id,
      value: "",
    };

    onUpdate(group.id, {
      ...group,
      rules: [...group.rules, newRule],
    });
  };

  const addGroup = () => {
    const newGroup: FilterGroup = {
      id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      condition: "AND",
      rules: [],
    };

    onUpdate(group.id, {
      ...group,
      rules: [...group.rules, newGroup],
    });
  };

  const updateRule = (id: string, updatedRule: FilterRule) => {
    onUpdate(group.id, {
      ...group,
      rules: group.rules.map((item) =>
        "field" in item && item.id === id ? updatedRule : item,
      ),
    });
  };

  const updateNestedGroup = (id: string, updatedGroup: FilterGroup) => {
    onUpdate(group.id, {
      ...group,
      rules: group.rules.map((item) =>
        !("field" in item) && item.id === id ? updatedGroup : item,
      ),
    });
  };

  const removeRule = (id: string) => {
    onUpdate(group.id, {
      ...group,
      rules: group.rules.filter((item) => item.id !== id),
    });
  };

  const toggleCondition = () => {
    onUpdate(group.id, {
      ...group,
      condition: group.condition === "AND" ? "OR" : "AND",
    });
  };

  return (
    <div className={`border rounded-md p-3 mb-3 ${level > 0 ? "ml-4" : ""} ${level > 0 ? "bg-muted/20" : ""}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleCondition}
            className={`text-xs font-medium ${
              group.condition === "AND"
                ? "bg-blue-100 hover:bg-blue-200 text-blue-700"
                : "bg-orange-100 hover:bg-orange-200 text-orange-700"
            } border-none`}
          >
            {group.condition}
          </Button>
          <span className="text-sm text-muted-foreground">
            {group.condition === "AND"
              ? "Todas as condições devem ser verdadeiras"
              : "Qualquer condição pode ser verdadeira"}
          </span>
        </div>
        {!isRoot && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(group.id)}
            className="h-7 w-7 text-destructive hover:text-destructive/80"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {group.rules.map((rule, index) =>
          "field" in rule ? (
            <Card key={rule.id} className="border rounded-md">
              <CardHeader className="py-2 px-3 text-sm font-medium">
                {rule.fieldName || rule.field}
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <FilterRuleComponent
                  rule={rule}
                  onUpdate={updateRule}
                  onRemove={removeRule}
                  isLast={index === group.rules.length - 1}
                />
              </CardContent>
            </Card>
          ) : (
            <FilterGroupComponent
              key={rule.id}
              group={rule}
              onUpdate={updateNestedGroup}
              onRemove={removeRule}
              level={level + 1}
            />
          ),
        )}

        {group.rules.length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Adicione regras ou grupos para criar seu filtro
          </div>
        )}

        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={addRule}
            className="flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar Regra
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={addGroup}
            className="flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar Grupo
          </Button>
        </div>
      </div>
    </div>
  );
};