import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingButton } from "@/components/ui/loading-button";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Contact } from "@/types/client";

import ContactInfo from "@/components/chat/ContactInfo";
import NotesFieldEdit from "./NotesFieldEdit";
import CustomFieldsSection from "./CustomFieldsSection";
import LoadingClientState from "@/components/chat/LoadingClientState";
import { useOptimizedCustomFields } from "@/hooks/useOptimizedCustomFields";
import { SkeletonFormGrid, SkeletonCustomFields } from "@/components/ui/skeleton-form";
import { Loader2 } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(true);
  const [customFieldsLoading, setCustomFieldsLoading] = useState(true);
  const validationErrors = {};
  
  // Usar o hook otimizado para pré-carregar campos personalizados
  const { preloadCustomFields } = useOptimizedCustomFields();

  useEffect(() => {
    if (isOpen && selectedContact) {
      setIsLoading(true);
      setCustomFieldsLoading(true);
      
      console.log("Setting contact data for editing:", selectedContact);
      setContact({ ...selectedContact });
      
      // Simulate loading time for better UX feedback
      setTimeout(() => setIsLoading(false), 200);
      
      // Pré-carregar campos personalizados quando o painel é aberto
      if (selectedContact.id) {
        preloadCustomFields(selectedContact.id)
          .finally(() => setCustomFieldsLoading(false));
      } else {
        setCustomFieldsLoading(false);
      }
    }
  }, [isOpen, selectedContact, preloadCustomFields]);



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

  // Show loading state while initial data loads
  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-4xl w-[90vw] h-[80vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando dados do cliente...
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 p-6">
            <SkeletonFormGrid fields={6} />
            <div className="mt-6">
              <SkeletonCustomFields />
            </div>
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

              {/* Custom Fields Section */}
              <div className="mt-6">
                {customFieldsLoading ? (
                  <SkeletonCustomFields />
                ) : (
                  <CustomFieldsSection contactId={selectedContact?.id || null} />
                )}
              </div>

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
              <LoadingButton
                onClick={handleSave} 
                loading={isSaving}
                loadingText="Salvando..."
                disabled={Object.keys(validationErrors).length > 0}
                className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1"
              >
                Salvar
              </LoadingButton>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditClientPanel;