import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { fixedClientProperties, operatorsByType } from "./filterConstants";
import { useFilterableFields } from "@/hooks/useFilterableFields";

export interface FilterRule {
  id: string;
  field: string;
  operator: string;
  value: string;
  fieldName?: string;
}

interface FilterRuleProps {
  rule: FilterRule;
  onUpdate: (id: string, updatedRule: FilterRule) => void;
  onRemove: (id: string) => void;
  isLast: boolean;
}

export const FilterRuleComponent: React.FC<FilterRuleProps> = ({
  rule,
  onUpdate,
  onRemove,
  isLast,
}) => {
  const { fields } = useFilterableFields();
  const selectedField = fields.find((f) => f.id === rule.field);
  const operators = selectedField
    ? operatorsByType[selectedField.type as keyof typeof operatorsByType]
    : [];

  return (
    <div className="flex flex-wrap items-center gap-2 mb-2 p-2 bg-muted/30 rounded-md">
      <Select
        value={rule.field}
        onValueChange={(value) => {
          const field = fields.find((f) => f.id === value);
          onUpdate(rule.id, {
            ...rule,
            field: value,
            fieldName: field?.name,
            operator:
              operatorsByType[field?.type as keyof typeof operatorsByType][0]
                .id,
            value: "",
          });
        }}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Selecione o campo" />
        </SelectTrigger>
        <SelectContent>
          {/* Agrupa: Fixos primeiro, depois Custom */}
          {fixedClientProperties.map((field) => (
            <SelectItem key={field.id} value={field.id}>
              {field.name}
            </SelectItem>
          ))}
          {fields
            .filter((f) => (f as any).isCustom)
            .map((field) => (
              <SelectItem key={field.id} value={field.id}>
                {field.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      <Select
        value={rule.operator}
        onValueChange={(value) => {
          onUpdate(rule.id, { ...rule, operator: value });
        }}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Operador" />
        </SelectTrigger>
        <SelectContent>
          {operators.map((op) => (
            <SelectItem key={op.id} value={op.id}>
              {op.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedField?.type === "select" ? (
        <Select
          value={rule.value}
          onValueChange={(value) => {
            onUpdate(rule.id, { ...rule, value });
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Valor" />
          </SelectTrigger>
          <SelectContent>
            {selectedField.options?.map((option: string) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          value={rule.value}
          onChange={(e) =>
            onUpdate(rule.id, { ...rule, value: e.target.value })
          }
          placeholder="Valor"
          className="w-[140px]"
        />
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(rule.id)}
        className="h-8 w-8 text-destructive hover:text-destructive/80"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};