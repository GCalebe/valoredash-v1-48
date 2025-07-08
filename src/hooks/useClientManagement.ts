import { useContactsData } from "./useContactsData";
import { useClientState } from "./useClientState";
import { useClientActions } from "./useClientActions";
import { useClientCustomFields } from "./useClientCustomFields";
import { useClientDisplayConfig } from "./useClientDisplayConfig";

export const useClientManagement = () => {
  const {
    contacts,
    setContacts,
    loadingContacts,
    refreshing,
    fetchClients,
    handleKanbanStageChange,
    handleRefresh,
  } = useContactsData();

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

  const getUnifiedContacts = () => {
    return contacts.map((contact) => {
      return contact;
    });
  };

  const handleAddContactWrapper = async (): Promise<string | undefined> => {
    return await createContact(
      newContact,
      (contactId?: string) => {
        fetchClients();
        setIsAddContactOpen(false);
      },
      resetNewContact,
    );
  };

  const handleEditContactWrapper = async () => {
    if (!selectedContact) return;

    await updateContact(selectedContact, newContact, () => {
      fetchClients();
      setIsEditModalOpen(false);
    });
  };

  const handleDeleteContactWrapper = async () => {
    if (!selectedContact) return;

    await deleteContact(selectedContact, () => {
      fetchClients();
      setSelectedContact(null);
      setIsDetailSheetOpen(false);
      setIsDeleteDialogOpen(false);
    });
  };

  const handleMessageClick = () => {
    setMessageText("");
    setIsMessageDialogOpen(true);
  };

  const handleMessageSubmit = () => {
    if (!messageText.trim() || !selectedContact) return;

    setIsMessageDialogOpen(false);
    setIsPauseDurationDialogOpen(true);
  };

  const handlePauseDurationConfirmWrapper = async (duration: number | null) => {
    await sendMessage(selectedContact, messageText, duration, () =>
      setIsPauseDurationDialogOpen(false),
    );
  };

  return {
    // Estados de contatos
    contacts,
    unifiedContacts: getUnifiedContacts(),
    loadingContacts,
    refreshing,
    selectedContact,
    setSelectedContact,

    // Estados de modais e diálogos
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

    // Estados de formulários
    messageText,
    setMessageText,
    newContact,
    setNewContact,

    // Campos personalizados
    customFieldsWithValues,
    loadingCustomFields,
    loadCustomFieldsForContact,
    saveCustomFields,

    // Configurações de visualização
    displayConfig,
    updateDisplayConfig,

    // Ações
    handleRefresh,
    handleContactClick,
    handleAddContact: handleAddContactWrapper,
    handleEditContact: handleEditContactWrapper,
    handleDeleteContact: handleDeleteContactWrapper,
    openEditModal,
    handleMessageClick,
    handleMessageSubmit,
    handlePauseDurationConfirm: handlePauseDurationConfirmWrapper,
    handleKanbanStageChange,
    fetchClients,
  };
};
