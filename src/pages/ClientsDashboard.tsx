import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { useClientManagementSimplified } from "@/hooks/useClientManagementSimplified";
import { useUnifiedClientFilters } from "@/hooks/useUnifiedClientFilters";
import { useFilteredContacts } from "@/hooks/useFilteredContacts";
import { useKanbanStagesSupabase, KanbanStage } from "@/hooks/useKanbanStagesSupabase";
import { useCustomFieldsPreloader } from "@/hooks/useCustomFieldsPreloader";
import ClientsDashboardLayout from "@/components/clients/ClientsDashboardLayout";
import ClientsTable from "@/components/clients/ClientsTable";
import ClientsListView from "@/components/clients/ClientsListView";
import KanbanView from "@/components/clients/KanbanView";
import GanttView from "@/components/clients/GanttView";
import ClientsModals from "@/components/clients/ClientsModals";
import EditStageDialog from "@/components/clients/EditStageDialog";
// Tree views não estão presentes; renderização de tree desativada temporariamente

const ClientsDashboard = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const filter = useUnifiedClientFilters();
  const { customFieldFilters } = filter;

  const [viewMode, setViewMode] = useState<"table" | "kanban" | "gantt">("kanban");
  const [isCompactView, setIsCompactView] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [listGrouping, setListGrouping] = useState<"flat" | "stageTag">("flat");
  
  // Stage editing state  
  const [isEditStageDialogOpen, setIsEditStageDialogOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<KanbanStage | null>(null);

  // Use the new Supabase-based kanban stages hook
  const kanbanStages = useKanbanStagesSupabase();

  // Hook para contatos filtrados
  const {
    contacts,
    isLoading: loadingContacts,
    refetch: handleRefresh,
  } = useFilteredContacts();

  // Hook para gerenciamento de estado dos clientes (sem dados)
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
    handleContactClick,
    handleAddContact: handleAddContactBase,
    handleEditContact: handleEditContactBase,
    handleDeleteContact: handleDeleteContactBase,
    openEditModal,
    handleMessageClick,
    handleMessageSubmit: handleMessageSubmitBase,
    handlePauseDurationConfirm: handlePauseDurationConfirmBase,
    handleKanbanStageChange: handleKanbanStageChangeBase,
  } = useClientManagementSimplified();

  // Wrappers para incluir refresh dos dados
  const handleAddContact = async () => {
    const result = await handleAddContactBase(() => handleRefresh());
    return result;
  };

  const handleEditContact = async () => {
    await handleEditContactBase(() => handleRefresh());
  };

  const handleDeleteContact = async () => {
    await handleDeleteContactBase(() => handleRefresh());
  };

  const handleMessageSubmit = async () => {
    await handleMessageSubmitBase(() => handleRefresh());
  };

  const handlePauseDurationConfirm = async (duration: number) => {
    await handlePauseDurationConfirmBase(duration, () => handleRefresh());
  };

  const handleKanbanStageChange = async (contactId: string, newStageId: string) => {
    await handleKanbanStageChangeBase(contactId, newStageId, () => handleRefresh());
  };

  // Estado para refreshing
  const [refreshing, setRefreshing] = useState(false);

  // Wrapper para handleRefresh com estado de loading
  const handleRefreshWithLoading = async () => {
    setRefreshing(true);
    try {
      await Promise.resolve(handleRefresh());
    } finally {
      setRefreshing(false);
    }
  };

  // Pré-carregar campos personalizados em background
  useCustomFieldsPreloader(contacts);

  // Handle stage editing
  const handleStageEdit = (stage: KanbanStage) => {
    setSelectedStage(stage);
    setIsEditStageDialogOpen(true);
  };

  const handleSaveStage = (stageId: string, title: string, color: string) => {
    kanbanStages.updateStage(stageId, title, color);
  };

  const handleCloseEditStageDialog = () => {
    setIsEditStageDialogOpen(false);
    setSelectedStage(null);
  };

  useEffect(() => {
    if (!isAuthLoading && !user) {
      navigate("/");
    }
  }, [user, isAuthLoading, navigate]);

  if (isAuthLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="h-16 w-16 border-4 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const headerActiveFilterChips = [
    filter.searchTerm ? `Busca: ${filter.searchTerm}` : "",
    filter.hasAdvancedRules ? `Filtro: ativo` : "",
  ].filter((v): v is string => Boolean(v));

  return (
    <ClientsDashboardLayout
      headerProps={{
        searchTerm: filter.searchTerm,
        setSearchTerm: filter.setSearchTerm,
        isFilterDialogOpen,
        setIsFilterDialogOpen,
        statusFilter: filter.statusFilter,
        segmentFilter: filter.segmentFilter,
        lastContactFilter: filter.lastContactFilter,
        customFieldFilters,
        onStatusFilterChange: filter.setStatusFilter,
        onSegmentFilterChange: filter.setSegmentFilter,
        onLastContactFilterChange: filter.setLastContactFilter,
        onAddCustomFieldFilter: filter.addCustomFieldFilter,
        onRemoveCustomFieldFilter: filter.removeCustomFieldFilter,
        onClearFilters: filter.clearAllFilters,
        onClearCustomFieldFilters: () => filter.clearAllFilters(),
        hasActiveFilters: filter.hasActiveFilters,
        activeFilterChips: [
          filter.searchTerm ? `Busca: ${filter.searchTerm}` : "",
          filter.statusFilter !== "all" ? `Status: ${filter.statusFilter}` : "",
          filter.segmentFilter !== "all" ? `Etapa: ${filter.segmentFilter}` : "",
          filter.lastContactFilter !== "all" ? `Últ. contato: ${filter.lastContactFilter}` : "",
          customFieldFilters.length > 0 ? `Custom: ${customFieldFilters.length}` : "",
          filter.hasAdvancedRules ? `Avançados` : "",
        ].filter(Boolean) as string[],
        isAddContactOpen,
        onAddContactOpenChange: setIsAddContactOpen,
        newContact,
        setNewContact,
        handleAddContact,
        viewMode,
        setViewMode: (v) => setViewMode(v as "table" | "kanban" | "gantt"),
        isCompactView,
        setIsCompactView,
        listGrouping,
        setListGrouping,
        refreshing,
        handleRefresh: () => { void handleRefreshWithLoading(); },
      }}
    >
      <div className="flex-1 overflow-hidden">
        {viewMode === "table" ? (
          <ClientsListView
            contacts={contacts}
            isLoading={loadingContacts}
            searchTerm={filter.searchTerm}
            statusFilter={filter.statusFilter}
            segmentFilter={filter.segmentFilter}
            lastContactFilter={filter.lastContactFilter}
            customFieldFilters={customFieldFilters}
            groupingMode={listGrouping}
            stages={kanbanStages.stages}
            onViewDetails={handleContactClick}
            onSendMessage={(contactId: string) => {
              const contact = contacts.find(c => c.id === contactId);
              if (contact) {
                setSelectedContact(contact);
                handleMessageClick();
              }
            }}
            onEditClient={openEditModal}
          />
        ) : viewMode === "kanban" ? (
          <KanbanView
            contacts={contacts}
            onContactClick={handleContactClick}
            onStageChange={handleKanbanStageChange}
            searchTerm={filter.searchTerm}
            onEditClick={openEditModal}
            isCompact={isCompactView}
            stages={kanbanStages.stages}
            onStageEdit={handleStageEdit}
          />
        ) : viewMode === "gantt" ? (
          <GanttView
            contacts={contacts}
            onContactClick={handleContactClick}
            searchTerm={filter.searchTerm}
            stages={kanbanStages.stages}
          />
        ) : null}
      </div>

      <ClientsModals
        selectedContact={selectedContact}
        isDetailSheetOpen={isDetailSheetOpen}
        setIsDetailSheetOpen={setIsDetailSheetOpen}
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        isMessageDialogOpen={isMessageDialogOpen}
        setIsMessageDialogOpen={setIsMessageDialogOpen}
        isPauseDurationDialogOpen={isPauseDurationDialogOpen}
        setIsPauseDurationDialogOpen={setIsPauseDurationDialogOpen}
        messageText={messageText}
        setMessageText={setMessageText}
        newContact={newContact}
        setNewContact={setNewContact}
        handleEditContact={handleEditContact}
        handleDeleteContact={handleDeleteContact}
        openEditModal={openEditModal}
        handleMessageSubmit={handleMessageSubmit}
        handlePauseDurationConfirm={handlePauseDurationConfirm}
      />

      <EditStageDialog
        isOpen={isEditStageDialogOpen}
        onClose={handleCloseEditStageDialog}
        stage={selectedStage}
        onSave={handleSaveStage}
      />
    </ClientsDashboardLayout>
  );
};

export default ClientsDashboard;
