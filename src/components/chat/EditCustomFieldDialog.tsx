import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useCustomFields } from "@/hooks/useCustomFields";
import { toast } from "@/hooks/use-toast";

interface EditCustomFieldDialogProps {
  isOpen: boolean;
  onClose: () => void;
  field: {
    id: string;
    name: string;
    type: string;
    options: string[];
  } | null;
  onFieldEdited?: () => void;
}

type FieldType = "text" | "single_select" | "multi_select";

const EditCustomFieldDialog: React.FC<EditCustomFieldDialogProps> = ({
  isOpen,
  onClose,
  field,
  onFieldEdited,
}) => {
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState<FieldType>("text");
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [loading, setLoading] = useState(false);

  const { updateCustomField } = useCustomFields();

  // Preencher dados quando o campo for selecionado
  useEffect(() => {
    if (field) {
      setFieldName(field.name);
      setFieldType(field.type as FieldType);
      setOptions(field.options || []);
      setIsRequired(false); // Pode ser expandido para buscar do banco
    }
  }, [field]);

  const handleAddOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      setOptions([...options, newOption.trim()]);
      setNewOption("");
    }
  };

  const handleRemoveOption = (optionToRemove: string) => {
    setOptions(options.filter(option => option !== optionToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddOption();
    }
  };

  const handleSubmit = async () => {
    if (!field || !fieldName.trim()) {
      toast({
        title: "Erro",
        description: "Nome do campo é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if ((fieldType === "single_select" || fieldType === "multi_select") && options.length === 0) {
      toast({
        title: "Erro",
        description: "Campos de seleção precisam ter pelo menos uma opção",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await updateCustomField(field.id, {
        field_name: fieldName.trim(),
        field_type: fieldType,
        field_options: fieldType === "text" ? null : options,
        is_required: isRequired,
      });

      toast({
        title: "Campo atualizado",
        description: `Campo "${fieldName}" foi atualizado com sucesso`,
      });

      onFieldEdited?.();
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar campo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o campo personalizado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFieldTypeLabel = (type: FieldType) => {
    switch (type) {
      case "text":
        return "Texto Curto";
      case "single_select":
        return "Seleção Única";
      case "multi_select":
        return "Seleção Múltipla";
      default:
        return type;
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFieldName("");
    setFieldType("text");
    setOptions([]);
    setNewOption("");
    setIsRequired(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Campo Personalizado</DialogTitle>
          <DialogDescription>
            Modificar as configurações do campo "{field?.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nome do Campo */}
          <div className="space-y-2">
            <Label htmlFor="fieldName">Nome do Campo</Label>
            <Input
              id="fieldName"
              placeholder="Ex: Preferência de contato"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
            />
          </div>

          {/* Tipo do Campo */}
          <div className="space-y-2">
            <Label htmlFor="fieldType">Tipo do Campo</Label>
            <Select value={fieldType} onValueChange={(value: FieldType) => setFieldType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Texto Curto</SelectItem>
                <SelectItem value="single_select">Seleção Única</SelectItem>
                <SelectItem value="multi_select">Seleção Múltipla</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Opções (apenas para campos de seleção) */}
          {(fieldType === "single_select" || fieldType === "multi_select") && (
            <div className="space-y-2">
              <Label>Opções</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Digite uma opção"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  disabled={!newOption.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {options.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {options.map((option, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {option}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-red-500"
                        onClick={() => handleRemoveOption(option)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Campo Obrigatório */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isRequired"
              checked={isRequired}
              onCheckedChange={(checked) => setIsRequired(checked as boolean)}
            />
            <Label htmlFor="isRequired">Campo obrigatório</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCustomFieldDialog;