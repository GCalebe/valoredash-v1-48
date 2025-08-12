import React from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from "@/components/animate-ui/base/accordion";
import { Badge } from "@/components/ui/badge";
import { Table } from "@/components/ui/table";
import { ClientsTableHeader } from "@/components/clients/table/ClientsTableHeader";
import { ClientsTableBody } from "@/components/clients/table/ClientsTableBody";
import { Contact } from "@/types/client";

interface TagGroupProps {
  stageId: string;
  tag: string;
  contacts: Contact[];
  visibleColumns: string[];
  onConfigureColumns: () => void;
  onViewDetails: (contact: Contact) => void;
  onSendMessage: (contactId: string) => void;
  onEditClient: (contact: Contact) => void;
}

const TagGroup: React.FC<TagGroupProps> = ({ stageId, tag, contacts, visibleColumns, onConfigureColumns, onViewDetails, onSendMessage, onEditClient }) => {
  return (
    <div className="mx-3 rounded-md border bg-muted/30">
      <Accordion type="multiple" defaultValue={[`${stageId}-${tag}`]}>
        <AccordionItem value={`${stageId}-${tag}`} className="border-b-0">
          <AccordionTrigger className="px-3 py-2 hover:no-underline">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm font-medium text-muted-foreground">{tag}</div>
              <Badge variant="outline">{contacts.length}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionPanel className="px-0 pb-2">
            <Table>
              <ClientsTableHeader visibleColumns={visibleColumns} onConfigureColumns={onConfigureColumns} />
              <ClientsTableBody
                contacts={contacts}
                visibleColumns={visibleColumns}
                onViewDetails={onViewDetails}
                onSendMessage={onSendMessage}
                onEditClient={onEditClient}
              />
            </Table>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default TagGroup;
