import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useKanbanStagesLocal } from "@/hooks/useKanbanStagesLocal";
import { useFilterableFields } from "@/hooks/useFilterableFields";

interface QuickFiltersProps {
  statusFilter: string;
  segmentFilter: string;
  lastContactFilter: string;
  onStatusFilterChange: (value: string) => void;
  onSegmentFilterChange: (value: string) => void;
  onLastContactFilterChange: (value: string) => void;
}

export const QuickFilters: React.FC<QuickFiltersProps> = ({
  statusFilter,
  segmentFilter,
  lastContactFilter,
  onStatusFilterChange,
  onSegmentFilterChange,
  onLastContactFilterChange,
}) => {
  const { stages, loading: kanbanLoading } = useKanbanStagesLocal();
  const { responsibleHosts, loading: hostsLoading } = useFilterableFields();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="pipeline-filter" className="text-sm font-medium">
            Pipeline
          </Label>
          <Select
            value={statusFilter}
            onValueChange={onStatusFilterChange}
            disabled={kanbanLoading}
          >
            <SelectTrigger id="pipeline-filter">
              <SelectValue placeholder="Todos os estágios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os estágios</SelectItem>
              {stages.map((stage) => (
                <SelectItem key={stage.id} value={stage.id}>
                  {stage.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="host-filter" className="text-sm font-medium">
            Anfitrião
          </Label>
          <Select
            value={segmentFilter}
            onValueChange={onSegmentFilterChange}
            disabled={hostsLoading}
          >
            <SelectTrigger id="host-filter">
              <SelectValue placeholder="Todos os anfitriões" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os anfitriões</SelectItem>
              {responsibleHosts.map((host) => (
                <SelectItem key={host} value={host}>
                  {host}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="last-contact-filter" className="text-sm font-medium">
            Último Contato
          </Label>
          <Select
            value={lastContactFilter}
            onValueChange={onLastContactFilterChange}
          >
            <SelectTrigger id="last-contact-filter">
              <SelectValue placeholder="Todos os períodos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os períodos</SelectItem>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="yesterday">Ontem</SelectItem>
              <SelectItem value="this-week">Esta semana</SelectItem>
              <SelectItem value="last-week">Semana passada</SelectItem>
              <SelectItem value="this-month">Este mês</SelectItem>
              <SelectItem value="last-month">Mês passado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};