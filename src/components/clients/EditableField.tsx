
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface EditableFieldProps {
  label: string;
  value: any;
  fieldId: string;
  type?: "text" | "email" | "tel" | "textarea" | "money" | "select" | "badge";
  options?: string[];
  readOnly?: boolean;
  onChange?: (fieldId: string, value: any) => void;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  fieldId,
  type = "text",
  options = [],
  readOnly = false,
  onChange,
}) => {
  const displayValue = value ?? "Não informado";

  const handleChange = (newValue: any) => {
    if (onChange && !readOnly) {
      onChange(fieldId, newValue);
    }
  };

  if (readOnly) {
    return (
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          {label}
        </h3>
        {type === "badge" ? (
          <Badge variant="outline">{displayValue}</Badge>
        ) : type === "money" ? (
          <p>{typeof value === "number" ? `R$ ${value.toFixed(2)}` : displayValue}</p>
        ) : (
          <p>{displayValue}</p>
        )}
      </div>
    );
  }

  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </h3>
      {type === "textarea" ? (
        <Textarea
          value={value || ""}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={`Digite ${label.toLowerCase()}`}
        />
      ) : type === "select" && options.length > 0 ? (
        <Select value={value || ""} onValueChange={(val) => handleChange(val)}>
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
      ) : type === "money" ? (
        <Input
          type="number"
          step="0.01"
          value={value || ""}
          onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
          placeholder="0.00"
        />
      ) : (
        <Input
          type={type}
          value={value || ""}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={`Digite ${label.toLowerCase()}`}
        />
      )}
    </div>
  );
};

export default EditableField;
