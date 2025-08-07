import React, { useMemo, useCallback } from "react";
import { Contact } from "@/types/client";
import { cn } from "@/lib/utils";
import ClientCard from "./ClientCard";

interface KanbanClientCardProps {
  contact: Contact;
  onClick: (contact: Contact) => void;
  onEditClick: (contact: Contact) => void;
  index: number;
  isCompact: boolean;
  dragHandleProps?: Record<string, unknown>;
  draggableProps?: Record<string, unknown>;
  innerRef?: (element: HTMLElement | null) => void;
  snapshot?: { isDragging: boolean; [key: string]: unknown };
}

export const KanbanClientCard: React.FC<KanbanClientCardProps> = React.memo(({
  contact,
  onClick,
  onEditClick,
  index,
  isCompact,
  dragHandleProps,
  draggableProps,
  innerRef,
  snapshot,
}) => {
  // Memoizar callbacks para evitar re-renders desnecessários
  const handleClick = useCallback(() => {
    onClick(contact);
  }, [onClick, contact]);

  const handleEditClick = useCallback(() => {
    onEditClick(contact);
  }, [onEditClick, contact]);

  // Memoizar displayConfig para evitar recriações
  const displayConfig = useMemo(() => ({
    showTags: true,
    showConsultationStage: true,
    showCommercialInfo: false,
    showCustomFields: false,
    isCompact,
  }), [isCompact]);

  // Memoizar className para evitar recálculos
  const className = useMemo(() => 
    cn(snapshot?.isDragging ? "shadow-xl rotate-1 scale-105" : ""),
    [snapshot?.isDragging]
  );

  return (
    <ClientCard
      contact={contact}
      onClick={handleClick}
      onEditClick={handleEditClick}
      displayConfig={displayConfig}
      dragHandleProps={dragHandleProps}
      draggableProps={draggableProps}
      innerRef={innerRef}
      snapshot={snapshot}
      className={className}
    />
  );
});

// Adicionar displayName para debugging
KanbanClientCard.displayName = 'KanbanClientCard';

export default KanbanClientCard;
