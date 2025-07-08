import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShipWheel, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useThemeSettings } from "@/context/ThemeSettingsContext";
import { Input } from "@/components/ui/input";
import FilterDialog from "@/components/clients/FilterDialog";
import AddClientDialog from "@/components/clients/AddClientDialog";
import ClientsCompactToggler from "./ClientsCompactToggler";
import ClientsViewToggler from "./ClientsViewToggler";
import ClientsRefreshButton from "./ClientsRefreshButton";
import { KanbanSettings } from "./KanbanSettings";

import { CustomFieldFilter } from "@/hooks/useClientsFilters";

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
  newContact: Partial<any>;
  setNewContact: (contact: Partial<any>) => void;
  handleAddContact: () => Promise<string>;
  viewMode: "table" | "kanban";
  setViewMode: (v: "table" | "kanban") => void;
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

  const handleAddContactWrapper = async () => {
    return await handleAddContact();
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
            - Clientes
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

          {/* Add Cliente */}
          <AddClientDialog
            isOpen={isAddContactOpen}
            onOpenChange={onAddContactOpenChange}
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
    </header>
  );
};

export default ClientsHeader;
