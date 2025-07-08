
import React from "react";
import { Contact } from "@/types/client";
import ClientDetailSheet from "@/components/clients/ClientDetailSheet";
import EditClientForm from "@/components/clients/EditClientForm";
import SendMessageDialog from "@/components/clients/SendMessageDialog";
import PauseDurationDialog from "@/components/PauseDurationDialog";

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
  return (
    <>
      {selectedContact && (
        <>
          <ClientDetailSheet
            isOpen={isDetailSheetOpen}
            onClose={() => setIsDetailSheetOpen(false)}
            contact={selectedContact}
            onEditClient={openEditModal}
            onDeleteClient={() => setIsDeleteDialogOpen(true)}
            onSendMessage={() => setIsMessageDialogOpen(true)}
          />
          <EditClientForm
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            selectedContact={selectedContact}
            onSave={async (updatedContact: Contact) => {
              // Handle the save logic here
              handleEditContact();
            }}
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
