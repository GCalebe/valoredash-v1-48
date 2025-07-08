import React, { useState } from "react";
import { Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useKanbanStages } from "@/hooks/useKanbanStages";

export function KanbanSettings() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStage, setNewStage] = useState("");
  const { stages, loading, addStage, removeStage, reorderStages, fetchStages } =
    useKanbanStages();

  // For drag-and-drop reordering UI (optional)
  // For now, simple click-up/down arrows, or just a basic non-draggable reorder, focusing on add/remove.

  const handleAddStage = async () => {
    if (
      newStage.trim() &&
      !stages.some(
        (s) => s.title.toLowerCase() === newStage.trim().toLowerCase(),
      )
    ) {
      await addStage(newStage.trim());
      setNewStage("");
    }
  };

  const handleRemoveStage = async (stageId: string) => {
    await removeStage(stageId);
  };

  const handleSave = async () => {
    // Already persisted on add/remove, just close
    setIsDialogOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsDialogOpen(true)}
        className="text-white hover:bg-white/20 focus-visible:ring-white"
      >
        <Settings className="h-4 w-4" />
        <span className="sr-only">Configurações do Kanban</span>
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Personalizar Etapas do Kanban</DialogTitle>
            <DialogDescription>
              Adicione, remova ou reordene as etapas do seu funil de clientes.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {stages.map((stage, index) => (
                <div
                  key={stage.id}
                  className="flex items-center justify-between p-2 bg-muted rounded-md text-sm"
                >
                  <span>{stage.title}</span>
                  {stages.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleRemoveStage(stage.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <Input
                value={newStage}
                onChange={(e) => setNewStage(e.target.value)}
                placeholder="Nome da nova etapa"
                onKeyDown={(e) => e.key === "Enter" && handleAddStage()}
              />
              <Button onClick={handleAddStage}>Adicionar</Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
