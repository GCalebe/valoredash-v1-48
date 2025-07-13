
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { Edit3 } from "lucide-react";
import KanbanClientCard from "./KanbanClientCard";
import { Contact } from "@/types/client";
import { KanbanStage } from "@/hooks/useKanbanStages";

interface KanbanStageColumnProps {
  stage: KanbanStage;
  contacts: Contact[];
  onContactClick: (contact: Contact) => void;
  onEditClick: (contact: Contact) => void;
  isCompact: boolean;
  onStageEdit?: (stage: KanbanStage) => void;
}

const KanbanStageColumn: React.FC<KanbanStageColumnProps> = ({
  stage,
  contacts,
  onContactClick,
  onEditClick,
  isCompact,
  onStageEdit,
}) => {
  const stageColor = stage.settings?.color || "#6b7280";
  const headerStyle = {
    color: stageColor,
  };

  return (
    <div className="w-[280px] md:w-[320px] flex-shrink-0">
      <Card className="h-full flex flex-col border">
        <CardHeader className="p-2 border-b">
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span style={headerStyle}>
                {stage.title}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-muted/50"
                onClick={() => onStageEdit?.(stage)}
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            </div>
            <Badge variant="secondary" className="text-xs h-5">
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
                className={`min-h-[200px] transition-colors duration-200 rounded-lg ${
                  snapshot.isDraggingOver ? "bg-blue-50 dark:bg-blue-950/20 ring-2 ring-blue-200 dark:ring-blue-800" : ""
                }`}
              >
                {contacts.map((contact, index) => (
                  <Draggable key={contact.id} draggableId={contact.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`mb-2 ${
                          snapshot.isDragging ? "opacity-50 rotate-2 scale-105 shadow-2xl z-50" : ""
                        }`}
                        style={{
                          ...provided.draggableProps.style,
                          ...(snapshot.isDragging && {
                            background: "white",
                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
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
                  <div className="text-center text-gray-400 text-sm py-8">
                    Arraste um cliente para cá
                  </div>
                )}
                {snapshot.isDraggingOver && contacts.length === 0 && (
                  <div className="text-center text-blue-500 text-sm py-8 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    Solte o cliente aqui
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </CardContent>
      </Card>
    </div>
  );
};

export default KanbanStageColumn;
