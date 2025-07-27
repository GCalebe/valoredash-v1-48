import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, User, Edit, Trash2, Calendar, X, Clock } from "lucide-react";
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
  const { agendas: supabaseAgendas } = useAgendas();
  const [hosts, setHosts] = useState<Host[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHost, setEditingHost] = useState<Host | null>(null);
  const [selectedAgendas, setSelectedAgendas] = useState<Agenda[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    description: "",
  });

  // Estado para gerenciar múltiplos horários de funcionamento
  const [operatingHours, setOperatingHours] = useState<Record<string, Array<{start: string, end: string}>>>({
    'Domingo': [{start: '08:00', end: '17:00'}],
    'Segunda-Feira': [{start: '08:00', end: '17:00'}],
    'Terça-Feira': [{start: '08:00', end: '17:00'}],
    'Quarta-Feira': [{start: '08:00', end: '17:00'}],
    'Quinta-Feira': [{start: '08:00', end: '17:00'}],
    'Sexta-Feira': [{start: '08:00', end: '17:00'}],
    'Sábado': [{start: '08:00', end: '17:00'}]
  });

  // Estado para dias disponíveis
  const [availableDays, setAvailableDays] = useState<string[]>(['Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira']);

  const fetchHosts = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHosts(data as Host[] || []);
    } catch (error) {
      console.error("Erro ao buscar anfitriões:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os anfitriões.",
        variant: "destructive",
      });
    }
  }, [user?.id]);

  useEffect(() => {
    fetchHosts();
  }, [fetchHosts]);

  // Funções para gerenciar horários de funcionamento
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

  const toggleAvailableDay = (day: string) => {
    setAvailableDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.role) {
      toast({
        title: "Erro",
        description: "Nome e função são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Preparar dados dos horários de funcionamento
      const availableHoursData = Object.entries(operatingHours)
        .filter(([day]) => availableDays.includes(day))
        .map(([day, hours]) => ({
          day,
          hours: hours.map(h => `${h.start}-${h.end}`)
        }));

      const employeeData = {
        name: formData.name,
        role: formData.role,
        description: formData.description,
        available_days: availableDays,
        available_hours: availableHoursData
      };

      if (editingHost) {
        const { error } = await supabase
          .from("employees")
          .update(employeeData)
          .eq("id", editingHost.id);
        if (error) throw error;
        toast({ title: "Sucesso", description: "Anfitrião atualizado com sucesso!" });
      } else {
        const { error } = await supabase
          .from("employees")
          .insert({ ...employeeData, user_id: user?.id })
          .select()
          .single();
        if (error) throw error;
        toast({ title: "Sucesso", description: "Anfitrião adicionado com sucesso!" });
      }

      resetForm();
      setIsDialogOpen(false);
      fetchHosts();
    } catch (error) {
      console.error("Erro ao salvar anfitrião:", error);
      toast({ title: "Erro", description: "Não foi possível salvar o anfitrião.", variant: "destructive" });
    }
  };

  const handleEdit = (host: Host) => {
    setEditingHost(host);
    setFormData({ name: host.name, role: host.role, description: host.description || "" });
    
    // Carregar dias disponíveis
    if (host.available_days) {
      setAvailableDays(host.available_days);
    } else {
      setAvailableDays(['Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira']);
    }
    
    // Carregar horários de funcionamento
    if (host.available_hours && Array.isArray(host.available_hours)) {
      const hoursData: Record<string, Array<{start: string, end: string}>> = {
        'Domingo': [{start: '08:00', end: '17:00'}],
        'Segunda-Feira': [{start: '08:00', end: '17:00'}],
        'Terça-Feira': [{start: '08:00', end: '17:00'}],
        'Quarta-Feira': [{start: '08:00', end: '17:00'}],
        'Quinta-Feira': [{start: '08:00', end: '17:00'}],
        'Sexta-Feira': [{start: '08:00', end: '17:00'}],
        'Sábado': [{start: '08:00', end: '17:00'}]
      };
      
      host.available_hours.forEach((dayData: any) => {
        if (dayData.day && dayData.hours) {
          hoursData[dayData.day] = dayData.hours.map((timeRange: string) => {
            const [start, end] = timeRange.split('-');
            return { start, end };
          });
        }
      });
      
      setOperatingHours(hoursData);
    } else {
      // Reset para horários padrão
      setOperatingHours({
        'Domingo': [{start: '08:00', end: '17:00'}],
        'Segunda-Feira': [{start: '08:00', end: '17:00'}],
        'Terça-Feira': [{start: '08:00', end: '17:00'}],
        'Quarta-Feira': [{start: '08:00', end: '17:00'}],
        'Quinta-Feira': [{start: '08:00', end: '17:00'}],
        'Sexta-Feira': [{start: '08:00', end: '17:00'}],
        'Sábado': [{start: '08:00', end: '17:00'}]
      });
    }
    
    setSelectedAgendas([]); 
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este anfitrião?")) return;
    try {
      const { error } = await supabase.from("employees").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Anfitrião excluído com sucesso!" });
      fetchHosts();
    } catch (error) {
      console.error("Erro ao excluir anfitrião:", error);
      toast({ title: "Erro", description: "Não foi possível excluir o anfitrião.", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({ name: "", role: "", description: "" });
    setSelectedAgendas([]);
    setEditingHost(null);
    
    // Reset horários de funcionamento para padrão
    setOperatingHours({
      'Domingo': [{start: '08:00', end: '17:00'}],
      'Segunda-Feira': [{start: '08:00', end: '17:00'}],
      'Terça-Feira': [{start: '08:00', end: '17:00'}],
      'Quarta-Feira': [{start: '08:00', end: '17:00'}],
      'Quinta-Feira': [{start: '08:00', end: '17:00'}],
      'Sexta-Feira': [{start: '08:00', end: '17:00'}],
      'Sábado': [{start: '08:00', end: '17:00'}]
    });
    
    // Reset dias disponíveis para padrão
    setAvailableDays(['Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira']);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Anfitriões</h3>
          <p className="text-sm text-muted-foreground">Gerencie os anfitriões e suas agendas associadas.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Adicionar Anfitrião</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingHost ? "Editar Anfitrião" : "Novo Anfitrião"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="name">Nome *</Label><Input id="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} required /></div>
                <div className="space-y-2"><Label htmlFor="role">Função *</Label><Input id="role" value={formData.role} onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))} required /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="description">Descrição</Label><Textarea id="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} /></div>
              
              {/* Seção de Horário de Funcionamento */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <Label className="text-sm font-medium">Horário de Funcionamento</Label>
                </div>
                
                {/* Dias Disponíveis */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Dias Disponíveis</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Domingo', 'Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sábado'].map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${day}`}
                          checked={availableDays.includes(day)}
                          onCheckedChange={() => toggleAvailableDay(day)}
                        />
                        <Label htmlFor={`day-${day}`} className="text-sm">
                          {day}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Horários por Dia */}
                <div className="space-y-3">
                  {availableDays.map((day) => (
                    <div key={day} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">{day}</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addOperatingHour(day)}
                          className="h-6 w-6 p-0"
                        >
                          +
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {operatingHours[day]?.map((hour, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={hour.start}
                              onChange={(e) => updateOperatingHour(day, index, 'start', e.target.value)}
                              className="flex-1"
                            />
                            <span className="text-sm text-muted-foreground">até</span>
                            <Input
                              type="time"
                              value={hour.end}
                              onChange={(e) => updateOperatingHour(day, index, 'end', e.target.value)}
                              className="flex-1"
                            />
                            {operatingHours[day]?.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeOperatingHour(day, index)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              >
                                ×
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Agendas Associadas</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start h-auto min-h-10">
                      {selectedAgendas.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                          {selectedAgendas.map(agenda => (
                            <Badge key={agenda.id} variant="secondary">{agenda.title}</Badge>
                          ))}
                        </div>
                      ) : "Selecione as agendas"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar agenda..." />
                      <CommandList>
                        <CommandEmpty>Nenhuma agenda encontrada.</CommandEmpty>
                        <CommandGroup>
                          {(supabaseAgendas || []).map(agenda => {
                            const mappedAgenda = {
                              id: agenda.id,
                              title: agenda.name,
                              description: agenda.description || '',
                              category: agenda.category || '',
                              host: '',
                              duration: agenda.duration_minutes || 60,
                              breakTime: agenda.buffer_time_minutes || 0
                            };
                            return (
                              <CommandItem
                                key={agenda.id}
                                onSelect={() => {
                                  setSelectedAgendas(current => 
                                    current.some(a => a.id === agenda.id)
                                      ? current.filter(a => a.id !== agenda.id)
                                      : [...current, mappedAgenda]
                                  )
                                }}
                              >
                                <div className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary ${selectedAgendas.some(a => a.id === agenda.id) ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"}`}>
                                  <X className="h-4 w-4" />
                                </div>
                                {agenda.name}
                              </CommandItem>
                            );
                           })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <DialogFooter><Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>Cancelar</Button><Button type="submit">{editingHost ? "Atualizar" : "Adicionar"}</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hosts.map((host) => (
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

      {hosts.length === 0 && (
        <div className="text-center py-12"><User className="h-12 w-12 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium">Nenhum anfitrião cadastrado</h3><p className="text-sm text-muted-foreground">Comece adicionando anfitriões à sua equipe.</p></div>
      )}
    </div>
  );
};

export default HostsTab;