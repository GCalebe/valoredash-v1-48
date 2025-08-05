// @ts-nocheck
import React, { useState } from "react";
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

interface AddCustomFieldDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetTab: "basico" | "comercial" | "utm" | "midia";
  onFieldAdded?: () => void;
}

type FieldType = "text" | "single_select" | "multi_select";

const AddCustomFieldDialog: React.FC<AddCustomFieldDialogProps> = ({
  isOpen,
  onClose,
  targetTab,
  onFieldAdded,
}) => {
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState<FieldType>("text");
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [loading, setLoading] = useState(false);

  const { addCustomField } = useCustomFields();

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

  const getTabCategory = (tab: string) => {
    switch (tab) {
      case "basico":
        return "basic";
      case "comercial":
        return "commercial";
      case "utm":
        return "utm";
      case "midia":
        return "docs";
      default:
        return "basic";
    }
  };

  const handleSubmit = async () => {
    if (!fieldName.trim()) {
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
      const category = getTabCategory(targetTab);
      
      await addCustomField({
        field_name: fieldName.trim(),
        field_type: fieldType,
        field_options: fieldType === "text" ? null : options,
        is_required: isRequired,
        visibility_settings: {
          visible_in_client_info: true,
          visible_in_tabs: {
            basic: category === "basic",
            commercial: category === "commercial",
            utm: category === "utm",
            docs: category === "docs",
          },
        },
      });

      toast({
        title: "Campo adicionado",
        description: `Campo "${fieldName}" foi criado com sucesso na aba ${targetTab}`,
      });

      // Reset form
      setFieldName("");
      setFieldType("text");
      setOptions([]);
      setNewOption("");
      setIsRequired(false);
      
      onFieldAdded?.();
      onClose();
    } catch (error) {
      console.error("Erro ao criar campo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o campo personalizado",
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

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case "basico":
        return "Básico";
      case "comercial":
        return "Comercial";
      case "utm":
        return "UTM";
      case "midia":
        return "Mídia";
      default:
        return tab;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Campo Personalizado</DialogTitle>
          <DialogDescription>
            Criar um novo campo para a aba {getTabLabel(targetTab)}
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
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Criando..." : "Criar Campo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomFieldDialog;