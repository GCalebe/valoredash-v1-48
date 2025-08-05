
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useCustomFields } from "@/hooks/useCustomFields";
import { CustomFieldWithValue } from "@/types/customFields";
import CustomFieldRenderer from "./CustomFieldRenderer";
import CreateCustomFieldDialog from "./CreateCustomFieldDialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CustomFieldsTabProps {
  clientId?: string;
  onFieldUpdate?: (fieldId: string, value: string | string[] | null) => void;
  readOnly?: boolean;
}

const CustomFieldsTab: React.FC<CustomFieldsTabProps> = ({
  clientId,
  onFieldUpdate,
  readOnly = false,
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [customFieldsWithValues, setCustomFieldsWithValues] = useState<CustomFieldWithValue[]>([]);
  const { customFields, loading, deleteCustomField, updateCustomField } = useCustomFields();

  const handleFieldChange = (fieldId: string, value: string | string[] | null) => {
    if (onFieldUpdate) {
      onFieldUpdate(`custom_${fieldId}`, value);
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    try {
      await deleteCustomField(fieldId);
    } catch (error) {
      console.error("Erro ao excluir campo:", error);
    }
  };

  const handleVisibilityChange = async (fieldId: string, visible: boolean) => {
    try {
      await updateCustomField(fieldId, { 
        visibility_settings: { visible_in_client_info: visible }
      });
    } catch (error) {
      console.error("Erro ao atualizar visibilidade:", error);
    }
  };

  const handleTabSelectionChange = async (fieldId: string, selectedTab: string) => {
    const field = customFields.find(f => f.id === fieldId);
    if (!field) return;

    const currentSettings = field.visibility_settings || {};
    
    // Reset all tabs to false, then set the selected one to true
    const newTabSettings = {
      basic: false,
      commercial: false,
      utm: false,
      docs: false,
      [selectedTab]: true
    };
    
    try {
      await updateCustomField(fieldId, {
        visibility_settings: {
          ...currentSettings,
          visible_in_tabs: newTabSettings
        }
      });
    } catch (error) {
      console.error("Erro ao atualizar aba do campo:", error);
    }
  };

  // Helper function to get the currently selected tab for a field
  const getSelectedTab = (field: any) => {
    const tabSettings = field?.visibility_settings?.visible_in_tabs || {};
    if (tabSettings.basic) return 'basic';
    if (tabSettings.commercial) return 'commercial';
    if (tabSettings.utm) return 'utm';
    if (tabSettings.docs) return 'docs';
    return 'basic'; // default
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
            <Card key={field.id} className="p-4">
              <div className="space-y-4">
                {/* Campo em si */}
                <div className="flex-1">
                  <CustomFieldRenderer
                    field={field}
                    value={customFieldsWithValues.find(f => f.id === field.id)?.value}
                    onChange={(value) => handleFieldChange(field.id, value as string | string[] | null)}
                  />
                </div>

                {/* Controles de visibilidade e exclusão */}
                {!readOnly && (
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`visible-${field.id}`}
                          checked={field.visibility_settings?.visible_in_client_info !== false}
                          onCheckedChange={(checked) => 
                            handleVisibilityChange(field.id, checked as boolean)
                          }
                        />
                        <Label htmlFor={`visible-${field.id}`} className="text-sm">
                          Exibir nas informações do cliente
                        </Label>
                      </div>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Campo Personalizado</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o campo "{field.field_name}"? 
                              Esta ação não pode ser desfeita e todos os dados associados serão perdidos.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteField(field.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    {/* Configuração de aba - agora como dropdown único */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Exibir na aba:</Label>
                      <Select
                        value={getSelectedTab(field)}
                        onValueChange={(value) => handleTabSelectionChange(field.id, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione uma aba" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Básico</SelectItem>
                          <SelectItem value="commercial">Comercial</SelectItem>
                          <SelectItem value="utm">UTM</SelectItem>
                          <SelectItem value="docs">Arquivos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </Card>
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
