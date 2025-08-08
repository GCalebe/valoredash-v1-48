import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X, Filter, Clock, Bookmark, Settings, Save } from "lucide-react";
import { QuickFilters } from "./filters/QuickFilters";
import { SavedFilters } from "./filters/SavedFilters";
import { FilterSuggestionsTabs } from "./filters/FilterSuggestionsTabs";
import { FilterGroupComponent, FilterGroup } from "./filters/FilterGroup";
import { useFilterDialog } from "@/hooks/useFilterDialog";
import { CustomFieldFilter } from "@/hooks/useClientsFilters";

interface SlidingFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  statusFilter?: string;
  segmentFilter?: string;
  lastContactFilter?: string;
  onStatusFilterChange?: (value: string) => void;
  onSegmentFilterChange?: (value: string) => void;
  onLastContactFilterChange?: (value: string) => void;
}

const SlidingFilterPanel: React.FC<SlidingFilterPanelProps> = ({
  isOpen,
  onClose,
  statusFilter = "all",
  segmentFilter = "all",
  lastContactFilter = "all",
  onStatusFilterChange = () => {},
  onSegmentFilterChange = () => {},
  onLastContactFilterChange = () => {},
}) => {
  const {
    filterName,
    setFilterName,
    advancedFilter,
    updateAdvancedFilter,
    saveFilter,
    applySavedFilter,
    loadSavedFilters,
    clearAdvancedFilter,
    hasAdvancedRules,
  } = useFilterDialog('clients');

  const handleAddField = (fieldId: string) => {
    updateAdvancedFilter(advancedFilter.id, {
      ...advancedFilter,
      rules: [
        ...advancedFilter.rules,
        {
          id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          field: fieldId,
          operator: "equals",
          value: "",
        },
      ],
    });
  };

  const activeFiltersCount = [
    statusFilter !== "all",
    segmentFilter !== "all", 
    lastContactFilter !== "all"
  ].filter(Boolean).length;

  const handleApplyFilters = () => {
    window.dispatchEvent(new CustomEvent('clients-apply-advanced-filter', { detail: advancedFilter }));
    onClose();
  };

  const handleClearFilters = () => {
    onStatusFilterChange("all");
    onSegmentFilterChange("all");
    onLastContactFilterChange("all");
    clearAdvancedFilter();
    window.dispatchEvent(new CustomEvent('clients-clear-advanced-filter'));
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[90vw] max-w-[1400px] p-0">
        <div className="flex h-full">
          {/* Coluna Esquerda - Filtros Rápidos */}
          <div className="w-[400px] min-w-[400px] border-r border-gray-200 flex flex-col bg-gray-50/50">
            <div className="px-6 py-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-gray-100">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-6">
                {/* Filtros Rápidos */}
                <div className="bg-white rounded-lg p-4 shadow-sm border">
                  <QuickFilters onAddField={handleAddField} />
                </div>

                {/* Filtros Salvos */}
                <div className="bg-white rounded-lg p-4 shadow-sm border">
                  <SavedFilters 
                    onApplyFilter={applySavedFilter}
                    onLoadFilters={loadSavedFilters}
                  />
                </div>

                {/* Filtros Ativos */}
                {activeFiltersCount > 0 && (
                  <div className="bg-white rounded-lg p-4 shadow-sm border">
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        <Settings className="h-4 w-4 text-blue-600" />
                        Filtros Ativos ({activeFiltersCount})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {statusFilter !== "all" && (
                          <Badge variant="default" className="flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200">
                            Status: {statusFilter}
                            <X 
                              className="h-3 w-3 cursor-pointer hover:text-blue-900" 
                              onClick={() => onStatusFilterChange("all")}
                            />
                          </Badge>
                        )}
                        {segmentFilter !== "all" && (
                          <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-200">
                            Segmento: {segmentFilter}
                            <X 
                              className="h-3 w-3 cursor-pointer hover:text-green-900" 
                              onClick={() => onSegmentFilterChange("all")}
                            />
                          </Badge>
                        )}
                        {lastContactFilter !== "all" && (
                          <Badge variant="default" className="flex items-center gap-1 bg-purple-100 text-purple-800 hover:bg-purple-200">
                            Último Contato: {lastContactFilter}
                            <X 
                              className="h-3 w-3 cursor-pointer hover:text-purple-900" 
                              onClick={() => onLastContactFilterChange("all")}
                            />
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="px-6 py-4 border-t border-gray-200 bg-white">
              <div className="flex gap-3">
                <Button onClick={handleApplyFilters} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Aplicar Filtros
                </Button>
                <Button variant="outline" onClick={handleClearFilters} className="border-gray-300 hover:bg-gray-50">
                  Limpar
                </Button>
              </div>
            </div>
          </div>

          {/* Coluna Direita - Filtros Avançados */}
          <div className="flex-1 flex flex-col bg-white">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                <Settings className="h-5 w-5 text-blue-600" />
                Filtros Avançados
              </h2>
            </div>

            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-6">
                {/* Sugestões por Categoria */}
                <div className="space-y-4">
                  <h3 className="text-base font-medium text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
                    <Bookmark className="h-4 w-4 text-blue-600" />
                    Sugestões por Categoria
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <FilterSuggestionsTabs onAddField={handleAddField} />
                  </div>
                </div>

                {/* Salvar Filtro */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-gray-900">
                      <Save className="h-4 w-4 text-blue-600" />
                      Salvar Filtro
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      placeholder="Nome do filtro"
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <Button 
                      onClick={() => saveFilter(filterName)} 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={!filterName.trim() || !hasAdvancedRules()}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Filtro
                    </Button>
                  </CardContent>
                </Card>

                {/* Regras do Filtro */}
                <div className="space-y-4">
                  <h3 className="text-base font-medium text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
                    <Filter className="h-4 w-4 text-blue-600" />
                    Regras do Filtro
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 min-h-[200px]">
                    <FilterGroupComponent
                      group={advancedFilter}
                      onUpdate={(updatedGroup) => updateAdvancedFilter(advancedFilter.id, updatedGroup)}
                      level={0}
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SlidingFilterPanel;