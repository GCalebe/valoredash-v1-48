
import React from "react";
import { Contact } from "@/types/client";
// ClientDetailSheet component was removed
import EditClientPanel from "@/components/clients/EditClientPanel";
import SendMessageDialog from "@/components/clients/SendMessageDialog";
import PauseDurationDialog from "@/components/PauseDurationDialog";
import { useOptimizedClientActions } from "@/hooks/useOptimizedClientActions";

interface ClientsModalsProps {
  selectedContact: Contact | null;
  isDetailSheetOpen: boolean;
  setIsDetailSheetOpen: (open: boolean) => void;
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  isMessageDialogOpen: boolean;
  setIsMessageDialogOpen: (open: boolean) => void;
  isPauseDurationDialogOpen: boolean;
  setIsPauseDurationDialogOpen: (open: boolean) => void;
  messageText: string;
  setMessageText: (text: string) => void;
  newContact: Partial<Contact>;
  setNewContact: (c: Partial<Contact>) => void;
  handleEditContact: () => void;
  handleDeleteContact: () => void;
  openEditModal: () => void;
  handleMessageSubmit: () => void;
  handlePauseDurationConfirm: (d: number | null) => void;
}

const ClientsModals = ({
  selectedContact,
  isDetailSheetOpen,
  setIsDetailSheetOpen,
  isEditModalOpen,
  setIsEditModalOpen,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  isMessageDialogOpen,
  setIsMessageDialogOpen,
  isPauseDurationDialogOpen,
  setIsPauseDurationDialogOpen,
  messageText,
  setMessageText,
  newContact,
  setNewContact,
  handleEditContact,
  handleDeleteContact,
  openEditModal,
  handleMessageSubmit,
  handlePauseDurationConfirm,
}: ClientsModalsProps) => {
  const { updateContactWithFields } = useOptimizedClientActions();
  
  const handleSaveContact = async (updatedContact: Contact) => {
    console.log("handleSaveContact called with:", updatedContact);
    
    if (!selectedContact) return;
    
    // Use optimized update function
    await updateContactWithFields(
      selectedContact,
      updatedContact,
      undefined, // No custom fields for now
      () => {
        console.log("Contact updated successfully");
      }
    );
  };

  return (
    <>
      {selectedContact && (
        <>
          {/* ClientDetailSheet component was removed */}
          <EditClientPanel
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            selectedContact={selectedContact}
            onSave={handleSaveContact}
          />
          {isMessageDialogOpen && (
            <SendMessageDialog
              isOpen={isMessageDialogOpen}
              selectedContact={selectedContact}
              messageText={messageText}
              setMessageText={setMessageText}
              handleMessageSubmit={handleMessageSubmit}
              onOpenChange={setIsMessageDialogOpen}
              isPauseDurationDialogOpen={isPauseDurationDialogOpen}
              setIsPauseDurationDialogOpen={setIsPauseDurationDialogOpen}
              handlePauseDurationConfirm={handlePauseDurationConfirm}
            />
          )}
        </>
      )}
      <PauseDurationDialog
        isOpen={isPauseDurationDialogOpen}
        onClose={() => setIsPauseDurationDialogOpen(false)}
        onConfirm={handlePauseDurationConfirm}
        phoneNumber={selectedContact?.phone || ""}
      />
    </>
  );
};

export default ClientsModals;
