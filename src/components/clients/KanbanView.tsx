import React, { useRef, useState, useCallback } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import KanbanStageColumn from "./KanbanStageColumn";
import { Contact } from "@/types/client";
import { KanbanStage } from "@/hooks/useKanbanStages";
import { useContactsByKanbanStage } from "@/hooks/useContactsByKanbanStage";

interface KanbanViewProps {
  contacts: Contact[];
  onContactClick: (contact: Contact) => void;
  onStageChange: (contactId: string, newStage: string) => void;
  searchTerm: string;
  onEditClick: (contact: Contact) => void;
  isCompact: boolean;
  stages: KanbanStage[];
}

const KanbanView = ({
  contacts,
  onContactClick,
  onStageChange,
  searchTerm,
  onEditClick,
  isCompact,
  stages,
}: KanbanViewProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

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
      stages.map((s) => s.title),
    );
    console.log(
      "[KanbanView] Total de contatos filtrados:",
      filteredContacts.length,
    );
    console.log("[KanbanView] Agrupamento final:", contactsByStage);
  }, [filteredContacts, stages, contactsByStage]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId) return;

    const newStage = destination.droppableId;
    onStageChange(draggableId, newStage);
  };

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
    <DragDropContext onDragEnd={handleDragEnd}>
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
              stage={stage.title}
              contacts={contactsByStage[stage.title] || []}
              onContactClick={onContactClick}
              onEditClick={onEditClick}
              isCompact={isCompact}
            />
          ))}
        </div>
      </div>
    </DragDropContext>
  );
};

export default KanbanView;
