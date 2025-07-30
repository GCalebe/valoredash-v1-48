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
  Users, 
  SortAsc, 
  SortDesc,
  Download,
  Upload,
  Grid3X3,
  TreePine
} from "lucide-react";

interface HostsHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddHost: () => void;
  onImport?: () => void;
  onExport?: () => void;
  sortBy: "name" | "role" | "created_at";
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: "name" | "role" | "created_at", order: "asc" | "desc") => void;
  viewMode: "grid" | "hierarchy";
  onViewModeChange: (mode: "grid" | "hierarchy") => void;
  totalHosts: number;
  filteredHosts: number;
  roleFilter: string;
  onRoleFilterChange: (role: string) => void;
}

const HostsHeader: React.FC<HostsHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onAddHost,
  onImport,
  onExport,
  sortBy,
  sortOrder,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalHosts,
  filteredHosts,
  roleFilter,
  onRoleFilterChange
}) => {
  const handleSortChange = (field: "name" | "role" | "created_at") => {
    const newOrder = field === sortBy && sortOrder === "asc" ? "desc" : "asc";
    onSortChange(field, newOrder);
  };

  const getSortLabel = (field: string) => {
    const labels = {
      name: "Nome",
      role: "Função",
      created_at: "Data de Criação"
    };
    return labels[field as keyof typeof labels] || field;
  };

  return (
    <div className="space-y-4">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Anfitriões</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{totalHosts} anfitriões</span>
              {filteredHosts !== totalHosts && (
                <>
                  <span>•</span>
                  <span>{filteredHosts} filtrados</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <Button onClick={onAddHost} className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Anfitrião
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar anfitriões..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className="rounded-r-none border-r"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "hierarchy" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("hierarchy")}
              className="rounded-l-none"
            >
              <TreePine className="h-4 w-4" />
            </Button>
          </div>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                {sortOrder === "asc" ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
                {getSortLabel(sortBy)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleSortChange("name")}>
                Nome {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("role")}>
                Função {sortBy === "role" && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("created_at")}>
                Data {sortBy === "created_at" && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
                  Importar Anfitriões
                </DropdownMenuItem>
              )}
              {onExport && (
                <DropdownMenuItem onClick={onExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Lista
                </DropdownMenuItem>
              )}
              {(onImport || onExport) && <DropdownMenuSeparator />}
              <DropdownMenuItem>
                <Users className="h-4 w-4 mr-2" />
                Filtrar por Função
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default HostsHeader;