import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ConversationQuickFiltersProps {
  statusFilter: string;
  segmentFilter: string;
  lastContactFilter: string;
  unreadFilter: string;
  lastMessageFilter: string;
  clientTypeFilter: string;
  onStatusFilterChange: (value: string) => void;
  onSegmentFilterChange: (value: string) => void;
  onLastContactFilterChange: (value: string) => void;
  onUnreadFilterChange: (value: string) => void;
  onLastMessageFilterChange: (value: string) => void;
  onClientTypeFilterChange: (value: string) => void;
}

export const ConversationQuickFilters = ({
  statusFilter,
  segmentFilter,
  lastContactFilter,
  unreadFilter,
  lastMessageFilter,
  clientTypeFilter,
  onStatusFilterChange,
  onSegmentFilterChange,
  onLastContactFilterChange,
  onUnreadFilterChange,
  onLastMessageFilterChange,
  onClientTypeFilterChange,
}: ConversationQuickFiltersProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Filtros Rápidos</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs">Status</Label>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Mensagens Não Lidas</Label>
          <Select value={unreadFilter} onValueChange={onUnreadFilterChange}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="unread">Não lidas</SelectItem>
              <SelectItem value="read">Lidas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Última Mensagem</Label>
          <Select value={lastMessageFilter} onValueChange={onLastMessageFilterChange}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="recent">Últimas 24h</SelectItem>
              <SelectItem value="older">Mais antigas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Tipo de Cliente</Label>
          <Select value={clientTypeFilter} onValueChange={onClientTypeFilterChange}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Pequena empresa">Pequena empresa</SelectItem>
              <SelectItem value="Média empresa">Média empresa</SelectItem>
              <SelectItem value="Grande empresa">Grande empresa</SelectItem>
              <SelectItem value="Pessoa física">Pessoa física</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Segmento</Label>
          <Select value={segmentFilter} onValueChange={onSegmentFilterChange}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Todos os segmentos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="leads">Leads</SelectItem>
              <SelectItem value="prospects">Prospects</SelectItem>
              <SelectItem value="customers">Clientes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Último Contato</Label>
          <Select value={lastContactFilter} onValueChange={onLastContactFilterChange}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Qualquer período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Qualquer período</SelectItem>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mês</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};