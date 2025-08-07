import { useClientState } from "./useClientState";
import { useClientActions } from "./useClientActions";
import { useClientCustomFields } from "./useClientCustomFields";
import { useClientDisplayConfig } from "./useClientDisplayConfig";

export const useClientManagementSimplified = () => {
  const {
    selectedContact,
    setSelectedContact,
    isAddContactOpen,
    setIsAddContactOpen,
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
    resetNewContact,
    handleContactClick,
    openEditModal,
  } = useClientState();

  const { createContact, updateContact, deleteContact, sendMessage } =
    useClientActions();

  const {
    customFieldsWithValues,
    loadingCustomFields,
    loadCustomFieldsForContact,
    saveCustomFields,
  } = useClientCustomFields(selectedContact?.id);

  const { displayConfig, updateDisplayConfig } = useClientDisplayConfig();

  const handleAddContactWrapper = async (onSuccess?: () => void): Promise<string | undefined> => {
    return await createContact(
      newContact,
      (contactId?: string) => {
        if (onSuccess) onSuccess();
        setIsAddContactOpen(false);
      },
      resetNewContact,
    );
  };

  const handleEditContactWrapper = async (onSuccess?: () => void) => {
    if (!selectedContact) {
      console.log("No selected contact to edit");
      return;
    }

    console.log("Editing contact:", selectedContact);

    // O EditClientForm já passou o contato completo atualizado
    // Agora precisamos apenas salvar usando o selectedContact atual
    await updateContact(selectedContact, selectedContact, () => {
      if (onSuccess) onSuccess();
      setIsEditModalOpen(false);
    });
  };

  const handleDeleteContactWrapper = async (onSuccess?: () => void) => {
    if (!selectedContact) return;

    await deleteContact(selectedContact, () => {
      if (onSuccess) onSuccess();
      setSelectedContact(null);
      setIsDetailSheetOpen(false);
      setIsDeleteDialogOpen(false);
    });
  };

  const handleMessageClick = () => {
    setMessageText("");
    setIsMessageDialogOpen(true);
  };

  const handleMessageSubmit = async (onSuccess?: () => void) => {
    if (!selectedContact || !messageText.trim()) return;

    await sendMessage(selectedContact, messageText, null, () => {
      if (onSuccess) onSuccess();
      setIsMessageDialogOpen(false);
      setMessageText("");
    });
  };

  const handlePauseDurationConfirm = async (
    duration: number,
    onSuccess?: () => void
  ) => {
    if (!selectedContact) return;

    // Implementar lógica de pausa aqui
    console.log(`Pausing contact ${selectedContact.id} for ${duration} days`);
    
    if (onSuccess) onSuccess();
    setIsPauseDurationDialogOpen(false);
  };

  const handleKanbanStageChange = async (
    contactId: string,
    newStageId: string,
    onSuccess?: () => void
  ) => {
    try {
      console.log(`[useClientManagementSimplified] Updating contact ${contactId} to stage ${newStageId}`);
      
      // Aqui você pode implementar a lógica de atualização do estágio
      // Por exemplo, usando o updateContact ou um serviço específico
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error updating kanban stage:", error);
    }
  };

  return {
    // Estados
    selectedContact,
    setSelectedContact,
    isAddContactOpen,
    setIsAddContactOpen,
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
    
    // Ações
    handleContactClick,
    handleAddContact: handleAddContactWrapper,
    handleEditContact: handleEditContactWrapper,
    handleDeleteContact: handleDeleteContactWrapper,
    openEditModal,
    handleMessageClick,
    handleMessageSubmit,
    handlePauseDurationConfirm,
    handleKanbanStageChange,
    
    // Campos personalizados
    customFieldsWithValues,
    loadingCustomFields,
    loadCustomFieldsForContact,
    saveCustomFields,
    
    // Configuração de exibição
    displayConfig,
    updateDisplayConfig,
  };
};