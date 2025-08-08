import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { useFilterableFields } from "@/hooks/useFilterableFields";
import { operatorsByType } from "@/components/clients/filters/filterConstants";
import { FieldRenderer } from "./FieldRenderer";

export interface FilterRule {
  id: string;
  fieldId: string;
  operator: string;
  value: any;
}

interface AdvancedFilterRuleProps {
  rule: FilterRule;
  onUpdate: (rule: FilterRule) => void;
  onRemove: () => void;
}

export const AdvancedFilterRule: React.FC<AdvancedFilterRuleProps> = ({
  rule,
  onUpdate,
  onRemove,
}) => {
  const { fields } = useFilterableFields();
  
  const selectedField = fields.find(f => f.id === rule.fieldId);
  const availableOperators = selectedField 
    ? operatorsByType[selectedField.type] || operatorsByType.text
    : operatorsByType.text;

  const handleFieldChange = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    const defaultOperator = field && operatorsByType[field.type] 
      ? operatorsByType[field.type][0].id 
      : "equals";
    
    onUpdate({
      ...rule,
      fieldId,
      operator: defaultOperator,
      value: null,
    });
  };

  const handleOperatorChange = (operator: string) => {
    onUpdate({
      ...rule,
      operator,
      value: null, // Reset value when operator changes
    });
  };

  const handleValueChange = (value: any) => {
    onUpdate({
      ...rule,
      value,
    });
  };

  const getFieldCategory = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    return field?.category || "basic";
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      basic: "bg-blue-100 text-blue-800",
      kanban: "bg-purple-100 text-purple-800",
      commercial: "bg-green-100 text-green-800",
      temporal: "bg-orange-100 text-orange-800",
      documents: "bg-gray-100 text-gray-800",
      personalized: "bg-pink-100 text-pink-800",
    };
    return colors[category as keyof typeof colors] || colors.basic;
  };

  return (
    <div className="p-4 border border-border rounded-lg bg-card space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={getCategoryColor(getFieldCategory(rule.fieldId))}>
            {selectedField?.name || "Selecione um campo"}
          </Badge>
          {selectedField && (
            <Badge variant="secondary" className="text-xs">
              {selectedField.type}
            </Badge>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onRemove}
          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Campo */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Campo
          </label>
          <Select value={rule.fieldId} onValueChange={handleFieldChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um campo..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(
                fields.reduce((acc, field) => {
                  const category = field.category || "basic";
                  if (!acc[category]) acc[category] = [];
                  acc[category].push(field);
                  return acc;
                }, {} as Record<string, typeof fields>)
              ).map(([category, categoryFields]) => (
                <div key={category}>
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                    {category}
                  </div>
                  {categoryFields.map((field) => (
                    <SelectItem key={field.id} value={field.id}>
                      <div className="flex items-center gap-2">
                        <span>{field.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {field.type}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Operador */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Operador
          </label>
          <Select value={rule.operator} onValueChange={handleOperatorChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um operador..." />
            </SelectTrigger>
            <SelectContent>
              {availableOperators.map((op) => (
                <SelectItem key={op.id} value={op.id}>
                  {op.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Valor */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Valor
          </label>
          {selectedField && !["is_empty", "is_not_empty"].includes(rule.operator) ? (
            <FieldRenderer
              field={selectedField}
              value={rule.value}
              operator={rule.operator}
              onChange={handleValueChange}
            />
          ) : (
            <div className="h-10 flex items-center text-sm text-muted-foreground bg-muted rounded-md px-3">
              {["is_empty", "is_not_empty"].includes(rule.operator) 
                ? "Sem valor necessário" 
                : "Selecione um campo"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};