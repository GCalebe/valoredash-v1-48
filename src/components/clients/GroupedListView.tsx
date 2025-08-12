import React, { useMemo, useState } from "react";
import { Contact } from "@/types/client";
import { KanbanStage } from "@/hooks/useKanbanStagesSupabase";
import { useGroupedContactsByStageTag } from "@/hooks/useGroupedContactsByStageTag";
import StageGroup from "./grouped/StageGroup";
import ColumnConfigDialog from "@/components/clients/ColumnConfigDialog";
import { ColumnConfig, getColumnConfig } from "@/config/columnConfig";

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
  const [columnConfig, setColumnConfig] = useState<ColumnConfig[]>(getColumnConfig());
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const visibleColumns = useMemo(
    () =>
      columnConfig
        .filter((c) => c.isVisible && c.id !== "kanbanStage") // ocultar coluna redundante no agrupado
        .sort((a, b) => a.priority - b.priority)
        .map((c) => c.id),
    [columnConfig]
  );

  const grouped = useGroupedContactsByStageTag(contacts, stages);

  if (grouped.length === 0) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Nenhum contato encontrado.
      </div>
    );
  }

  return (
    <>
      <ColumnConfigDialog
        isOpen={isConfigOpen}
        onOpenChange={setIsConfigOpen}
        columnConfig={columnConfig}
        onColumnConfigChange={setColumnConfig}
      />
      <div className="space-y-3">
        {grouped.map((stage) => (
          <StageGroup
            key={stage.stageId}
            stage={stage}
            visibleColumns={visibleColumns}
            onConfigureColumns={() => setIsConfigOpen(true)}
            onViewDetails={onViewDetails}
            onSendMessage={onSendMessage}
            onEditClient={onEditClient}
          />
        ))}
      </div>
    </>
  );
};

export default GroupedListView;
