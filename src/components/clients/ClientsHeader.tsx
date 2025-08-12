import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShipWheel, Filter, UserPlus, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useThemeSettings } from "@/context/ThemeSettingsContext";
import { useClientImport } from "@/hooks/useClientImport";
import AddClientDialog from "@/components/clients/AddClientDialog";
import ClientMethodSelectionModal from "@/components/clients/ClientMethodSelectionModal";
import ClientImportModal from "@/components/clients/ClientImportModal";
import SmartSuggestionsBar from "@/components/clients/SmartSuggestionsBar";
import SlidingFilterPanel from "@/components/clients/SlidingFilterPanel";
import ClientsCompactToggler from "./ClientsCompactToggler";
import ClientsViewToggler from "./ClientsViewToggler";
import ClientsRefreshButton from "./ClientsRefreshButton";
import { KanbanSettings } from "./KanbanSettings";

// Removido filtro antigo, não precisamos mais do tipo CustomFieldFilter aqui

interface ClientsHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  hasActiveFilters: boolean;
  activeFilterChips?: string[];
  isAddContactOpen: boolean;
  onAddContactOpenChange: (open: boolean) => void;
  newContact: Partial<unknown>;
  setNewContact: (contact: Partial<unknown>) => void;
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
  hasActiveFilters,
  activeFilterChips = [],
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
  const [isSmartSuggestionsOpen, setIsSmartSuggestionsOpen] = useState(false);
  const [isSlidingFilterOpen, setIsSlidingFilterOpen] = useState(false);
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
  // Indicadores do filtro antigo removidos

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
          {/* Sugestões Inteligentes */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSmartSuggestionsOpen(true)}
            className="text-white hover:bg-white/20 focus-visible:ring-white flex items-center gap-1"
          >
            <Lightbulb className="h-4 w-4" />
            Sugestões
          </Button>

          {/* Filtro 2 (painel deslizante) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSlidingFilterOpen(true)}
            className="text-white hover:bg-white/20 focus-visible:ring-white flex items-center gap-1"
            aria-label="Abrir Filtro 2"
            title="Abrir Filtro 2"
          >
            <Filter className="h-4 w-4" />
            Filtro 2
          </Button>

          {/* Chips dos filtros ativos */}
          {hasActiveFilters && activeFilterChips.length > 0 && (
            <div className="flex gap-1 max-w-[520px] overflow-x-auto py-1">
              {activeFilterChips.map((chip) => (
                <Badge key={chip} variant="secondary" className="whitespace-nowrap">
                  {chip}
                </Badge>
              ))}
            </div>
          )}

          {/* Filtro padrão removido. Mantemos apenas o Filtro 2. */}

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
      
      {/* Indicadores do filtro antigo removidos */}
      
      {/* Smart Suggestions Bar */}
      <SmartSuggestionsBar
        isOpen={isSmartSuggestionsOpen}
        onClose={() => setIsSmartSuggestionsOpen(false)}
      />
      
      {/* Sliding Filter Panel */}
      <SlidingFilterPanel
        isOpen={isSlidingFilterOpen}
        onClose={() => setIsSlidingFilterOpen(false)}
      />
    </header>
  );
};

export default ClientsHeader;