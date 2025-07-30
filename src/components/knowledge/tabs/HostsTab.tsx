import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, User, Edit, Trash2, Calendar, X, Clock } from "lucide-react";
import HostsHeader from '../hosts/HostsHeader';
import HostsHierarchicalView from '../hosts/HostsHierarchicalView';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useAgendas } from '@/hooks/useAgendas';
import { Checkbox } from "@/components/ui/checkbox";

type Host = Database['public']['Tables']['employees']['Row'];
type Agenda = {
  id: string | number;
  title: string;
  description: string;
  category: string;
  host: string;
  duration: number;
  breakTime: number;
};

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
    'Segunda-Feira': [{start: '08:00', end: '17:00'}],
    'Terca-Feira': [{start: '08:00', end: '17:00'}],
    'Quarta-Feira': [{start: '08:00', end: '17:00'}],
    'Quinta-Feira': [{start: '08:00', end: '17:00'}],
    'Sexta-Feira': [{start: '08:00', end: '17:00'}],
    'Sabado': [{start: '08:00', end: '17:00'}]
  });
  
  // Estado para dias disponiveis
  const [availableDays, setAvailableDays] = useState<string[]>(['Segunda-Feira', 'Terca-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira']);
  
  const { data: agendas = [] } = useAgendas();
  
  const fetchHosts = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      setHosts(data || []);
    } catch (error) {
      console.error("Erro ao buscar anfitrioes:", error);
      toast({
        title: "Erro",
        description: "Nao foi possivel carregar os anfitrioes.",
        variant: "destructive"
      });
    }
  }, [user]);
  
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
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else {
        aValue = aValue.toString().toLowerCase();
        bValue = bValue.toString().toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    return filtered;
  }, [hosts, searchTerm, sortBy, sortOrder, roleFilter]);
  
  // Funcoes para gerenciar horarios de funcionamento
  const addOperatingHour = (day: string) => {
    setOperatingHours(prev => ({
      ...prev,
      [day]: [...prev[day], { start: '08:00', end: '17:00' }]
    }));
  };
  
  const removeOperatingHour = (day: string, index: number) => {
    setOperatingHours(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index)
    }));
  };
  
  const updateOperatingHour = (day: string, index: number, field: 'start' | 'end', value: string) => {
    setOperatingHours(prev => ({
      ...prev,
      [day]: prev[day].map((hour, i) => 
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
      if (editingHost) {
        const { error } = await supabase
          .from('employees')
          .update({
            name: formData.name,
            role: formData.role,
            description: formData.description,
            operating_hours: operatingHoursData,
            available_days: availableDays
          })
          .eq('id', editingHost.id);
        
        if (error) throw error;
        toast({ title: "Sucesso", description: "Anfitriao atualizado com sucesso!" });
      } else {
        const { error } = await supabase
          .from('employees')
          .insert({
            name: formData.name,
            role: formData.role,
            description: formData.description,
            user_id: user?.id,
            operating_hours: operatingHoursData,
            available_days: availableDays
          });
        
        if (error) throw error;
        toast({ title: "Sucesso", description: "Anfitriao adicionado com sucesso!" });
      }
      
      fetchHosts();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar anfitriao:", error);
      toast({ title: "Erro", description: "Nao foi possivel salvar o anfitriao.", variant: "destructive" });
    }
  };
  
  const handleEdit = (host: Host) => {
    setEditingHost(host);
    setFormData({ name: host.name, role: host.role, description: host.description || '' });
    
    // Carregar dias disponiveis
    if (host.available_days && Array.isArray(host.available_days)) {
      setAvailableDays(host.available_days);
    } else {
      setAvailableDays(['Segunda-Feira', 'Terca-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira']);
    }
    
    // Carregar horarios de funcionamento
    if (host.operating_hours && typeof host.operating_hours === 'object') {
      setOperatingHours(host.operating_hours as Record<string, Array<{start: string, end: string}>>);
    } else {
      setOperatingHours({
        'Segunda-Feira': [{start: '08:00', end: '17:00'}],
        'Terca-Feira': [{start: '08:00', end: '17:00'}],
        'Quarta-Feira': [{start: '08:00', end: '17:00'}],
        'Quinta-Feira': [{start: '08:00', end: '17:00'}],
        'Sexta-Feira': [{start: '08:00', end: '17:00'}],
        'Sabado': [{start: '08:00', end: '17:00'}]
      });
    }
    
    setIsDialogOpen(true);
  };
  
  const resetOperatingHours = () => {
    // Reset para horarios padrao
    setOperatingHours({
      'Segunda-Feira': [{start: '08:00', end: '17:00'}],
      'Terca-Feira': [{start: '08:00', end: '17:00'}],
      'Quarta-Feira': [{start: '08:00', end: '17:00'}],
      'Quinta-Feira': [{start: '08:00', end: '17:00'}],
      'Sexta-Feira': [{start: '08:00', end: '17:00'}],
      'Sabado': [{start: '08:00', end: '17:00'}]
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
      'Segunda-Feira': [{start: '08:00', end: '17:00'}],
      'Terca-Feira': [{start: '08:00', end: '17:00'}],
      'Quarta-Feira': [{start: '08:00', end: '17:00'}],
      'Quinta-Feira': [{start: '08:00', end: '17:00'}],
      'Sexta-Feira': [{start: '08:00', end: '17:00'}],
      'Sabado': [{start: '08:00', end: '17:00'}]
    });
    
    // Reset dias disponiveis para padrao
    setAvailableDays(['Segunda-Feira', 'Terca-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira']);
  };
  
  const openDialog = () => {
    resetForm();
    setIsDialogOpen(true);
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingHost ? "Editar Anfitriao" : "Novo Anfitriao"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="name">Nome *</Label><Input id="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} required /></div>
              <div className="space-y-2"><Label htmlFor="role">Funcao *</Label><Input id="role" value={formData.role} onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))} required /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="description">Descricao</Label><Textarea id="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} /></div>
            
            <div className="space-y-4">
              <Label className="text-sm font-medium">Horario de Funcionamento</Label>
              
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Dias Disponiveis</Label>
                <div className="flex flex-wrap gap-2">
                  {['Domingo', 'Segunda-Feira', 'Terca-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sabado'].map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={day}
                        checked={availableDays.includes(day)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setAvailableDays(prev => [...prev, day]);
                          } else {
                            setAvailableDays(prev => prev.filter(d => d !== day));
                          }
                        }}
                      />
                      <Label htmlFor={day} className="text-sm">{day}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                {availableDays.map((day) => (
                  <div key={day} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">{day}</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => addOperatingHour(day)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {operatingHours[day]?.map((hour, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={hour.start}
                            onChange={(e) => updateOperatingHour(day, index, 'start', e.target.value)}
                            className="w-32"
                          />
                          <span className="text-sm text-muted-foreground">ate</span>
                          <Input
                            type="time"
                            value={hour.end}
                            onChange={(e) => updateOperatingHour(day, index, 'end', e.target.value)}
                            className="w-32"
                          />
                          {operatingHours[day].length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOperatingHour(day, index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <Label className="text-sm font-medium">Agendas Associadas</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {selectedAgendas.length > 0 ? `${selectedAgendas.length} agendas selecionadas` : "Selecionar agendas"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0">
                  <Command>
                    <CommandInput placeholder="Buscar agendas..." />
                    <CommandEmpty>Nenhuma agenda encontrada.</CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        {agendas.map((agenda) => (
                          <CommandItem
                            key={agenda.id}
                            onSelect={() => {
                              const agendaId = agenda.id.toString();
                              setSelectedAgendas(prev => 
                                prev.includes(agendaId)
                                  ? prev.filter(id => id !== agendaId)
                                  : [...prev, agendaId]
                              );
                            }}
                          >
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={selectedAgendas.includes(agenda.id.toString())}
                                readOnly
                              />
                              <span>{agenda.title}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">{editingHost ? "Atualizar" : "Adicionar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayHosts.map((host) => (
            <Card key={host.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <User className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle className="text-base">{host.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs mt-1">{host.role}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(host)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(host.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {host.description && <p className="text-sm text-muted-foreground">{host.description}</p>}
                <div>
                  <div className="flex items-center gap-2 mb-2"><Calendar className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">Agendas:</span></div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline">Consulta de Terapia</Badge>
                    <Badge variant="outline">Aula de Yoga</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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