
// @ts-nocheck
import React, { useRef, useCallback, useMemo } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import KanbanStageColumn from "./KanbanStageColumn";
import { Contact } from "@/types/client";
import { KanbanStage } from "@/hooks/useKanbanStages";
import { useContactsByKanbanStage } from "@/hooks/useContactsByKanbanStage";
import { Loader2 } from "lucide-react";
import { useHorizontalDragScroll } from "./kanban/hooks/useHorizontalDragScroll";
import { useKanbanDragAndDrop } from "./kanban/hooks/useKanbanDragAndDrop";

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

const KanbanView = React.memo(({
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
  const { isDragging, handlers } = useHorizontalDragScroll(scrollContainerRef);
  const { draggedContactId, isUpdatingStage, optimisticContacts, setOptimisticContacts, handleDragStart, handleDragEnd } = useKanbanDragAndDrop(
    stages,
    contacts,
    onStageChange as any,
  );

  // Sincronizar contatos otimistas com contatos reais
  React.useEffect(() => {
    setOptimisticContacts(contacts);
  }, [contacts]);

  // Filtragem de contatos otimizada com useMemo
  const filteredContacts = useMemo(() => {
    if (!searchTerm.trim()) return optimisticContacts;
    const searchLower = searchTerm.toLowerCase();
    return optimisticContacts.filter((contact) =>
      contact.name.toLowerCase().includes(searchLower) ||
      contact.email?.toLowerCase().includes(searchLower) ||
      contact.clientName?.toLowerCase().includes(searchLower) ||
      contact.phone?.includes(searchTerm)
    );
  }, [optimisticContacts, searchTerm]);

  // Agrupamento de contatos por estágio usando hook refatorado
  const contactsByStage = useContactsByKanbanStage(filteredContacts, stages);

  // Memoizar estágios para evitar re-renderizações
  const memoizedStages = useMemo(() => stages, [stages]);

  // Callbacks otimizados com useCallback
  const handleContactClick = useCallback((contact: Contact) => {
    onContactClick(contact);
  }, [onContactClick]);

  const handleEditClick = useCallback((contact: Contact) => {
    onEditClick(contact);
  }, [onEditClick]);

  const handleStageEdit = useCallback((stage: KanbanStage) => {
    onStageEdit?.(stage);
  }, [onStageEdit]);

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

  // Sincronizar contatos ao mudar da fonte
  React.useEffect(() => {
    setOptimisticContacts(contacts);
  }, [contacts, setOptimisticContacts]);

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div
        ref={scrollContainerRef}
        className={`overflow-x-auto overflow-y-hidden h-full select-none transition-all duration-200 ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        } [&::-webkit-scrollbar]:hidden relative`}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        {...handlers}
      >
        {/* Loading overlay when updating stage */}
        {isUpdatingStage && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg shadow-lg border">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Atualizando estágio...</span>
            </div>
          </div>
        )}
        
        <div className="flex gap-3 min-w-max p-1 md:p-2 kanban-drag-area h-full">
          {memoizedStages.map((stage) => (
            <KanbanStageColumn
              key={stage.id}
              stage={stage}
              contacts={contactsByStage[stage.title] || []}
              onContactClick={handleContactClick}
              onEditClick={handleEditClick}
              isCompact={isCompact}
              onStageEdit={handleStageEdit}
              isDraggedOver={draggedContactId !== null}
            />
          ))}
        </div>
      </div>
    </DragDropContext>
  );
});

// Adicionar displayName para debugging
KanbanView.displayName = 'KanbanView';

export default KanbanView;
