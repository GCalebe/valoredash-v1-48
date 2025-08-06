import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Contact } from "@/types/client";

import ContactInfo from "@/components/chat/ContactInfo";
import NotesFieldEdit from "./NotesFieldEdit";

import LoadingClientState from "@/components/chat/LoadingClientState";

interface EditClientPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedContact: Contact | null;
  onSave: (updatedContact: Contact) => Promise<void>;
}

/**
 * Painel de edição de cliente com design baseado no ClientInfoPanel
 * Inclui tags, informações em abas, anotações e validação
 */
const EditClientPanel: React.FC<EditClientPanelProps> = ({
  isOpen,
  onClose,
  selectedContact,
  onSave,
}) => {
  const [contact, setContact] = useState<Contact | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [dynamicFieldsLoading, setDynamicFieldsLoading] = useState(false);
  const validationErrors = {};

  useEffect(() => {
    if (isOpen && selectedContact) {
      console.log("Setting contact data for editing:", selectedContact);
      setContact({ ...selectedContact });
    }
  }, [isOpen, selectedContact]);



  const handleSave = async () => {
    if (!contact) return;

    // Check for validation errors
    const hasErrors = Object.keys(validationErrors).length > 0;
    if (hasErrors) {
      console.warn("Cannot save with validation errors:", validationErrors);
      return;
    }

    try {
      setIsSaving(true);
      console.log("Saving contact:", contact);
      await onSave(contact);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setContact(null);
    onClose();
  };

  if (dynamicFieldsLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Carregando...</DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex items-center justify-center">
            <LoadingClientState />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl w-[90vw] h-[80vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            {contact?.name ? `Editar Cliente - ${contact.name}` : 'Editar Cliente'}
          </DialogTitle>
        </DialogHeader>
        
        {/* Conteúdo principal */}
        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-4 space-y-4">
              {/* Client Information with Tabs */}
               {contact && (
                  <ContactInfo
                    contact={{
                      id: contact.id,
                      name: contact.name,
                      avatar: contact.avatar || '',
                      lastMessage: '',
                      timestamp: new Date().toISOString(),
                      unreadCount: 0,
                      isOnline: false,
                      status: 'offline',
                      phone: contact.phone,
                      email: contact.email,
                      sessionId: contact.id,
                      tags: contact.tags || [] // Passar as tags reais do contato
                    }}
                    getStatusColor={() => 'bg-gray-400'}
                    width={400}
                    onTagsChange={(newTags) => {
                      // Atualizar as tags no estado do contato
                      setContact(prev => prev ? { ...prev, tags: newTags } : null);
                    }}
                  />
               )}

              {/* Notes Field */}
              <div className="mt-6">
                <NotesFieldEdit contactId={selectedContact?.id || null} />
              </div>
            </div>
          </ScrollArea>

          {/* Footer com botões */}
          <div className="border-t p-4 flex-shrink-0">
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleClose} disabled={isSaving} className="flex-1">
                Cancelar
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving || Object.keys(validationErrors).length > 0}
                className="bg-green-500 hover:bg-green-600 text-white flex-1"
              >
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditClientPanel;