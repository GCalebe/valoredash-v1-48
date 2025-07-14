
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { useCustomFields } from "@/hooks/useCustomFields";
import { toast } from "@/hooks/use-toast";

interface CreateCustomFieldDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateCustomFieldDialog: React.FC<CreateCustomFieldDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState<"text" | "single_select" | "multi_select">("text");
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>("basic");
  const [isCreating, setIsCreating] = useState(false);

  const { createCustomField } = useCustomFields();

  const handleAddOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      setOptions([...options, newOption.trim()]);
      setNewOption("");
    }
  };

  const handleRemoveOption = (optionToRemove: string) => {
    setOptions(options.filter(option => option !== optionToRemove));
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

    setIsCreating(true);

    try {
      await createCustomField({
        field_name: fieldName.trim(),
        field_type: fieldType,
        field_options: (fieldType === "single_select" || fieldType === "multi_select") ? options : null,
        is_required: isRequired,
        visibility_settings: {
          visible_in_client_info: true,
          visible_in_tabs: {
            [selectedTab]: true
          }
        }
      });

      // Reset form
      setFieldName("");
      setFieldType("text");
      setOptions([]);
      setNewOption("");
      setIsRequired(false);
      setSelectedTab("basic");
      
      onClose();
      
      toast({
        title: "Sucesso",
        description: "Campo personalizado criado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao criar campo personalizado",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setFieldName("");
      setFieldType("text");
      setOptions([]);
      setNewOption("");
      setIsRequired(false);
      setSelectedTab("basic");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Campo Personalizado</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="fieldName">Título do Campo</Label>
            <Input
              id="fieldName"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              placeholder="Ex: Preferência de Contato"
              disabled={isCreating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fieldType">Tipo do Campo</Label>
            <Select
              value={fieldType}
              onValueChange={(value: "text" | "single_select" | "multi_select") => {
                setFieldType(value);
                if (value === "text") {
                  setOptions([]);
                }
              }}
              disabled={isCreating}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Texto</SelectItem>
                <SelectItem value="single_select">Seletor Único</SelectItem>
                <SelectItem value="multi_select">Seletor Múltiplo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(fieldType === "single_select" || fieldType === "multi_select") && (
            <div className="space-y-2">
              <Label>Opções</Label>
              <div className="flex gap-2">
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Digite uma opção"
                  disabled={isCreating}
                  onKeyPress={(e) => e.key === "Enter" && handleAddOption()}
                />
                <Button
                  type="button"
                  onClick={handleAddOption}
                  disabled={!newOption.trim() || isCreating}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {options.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {options.map((option) => (
                    <Badge
                      key={option}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {option}
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(option)}
                        disabled={isCreating}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="selectedTab">Aba onde o campo aparecerá</Label>
            <Select
              value={selectedTab}
              onValueChange={setSelectedTab}
              disabled={isCreating}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Básico</SelectItem>
                <SelectItem value="commercial">Comercial</SelectItem>
                <SelectItem value="utm">UTM</SelectItem>
                <SelectItem value="docs">Arquivos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="required"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              disabled={isCreating}
            />
            <Label htmlFor="required">Campo obrigatório</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isCreating}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isCreating}>
            {isCreating ? "Criando..." : "Criar Campo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCustomFieldDialog;
