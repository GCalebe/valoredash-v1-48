import React from "react";

import GroupedListView from "./GroupedListView";
import { Contact } from "@/types/client";
import { KanbanStage } from "@/hooks/useKanbanStagesSupabase";
import { CustomFieldFilter } from "@/hooks/useClientsFilters";
import { useClientsTableFilters } from "@/hooks/useClientsTableFilters";

interface ClientsListViewProps {
  contacts: Contact[];
  isLoading: boolean;
  searchTerm: string;
  statusFilter: string;
  segmentFilter: string;
  lastContactFilter: string;
  customFieldFilters?: CustomFieldFilter[];
  groupingMode: "flat" | "stageTag";
  stages: KanbanStage[];
  onViewDetails: (contact: Contact) => void;
  onSendMessage: (contactId: string) => void;
  onEditClient: (contact: Contact) => void;
}

const ClientsListView: React.FC<ClientsListViewProps> = ({
  contacts,
  isLoading,
  searchTerm,
  statusFilter,
  segmentFilter,
  lastContactFilter,
  customFieldFilters = [],
  groupingMode,
  stages,
  onViewDetails,
  onSendMessage,
  onEditClient,
}) => {
  const { filteredContacts } = useClientsTableFilters({
    contacts,
    searchTerm,
    statusFilter,
    segmentFilter,
    lastContactFilter,
    customFieldFilters,
  });

  return (
    <GroupedListView
      contacts={filteredContacts}
      stages={stages}
      onViewDetails={onViewDetails}
      onSendMessage={onSendMessage}
      onEditClient={onEditClient}
    />
  );
};

export default ClientsListView;
