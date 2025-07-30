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
  HelpCircle, 
  SortAsc, 
  SortDesc,
  Download,
  Upload,
  Grid3X3,
  TreePine
} from "lucide-react";

interface FAQHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddFAQ: () => void;
  onImport?: () => void;
  onExport?: () => void;
  sortBy: "question" | "category" | "created_at";
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: "question" | "category" | "created_at", order: "asc" | "desc") => void;
  totalFAQs: number;
  filteredFAQs: number;
  viewMode: "grid" | "hierarchy";
  onViewModeChange: (mode: "grid" | "hierarchy") => void;
}

const FAQHeader: React.FC<FAQHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onAddFAQ,
  onImport,
  onExport,
  sortBy,
  sortOrder,
  onSortChange,
  totalFAQs,
  filteredFAQs,
  viewMode,
  onViewModeChange
}) => {
  const handleSortChange = (field: "question" | "category" | "created_at") => {
    const newOrder = field === sortBy && sortOrder === "asc" ? "desc" : "asc";
    onSortChange(field, newOrder);
  };

  const getSortLabel = (field: string) => {
    const labels = {
      question: "Pergunta",
      category: "Categoria",
      created_at: "Data de Criação"
    };
    return labels[field as keyof typeof labels] || field;
  };

  return (
    <div className="space-y-4">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <HelpCircle className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Perguntas Frequentes (FAQ)</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{totalFAQs} perguntas</span>
              {filteredFAQs !== totalFAQs && (
                <>
                  <span>•</span>
                  <span>{filteredFAQs} filtradas</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <Button onClick={onAddFAQ} className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar FAQ
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar FAQ..."
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
              <DropdownMenuItem onClick={() => handleSortChange("question")}>
                Pergunta {sortBy === "question" && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("category")}>
                Categoria {sortBy === "category" && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("created_at")}>
                Criação {sortBy === "created_at" && (sortOrder === "asc" ? "↑" : "↓")}
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
                  Importar FAQ
                </DropdownMenuItem>
              )}
              {onExport && (
                <DropdownMenuItem onClick={onExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar FAQ
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default FAQHeader;