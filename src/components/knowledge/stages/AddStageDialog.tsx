import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import StageFormFields from "./StageFormFields";
import type { StageFormValues } from "@/hooks/useAIStageManager";

interface AddStageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: StageFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

const AddStageDialog: React.FC<AddStageDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}) => {
  const [values, setValues] = useState<StageFormValues>({
    name: "",
    description: "",
    trigger: "",
    actions: "",
    nextStage: "",
  });

  const handleSubmit = async () => {
    await onSubmit(values);
    setValues({ name: "", description: "", trigger: "", actions: "", nextStage: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          Adicionar Etapa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Etapa</DialogTitle>
          <DialogDescription>
            Crie uma nova etapa no fluxo de conversação da IA.
          </DialogDescription>
        </DialogHeader>
        <StageFormFields values={values} onChange={setValues} idPrefix="add-" />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Adicionando..." : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddStageDialog;
