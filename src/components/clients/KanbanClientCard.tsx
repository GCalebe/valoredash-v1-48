import React from "react";
import { Contact } from "@/types/client";
import { cn } from "@/lib/utils";
import ClientCard from "./ClientCard";

interface KanbanClientCardProps {
  contact: Contact;
  onClick: (contact: Contact) => void;
  onEditClick: (contact: Contact) => void;
  index: number;
  isCompact: boolean;
  dragHandleProps?: any;
  draggableProps?: any;
  innerRef?: (element: HTMLElement | null) => void;
  snapshot?: any;
}

export const KanbanClientCard: React.FC<KanbanClientCardProps> = ({
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
  return (
    <ClientCard
      contact={contact}
      onClick={onClick}
      onEditClick={onEditClick}
      displayConfig={{
        showTags: true,
        showConsultationStage: true,
        showCommercialInfo: false,
        showCustomFields: false,
        isCompact,
      }}
      dragHandleProps={dragHandleProps}
      draggableProps={draggableProps}
      innerRef={innerRef}
      snapshot={snapshot}
      className={cn(snapshot?.isDragging ? "shadow-xl rotate-1 scale-105" : "")}
    />
  );
};

export default KanbanClientCard;
