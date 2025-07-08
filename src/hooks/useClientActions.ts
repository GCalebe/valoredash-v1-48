import { Contact } from "@/types/client";
import { useContactsActions } from "./useContactsActions";
import { useContactsMessages } from "./useContactsMessages";

export const useClientActions = () => {
  const { handleAddContact, handleEditContact, handleDeleteContact } =
    useContactsActions();
  const { handlePauseDurationConfirm } = useContactsMessages();

  const createContact = async (
    contactData: Partial<Contact>,
    onSuccess?: (contactId?: string) => void,
    onReset?: () => void,
  ): Promise<string | undefined> => {
    return new Promise((resolve) => {
      handleAddContact(
        contactData,
        (contactId?: string) => {
          onSuccess?.(contactId);
          resolve(contactId);
        },
        onReset,
      );
    });
  };

  const updateContact = async (
    selectedContact: Contact,
    contactData: Partial<Contact>,
    onSuccess?: () => void,
  ) => {
    await handleEditContact(selectedContact, contactData, onSuccess);
  };

  const deleteContact = async (
    selectedContact: Contact,
    onSuccess?: () => void,
  ) => {
    await handleDeleteContact(selectedContact, onSuccess);
  };

  const sendMessage = async (
    selectedContact: Contact | null,
    messageText: string,
    duration: number | null,
    onSuccess?: () => void,
  ) => {
    await handlePauseDurationConfirm(
      selectedContact,
      messageText,
      duration,
      onSuccess,
    );
  };

  return {
    createContact,
    updateContact,
    deleteContact,
    sendMessage,
  };
};
