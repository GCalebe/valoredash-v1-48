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
import { KanbanStage } from "@/hooks/useKanbanStages";

interface EditStageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stage: KanbanStage | null;
  onSave: (stageId: string, title: string, color: string) => void;
}

const PRESET_COLORS = [
  "#6b7280", // gray
  "#3b82f6", // blue
  "#eab308", // yellow
  "#22c55e", // green
  "#a855f7", // purple
  "#f97316", // orange
  "#10b981", // emerald
  "#ef4444", // red
  "#8b5cf6", // violet
  "#06b6d4", // cyan
];

const EditStageDialog: React.FC<EditStageDialogProps> = ({
  isOpen,
  onClose,
  stage,
  onSave,
}) => {
  const [title, setTitle] = useState(stage?.title || "");
  const [selectedColor, setSelectedColor] = useState(
    stage?.settings?.color || PRESET_COLORS[0]
  );

  React.useEffect(() => {
    if (stage) {
      setTitle(stage.title);
      setSelectedColor(stage.settings?.color || PRESET_COLORS[0]);
    }
  }, [stage]);

  const handleSave = () => {
    if (!stage || !title.trim()) return;
    onSave(stage.id, title.trim(), selectedColor);
    onClose();
  };

  const handleClose = () => {
    onClose();
    // Reset form when closing
    if (stage) {
      setTitle(stage.title);
      setSelectedColor(stage.settings?.color || PRESET_COLORS[0]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Estágio</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="stage-title">Nome do Estágio</Label>
            <Input
              id="stage-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o nome do estágio"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Cor do Estágio</Label>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === color
                      ? "border-foreground scale-110"
                      : "border-border hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                  aria-label={`Selecionar cor ${color}`}
                />
              ))}
            </div>
          </div>
          
          {/* Preview */}
          <div className="space-y-2">
            <Label>Pré-visualização</Label>
            <div
              className="p-3 rounded-lg border text-sm font-medium"
              style={{ 
                backgroundColor: `${selectedColor}20`,
                borderColor: selectedColor,
                color: selectedColor
              }}
            >
              {title || "Nome do estágio"}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!title.trim()}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditStageDialog;