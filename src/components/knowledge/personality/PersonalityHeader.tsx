import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Search, 
  Filter, 
  Brain, 
  SortAsc, 
  SortDesc,
  Download,
  Upload,
  Settings,
  LayoutGrid,
  RotateCcw,
  Grid3X3,
  TreePine
} from "lucide-react";

interface PersonalityHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCreateNew: () => void;
  onImport?: () => void;
  onExport?: () => void;
  onReset?: () => void;
  viewMode: "templates" | "configuration";
  onViewModeChange: (mode: "templates" | "configuration") => void;
  displayMode: "grid" | "hierarchy";
  onDisplayModeChange: (mode: "grid" | "hierarchy") => void;
  totalTemplates: number;
  filteredTemplates: number;
  hasChanges?: boolean;
}

const PersonalityHeader: React.FC<PersonalityHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onCreateNew,
  onImport,
  onExport,
  onReset,
  viewMode,
  onViewModeChange,
  displayMode,
  onDisplayModeChange,
  totalTemplates,
  filteredTemplates,
  hasChanges
}) => {
  return (
    <div className="space-y-4">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Personalidade da IA</h2>
            {viewMode === "templates" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{totalTemplates} templates</span>
                {filteredTemplates !== totalTemplates && (
                  <>
                    <span>•</span>
                    <span>{filteredTemplates} filtrados</span>
                  </>
                )}
              </div>
            )}
            {viewMode === "configuration" && hasChanges && (
              <div className="text-sm text-amber-500">
                Alterações não salvas
              </div>
            )}
          </div>
        </div>
        
        <Button onClick={onCreateNew} className="gap-2">
          <Plus className="h-4 w-4" />
          {viewMode === "templates" ? "Novo Template" : "Salvar Configuração"}
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        {/* Search (apenas no modo templates) */}
        {viewMode === "templates" && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar templates..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Espaçador quando não há busca */}
        {viewMode === "configuration" && <div className="flex-1"></div>}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Display Mode Toggle (apenas no modo templates) */}
          {viewMode === "templates" && (
            <div className="flex items-center border rounded-md">
              <Button
                variant={displayMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => onDisplayModeChange("grid")}
                className="rounded-r-none border-r"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={displayMode === "hierarchy" ? "default" : "ghost"}
                size="sm"
                onClick={() => onDisplayModeChange("hierarchy")}
                className="rounded-l-none"
              >
                <TreePine className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* View Mode */}
          <div className="border rounded-md p-1 flex">
            <Button
              variant={viewMode === "templates" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("templates")}
              className="px-2"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>

            <Button
              variant={viewMode === "configuration" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("configuration")}
              className="px-2"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          {/* Reset (apenas no modo configuração) */}
          {viewMode === "configuration" && onReset && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onReset}
              className="gap-1"
              disabled={!hasChanges}
            >
              <RotateCcw className="h-4 w-4" />
              Resetar
            </Button>
          )}

          {/* More Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onImport && (
                <DropdownMenuItem onClick={onImport}>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Template
                </DropdownMenuItem>
              )}
              {onExport && (
                <DropdownMenuItem onClick={onExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Configuração
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default PersonalityHeader;