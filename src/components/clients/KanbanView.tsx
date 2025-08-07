
// @ts-nocheck
import React, { useRef, useState, useCallback, useMemo } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import KanbanStageColumn from "./KanbanStageColumn";
import { Contact } from "@/types/client";
import { KanbanStage } from "@/hooks/useKanbanStages";
import { useContactsByKanbanStage } from "@/hooks/useContactsByKanbanStage";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

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
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragStartTime, setDragStartTime] = useState<number | null>(null);
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);
  const [draggedContactId, setDraggedContactId] = useState<string | null>(null);
  const [optimisticContacts, setOptimisticContacts] = useState<Contact[]>(contacts);

  // Sincronizar contatos otimistas com contatos reais
  React.useEffect(() => {
    setOptimisticContacts(contacts);
  }, [contacts]);

  // Filtragem de contatos otimizada com useMemo
  const filteredContacts = useMemo(() => {
    if (!searchTerm.trim()) return optimisticContacts;
    
    const searchLower = searchTerm.toLowerCase();
    return optimisticContacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(searchLower) ||
        (contact.email && contact.email.toLowerCase().includes(searchLower)) ||
        (contact.clientName && contact.clientName.toLowerCase().includes(searchLower)) ||
        (contact.phone && contact.phone.includes(searchTerm))
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

  const handleDragStart = useCallback((start: any) => {
    setDragStartTime(Date.now());
    setDraggedContactId(start.draggableId);
    console.log("[KanbanView] Drag started for contact:", start.draggableId);
    
    // Adicionar feedback visual global
    document.body.style.userSelect = 'none';
    document.body.style.pointerEvents = 'none';
    document.body.classList.add('dragging');
  }, []);

  const handleDragEnd = useCallback(async (result: any) => {
    const dragEndTime = Date.now();
    const dragDuration = dragStartTime ? dragEndTime - dragStartTime : 0;
    
    console.log("[KanbanView] Drag ended:", result);
    console.log("[KanbanView] Drag duration:", dragDuration, "ms");
    
    // Limpar feedback visual global
    setDragStartTime(null);
    setDraggedContactId(null);
    document.body.style.userSelect = '';
    document.body.style.pointerEvents = '';
    document.body.classList.remove('dragging');

    if (!result?.destination) {
      console.log("[KanbanView] No destination - drag cancelled");
      return;
    }

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId) {
      console.log("[KanbanView] Same column - no action needed");
      return;
    }

    // Find the source and destination stages usando memoizedStages
    const sourceStage = memoizedStages.find(stage => stage.id === source.droppableId);
    const destinationStage = memoizedStages.find(stage => stage.id === destination.droppableId);
    
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
    
    // Otimistic update: Move contact immediately in UI
    setOptimisticContacts(prevContacts => 
      prevContacts.map(contact => 
        contact.id === draggableId 
          ? { ...contact, kanban_stage_id: destination.droppableId }
          : contact
      )
    );
    
    setIsUpdatingStage(true);
    
    try {
      // Call the stage change handler with the destination stage ID
      await onStageChange(draggableId, destination.droppableId);
      
      toast({
        title: "Cliente movido",
        description: `Cliente movido para ${destinationStage.title} com sucesso`,
        duration: 2000,
      });
    } catch (error) {
      console.error("[KanbanView] Error updating stage:", error);
      
      // Revert optimistic update on error
      setOptimisticContacts(contacts);
      
      toast({
        title: "Erro ao mover cliente",
        description: "Não foi possível mover o cliente. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStage(false);
    }
  }, [memoizedStages, onStageChange, dragStartTime, contacts]);

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
        } [&::-webkit-scrollbar]:hidden relative`}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
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
