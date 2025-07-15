import { useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  useAIStagesQuery,
  useCreateAIStageMutation,
  useUpdateAIStageMutation,
  useDeleteAIStageMutation,
  useReorderAIStagesMutation,
} from "@/hooks/useAIStagesQuery";

export interface StageFormValues {
  name: string;
  description: string;
  trigger: string;
  actions: string;
  nextStage: string;
}

export function useAIStageManager() {
  const { toast } = useToast();
  const { data: stages = [], isLoading, error } = useAIStagesQuery();
  const createStageMutation = useCreateAIStageMutation();
  const updateStageMutation = useUpdateAIStageMutation();
  const deleteStageMutation = useDeleteAIStageMutation();
  const reorderStagesMutation = useReorderAIStagesMutation();

  const sortedStages = useMemo(
    () => [...stages].sort((a, b) => (a.stage_order || 0) - (b.stage_order || 0)),
    [stages],
  );

  const addStage = async (values: StageFormValues) => {
    if (!values.name || !values.description) {
      toast({
        title: "Erro",
        description: "Nome e descrição são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const stageData = {
      name: values.name,
      description: values.description,
      trigger_conditions: { trigger: values.trigger },
      actions: values.actions.split("\n").filter((a) => a.trim()),
      next_stage_id: values.nextStage,
      stage_order: stages.length + 1,
      is_active: true,
    };

    try {
      await createStageMutation.mutateAsync(stageData);
      toast({
        title: "Etapa adicionada",
        description: "Nova etapa criada com sucesso!",
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Erro ao criar etapa.",
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateStage = async (id: string, values: StageFormValues) => {
    if (!values.name || !values.description) return;

    const updatedData = {
      name: values.name,
      description: values.description,
      trigger_conditions: { trigger: values.trigger },
      actions: values.actions.split("\n").filter((a) => a.trim()),
      next_stage_id: values.nextStage,
    };

    try {
      await updateStageMutation.mutateAsync({ id, ...updatedData });
      toast({
        title: "Etapa atualizada",
        description: "Etapa atualizada com sucesso!",
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar etapa.",
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteStage = async (id: string) => {
    try {
      await deleteStageMutation.mutateAsync(id);
      toast({
        title: "Etapa excluída",
        description: "Etapa removida com sucesso!",
        variant: "destructive",
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Erro ao excluir etapa.",
        variant: "destructive",
      });
    }
  };

  const toggleStage = async (id: string) => {
    const stage = stages.find((s) => s.id === id);
    if (!stage) return;

    try {
      await updateStageMutation.mutateAsync({ id, is_active: !stage.is_active });
      toast({
        title: "Etapa atualizada",
        description: `Etapa ${stage.is_active ? "desativada" : "ativada"} com sucesso!`,
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar etapa.",
        variant: "destructive",
      });
    }
  };

  const moveStage = async (id: string, direction: "up" | "down") => {
    const stageIndex = sortedStages.findIndex((s) => s.id === id);
    if (
      stageIndex === -1 ||
      (direction === "up" && stageIndex === 0) ||
      (direction === "down" && stageIndex === sortedStages.length - 1)
    ) {
      return;
    }

    const newStages = [...sortedStages];
    const swapIndex = direction === "up" ? stageIndex - 1 : stageIndex + 1;
    [newStages[stageIndex], newStages[swapIndex]] = [newStages[swapIndex], newStages[stageIndex]];
    const reorderData = newStages.map((stage, index) => ({
      id: stage.id,
      stage_order: index + 1,
    }));

    try {
      await reorderStagesMutation.mutateAsync(reorderData);
      toast({
        title: "Etapas reordenadas",
        description: "Ordem das etapas atualizada com sucesso!",
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Erro ao reordenar etapas.",
        variant: "destructive",
      });
    }
  };

  return {
    stages: sortedStages,
    isLoading,
    error,
    addStage,
    updateStage,
    deleteStage,
    toggleStage,
    moveStage,
    isAdding: createStageMutation.isPending,
    isUpdating: updateStageMutation.isPending,
    isDeleting: deleteStageMutation.isPending,
  };
}

// StageFormValues is already exported as interface above
