import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Filter } from "lucide-react";
import { useThemeSettings } from "@/context/ThemeSettingsContext";
import { useScheduleData } from "@/hooks/useScheduleData";

interface ScheduleFiltersSectionProps {
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  hostFilter?: string;
  onHostFilterChange?: (host: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const ScheduleFiltersSection = ({
  statusFilter = "all",
  onStatusFilterChange,
  hostFilter = "all",
  onHostFilterChange,
  onRefresh,
  isRefreshing = false,
}: ScheduleFiltersSectionProps) => {
  const { settings } = useThemeSettings();
  
  // Buscar dados para exibir contagem correta
  const { events } = useScheduleData();
  
  return (
    <div
      className="rounded-lg p-4 mb-6 flex items-center justify-between"
      style={{ backgroundColor: settings.primaryColor }}
    >
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-white" />
          <h3 className="text-white text-[16px] font-semibold">
            Filtros da Agenda
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium">Anfitrião:</span>
          <Select value={hostFilter} onValueChange={onHostFilterChange}>
            <SelectTrigger className="h-9 border-slate-600 text-white bg-slate-700 hover:bg-slate-600 text-sm rounded-md w-[180px]">
              <SelectValue placeholder="Todos os anfitriões" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="all" className="text-white hover:bg-slate-700">
                Todos os anfitriões
              </SelectItem>
              <SelectItem
                value="corretor1"
                className="text-white hover:bg-slate-700"
              >
                João Silva
              </SelectItem>
              <SelectItem
                value="corretor2"
                className="text-white hover:bg-slate-700"
              >
                Maria Santos
              </SelectItem>
              <SelectItem
                value="corretor3"
                className="text-white hover:bg-slate-700"
              >
                Pedro Costa
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium">Status:</span>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="h-9 border-slate-600 text-white bg-slate-700 hover:bg-slate-600 text-sm rounded-md w-[220px]">
              <SelectValue placeholder="Visualizando todos" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="all" className="text-white hover:bg-slate-700">
                Visualizando todos ({events.length} eventos)
              </SelectItem>
              <SelectItem
                value="scheduled"
                className="text-white hover:bg-slate-700"
              >
                Confirmados ({events.filter(e => e.status === "scheduled").length})
              </SelectItem>
              <SelectItem
                value="completed"
                className="text-white hover:bg-slate-700"
              >
                Pendentes ({events.filter(e => e.status === "completed").length})
              </SelectItem>
              <SelectItem
                value="cancelled"
                className="text-white hover:bg-slate-700"
              >
                Cancelados ({events.filter(e => e.status === "cancelled").length})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button
        variant="outline"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="border-white text-white bg-transparent hover:bg-white/20 min-w-[110px] transition-all"
        style={{
          borderWidth: 1.4,
        }}
      >
        <RefreshCcw
          className={`mr-2 h-4 w-4 ${
            isRefreshing ? "animate-spin" : ""
          }`}
        />
        <span>{isRefreshing ? "Atualizando..." : "Atualizar"}</span>
      </Button>
    </div>
  );
};

export default ScheduleFiltersSection;