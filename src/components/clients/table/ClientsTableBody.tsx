import React from "react";
import { Contact } from "@/types/client";
import { TableBody } from "@/components/ui/table";
import ClientTableRow from "../ClientTableRow";

interface ClientsTableBodyProps {
  contacts: Contact[];
  visibleColumns: string[];
  onViewDetails: (contact: Contact) => void;
  onSendMessage: (contactId: string) => void;
  onEditClient: (contact: Contact) => void;
}

export const ClientsTableBody: React.FC<ClientsTableBodyProps> = ({
  contacts,
  visibleColumns,
  onViewDetails,
  onSendMessage,
  onEditClient,
}) => {
  return (
    <TableBody>
      {contacts.map((contact) => (
        <ClientTableRow
          key={contact.id}
          contact={contact}
          onViewDetails={onViewDetails}
          onSendMessage={onSendMessage}
          onEditClient={onEditClient}
          columns={visibleColumns}
        />
      ))}
    </TableBody>
  );
};