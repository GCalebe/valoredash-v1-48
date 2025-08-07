import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShipWheel, Filter, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useThemeSettings } from "@/context/ThemeSettingsContext";
import { Input } from "@/components/ui/input";
import { useClientImport } from "@/hooks/useClientImport";
import FilterDialog from "@/components/clients/FilterDialog";
import AddClientDialog from "@/components/clients/AddClientDialog";
import ClientMethodSelectionModal from "@/components/clients/ClientMethodSelectionModal";
import ClientImportModal from "@/components/clients/ClientImportModal";
import ClientsCompactToggler from "./ClientsCompactToggler";
import ClientsViewToggler from "./ClientsViewToggler";
import ClientsRefreshButton from "./ClientsRefreshButton";
import { KanbanSettings } from "./KanbanSettings";

import { CustomFieldFilter } from "@/hooks/useUnifiedClientFilters";

interface ClientsHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isFilterDialogOpen: boolean;
  setIsFilterDialogOpen: (isOpen: boolean) => void;
  statusFilter: string;
  segmentFilter: string;
  lastContactFilter: string;
  customFieldFilters: CustomFieldFilter[];
  onStatusFilterChange: (value: string) => void;
  onSegmentFilterChange: (value: string) => void;
  onLastContactFilterChange: (value: string) => void;
  onAddCustomFieldFilter: (filter: CustomFieldFilter) => void;
  onRemoveCustomFieldFilter: (fieldId: string) => void;
  onClearFilters: () => void;
  onClearCustomFieldFilters: () => void;
  hasActiveFilters: boolean;
  isAddContactOpen: boolean;
  onAddContactOpenChange: (open: boolean) => void;
  newContact: Partial<unknown>;
  setNewContact: (contact: Partial<unknown>) => void;
  handleAddContact: () => Promise<string>;
  viewMode: "table" | "kanban" | "tree-sales" | "tree-marketing";
  setViewMode: (v: "table" | "kanban" | "tree-sales" | "tree-marketing") => void;
  isCompactView: boolean;
  setIsCompactView: (val: boolean) => void;
  refreshing: boolean;
  handleRefresh: () => void;
}

const ClientsHeader = ({
  searchTerm,
  setSearchTerm,
  isFilterDialogOpen,
  setIsFilterDialogOpen,
  statusFilter,
  segmentFilter,
  lastContactFilter,
  customFieldFilters,
  onStatusFilterChange,
  onSegmentFilterChange,
  onLastContactFilterChange,
  onAddCustomFieldFilter,
  onRemoveCustomFieldFilter,
  onClearFilters,
  onClearCustomFieldFilters,
  hasActiveFilters,
  isAddContactOpen,
  onAddContactOpenChange,
  newContact,
  setNewContact,
  handleAddContact,
  viewMode,
  setViewMode,
  isCompactView,
  setIsCompactView,
  refreshing,
  handleRefresh,
}: ClientsHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useThemeSettings();
  
  const {
    isMethodSelectionOpen,
    isImportModalOpen,
    isAddClientOpen: isImportAddClientOpen,
    setIsAddClientOpen: setIsImportAddClientOpen,
    handleNewClientClick,
    handleSelectManual,
    handleSelectImport,
    handleBackToSelection,
    handleCloseAll,
  } = useClientImport();

  const handleAddContactWrapper = async () => {
    return await handleAddContact();
  };

  // Função para exibir o nome do status de forma amigável
  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case "Ganhos":
        return "Ganhos";
      case "Perdidos":
        return "Perdidos";
      case "all":
        return "Todos";
      default:
        return status;
    }
  };

  return (
    <header
      className="shadow-md transition-colors duration-300 rounded-b-xl"
      style={{ backgroundColor: settings.primaryColor }}
    >
      <div className="flex flex-row items-center justify-between min-h-[64px] w-full px-6 py-0">
        {/* Branding e título */}
        <div className="flex items-center gap-4 min-w-0 h-full">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="text-white hover:bg-white/20 focus-visible:ring-white"
            aria-label="Voltar ao dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          {settings.logo ? (
            <img
              src={settings.logo}
              alt="Logo"
              className="h-8 w-8 object-contain"
            />
          ) : (
            <ShipWheel
              className="h-8 w-8"
              style={{ color: settings.secondaryColor }}
            />
          )}
          <h1 className="text-xl font-bold text-white">
            {" "}
            {settings.brandName}{" "}
          </h1>
          <span className="text-base ml-1 opacity-80 text-white">
            Pipeline
          </span>
        </div>

        {/* Grupo principal: filtros, novo cliente e controles */}
        <div className="flex flex-row items-center gap-3 h-full">
          {/* Filtros */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFilterDialogOpen(true)}
            className="text-white hover:bg-white/20 focus-visible:ring-white flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <Badge
                variant="secondary"
                className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                !
              </Badge>
            )}
          </Button>

          <FilterDialog
            isOpen={isFilterDialogOpen}
            onOpenChange={setIsFilterDialogOpen}
            statusFilter={statusFilter}
            segmentFilter={segmentFilter}
            lastContactFilter={lastContactFilter}
            customFieldFilters={customFieldFilters}
            onStatusFilterChange={onStatusFilterChange}
            onSegmentFilterChange={onSegmentFilterChange}
            onLastContactFilterChange={onLastContactFilterChange}
            onAddCustomFieldFilter={onAddCustomFieldFilter}
            onRemoveCustomFieldFilter={onRemoveCustomFieldFilter}
            onClearFilters={onClearFilters}
            onClearCustomFieldFilters={onClearCustomFieldFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Add Cliente - New Flow */}
          <Button 
            className="h-9 bg-green-500 hover:bg-green-600 text-white"
            onClick={handleNewClientClick}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
          
          {/* Method Selection Modal */}
          <ClientMethodSelectionModal
            isOpen={isMethodSelectionOpen}
            onClose={handleCloseAll}
            onSelectManual={handleSelectManual}
            onSelectImport={handleSelectImport}
          />
          
          {/* Import Modal */}
          <ClientImportModal
            isOpen={isImportModalOpen}
            onClose={handleCloseAll}
            onBack={handleBackToSelection}
            onImportComplete={() => {
              handleRefresh();
              handleCloseAll();
            }}
          />
          
          {/* Manual Add Client Dialog */}
          <AddClientDialog
            isOpen={isImportAddClientOpen || isAddContactOpen}
            onOpenChange={(open) => {
              if (isImportAddClientOpen) {
                setIsImportAddClientOpen(open);
              } else {
                onAddContactOpenChange(open);
              }
            }}
            newContact={newContact}
            setNewContact={setNewContact}
            handleAddContact={handleAddContactWrapper}
          />

          {/* Divisor */}
          <div className="h-7 w-px bg-white/30 mx-2 hidden md:block"></div>

          {/* Controles de Kanban/Table/Compact */}
          <div className="flex items-center gap-1 bg-white/10 rounded-md px-1">
            {viewMode === "kanban" && (
              <ClientsCompactToggler
                isCompactView={isCompactView}
                setIsCompactView={setIsCompactView}
                visible
              />
            )}
            <ClientsViewToggler viewMode={viewMode} setViewMode={setViewMode} />
          </div>

          {/* Botão atualizar */}
          <ClientsRefreshButton
            handleRefresh={handleRefresh}
            refreshing={refreshing}
          />

          {/* Divisor */}
          <div className="h-7 w-px bg-white/30 mx-2 hidden md:block"></div>

          {/* Usuário e config */}
          <div className="flex items-center gap-2 min-w-fit">
            <Badge
              variant="outline"
              className="bg-white/10 text-white border border-white/40 px-3 py-1 font-normal rounded-md"
            >
              {user?.user_metadata?.name || user?.email}
            </Badge>
            <KanbanSettings />
          </div>
        </div>
      </div>
      
      {/* Status filter indicator */}
      {statusFilter !== "all" && (
        <div className="bg-white/10 py-1 px-6 text-white text-sm flex items-center">
          <span className="mr-2">Filtro ativo:</span>
          <Badge className="bg-blue-500 text-white">
            Status: {getStatusDisplayName(statusFilter)}
          </Badge>
        </div>
      )}
    </header>
  );
};

export default ClientsHeader;