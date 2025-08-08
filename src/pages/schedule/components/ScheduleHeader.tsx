// @ts-nocheck
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, RefreshCw } from 'lucide-react';
import { CalendarViewSwitcher } from '@/components/schedule/CalendarViewSwitcher';

interface Host { id: string; name: string }

interface ScheduleHeaderProps {
  primaryColor: string;
  onBack: () => void;
  hosts: Host[];
  isHostsLoading: boolean;
  hostFilter: string;
  setHostFilter: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  calendarViewTab: 'mes' | 'semana' | 'dia' | 'agenda';
  setCalendarViewTab: (v: 'mes' | 'semana' | 'dia' | 'agenda') => void;
  onRefreshAll: () => void;
  isRefreshing: boolean;
  onOpenNew: () => void;
}

const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({ primaryColor, onBack, hosts, isHostsLoading, hostFilter, setHostFilter, statusFilter, setStatusFilter, calendarViewTab, setCalendarViewTab, onRefreshAll, isRefreshing, onOpenNew }) => {
  return (
    <header className="text-white shadow-md transition-colors duration-300 rounded-b-xl flex-shrink-0" style={{ backgroundColor: primaryColor }}>
      <div className="flex flex-row items-center justify-between h-16 w-full px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-white/20 focus-visible:ring-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Calendário</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-medium">Anfitrião:</span>
            <select value={hostFilter} onChange={(e) => setHostFilter(e.target.value)} className="h-8 border-slate-600 text-white bg-slate-700/50 hover:bg-slate-600 text-xs rounded-md w-[120px] px-2" disabled={isHostsLoading}>
              <option value="all">{isHostsLoading ? 'Carregando...' : 'Todos'}</option>
              {hosts.map((host) => (
                <option key={host.id} value={host.id}>{host.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-medium">Status:</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-8 border-slate-600 text-white bg-slate-700/50 hover:bg-slate-600 text-xs rounded-md w-[140px] px-2">
              <option value="all">Todos</option>
              <option value="confirmed">Confirmados</option>
              <option value="pending">Pendentes</option>
              <option value="scheduled">Agendados</option>
              <option value="completed">Concluídos</option>
              <option value="cancelled">Cancelados</option>
              <option value="no_show">Não compareceu</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <CalendarViewSwitcher view={calendarViewTab} onChange={(view) => setCalendarViewTab(view)} />
          </div>

          <Button variant="outline" onClick={onRefreshAll} className="border-white text-white bg-transparent hover:bg-white/20 h-8 px-2" disabled={isRefreshing}>
            <span className="flex items-center gap-1">
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Atualizando...' : 'Atualizar'}
            </span>
          </Button>

          <Button onClick={onOpenNew} className="bg-white text-blue-600 hover:bg-blue-50 h-8 px-2">
            <Plus className="h-4 w-4 mr-1" />
            Novo
          </Button>
        </div>
      </div>
    </header>
  );
};

export default ScheduleHeader;


