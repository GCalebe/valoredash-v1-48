import React from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from "@/components/animate-ui/base/accordion";
import { Badge } from "@/components/ui/badge";
import ContactListItem from "./ContactListItem";
import { Contact } from "@/types/client";

interface TagGroupProps {
  stageId: string;
  tag: string;
  contacts: Contact[];
  onViewDetails: (contact: Contact) => void;
  onSendMessage: (contactId: string) => void;
  onEditClient: (contact: Contact) => void;
}

const TagGroup: React.FC<TagGroupProps> = ({ stageId, tag, contacts, onViewDetails, onSendMessage, onEditClient }) => {
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
            <ul className="divide-y">
              {contacts.map((c) => (
                <ContactListItem
                  key={c.id}
                  contact={c}
                  onViewDetails={onViewDetails}
                  onSendMessage={onSendMessage}
                  onEditClient={onEditClient}
                />
              ))}
            </ul>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default TagGroup;
