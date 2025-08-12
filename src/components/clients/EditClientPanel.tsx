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

import { SkeletonFormGrid, SkeletonCustomFields } from "@/components/ui/skeleton-form";
import { Loader2, Save, Clock, CheckCircle } from "lucide-react";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useRealTimeValidation } from "@/hooks/useRealTimeValidation";
import ContactPreview from "./ContactPreview";

interface EditClientPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedContact: Contact | null;
  onSave: (updatedContact: Contact) => Promise<void>;
  enableAutoSave?: boolean;
  showPreview?: boolean;
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
  enableAutoSave = true,
  showPreview = true,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showContactPreview, setShowContactPreview] = useState(false);
  // Auto-save functionality
  const {
    contact,
    updateContact,
    hasUnsavedChanges,
    isSaving: autoSaving,
    lastSaved,
    forceSave,
    discardChanges,
    resetContact,
  } = useAutoSave(selectedContact, {
    enabled: enableAutoSave,
    delay: 2000,
    fields: ['name', 'email', 'phone', 'notes', 'address'],
  });

  // Real-time validation
  const {
    errors,
    isValid,
    getFieldError,
    markFieldAsTouched,
    triggerValidation,
  } = useRealTimeValidation(contact);

  useEffect(() => {
    if (isOpen && selectedContact) {
      setIsLoading(true);
      
      console.log("Setting contact data for editing:", selectedContact);
      resetContact(selectedContact);
      
      // Simulate loading time for better UX feedback
      setTimeout(() => setIsLoading(false), 200);
    }
  }, [isOpen, selectedContact, resetContact]);



  const handleSave = async () => {
    if (!contact) return;

    // Trigger validation
    triggerValidation();
    
    if (!isValid) {
      console.warn("Cannot save with validation errors:", errors);
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
    if (hasUnsavedChanges) {
      // Could add a confirmation dialog here
    }
    resetContact(null);
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
        {/* Header with auto-save status */}
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              {contact?.name ? `Editar Cliente - ${contact.name}` : 'Editar Cliente'}
            </DialogTitle>
            
            {enableAutoSave && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {autoSaving ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : hasUnsavedChanges ? (
                  <>
                    <Clock className="h-3 w-3" />
                    <span>Alterações não salvas</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span>Salvo às {lastSaved.toLocaleTimeString()}</span>
                  </>
                ) : null}
              </div>
            )}
          </div>
          
          {showPreview && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setShowContactPreview(!showContactPreview)}
                className="text-xs text-primary hover:underline"
              >
                {showContactPreview ? 'Ocultar' : 'Mostrar'} Preview
              </button>
            </div>
          )}
        </DialogHeader>
        
        {/* Conteúdo principal */}
        <div className="flex-1 flex min-h-0">
          {/* Left side - Edit form */}
          <div className={`${showContactPreview ? 'w-1/2' : 'w-full'} min-h-0 flex flex-col`}>
            <ScrollArea className="flex-1">
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
                      tags: contact.tags || []
                    }}
                    getStatusColor={() => 'bg-gray-400'}
                    width={400}
                    showCustomFields={false}
                    onTagsChange={(newTags) => {
                      updateContact('tags', newTags);
                      markFieldAsTouched('tags');
                    }}
                  />
                )}

                {/* Custom Fields Section */}
                <div className="mt-6">
                  <CustomFieldsSection contactId={selectedContact?.id || null} />
                </div>

                {/* Notes Field */}
                <div className="mt-6">
                  <NotesFieldEdit contactId={selectedContact?.id || null} />
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Right side - Preview */}
          {showContactPreview && showPreview && contact && (
            <div className="w-1/2 border-l bg-muted/20">
              <div className="p-4 border-b">
                <h3 className="font-medium text-sm">Preview do Cliente</h3>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4">
                  <ContactPreview contact={contact} />
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Footer com botões */}
        <div className="border-t p-4 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {hasUnsavedChanges && !enableAutoSave && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={discardChanges}
                  className="text-destructive hover:text-destructive"
                >
                  Descartar
                </Button>
              )}
              {enableAutoSave && hasUnsavedChanges && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={forceSave}
                  disabled={autoSaving || !isValid}
                >
                  <Save className="h-3 w-3 mr-1" />
                  Salvar Agora
                </Button>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleClose} disabled={isSaving} className="flex-1">
                Cancelar
              </Button>
              <LoadingButton
                onClick={handleSave} 
                loading={isSaving}
                loadingText="Salvando..."
                disabled={!isValid}
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