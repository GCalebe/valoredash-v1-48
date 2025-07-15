import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StageFormFields from "./StageFormFields";
import type { AIStage } from "@/hooks/useAIStagesQuery";
import type { StageFormValues } from "@/hooks/useAIStageManager";

interface EditStageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stage: AIStage | null;
  onSubmit: (values: StageFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

const EditStageDialog: React.FC<EditStageDialogProps> = ({
  open,
  onOpenChange,
  stage,
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

  useEffect(() => {
    if (stage) {
      setValues({
        name: stage.name,
        description: stage.description || "",
        trigger: stage.trigger_conditions?.trigger || "",
        actions: Array.isArray(stage.actions) ? stage.actions.join("\n") : "",
        nextStage: stage.next_stage_id || "",
      });
    }
  }, [stage]);

  const handleSubmit = async () => {
    if (!stage) return;
    await onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Etapa</DialogTitle>
          <DialogDescription>Modifique as informações da etapa.</DialogDescription>
        </DialogHeader>
        <StageFormFields values={values} onChange={setValues} idPrefix="edit-" />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Atualizando..." : "Atualizar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditStageDialog;
