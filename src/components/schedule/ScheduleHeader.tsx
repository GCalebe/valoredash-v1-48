import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useThemeSettings } from "@/context/ThemeSettingsContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Plus, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CalendarViewSwitcher } from "./CalendarViewSwitcher";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useScheduleData } from "@/hooks/useScheduleData";

interface ScheduleHeaderProps {
  onAddEvent: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  lastUpdated?: Date | null;
  view?: "mes" | "semana" | "dia" | "agenda";
  onViewChange?: (view: "mes" | "semana" | "dia" | "agenda") => void;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  hostFilter?: string;
  onHostFilterChange?: (host: string) => void;
}

const ScheduleHeader = ({
  onAddEvent,
  onRefresh,
  isRefreshing,
  lastUpdated,
  view,
  onViewChange,
  statusFilter = "all",
  onStatusFilterChange,
  hostFilter = "all",
  onHostFilterChange,
}: ScheduleHeaderProps) => {
  const { settings } = useThemeSettings();
  const navigate = useNavigate();
  
  // Buscar dados para exibir contagem correta
  const { events } = useScheduleData(hostFilter);

  return (
    <header
      className="rounded-b-xl"
      style={{ backgroundColor: settings.primaryColor || "#183385" }}
      data-testid="schedule-header"
    >
      <div className="flex flex-row items-center justify-between px-6 py-4">
        {/* Left side: Branding and title */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="text-white hover:bg-white/20 focus-visible:ring-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <Calendar
            className="h-7 w-7"
            style={{
              color: settings.secondaryColor,
              strokeWidth: 2.3,
            }}
          />
          <h1 className="text-2xl font-bold text-white tracking-tight leading-none">
            Agenda
          </h1>
          {lastUpdated && (
            <Badge
              variant="outline"
              className="bg-transparent text-white border border-white/70 px-3 py-1 ml-3 font-mono text-xs"
              style={{
                background: "rgba(255,255,255,0.06)",
              }}
            >
              Última atualização: {lastUpdated.toLocaleTimeString("pt-BR")}
            </Badge>
          )}
        </div>

        {/* Right side: Filters and controls */}
        <div className="flex items-center gap-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-medium">Vendedor:</span>
              <Select value={hostFilter} onValueChange={onHostFilterChange}>
                <SelectTrigger className="h-9 border-slate-600 text-white bg-slate-700/50 hover:bg-slate-600 text-sm rounded-md w-[180px]">
                  <SelectValue placeholder="Todos os vendedores" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="all" className="text-white hover:bg-slate-700">
                    Todos os vendedores
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
                <SelectTrigger className="h-9 border-slate-600 text-white bg-slate-700/50 hover:bg-slate-600 text-sm rounded-md w-[220px]">
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

          {/* Divider */}
          <div className="h-8 w-px bg-white/20"></div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {!!view && !!onViewChange && (
              <CalendarViewSwitcher view={view} onChange={onViewChange} />
            )}

            <Button
              variant="outline"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="border-white text-white bg-transparent hover:bg-white/20 min-w-[110px] transition-all"
              style={{
                borderWidth: 1.4,
              }}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
              <span>{isRefreshing ? "Atualizando..." : "Atualizar"}</span>
            </Button>

            <Button
              variant="success"
              onClick={onAddEvent}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ScheduleHeader;