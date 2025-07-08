import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { GripVertical, Eye, EyeOff } from "lucide-react";
import {
  ColumnConfig,
  defaultColumnConfig,
  saveColumnConfig,
} from "@/config/columnConfig";

interface ColumnConfigDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  columnConfig: ColumnConfig[];
  onColumnConfigChange: (config: ColumnConfig[]) => void;
}

const ColumnConfigDialog: React.FC<ColumnConfigDialogProps> = ({
  isOpen,
  onOpenChange,
  columnConfig,
  onColumnConfigChange,
}) => {
  const [columns, setColumns] = useState<ColumnConfig[]>(columnConfig);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(columns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Atualiza a prioridade com base na nova ordem
    const updatedItems = items.map((item, index) => ({
      ...item,
      priority: index + 1,
    }));

    setColumns(updatedItems);
  };

  const toggleColumnVisibility = (id: string) => {
    const updatedColumns = columns.map((column) => {
      if (column.id === id) {
        return { ...column, isVisible: !column.isVisible };
      }
      return column;
    });
    setColumns(updatedColumns);
  };

  const handleSave = () => {
    onColumnConfigChange(columns);
    saveColumnConfig(columns);
    onOpenChange(false);
  };

  const handleReset = () => {
    setColumns(defaultColumnConfig);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurar Colunas</DialogTitle>
          <DialogDescription>
            Arraste para reordenar ou ative/desative colunas para personalizar a
            tabela de clientes.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="columns">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {columns.map((column, index) => (
                    <Draggable
                      key={column.id}
                      draggableId={column.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md border"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab"
                            >
                              <GripVertical className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {column.label}
                              </span>
                              <span className="text-xs text-gray-500">
                                {column.isVisible ? (
                                  <span className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" /> Visível
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <EyeOff className="h-3 w-3" /> Oculto
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              id={`column-${column.id}`}
                              checked={column.isVisible}
                              onCheckedChange={() =>
                                toggleColumnVisibility(column.id)
                              }
                            />
                            <Label
                              htmlFor={`column-${column.id}`}
                              className="sr-only"
                            >
                              {column.label}
                            </Label>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            Restaurar Padrão
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar Configuração</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnConfigDialog;
