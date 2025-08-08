import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { FilterProperty } from "@/hooks/useFilterableFields";

interface FieldRendererProps {
  field: FilterProperty;
  value: any;
  operator: string;
  onChange: (value: any) => void;
  className?: string;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  operator,
  onChange,
  className = "",
}) => {
  // Renderização para campos de texto
  if (field.type === "text") {
    return (
      <Input
        type="text"
        placeholder={`Digite ${field.name.toLowerCase()}...`}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={className}
      />
    );
  }

  // Renderização para campos numéricos
  if (field.type === "number") {
    if (operator === "between") {
      const [min, max] = Array.isArray(value) ? value : [value, ""];
      return (
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Mín."
            value={min || ""}
            onChange={(e) => onChange([e.target.value, max])}
            className={className}
          />
          <Input
            type="number"
            placeholder="Máx."
            value={max || ""}
            onChange={(e) => onChange([min, e.target.value])}
            className={className}
          />
        </div>
      );
    }
    
    return (
      <Input
        type="number"
        placeholder={`Digite ${field.name.toLowerCase()}...`}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={className}
      />
    );
  }

  // Renderização para campos de data
  if (field.type === "date") {
    if (operator === "between") {
      const [start, end] = Array.isArray(value) ? value : [value, ""];
      return (
        <div className="flex gap-2">
          <Input
            type="date"
            value={start || ""}
            onChange={(e) => onChange([e.target.value, end])}
            className={className}
          />
          <Input
            type="date"
            value={end || ""}
            onChange={(e) => onChange([start, e.target.value])}
            className={className}
          />
        </div>
      );
    }

    if (operator === "last_days" || operator === "next_days") {
      return (
        <Input
          type="number"
          placeholder="Número de dias"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={className}
        />
      );
    }
    
    return (
      <Input
        type="date"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={className}
      />
    );
  }

  // Renderização para campos de seleção única
  if (field.type === "select" || field.type === "kanban_stage") {
    const options = field.options || [];
    
    return (
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={`Selecione ${field.name.toLowerCase()}...`} />
        </SelectTrigger>
        <SelectContent>
          {options.filter(option => option).map((option) => {
            // Suporte para opções com valor e label
            const optionValue = typeof option === "object" ? (option as any).value : option as string;
            const optionLabel = typeof option === "object" ? (option as any).label : option as string;
            
            return (
              <SelectItem key={optionValue} value={optionValue}>
                {optionLabel}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    );
  }

  // Renderização para campos de seleção múltipla
  if (field.type === "multi_select") {
    const selectedValues = Array.isArray(value) ? value : [];
    const options = field.options || [];

    return (
      <div className="space-y-2">
        {/* Tags selecionadas */}
        {selectedValues.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedValues.map((selectedValue) => (
              <Badge key={selectedValue} variant="secondary" className="text-xs">
                {selectedValue}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-3 w-3 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => {
                    const newValues = selectedValues.filter(v => v !== selectedValue);
                    onChange(newValues);
                  }}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        {/* Seleção de novas opções */}
        <Select 
          value="" 
          onValueChange={(newValue) => {
            if (newValue && !selectedValues.includes(newValue)) {
              onChange([...selectedValues, newValue]);
            }
          }}
        >
          <SelectTrigger className={className}>
            <SelectValue placeholder={`Adicionar ${field.name.toLowerCase()}...`} />
          </SelectTrigger>
          <SelectContent>
          {options
            .filter(option => option && !selectedValues.includes(option as string))
            .map((option) => (
              <SelectItem key={option as string} value={option as string}>
                {option as string}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Fallback para tipos não reconhecidos
  return (
    <Input
      type="text"
      placeholder={`Digite ${field.name.toLowerCase()}...`}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    />
  );
};