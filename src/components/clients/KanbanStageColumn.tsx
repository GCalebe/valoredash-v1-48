import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Droppable } from "react-beautiful-dnd";
import { Edit3 } from "lucide-react";
import KanbanClientCard from "./KanbanClientCard";
import { Contact } from "@/types/client";

interface KanbanStageColumnProps {
  stage: string; // Allow any stage name, not just the union type
  contacts: Contact[];
  onContactClick: (contact: Contact) => void;
  onEditClick: (contact: Contact) => void;
  isCompact: boolean;
  onStageEdit?: (stageName: string) => void;
}

// Cores removidas - agora usando apenas cores do texto

const STAGE_HEADER_COLORS: { [key: string]: string } = {
  Entraram: "text-gray-500 dark:text-gray-400",
  Conversaram: "text-blue-500 dark:text-blue-400",
  Agendaram: "text-yellow-500 dark:text-yellow-400",
  Compareceram: "text-green-500 dark:text-green-400",
  Negociaram: "text-purple-500 dark:text-purple-400",
  Postergaram: "text-orange-500 dark:text-orange-400",
  Converteram: "text-emerald-500 dark:text-emerald-400",
};
const DEFAULT_HEADER_COLOR = "text-gray-500 dark:text-gray-400";

const KanbanStageColumn: React.FC<KanbanStageColumnProps> = ({
  stage,
  contacts,
  onContactClick,
  onEditClick,
  isCompact,
  onStageEdit,
}) => (
  <div className="w-[280px] md:w-[320px] flex-shrink-0">
    <Card className="h-full flex flex-col bg-card border">
      <CardHeader className="p-2 border-b-2 border-border/80">
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={STAGE_HEADER_COLORS[stage] ?? DEFAULT_HEADER_COLOR}>
              {stage}
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
        <Droppable droppableId={stage}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`min-h-[200px] transition-colors duration-200 rounded-lg ${
                snapshot.isDraggingOver ? "bg-black/5 dark:bg-white/5" : ""
              }`}
            >
              {contacts.map((contact, index) => (
                <KanbanClientCard
                  key={contact.id}
                  contact={contact}
                  onClick={onContactClick}
                  onEditClick={onEditClick}
                  index={index}
                  isCompact={isCompact}
                />
              ))}
              {provided.placeholder}
              {contacts.length === 0 && !snapshot.isDraggingOver && (
                <div className="text-center text-gray-400 text-sm py-8">
                  Arraste um cliente para cá
                </div>
              )}
            </div>
          )}
        </Droppable>
      </CardContent>
    </Card>
  </div>
);

export default KanbanStageColumn;
