import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Package, 
  SortAsc, 
  SortDesc,
  Grid3X3,
  List,
  Download,
  Upload
} from "lucide-react";

interface ProductsHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddProduct: () => void;
  onImport?: () => void;
  onExport?: () => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  sortBy: "name" | "price" | "created_at";
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: "name" | "price" | "created_at", order: "asc" | "desc") => void;
  totalProducts: number;
  filteredProducts: number;
}

const ProductsHeader: React.FC<ProductsHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onAddProduct,
  onImport,
  onExport,
  viewMode,
  onViewModeChange,
  sortBy,
  sortOrder,
  onSortChange,
  totalProducts,
  filteredProducts,
}) => {
  const handleSortChange = (newSortBy: "name" | "price" | "created_at") => {
    if (sortBy === newSortBy) {
      // Toggle order if same field
      onSortChange(newSortBy, sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Default to ascending for new field
      onSortChange(newSortBy, "asc");
    }
  };

  const getSortLabel = (field: string) => {
    const labels = {
      name: "Nome",
      price: "Preço",
      created_at: "Data de Criação"
    };
    return labels[field as keyof typeof labels] || field;
  };

  return (
    <div className="space-y-4">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Package className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Produtos/Serviços</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{totalProducts} produtos</span>
              {filteredProducts !== totalProducts && (
                <>
                  <span>•</span>
                  <span>{filteredProducts} filtrados</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <Button onClick={onAddProduct} className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Produto
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
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
              <DropdownMenuItem onClick={() => handleSortChange("price")}>
                Preço {sortBy === "price" && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("created_at")}>
                Data {sortBy === "created_at" && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Mode */}
          <div className="border rounded-md p-1 flex">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className="px-2"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className="px-2"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

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
                  Importar Produtos
                </DropdownMenuItem>
              )}
              {onExport && (
                <DropdownMenuItem onClick={onExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Produtos
                </DropdownMenuItem>
              )}
              {(onImport || onExport) && <DropdownMenuSeparator />}
              <DropdownMenuItem>
                <Package className="h-4 w-4 mr-2" />
                Filtros Avançados
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default ProductsHeader;