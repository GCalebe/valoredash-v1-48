import React, { useState } from "react";
import { Edit, Trash2, ArrowRight, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import AddStageDialog from "../stages/AddStageDialog";
import EditStageDialog from "../stages/EditStageDialog";
import { useAIStageManager } from "@/hooks/useAIStageManager";
import type { AIStage } from "@/hooks/useAIStagesQuery";

const AIStagesTab = () => {
  const {
    stages,
    isLoading,
    error,
    addStage,
    updateStage,
    deleteStage,
    toggleStage,
    moveStage,
    isAdding,
    isUpdating,
    isDeleting,
  } = useAIStageManager();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<AIStage | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-red-600">Erro ao carregar etapas</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  const handleEditStage = (stage: AIStage) => {
    setEditingStage(stage);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
            Configuração das Etapas da IA
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Defina o fluxo de conversação e etapas que a IA deve seguir
          </p>
        </div>
        <AddStageDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSubmit={addStage}
          isSubmitting={isAdding}
        />
      </div>

      <div className="space-y-4">
        {stages.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <h3 className="text-lg font-medium mb-1">Nenhuma etapa configurada</h3>
            <p className="text-sm">Comece adicionando etapas ao fluxo de conversação.</p>
          </div>
        ) : (
          stages.map((stage, index) => (
            <div key={stage.id} className="relative">
              <Card className={`${!stage.is_active ? "opacity-50" : ""}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                        {stage.stage_order || index + 1}
                      </div>
                      <div>
                        <CardTitle className="text-base">{stage.name}</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{stage.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveStage(stage.id, "up")}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveStage(stage.id, "down")}
                        disabled={index === stages.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditStage(stage)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteStage(stage.id)}
                        className="text-red-500 hover:text-red-600"
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stage.trigger_conditions?.trigger && (
                      <div>
                        <span className="text-sm font-medium">Gatilho:</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">
                          {stage.trigger_conditions.trigger}
                        </span>
                      </div>
                    )}

                    {stage.actions && Array.isArray(stage.actions) && stage.actions.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">Ações:</span>
                        <ul className="text-sm text-gray-600 dark:text-gray-300 ml-4 mt-1">
                          {stage.actions.map((action, actionIndex) => (
                            <li key={actionIndex} className="list-disc">
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={stage.is_active ? "default" : "secondary"}>
                          {stage.is_active ? "Ativa" : "Inativa"}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => toggleStage(stage.id)}>
                          {stage.is_active ? "Desativar" : "Ativar"}
                        </Button>
                      </div>
                      {stage.next_stage_id && stage.next_stage_id !== "Fim" && (
                        <div className="flex items-center text-sm text-gray-500">
                          <ArrowRight className="h-4 w-4 mr-1" /> Próxima: {stage.next_stage_id}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {index < stages.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <EditStageDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        stage={editingStage}
        onSubmit={(values) => (editingStage ? updateStage(editingStage.id, values) : Promise.resolve())}
        isSubmitting={isUpdating}
      />
    </div>
  );
};

export default AIStagesTab;
