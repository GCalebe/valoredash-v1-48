import React from "react";
import { Contact } from "@/types/client";
import { MessageSquare, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContactListItemProps {
  contact: Contact;
  onViewDetails: (contact: Contact) => void;
  onSendMessage: (contactId: string) => void;
  onEditClient: (contact: Contact) => void;
}

const ContactListItem: React.FC<ContactListItemProps> = ({ contact, onViewDetails, onSendMessage, onEditClient }) => {
  return (
    <li className="px-3 py-2 bg-background hover:bg-muted/40 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button
              className="text-sm font-medium hover:underline text-foreground"
              onClick={() => onViewDetails(contact)}
              title="Ver detalhes"
            >
              {contact.name}
            </button>
            {contact.clientName && (
              <span className="text-xs text-muted-foreground">• {contact.clientName}</span>
            )}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {contact.email || contact.phone || "Sem contato"}
          </div>
          {contact.tags && contact.tags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {contact.tags.slice(0, 6).map((t) => (
                <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {t}
                </span>
              ))}
              {contact.tags.length > 6 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">+{contact.tags.length - 6}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => onSendMessage(contact.id)} title="Enviar mensagem">
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEditClient(contact)} title="Editar">
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </li>
  );
};

export default ContactListItem;
