import React from "react";
import { Contact } from "@/types/client";
import { KanbanStage } from "@/hooks/useKanbanStagesSupabase";
import { useGroupedContactsByStageTag } from "@/hooks/useGroupedContactsByStageTag";
import StageGroup from "./grouped/StageGroup";

interface GroupedListViewProps {
  contacts: Contact[];
  stages: KanbanStage[];
  onViewDetails: (contact: Contact) => void;
  onSendMessage: (contactId: string) => void;
  onEditClient: (contact: Contact) => void;
}

const GroupedListView: React.FC<GroupedListViewProps> = ({
  contacts,
  stages,
  onViewDetails,
  onSendMessage,
  onEditClient,
}) => {
  const grouped = useGroupedContactsByStageTag(contacts, stages);

  if (grouped.length === 0) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Nenhum contato encontrado.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {grouped.map((stage) => (
        <StageGroup
          key={stage.stageId}
          stage={stage}
          onViewDetails={onViewDetails}
          onSendMessage={onSendMessage}
          onEditClient={onEditClient}
        />)
      )}
    </div>
  );
};

export default GroupedListView;
