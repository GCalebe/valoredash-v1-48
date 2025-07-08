
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useThemeSettings } from "@/context/ThemeSettingsContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Filter, Plus, RefreshCcw } from "lucide-react";
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
  onOpenFilter?: () => void;
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
  onOpenFilter,
  statusFilter = "all",
  onStatusFilterChange,
  hostFilter = "all",
  onHostFilterChange,
}: ScheduleHeaderProps) => {
  const { settings } = useThemeSettings();
  const navigate = useNavigate();
  
  // Buscar dados para exibir contagem correta
  const { events } = useScheduleData(hostFilter);

  const handleFilterClick =
    onOpenFilter ||
    (() => {
      alert("Funcionalidade de filtros avançados em breve!");
    });

  return (
    <header
      className="rounded-b-xl pb-6"
      style={{ backgroundColor: settings.primaryColor || "#183385" }}
      data-testid="schedule-header"
    >
      {/* Header principal */}
      <div
        className="flex flex-row items-center justify-between min-h-[64px] w-full px-6 py-0"
        style={{ height: 64 }}
      >
        {/* Branding e título */}
        <div className="flex flex-row items-center gap-4 min-w-0 h-full">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="text-white hover:bg-white/20 focus-visible:ring-white"
            style={{ minWidth: 32, minHeight: 32, padding: 0 }}
            aria-label="Voltar para o dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <Calendar
            className="h-7 w-7"
            style={{
              color: "#FFC72C",
              strokeWidth: 2.3,
            }}
          />
          <h1
            className="text-2xl font-bold text-white pl-1 pr-1 tracking-tight leading-none"
            style={{ minWidth: 0 }}
          >
            Agenda
          </h1>
          {lastUpdated && (
            <Badge
              variant="outline"
              className="bg-transparent text-white border border-white/70 px-3 py-1 ml-3 font-mono text-xs min-w-fit !leading-none"
              style={{
                letterSpacing: 0.5,
                height: 28,
                display: "flex",
                alignItems: "center",
                fontWeight: 500,
                background: "rgba(255,255,255,0.06)",
              }}
            >
              Última atualização: {lastUpdated.toLocaleTimeString("pt-BR")}
            </Badge>
          )}
        </div>

        {/* Controles */}
        <div className="flex flex-row items-center gap-3 h-full">
          <Button
            variant="success"
            onClick={onAddEvent}
            className="bg-green-500 hover:bg-green-600 text-white"
            style={{ height: 40, borderRadius: 8 }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
          </Button>

          {!!view && !!onViewChange && (
            <div className="flex flex-row items-center gap-2">
              <CalendarViewSwitcher view={view} onChange={onViewChange} />
            </div>
          )}
        </div>
      </div>

      {/* Seção de filtros integrada */}
      <div className="px-6 pt-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-white" />
            <h3 className="text-white text-[16px] font-semibold">
              Filtros da Agenda
            </h3>
          </div>
          
          <div className="flex flex-col gap-1 min-w-[180px]">
            <span className="text-white text-xs font-medium mb-1">Vendedor</span>
            <Select value={hostFilter} onValueChange={onHostFilterChange}>
              <SelectTrigger className="h-9 border-slate-600 text-white bg-slate-700 hover:bg-slate-600 text-sm rounded-md w-full min-w-[180px]">
                <span className="truncate">
                  {hostFilter === "corretor1"
                    ? "João Silva"
                    : hostFilter === "corretor2"
                      ? "Maria Santos"
                      : hostFilter === "corretor3"
                        ? "Pedro Costa"
                        : "Todos os vendedores"}
                </span>
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all" className="text-white hover:bg-slate-700">
                  Todos os vendedores
                </SelectItem>
                <SelectItem
                  value="corretor1"
                  className="text-white hover:bg-slate-700"
                >
                  Agenda 1 - João Silva
                </SelectItem>
                <SelectItem
                  value="corretor2"
                  className="text-white hover:bg-slate-700"
                >
                  Agenda 2 - Maria Santos
                </SelectItem>
                <SelectItem
                  value="corretor3"
                  className="text-white hover:bg-slate-700"
                >
                  Agenda 3 - Pedro Costa
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col gap-1 min-w-[220px]">
            <span className="text-white text-xs font-medium mb-1">Status</span>
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="h-9 border-slate-600 text-white bg-slate-700 hover:bg-slate-600 text-sm rounded-md w-full min-w-[220px]">
                <span className="truncate">
                  {statusFilter === "confirmado"
                    ? "Confirmados"
                    : statusFilter === "pendente"
                      ? "Pendentes"
                      : statusFilter === "cancelado"
                        ? "Cancelados"
                        : `Visualizando todos (${events.length} eventos)`}
                </span>
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all" className="text-white hover:bg-slate-700">
                  Visualizando todos ({events.length} eventos)
                </SelectItem>
                <SelectItem
                  value="confirmado"
                  className="text-white hover:bg-slate-700"
                >
                  Confirmados ({events.filter(e => e.status === "confirmado").length})
                </SelectItem>
                <SelectItem
                  value="pendente"
                  className="text-white hover:bg-slate-700"
                >
                  Pendentes ({events.filter(e => e.status === "pendente").length})
                </SelectItem>
                <SelectItem
                  value="cancelado"
                  className="text-white hover:bg-slate-700"
                >
                  Cancelados ({events.filter(e => e.status === "cancelado").length})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1 flex justify-end">
            <Button
              variant="outline"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="border-white text-white bg-transparent hover:bg-white/20 min-w-[110px] transition-all"
              style={{
                height: 40,
                borderRadius: 8,
                borderWidth: 1.4,
              }}
            >
              <RefreshCcw
                className={`mr-2 h-4 w-4 inline-block ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
              <span>{isRefreshing ? "Atualizando..." : "Atualizar"}</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ScheduleHeader;
