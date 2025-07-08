import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Contact } from "@/types/client";
import { MessageCircle, Edit, Trash } from "lucide-react";
import ClientInfo from "./ClientInfo";
import { DynamicCategory } from "./DynamicCategoryManager";
import { useDynamicFields } from "@/hooks/useDynamicFields";

interface ClientDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  onSendMessage?: (contactId: string) => void;
  onEditClient?: (contact: Contact) => void;
  onDeleteClient?: (contact: Contact) => void;
}

/**
 * Componente para exibir os detalhes do cliente em uma folha lateral
 */
const ClientDetailSheet: React.FC<ClientDetailSheetProps> = ({
  isOpen,
  onClose,
  contact,
  onSendMessage,
  onEditClient,
  onDeleteClient,
}) => {
  // Inicializando dynamicFields com um objeto vazio para evitar o erro
  const [dynamicFields, setDynamicFields] = useState({
    basic: [],
    commercial: [],
    personalized: [],
    documents: [],
  });

  useEffect(() => {
    if (isOpen && contact) {
      // Verificando no console os dados recebidos
      console.log("ClientDetailSheet - Props:", {
        isOpen,
        contact,
        onSendMessage,
        onEditClient,
        onDeleteClient,
      });

      // Se necessário, podemos carregar os campos dinâmicos aqui usando o ID do contato
      // Exemplo: fetchDynamicFieldsForContact(contact.id);
    }
  }, [isOpen, contact, onSendMessage, onEditClient, onDeleteClient]);

  const handleSendMessage = () => {
    if (contact?.id && onSendMessage) {
      onSendMessage(contact.id);
      onClose();
    }
  };

  const handleEditClient = () => {
    if (contact && onEditClient) {
      onEditClient(contact);
      onClose();
    }
  };

  const handleDeleteClient = () => {
    if (contact && onDeleteClient) {
      onDeleteClient(contact);
      onClose();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md md:max-w-lg lg:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-xl font-bold">
            {contact?.name || "Detalhes do Cliente"}
          </SheetTitle>
        </SheetHeader>

        {contact && (
          <div className="space-y-6">
            <ClientInfo
              clientData={contact}
              dynamicFields={dynamicFields}
              context="details"
            />

            <div className="flex space-x-2 mt-6">
              <Button
                variant="default"
                className="flex-1"
                onClick={handleSendMessage}
                disabled={!onSendMessage}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Enviar Mensagem
              </Button>

              <Button
                variant="outline"
                className="flex-1"
                onClick={handleEditClient}
                disabled={!onEditClient}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar Cliente
              </Button>

              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDeleteClient}
                disabled={!onDeleteClient}
              >
                <Trash className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ClientDetailSheet;
