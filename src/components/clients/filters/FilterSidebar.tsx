import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuickFilters } from "./QuickFilters";
import { SavedFilters } from "./SavedFilters";
import { FilterGroup } from "./FilterGroup";
import { Clock, Bookmark } from "lucide-react";

interface FilterSidebarProps {
  statusFilter: string;
  segmentFilter: string;
  lastContactFilter: string;
  onStatusFilterChange: (value: string) => void;
  onSegmentFilterChange: (value: string) => void;
  onLastContactFilterChange: (value: string) => void;
  onApplyFilter: (filter: FilterGroup) => void;
  onFilterDeleted?: () => void;
  hasActiveFilters: boolean;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  statusFilter,
  segmentFilter,
  lastContactFilter,
  onStatusFilterChange,
  onSegmentFilterChange,
  onLastContactFilterChange,
  onApplyFilter,
  onFilterDeleted,
  hasActiveFilters,
}) => {
  const activeFiltersCount = [
    statusFilter !== "all",
    segmentFilter !== "all", 
    lastContactFilter !== "all"
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Quick Filters Card */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-primary" />
            Filtros Rápidos
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <QuickFilters
            statusFilter={statusFilter}
            segmentFilter={segmentFilter}
            lastContactFilter={lastContactFilter}
            onStatusFilterChange={onStatusFilterChange}
            onSegmentFilterChange={onSegmentFilterChange}
            onLastContactFilterChange={onLastContactFilterChange}
          />
        </CardContent>
      </Card>

      {/* Saved Filters Card */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bookmark className="h-4 w-4 text-primary" />
            Filtros Salvos
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <SavedFilters
            onApplyFilter={onApplyFilter}
            onFilterDeleted={onFilterDeleted}
          />
        </CardContent>
      </Card>
    </div>
  );
};