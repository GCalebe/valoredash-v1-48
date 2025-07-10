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
import { ChromePicker } from "react-color";
import { KanbanStage } from "@/hooks/useKanbanStages";

interface EditStageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stage: KanbanStage | null;
  onSave: (stageId: string, title: string, color: string) => void;
}


const EditStageDialog: React.FC<EditStageDialogProps> = ({
  isOpen,
  onClose,
  stage,
  onSave,
}) => {
  const [title, setTitle] = useState(stage?.title || "");
  const [selectedColor, setSelectedColor] = useState(
    stage?.settings?.color || "#6b7280"
  );
  const [showColorPicker, setShowColorPicker] = useState(false);

  React.useEffect(() => {
    if (stage) {
      setTitle(stage.title);
      setSelectedColor(stage.settings?.color || "#6b7280");
    }
  }, [stage]);

  const handleSave = () => {
    if (!stage || !title.trim()) return;
    onSave(stage.id, title.trim(), selectedColor);
    onClose();
  };

  const handleClose = () => {
    onClose();
    setShowColorPicker(false);
    // Reset form when closing
    if (stage) {
      setTitle(stage.title);
      setSelectedColor(stage.settings?.color || "#6b7280");
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
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="w-full h-10 rounded border border-border flex items-center justify-between px-3 hover:bg-muted/50"
                onClick={() => setShowColorPicker(!showColorPicker)}
              >
                <span className="text-sm">Escolher cor</span>
                <div 
                  className="w-6 h-6 rounded border border-border"
                  style={{ backgroundColor: selectedColor }}
                />
              </button>
              {showColorPicker && (
                <div className="mt-2">
                  <ChromePicker
                    color={selectedColor}
                    onChange={(color) => setSelectedColor(color.hex)}
                    disableAlpha
                  />
                </div>
              )}
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