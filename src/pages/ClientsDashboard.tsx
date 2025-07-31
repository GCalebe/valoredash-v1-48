import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { useClientManagement } from "@/hooks/useClientManagement";
import { useClientsFilters } from "@/hooks/useClientsFilters";
import { useKanbanStagesSupabase, KanbanStage } from "@/hooks/useKanbanStagesSupabase";
import ClientsDashboardLayout from "@/components/clients/ClientsDashboardLayout";
import ClientsTable from "@/components/clients/ClientsTable";
import KanbanView from "@/components/clients/KanbanView";
import ClientsModals from "@/components/clients/ClientsModals";
import EditStageDialog from "@/components/clients/EditStageDialog";
import { ClientTreeView2, ClientTreeView4 } from '@/components/clients/tree-views';

const ClientsDashboard = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const filter = useClientsFilters();
  const { customFieldFilters, addCustomFieldFilter, removeCustomFieldFilter } =
    filter;

  const [viewMode, setViewMode] = useState<"table" | "kanban" | "tree-sales" | "tree-marketing">("kanban");
  const [isCompactView, setIsCompactView] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  
  // Stage editing state  
  const [isEditStageDialogOpen, setIsEditStageDialogOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<KanbanStage | null>(null);

  // Use the new Supabase-based kanban stages hook
  const kanbanStages = useKanbanStagesSupabase();

  const {
    contacts,
    loadingContacts,
    refreshing,
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
    handleRefresh,
    handleContactClick,
    handleAddContact,
    handleEditContact,
    handleDeleteContact,
    openEditModal,
    handleMessageClick,
    handleMessageSubmit,
    handlePauseDurationConfirm,
    handleKanbanStageChange,
  } = useClientManagement();

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
        onAddCustomFieldFilter: addCustomFieldFilter,
        onRemoveCustomFieldFilter: removeCustomFieldFilter,
        onClearFilters: filter.clearAll,
        onClearCustomFieldFilters: () => filter.clearAll("customFields"),
        hasActiveFilters: filter.hasActiveFilters,
        isAddContactOpen,
        onAddContactOpenChange: setIsAddContactOpen,
        newContact,
        setNewContact,
        handleAddContact,
        viewMode,
        setViewMode,
        isCompactView,
        setIsCompactView,
        refreshing,
        handleRefresh,
      }}
    >
      <div className="flex-1 overflow-hidden">
        {viewMode === "table" ? (
          <ClientsTable
            contacts={contacts}
            isLoading={loadingContacts}
            searchTerm={filter.searchTerm}
            statusFilter={filter.statusFilter}
            segmentFilter={filter.segmentFilter}
            lastContactFilter={filter.lastContactFilter}
            customFieldFilters={customFieldFilters}
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
        ) : viewMode === "tree-sales" ? (
          <div className="h-full overflow-auto p-4">
            <ClientTreeView2
              contacts={contacts}
              onContactClick={handleContactClick}
              onEditClick={openEditModal}
            />
          </div>
        ) : viewMode === "tree-marketing" ? (
          <div className="h-full overflow-auto p-4">
            <ClientTreeView4
              contacts={contacts}
              onContactClick={handleContactClick}
              onEditClick={openEditModal}
            />
          </div>
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
