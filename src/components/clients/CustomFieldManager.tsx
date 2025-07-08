import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit } from "lucide-react";
import { useCustomFields } from "@/hooks/useCustomFields";
import { CustomField } from "@/types/customFields";

interface CustomFieldManagerProps {
  onClose?: () => void;
}

const CustomFieldManager = ({ onClose }: CustomFieldManagerProps) => {
  const { customFields, createCustomField, deleteCustomField, loading } =
    useCustomFields();
  const [isCreating, setIsCreating] = useState(false);
  const [newField, setNewField] = useState({
    field_name: "",
    field_type: "text" as "text" | "single_select" | "multi_select",
    field_options: [] as string[],
    is_required: false,
  });
  const [optionText, setOptionText] = useState("");

  const handleCreateField = async () => {
    if (!newField.field_name.trim()) return;

    try {
      await createCustomField({
        field_name: newField.field_name,
        field_type: newField.field_type,
        field_options:
          newField.field_options.length > 0 ? newField.field_options : null,
        is_required: newField.is_required,
      });

      setNewField({
        field_name: "",
        field_type: "text",
        field_options: [],
        is_required: false,
      });
      setIsCreating(false);
    } catch (error) {
      console.error("Error creating field:", error);
    }
  };

  const addOption = () => {
    if (
      optionText.trim() &&
      !newField.field_options.includes(optionText.trim())
    ) {
      setNewField({
        ...newField,
        field_options: [...newField.field_options, optionText.trim()],
      });
      setOptionText("");
    }
  };

  const removeOption = (option: string) => {
    setNewField({
      ...newField,
      field_options: newField.field_options.filter((opt) => opt !== option),
    });
  };

  if (loading) {
    return <div className="p-4">Carregando campos personalizados...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Gerenciar Campos Personalizados
        </h3>
        <Button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Campo
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Campo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="field_name">Nome do Campo</Label>
              <Input
                id="field_name"
                value={newField.field_name}
                onChange={(e) =>
                  setNewField({ ...newField, field_name: e.target.value })
                }
                placeholder="Ex: Indicação"
              />
            </div>

            <div>
              <Label htmlFor="field_type">Tipo do Campo</Label>
              <Select
                value={newField.field_type}
                onValueChange={(
                  value: "text" | "single_select" | "multi_select",
                ) =>
                  setNewField({
                    ...newField,
                    field_type: value,
                    field_options: [],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="single_select">Seleção Única</SelectItem>
                  <SelectItem value="multi_select">Seleção Múltipla</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(newField.field_type === "single_select" ||
              newField.field_type === "multi_select") && (
              <div>
                <Label>Opções</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={optionText}
                    onChange={(e) => setOptionText(e.target.value)}
                    placeholder="Nova opção"
                    onKeyPress={(e) => e.key === "Enter" && addOption()}
                  />
                  <Button onClick={addOption} type="button" variant="outline">
                    Adicionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newField.field_options.map((option) => (
                    <Badge
                      key={option}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {option}
                      <button
                        onClick={() => removeOption(option)}
                        className="ml-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_required"
                checked={newField.is_required}
                onChange={(e) =>
                  setNewField({ ...newField, is_required: e.target.checked })
                }
              />
              <Label htmlFor="is_required">Campo obrigatório</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateField}>Criar Campo</Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {customFields.map((field) => (
          <Card key={field.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{field.field_name}</h4>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline">{field.field_type}</Badge>
                    {field.is_required && (
                      <Badge variant="destructive">Obrigatório</Badge>
                    )}
                  </div>
                  {field.field_options && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {field.field_options.map((option) => (
                        <Badge
                          key={option}
                          variant="secondary"
                          className="text-xs"
                        >
                          {option}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteCustomField(field.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {onClose && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      )}
    </div>
  );
};

export default CustomFieldManager;
