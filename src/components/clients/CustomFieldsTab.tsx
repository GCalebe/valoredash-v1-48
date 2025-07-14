
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCustomFields } from "@/hooks/useCustomFields";
import { CustomFieldWithValue } from "@/types/customFields";
import CustomFieldRenderer from "./CustomFieldRenderer";
import CreateCustomFieldDialog from "./CreateCustomFieldDialog";

interface CustomFieldsTabProps {
  clientId?: string;
  onFieldUpdate?: (fieldId: string, value: any) => void;
  readOnly?: boolean;
}

const CustomFieldsTab: React.FC<CustomFieldsTabProps> = ({
  clientId,
  onFieldUpdate,
  readOnly = false,
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [customFieldsWithValues, setCustomFieldsWithValues] = useState<CustomFieldWithValue[]>([]);
  const { customFields, loading } = useCustomFields();

  const handleFieldChange = (fieldId: string, value: any) => {
    if (onFieldUpdate) {
      onFieldUpdate(`custom_${fieldId}`, value);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Carregando campos personalizados...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!readOnly && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Campos Personalizados</h3>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar Campo
          </Button>
        </div>
      )}

      {customFields.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">
            Nenhum campo personalizado configurado ainda.
          </p>
          {!readOnly && (
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Criar Primeiro Campo
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {customFields.map((field) => (
            <CustomFieldRenderer
              key={field.id}
              field={field}
              value={customFieldsWithValues.find(f => f.id === field.id)?.value}
              onChange={(value) => handleFieldChange(field.id, value)}
            />
          ))}
        </div>
      )}

      <CreateCustomFieldDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />
    </div>
  );
};

export default CustomFieldsTab;
