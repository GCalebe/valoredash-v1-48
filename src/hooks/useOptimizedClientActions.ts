import { Contact } from "@/types/client";
import { useContactsActions } from "./useContactsActions";
import { useContactsMessages } from "./useContactsMessages";
import { useCustomFields } from "./useCustomFields";
import { toast } from "@/hooks/use-toast";

export const useOptimizedClientActions = () => {
  const { handleAddContact, handleEditContact, handleDeleteContact } = useContactsActions();
  const { handlePauseDurationConfirm } = useContactsMessages();
  const { saveClientCustomValues } = useCustomFields();

  const createContactWithFields = async (
    contactData: Partial<Contact>,
    customValues: Record<string, any>,
    onSuccess?: (contactId?: string) => void,
    onReset?: () => void,
  ): Promise<string | undefined> => {
    return new Promise((resolve, reject) => {
      // Optimized: Create contact and save custom fields in parallel when possible
      handleAddContact(
        contactData,
        async (contactId?: string) => {
          try {
            // If we have custom fields and a contact ID, save them
            if (contactId && Object.keys(customValues).length > 0) {
              const customValuesArray = Object.entries(customValues).map(
                ([fieldId, value]) => ({ fieldId, value })
              );
              
              // Run custom fields save in parallel (fire and forget for better UX)
              saveClientCustomValues(contactId, customValuesArray as any).catch(error => {
                console.error("Error saving custom fields:", error);
                toast({
                  title: "Aviso",
                  description: "Cliente criado, mas alguns campos personalizados podem não ter sido salvos.",
                });
              });
            }
            
            onSuccess?.(contactId);
            resolve(contactId);
          } catch (error) {
            console.error("Error in post-creation process:", error);
            onSuccess?.(contactId); // Still call success since contact was created
            resolve(contactId);
          }
        },
        onReset,
      );
    });
  };

  const updateContactWithFields = async (
    selectedContact: Contact,
    contactData: Contact,
    customValues?: Record<string, any>,
    onSuccess?: () => void,
  ) => {
    try {
      // Update contact data
      await new Promise<void>((resolve, reject) => {
        handleEditContact(selectedContact, contactData, () => {
          resolve();
        });
      });

      // If we have custom field updates, save them in parallel
      if (customValues && Object.keys(customValues).length > 0) {
        const customValuesArray = Object.entries(customValues).map(
          ([fieldId, value]) => ({ fieldId, value })
        );
        
        // Fire and forget custom fields update for better performance
        saveClientCustomValues(selectedContact.id, customValuesArray as any).catch(error => {
          console.error("Error updating custom fields:", error);
          toast({
            title: "Aviso",
            description: "Cliente atualizado, mas alguns campos personalizados podem não ter sido salvos.",
          });
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error updating contact:", error);
      throw error;
    }
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
    createContactWithFields,
    updateContactWithFields,
    deleteContact,
    sendMessage,
    // Legacy compatibility
    createContact: createContactWithFields,
    updateContact: updateContactWithFields,
  };
};