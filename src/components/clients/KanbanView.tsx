
// @ts-nocheck
import React, { useRef, useState, useCallback } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import KanbanStageColumn from "./KanbanStageColumn";
import { Contact } from "@/types/client";
import { KanbanStage } from "@/hooks/useKanbanStages";
import { useContactsByKanbanStage } from "@/hooks/useContactsByKanbanStage";
import { toast } from "@/hooks/use-toast";

interface KanbanViewProps {
  contacts: Contact[];
  onContactClick: (contact: Contact) => void;
  onStageChange: (contactId: string, newStageId: string) => void;
  searchTerm: string;
  onEditClick: (contact: Contact) => void;
  isCompact: boolean;
  stages: KanbanStage[];
  onStageEdit?: (stage: KanbanStage) => void;
}

const KanbanView = ({
  contacts,
  onContactClick,
  onStageChange,
  searchTerm,
  onEditClick,
  isCompact,
  stages,
  onStageEdit,
}: KanbanViewProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragStartTime, setDragStartTime] = useState<number | null>(null);

  // Filtragem de contatos
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.email &&
        contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.clientName &&
        contact.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.phone && contact.phone.includes(searchTerm)),
  );

  // Agrupamento de contatos por estágio usando hook refatorado
  const contactsByStage = useContactsByKanbanStage(filteredContacts, stages);

  // Log para diagnosticar dados recebidos
  React.useEffect(() => {
    console.log(
      "[KanbanView] Stages disponíveis:",
      stages.map((s) => ({ id: s.id, title: s.title })),
    );
    console.log(
      "[KanbanView] Total de contatos filtrados:",
      filteredContacts.length,
    );
    console.log("[KanbanView] Agrupamento final:", contactsByStage);
  }, [filteredContacts, stages, contactsByStage]);

  const handleDragStart = useCallback(() => {
    setDragStartTime(Date.now());
    console.log("[KanbanView] Drag started");
  }, []);

  const handleDragEnd = useCallback((result: any) => {
    const dragEndTime = Date.now();
    const dragDuration = dragStartTime ? dragEndTime - dragStartTime : 0;
    
    console.log("[KanbanView] Drag ended:", result);
    console.log("[KanbanView] Drag duration:", dragDuration, "ms");
    
    setDragStartTime(null);

    if (!result?.destination) {
      console.log("[KanbanView] No destination - drag cancelled");
      return;
    }

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId) {
      console.log("[KanbanView] Same column - no action needed");
      return;
    }

    // Find the source and destination stages
    const sourceStage = stages.find(stage => stage.id === source.droppableId);
    const destinationStage = stages.find(stage => stage.id === destination.droppableId);
    
    if (!sourceStage || !destinationStage) {
      console.error("[KanbanView] Could not find source or destination stage");
      toast({
        title: "Erro",
        description: "Não foi possível encontrar os estágios de origem ou destino.",
        variant: "destructive",
      });
      return;
    }

    console.log(`[KanbanView] Moving contact ${draggableId} from ${sourceStage.title} to ${destinationStage.title}`);
    
    // Call the stage change handler with the destination stage ID
    onStageChange(draggableId, destination.droppableId);
  }, [stages, onStageChange, dragStartTime]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;

    if (
      e.target === scrollContainerRef.current ||
      (e.target as Element).closest(".kanban-drag-area")
    ) {
      setIsDragging(true);
      setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
      setScrollLeft(scrollContainerRef.current.scrollLeft);
      e.preventDefault();
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !scrollContainerRef.current) return;

      e.preventDefault();
      const x = e.pageX - scrollContainerRef.current.offsetLeft;
      const walk = (x - startX) * 2;
      scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    },
    [isDragging, startX, scrollLeft],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div
        ref={scrollContainerRef}
        className={`overflow-x-auto overflow-y-hidden h-full select-none transition-all duration-200 ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        } [&::-webkit-scrollbar]:hidden`}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex gap-3 min-w-max p-1 md:p-2 kanban-drag-area h-full">
          {stages.map((stage) => (
            <KanbanStageColumn
              key={stage.id}
              stage={stage}
              contacts={contactsByStage[stage.title] || []}
              onContactClick={onContactClick}
              onEditClick={onEditClick}
              isCompact={isCompact}
              onStageEdit={onStageEdit}
            />
          ))}
        </div>
      </div>
    </DragDropContext>
  );
};

export default KanbanView;
