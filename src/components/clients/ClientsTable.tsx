import React, { useState } from "react";
import { Contact } from "@/types/client";
import { Table } from "@/components/ui/table";
import { ColumnConfig, getColumnConfig } from "@/config/columnConfig";
import ColumnConfigDialog from "./ColumnConfigDialog";
import { CustomFieldFilter } from "@/hooks/useClientsFilters";
import { useClientsTableFilters } from "@/hooks/useClientsTableFilters";
import { ClientsTableStates } from "./table/ClientsTableStates";
import { ClientsTableHeader } from "./table/ClientsTableHeader";
import { ClientsTableBody } from "./table/ClientsTableBody";

interface ClientsTableProps {
  contacts: Contact[];
  isLoading: boolean;
  searchTerm: string;
  statusFilter: string;
  segmentFilter: string;
  lastContactFilter: string;
  customFieldFilters?: CustomFieldFilter[];
  onViewDetails: (contact: Contact) => void;
  onSendMessage: (contactId: string) => void;
  onEditClient: (contact: Contact) => void;
  displayConfig?: {
    showTags?: boolean;
    showConsultationStage?: boolean;
    showCommercialInfo?: boolean;
    showCustomFields?: boolean;
  };
}

const ClientsTable: React.FC<ClientsTableProps> = ({
  contacts,
  isLoading,
  searchTerm,
  statusFilter,
  segmentFilter,
  lastContactFilter,
  customFieldFilters = [],
  onViewDetails,
  onSendMessage,
  onEditClient,
  displayConfig = {
    showTags: true,
    showConsultationStage: true,
    showCommercialInfo: false,
    showCustomFields: false,
  },
}: ClientsTableProps) => {
  const [columnConfig, setColumnConfig] = useState<ColumnConfig[]>(getColumnConfig());
  const [isColumnConfigOpen, setIsColumnConfigOpen] = useState(false);

  const { filteredContacts } = useClientsTableFilters({
    contacts,
    searchTerm,
    statusFilter,
    segmentFilter,
    lastContactFilter,
    customFieldFilters,
  });

  const hasFilters = Boolean(
    searchTerm ||
    statusFilter !== "all" ||
    segmentFilter !== "all" ||
    lastContactFilter !== "all"
  );

  // Obtém as colunas visíveis e ordenadas por prioridade
  const visibleColumns = columnConfig
    .filter((column) => column.isVisible)
    .sort((a, b) => a.priority - b.priority)
    .map((column) => column.id);

  // Renderiza estados especiais (loading/empty)
  const stateComponent = (
    <ClientsTableStates
      isLoading={isLoading}
      hasContacts={filteredContacts.length > 0}
      hasFilters={hasFilters}
      searchTerm={searchTerm}
      statusFilter={statusFilter}
      segmentFilter={segmentFilter}
      lastContactFilter={lastContactFilter}
    />
  );

  if (stateComponent && (isLoading || filteredContacts.length === 0)) {
    return stateComponent;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border">
      <Table>
        <ClientsTableHeader
          visibleColumns={visibleColumns}
          onConfigureColumns={() => setIsColumnConfigOpen(true)}
        />
        <ClientsTableBody
          contacts={filteredContacts}
          visibleColumns={visibleColumns}
          onViewDetails={onViewDetails}
          onSendMessage={onSendMessage}
          onEditClient={onEditClient}
        />
      </Table>

      <ColumnConfigDialog
        isOpen={isColumnConfigOpen}
        onOpenChange={setIsColumnConfigOpen}
        columnConfig={columnConfig}
        onColumnConfigChange={setColumnConfig}
      />
    </div>
  );
};

export default ClientsTable;