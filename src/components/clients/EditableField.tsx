
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FieldVisibilityControl from "./FieldVisibilityControl";

interface EditableFieldProps {
  label: string;
  value?: string | number | null;
  fieldId: string;
  type?: "text" | "email" | "tel" | "textarea" | "select" | "badge" | "money";
  options?: string[];
  readOnly?: boolean;
  onChange?: (fieldId: string, newValue: unknown) => void;
  onVisibilityChange?: (fieldId: string, visible: boolean) => void;
  isVisible?: boolean;
  showVisibilityControl?: boolean;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  fieldId,
  type = "text",
  options = [],
  readOnly = false,
  onChange,
  onVisibilityChange,
  isVisible = true,
  showVisibilityControl = false,
}) => {
  const [localValue, setLocalValue] = useState(value || "");

  const handleChange = (newValue: unknown) => {
    setLocalValue(newValue);
    if (onChange) {
      onChange(fieldId, newValue);
    }
  };

  const handleVisibilityChange = (fieldId: string, visible: boolean) => {
    if (onVisibilityChange) {
      onVisibilityChange(fieldId, visible);
    }
  };

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return "R$ 0,00";
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const renderField = () => {
    if (readOnly) {
      switch (type) {
        case "badge":
          return value ? (
            <Badge variant="secondary" className="text-sm">
              {value}
            </Badge>
          ) : (
            <span className="text-gray-500 text-sm">-</span>
          );
        case "money":
          return (
            <span className="text-sm font-medium">
              {value ? formatCurrency(value) : "R$ 0,00"}
            </span>
          );
        case "textarea":
          return (
            <div className="text-sm whitespace-pre-wrap">
              {value || <span className="text-gray-500">-</span>}
            </div>
          );
        default:
          return (
            <span className="text-sm">
              {value || <span className="text-gray-500">-</span>}
            </span>
          );
      }
    }

    switch (type) {
      case "textarea":
        return (
          <Textarea
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            className="min-h-[60px] resize-none"
            placeholder={`Digite ${label.toLowerCase()}`}
          />
        );
      case "select":
        return (
          <Select value={localValue as string} onValueChange={handleChange}>
            <SelectTrigger>
              <SelectValue placeholder={`Selecione ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "money":
        return (
          <Input
            type="number"
            step="0.01"
            value={localValue}
            onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
            placeholder="0,00"
          />
        );
      default:
        return (
          <Input
            type={type}
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`Digite ${label.toLowerCase()}`}
          />
        );
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label htmlFor={fieldId} className="text-sm font-medium">
          {label}
        </Label>
        {showVisibilityControl && onVisibilityChange && (
          <FieldVisibilityControl
            fieldId={fieldId}
            fieldLabel={label}
            isVisible={isVisible}
            onVisibilityChange={handleVisibilityChange}
            readOnly={readOnly}
          />
        )}
      </div>
      {renderField()}
    </div>
  );
};

export default EditableField;
