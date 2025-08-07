  
import React, { useMemo, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { Edit3 } from "lucide-react";
import KanbanClientCard from "./KanbanClientCard";
import { Contact } from "@/types/client";
import { KanbanStage } from "@/hooks/useKanbanStagesSupabase";

interface KanbanStageColumnProps {
  stage: KanbanStage;
  contacts: Contact[];
  onContactClick: (contact: Contact) => void;
  onEditClick: (contact: Contact) => void;
  isCompact: boolean;
  onStageEdit?: (stage: KanbanStage) => void;
  isDraggedOver?: boolean;
}

const KanbanStageColumn: React.FC<KanbanStageColumnProps> = React.memo(({
  stage,
  contacts,
  onContactClick,
  onEditClick,
  isCompact,
  onStageEdit,
  isDraggedOver,
}) => {
  // Memoizar o estilo do header para evitar recriações
  const headerStyle = useMemo(() => ({
    color: stage.settings?.color || "#6b7280",
  }), [stage.settings?.color]);

  // Memoizar o callback de edição do stage
  const handleStageEdit = useCallback(() => {
    onStageEdit?.(stage);
  }, [onStageEdit, stage]);

  return (
    <div className={`w-[280px] md:w-[320px] flex-shrink-0 transition-all duration-200 ${
      isDraggedOver ? 'scale-[1.02]' : ''
    }`}>
      <Card className="h-full flex flex-col border transition-all duration-200">
        <CardHeader className="p-2 border-b">
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span style={headerStyle} className="transition-all duration-200">
                {stage.title}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-muted/50 transition-colors"
                onClick={handleStageEdit}
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            </div>
            <Badge variant="secondary" className="text-xs h-5 transition-all duration-200">
              {contacts.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 flex-1 overflow-y-auto">
          <Droppable droppableId={stage.id}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`min-h-[200px] transition-all duration-300 rounded-lg p-2 ${
                  snapshot.isDraggingOver 
                    ? "bg-primary/10 ring-2 ring-primary/30 shadow-lg transform scale-[1.02]" 
                    : "hover:bg-muted/30"
                }`}
              >
                {contacts.map((contact, index) => (
                  <Draggable key={contact.id} draggableId={contact.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`mb-2 transition-all duration-200 ${
                          snapshot.isDragging 
                            ? "opacity-80 rotate-3 scale-110 shadow-2xl z-50 cursor-grabbing" 
                            : "hover:scale-[1.02] hover:shadow-md cursor-grab"
                        }`}
                        style={{
                          ...provided.draggableProps.style,
                          ...(snapshot.isDragging && {
                            background: "hsl(var(--card))",
                            borderRadius: "8px",
                            border: "2px solid hsl(var(--primary))",
                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px hsl(var(--primary))",
                            transform: `${provided.draggableProps.style?.transform} rotate(3deg) scale(1.1)`,
                          }),
                        }}
                      >
                        <KanbanClientCard
                          contact={contact}
                          onClick={onContactClick}
                          onEditClick={onEditClick}
                          index={index}
                          isCompact={isCompact}
                          dragHandleProps={provided.dragHandleProps}
                          draggableProps={provided.draggableProps}
                          innerRef={provided.innerRef}
                          snapshot={snapshot}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                {contacts.length === 0 && !snapshot.isDraggingOver && (
                  <div className="text-center text-muted-foreground text-sm py-8 transition-all duration-200">
                    Arraste um cliente para cá
                  </div>
                )}
                {snapshot.isDraggingOver && contacts.length === 0 && (
                  <div className="text-center text-primary text-sm py-8 border-2 border-dashed border-primary/40 rounded-lg bg-primary/5 animate-pulse transition-all duration-300">
                    <div className="animate-bounce">📥</div>
                    <div className="mt-1">Solte o cliente aqui</div>
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </CardContent>
      </Card>
    </div>
  );
});

// Adicionar displayName para debugging
KanbanStageColumn.displayName = 'KanbanStageColumn';

export default KanbanStageColumn;
