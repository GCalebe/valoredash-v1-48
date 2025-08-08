// @ts-nocheck
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import HostsEmptyState from "../hosts/HostsEmptyState";
import HostsHeader from '../hosts/HostsHeader';
import HostsHierarchicalView from '../hosts/HostsHierarchicalView';
import HostFormDialog from "../hosts/HostFormDialog";
import HostsGrid from "../hosts/HostsGrid";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import { useAgendas } from '@/hooks/useAgendas';
import { useOptimizedHosts } from '@/hooks/useOptimizedHosts';
import { useHostAgendas } from '@/hooks/useHostAgendas';

type Host = Database['public']['Tables']['employees']['Row'];

type SortBy = 'name' | 'role' | 'created_at';

function normalizeValueForSort(value: any): string | number {
  if (value == null) return '';
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'string' || typeof value === 'number') return value;
  return String(value).toLowerCase();
}

function compareValues(aValue: any, bValue: any, sortBy: SortBy, sortOrder: 'asc' | 'desc'): number {
  if (sortBy === 'created_at') {
    const aTime = new Date(aValue).getTime();
    const bTime = new Date(bValue).getTime();
    return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
  }
  const aStr = String(normalizeValueForSort(aValue)).toLowerCase();
  const bStr = String(normalizeValueForSort(bValue)).toLowerCase();
  if (aStr === bStr) return 0;
  const result = aStr < bStr ? -1 : 1;
  return sortOrder === 'asc' ? result : -result;
}

function computeDisplayHosts(hosts: Host[], searchTerm: string, roleFilter: string, sortBy: SortBy, sortOrder: 'asc' | 'desc'): Host[] {
  const term = searchTerm.trim().toLowerCase();
  const filtered = hosts.filter((host) => {
    const matchesSearch = !term || host.name.toLowerCase().includes(term) || host.role.toLowerCase().includes(term);
    const matchesRole = !roleFilter || host.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return filtered.sort((a: any, b: any) => compareValues(a[sortBy], b[sortBy], sortBy, sortOrder));
}

const HostsTab = () => {
  const { user } = useAuth();
  const { hosts, loading: hostsLoading, refetch: refetchHosts } = useOptimizedHosts();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHost, setEditingHost] = useState<Host | null>(null);
  
  // Estados para busca, ordenacao e filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'role' | 'created_at'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'hierarchy'>('grid');
  
  const { agendas = [] } = useAgendas(user?.id);
  const hostIds = useMemo(() => hosts.map(h => h.id), [hosts]);
  const { agendasByHostId, loading: agendasLoading, refetch: refetchHostAgendas } = useHostAgendas(hostIds);

  const fetchHosts = useCallback(async () => {
    await refetchHosts();
    await refetchHostAgendas();
  }, [refetchHosts, refetchHostAgendas]);
  
  useEffect(() => {
    fetchHosts();
  }, [fetchHosts]);
  
  // Filtrar e ordenar hosts
  const displayHosts = useMemo(() => computeDisplayHosts(hosts, searchTerm, roleFilter, sortBy, sortOrder), [hosts, searchTerm, roleFilter, sortBy, sortOrder]);
  
  
  const handleEdit = (host: Host) => {
    setEditingHost(host);
    setIsDialogOpen(true);
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este anfitriao?")) return;
    
    try {
      const { error } = await supabase.from('employees').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Anfitriao excluido com sucesso!" });
      fetchHosts();
    } catch (error) {
      console.error("Erro ao excluir anfitriao:", error);
      toast({ title: "Erro", description: "Nao foi possivel excluir o anfitriao.", variant: "destructive" });
    }
  };
  
  const openDialog = () => {
    setEditingHost(null);
    setIsDialogOpen(true);
  };
  
  // Função para obter os nomes das agendas associadas a um anfitrião
  const getHostAgendaNames = (hostId: string): string[] => {
    const agendaIds = agendasByHostId[hostId] || [];
    return agendaIds.map(agendaId => {
      const agenda = agendas.find(a => a.id === agendaId);
      return agenda?.name || 'Agenda não encontrada';
    });
  };

  // Handlers para o header
  const handleSortChange = (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy as 'name' | 'role' | 'created_at');
    setSortOrder(newSortOrder);
  };
  
  const handleImport = () => {
    // TODO: Implementar importacao
    console.log('Importar anfitrioes');
  };
  
  const handleExport = () => {
    // TODO: Implementar exportacao
    console.log('Exportar anfitrioes');
  };
  
  return (
    <div className="space-y-6">
      <HostsHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddHost={openDialog}
        onImport={handleImport}
        onExport={handleExport}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalHosts={hosts.length}
        filteredHosts={displayHosts.length}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
      />
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button><Plus className="h-4 w-4 mr-2" />Adicionar Anfitriao</Button>
        </DialogTrigger>
        <HostFormDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} editingHost={editingHost} agendas={agendas} onSaved={() => { fetchHosts(); }} />
      </Dialog>
      
      {viewMode === 'hierarchy' ? (
        <HostsHierarchicalView
          hosts={displayHosts}
          agendas={agendas}
          searchTerm={searchTerm}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <HostsGrid hosts={displayHosts} getAgendaNames={getHostAgendaNames} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      {displayHosts.length === 0 && hosts.length > 0 && (
        <HostsEmptyState title="Nenhum anfitrião encontrado" description="Tente ajustar os filtros de busca." />
      )}
      
      {hosts.length === 0 && (
        <HostsEmptyState title="Nenhum anfitrião cadastrado" description="Comece adicionando anfitriões à sua equipe." />
      )}
    </div>
  );
};

export default HostsTab;