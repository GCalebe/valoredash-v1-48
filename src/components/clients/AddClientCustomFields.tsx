import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomField } from "@/types/customFields";
import CustomFieldRenderer from "./CustomFieldRenderer";

interface AddClientCustomFieldsProps {
  customFields: CustomField[];
  customValues: { [fieldId: string]: string | string[] | null };
  onCustomFieldChange: (fieldId: string, value: string | string[] | null) => void;
  loading?: boolean;
}

const AddClientCustomFields: React.FC<AddClientCustomFieldsProps> = ({
  customFields,
  customValues,
  onCustomFieldChange,
  loading = false,
}) => {
  // Filter fields that should be visible in basic tab
  const visibleFields = customFields.filter(field => 
    field.visibility_settings?.visible_in_tabs?.basic !== false
  );

  if (loading && visibleFields.length === 0) {
    return (
      <div className="space-y-4">
        <Label className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          CAMPOS PERSONALIZADOS
        </Label>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (visibleFields.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium text-gray-600 uppercase tracking-wide">
        CAMPOS PERSONALIZADOS
      </Label>
      <div className="space-y-4">
        {visibleFields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label className="text-sm font-medium">
              {field.field_name}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <CustomFieldRenderer
              field={field}
              value={customValues[field.id] || null}
              onChange={(value) => onCustomFieldChange(field.id, value as string | string[] | null)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddClientCustomFields;