import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CustomFieldWithValue } from "@/types/customFields";
import { AlertCircle } from "lucide-react";

interface CustomFieldRendererProps {
  field: CustomFieldWithValue;
  value: any;
  onChange: (value: any) => void;
  validationError?: string;
}

const CustomFieldRenderer = ({
  field,
  value,
  onChange,
  validationError,
}: CustomFieldRendererProps) => {
  const renderField = () => {
    switch (field.field_type) {
      case "text":
        return (
          <Input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Digite ${field.field_name.toLowerCase()}`}
            className={`bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 ${
              validationError ? "border-red-500 focus:border-red-500" : ""
            }`}
          />
        );

      case "single_select":
        return (
          <Select
            value={value || "none"}
            onValueChange={(val) => onChange(val === "none" ? null : val)}
          >
            <SelectTrigger
              className={`bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white ${
                validationError ? "border-red-500 focus:border-red-500" : ""
              }`}
            >
              <SelectValue
                placeholder={`Selecione ${field.field_name.toLowerCase()}`}
              />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
              <SelectItem
                value="none"
                className="text-gray-900 dark:text-white"
              >
                Nenhum
              </SelectItem>
              {field.field_options &&
                Array.isArray(field.field_options) &&
                field.field_options.map((option) => (
                  <SelectItem
                    key={option}
                    value={option}
                    className="text-gray-900 dark:text-white"
                  >
                    {option}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        );

      case "multi_select":
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div
            className={`space-y-2 ${
              validationError ? "p-2 border border-red-500 rounded" : ""
            }`}
          >
            {field.field_options &&
              Array.isArray(field.field_options) &&
              field.field_options.map((option) => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onChange([...selectedValues, option]);
                      } else {
                        onChange(
                          selectedValues.filter((v: string) => v !== option),
                        );
                      }
                    }}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700"
                  />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {option}
                  </span>
                </label>
              ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
        {field.field_name}
        {field.is_required && <span className="text-red-500 ml-1">*</span>}
        {validationError && <AlertCircle className="h-4 w-4 text-red-500" />}
      </Label>
      {renderField()}
      {validationError && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {validationError}
        </p>
      )}
    </div>
  );
};

export default CustomFieldRenderer;
