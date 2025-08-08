// @ts-nocheck
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, User, Edit, Trash2, Calendar, X, Clock } from "lucide-react";
import HostsHeader from '../hosts/HostsHeader';
import HostsHierarchicalView from '../hosts/HostsHierarchicalView';
import HostFormDialog from "../hosts/HostFormDialog";
import HostsGrid from "../hosts/HostsGrid";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import { useAgendas } from '@/hooks/useAgendas';

type Host = Database['public']['Tables']['employees']['Row'];

const HostsTab = () => {
  const { user } = useAuth();
  const [hosts, setHosts] = useState<Host[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHost, setEditingHost] = useState<Host | null>(null);
  const [selectedAgendas, setSelectedAgendas] = useState<string[]>([]);
  const [formData, setFormData] = useState({ name: '', role: '', description: '' });
  
  // Estados para busca, ordenacao e filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'role' | 'created_at'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'hierarchy'>('grid');
  
  // Estado para gerenciar multiplos horarios de funcionamento
  const [operatingHours, setOperatingHours] = useState<Record<string, Array<{start: string, end: string}>>>({
    'Domingo': [{start: '08:00', end: '17:00'}],
    'Segunda-Feira': [{start: '08:00', end: '17:00'}],
    'Terça-Feira': [{start: '08:00', end: '17:00'}],
    'Quarta-Feira': [{start: '08:00', end: '17:00'}],
    'Quinta-Feira': [{start: '08:00', end: '17:00'}],
    'Sexta-Feira': [{start: '08:00', end: '17:00'}],
    'Sábado': [{start: '08:00', end: '17:00'}]
  });
  
  // Estado para dias disponiveis
  const [availableDays, setAvailableDays] = useState<string[]>(['Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira']);
  
  // Estado para armazenar as agendas associadas a cada anfitrião
  const [hostAgendas, setHostAgendas] = useState<Record<string, string[]>>({});
  
  const { agendas = [] } = useAgendas(user?.id);
  
  // Função para carregar as agendas associadas a todos os anfitriões
  const fetchHostAgendas = useCallback(async (hostIds: string[]) => {
    if (hostIds.length === 0) {
      setHostAgendas({});
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('employee_agendas')
        .select('employee_id, agenda_id')
        .in('employee_id', hostIds);
      
      if (error) throw error;
      
      // Agrupar agendas por anfitrião
      const agendaMap: Record<string, string[]> = {};
      data?.forEach(item => {
        if (!agendaMap[item.employee_id]) {
          agendaMap[item.employee_id] = [];
        }
        agendaMap[item.employee_id].push(item.agenda_id);
      });
      
      setHostAgendas(agendaMap);
    } catch (error) {
      console.error("Erro ao buscar agendas dos anfitriões:", error);
      setHostAgendas({});
    }
  }, []);

  const fetchHosts = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      const hostsData = data || [];
      setHosts(hostsData);
      
      // Carregar agendas associadas aos anfitriões
      const hostIds = hostsData.map(host => host.id);
      await fetchHostAgendas(hostIds);
    } catch (error) {
      console.error("Erro ao buscar anfitrioes:", error);
      toast({
        title: "Erro",
        description: "Nao foi possivel carregar os anfitrioes.",
        variant: "destructive"
      });
    }
  }, [user, fetchHostAgendas]);
  
  useEffect(() => {
    fetchHosts();
  }, [fetchHosts]);
  
  // Filtrar e ordenar hosts
  const displayHosts = useMemo(() => {
    let filtered = hosts.filter(host => {
      const matchesSearch = host.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           host.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = !roleFilter || host.role === roleFilter;
      return matchesSearch && matchesRole;
    });
    
    // Aplicar filtro de funcao
    if (roleFilter) {
      filtered = filtered.filter(host => host.role === roleFilter);
    }
    
    // Aplicar ordenacao
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'created_at') {
        const aTime = new Date(aValue).getTime();
        const bTime = new Date(bValue).getTime();
        if (sortOrder === 'asc') {
          return aTime < bTime ? -1 : aTime > bTime ? 1 : 0;
        } else {
          return aTime > bTime ? -1 : aTime < bTime ? 1 : 0;
        }
      } else {
        const aStr = aValue.toString().toLowerCase();
        const bStr = bValue.toString().toLowerCase();
        if (sortOrder === 'asc') {
          return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
        } else {
          return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
        }
      }
      
    });
    
    return filtered;
  }, [hosts, searchTerm, sortBy, sortOrder, roleFilter]);
  
  // Funcoes para gerenciar horarios de funcionamento
  const addOperatingHour = (day: string) => {
    setOperatingHours(prev => ({
      ...prev,
      [day]: [...(prev[day] || []), { start: '08:00', end: '17:00' }]
    }));
  };
  
  const removeOperatingHour = (day: string, index: number) => {
    setOperatingHours(prev => ({
      ...prev,
      [day]: (prev[day] || []).filter((_, i) => i !== index)
    }));
  };
  
  const updateOperatingHour = (day: string, index: number, field: 'start' | 'end', value: string) => {
    setOperatingHours(prev => ({
      ...prev,
      [day]: (prev[day] || []).map((hour, i) => 
        i === index ? { ...hour, [field]: value } : hour
      )
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.role.trim()) {
      toast({
        title: "Erro",
        description: "Nome e funcao sao obrigatorios.",
        variant: "destructive"
      });
      return;
    }
    
    // Preparar dados dos horarios de funcionamento
    const operatingHoursData = Object.entries(operatingHours)
      .filter(([day]) => availableDays.includes(day))
      .reduce((acc, [day, hours]) => {
        acc[day] = hours;
        return acc;
      }, {} as Record<string, Array<{start: string, end: string}>>);
    
    try {
      let employeeId: string;
      
      if (editingHost) {
        // Atualizar anfitrião existente
        const { error } = await supabase
          .from('employees')
          .update({
            name: formData.name,
            role: formData.role,
            description: formData.description,
            available_days: availableDays
          })
          .eq('id', editingHost.id);
        
        if (error) throw error;
        employeeId = editingHost.id;
        
        // Remover associações antigas de agendas
        await supabase
          .from('employee_agendas')
          .delete()
          .eq('employee_id', employeeId);
        
        toast({ title: "Sucesso", description: "Anfitriao atualizado com sucesso!" });
      } else {
        // Criar novo anfitrião
        const { data, error } = await supabase
          .from('employees')
          .insert({
            name: formData.name,
            role: formData.role,
            description: formData.description,
            user_id: user?.id,
            available_days: availableDays
          })
          .select('id')
          .single();
        
        if (error || !data) throw error;
        employeeId = data.id;
        
        toast({ title: "Sucesso", description: "Anfitriao adicionado com sucesso!" });
      }
      
      // Associar agendas selecionadas ao anfitrião
      if (selectedAgendas.length > 0) {
        const agendaAssociations = selectedAgendas.map(agendaId => ({
          employee_id: employeeId,
          agenda_id: agendaId
        }));
        
        const { error: agendaError } = await supabase
          .from('employee_agendas')
          .insert(agendaAssociations);
        
        if (agendaError) {
          console.error('Erro ao associar agendas:', agendaError);
          toast({ 
            title: "Aviso", 
            description: "Anfitriao salvo, mas houve erro ao associar algumas agendas.", 
            variant: "destructive" 
          });
        }
      }
      
      fetchHosts();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar anfitriao:", error);
      toast({ title: "Erro", description: "Nao foi possivel salvar o anfitriao.", variant: "destructive" });
    }
  };
  
  const handleEdit = async (host: Host) => {
    setEditingHost(host);
    setFormData({ name: host.name, role: host.role, description: host.description || '' });
    
    // Carregar dias disponiveis
    if (host.available_days && Array.isArray(host.available_days)) {
      setAvailableDays(host.available_days);
    } else {
      setAvailableDays(['Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira']);
    }
    
    // Carregar horarios de funcionamento - usando available_hours como fallback
    // Como operating_hours não existe na tabela employees, vamos usar valores padrão
    setOperatingHours({
      'Domingo': [{start: '08:00', end: '17:00'}],
      'Segunda-Feira': [{start: '08:00', end: '17:00'}],
      'Terça-Feira': [{start: '08:00', end: '17:00'}],
      'Quarta-Feira': [{start: '08:00', end: '17:00'}],
      'Quinta-Feira': [{start: '08:00', end: '17:00'}],
      'Sexta-Feira': [{start: '08:00', end: '17:00'}],
      'Sábado': [{start: '08:00', end: '17:00'}]
    });
    
    // Carregar agendas associadas ao anfitrião
    try {
      const { data: employeeAgendas, error } = await supabase
        .from('employee_agendas')
        .select('agenda_id')
        .eq('employee_id', host.id);
      
      if (error) {
        console.error('Erro ao carregar agendas do anfitrião:', error);
        setSelectedAgendas([]);
      } else {
        const agendaIds = employeeAgendas?.map(ea => ea.agenda_id) || [];
        setSelectedAgendas(agendaIds);
      }
    } catch (error) {
      console.error('Erro ao carregar agendas do anfitrião:', error);
      setSelectedAgendas([]);
    }
    
    setIsDialogOpen(true);
  };
  
  const resetOperatingHours = () => {
    // Reset para horarios padrao
    setOperatingHours({
      'Domingo': [{start: '08:00', end: '17:00'}],
      'Segunda-Feira': [{start: '08:00', end: '17:00'}],
      'Terça-Feira': [{start: '08:00', end: '17:00'}],
      'Quarta-Feira': [{start: '08:00', end: '17:00'}],
      'Quinta-Feira': [{start: '08:00', end: '17:00'}],
      'Sexta-Feira': [{start: '08:00', end: '17:00'}],
      'Sábado': [{start: '08:00', end: '17:00'}]
    });
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
  
  const resetForm = () => {
    setFormData({ name: '', role: '', description: '' });
    setSelectedAgendas([]);
    setEditingHost(null);
    
    // Reset horarios de funcionamento para padrao
    setOperatingHours({
      'Domingo': [{start: '08:00', end: '17:00'}],
      'Segunda-Feira': [{start: '08:00', end: '17:00'}],
      'Terça-Feira': [{start: '08:00', end: '17:00'}],
      'Quarta-Feira': [{start: '08:00', end: '17:00'}],
      'Quinta-Feira': [{start: '08:00', end: '17:00'}],
      'Sexta-Feira': [{start: '08:00', end: '17:00'}],
      'Sábado': [{start: '08:00', end: '17:00'}]
    });
    
    // Reset dias disponiveis para padrao
    setAvailableDays(['Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira']);
  };
  
  const openDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };
  
  // Função para obter os nomes das agendas associadas a um anfitrião
  const getHostAgendaNames = (hostId: string): string[] => {
    const agendaIds = hostAgendas[hostId] || [];
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
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Nenhum anfitriao encontrado</h3>
          <p className="text-sm text-muted-foreground">Tente ajustar os filtros de busca.</p>
        </div>
      )}
      
      {hosts.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Nenhum anfitriao cadastrado</h3>
          <p className="text-sm text-muted-foreground">Comece adicionando anfitrioes a sua equipe.</p>
        </div>
      )}
    </div>
  );
};

export default HostsTab;