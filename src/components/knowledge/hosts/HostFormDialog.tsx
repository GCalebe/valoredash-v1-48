// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Plus, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Agenda } from "@/hooks/useAgendas";

type Host = any; // manter sem tipos estritos para respeitar @ts-nocheck do projeto

interface HostFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingHost: Host | null;
  agendas: Agenda[];
  onSaved: () => void;
}

const defaultDays = ['Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira'];
const allDays = ['Domingo', ...defaultDays, 'Sábado'];

export const HostFormDialog: React.FC<HostFormDialogProps> = ({ isOpen, onOpenChange, editingHost, agendas, onSaved }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ name: '', role: '', description: '' });
  const [availableDays, setAvailableDays] = useState<string[]>(defaultDays);
  const [operatingHours, setOperatingHours] = useState<Record<string, Array<{ start: string; end: string }>>>(() => {
    const base = {} as Record<string, Array<{ start: string; end: string }>>;
    allDays.forEach((d) => { base[d] = [{ start: '08:00', end: '17:00' }]; });
    return base;
  });
  const [selectedAgendas, setSelectedAgendas] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    if (editingHost) {
      setFormData({ name: editingHost.name, role: editingHost.role, description: editingHost.description || '' });
      if (Array.isArray(editingHost.available_days)) {
        setAvailableDays(editingHost.available_days);
      } else {
        setAvailableDays(defaultDays);
      }
      // operatingHours não existe em tabela; manter padrão
      (async () => {
        try {
          const { data, error } = await supabase
            .from('employee_agendas')
            .select('agenda_id')
            .eq('employee_id', editingHost.id);
          if (error) throw error;
          setSelectedAgendas((data || []).map((d) => d.agenda_id.toString()));
        } catch (err) {
          console.error('Erro ao carregar agendas do anfitrião:', err);
          setSelectedAgendas([]);
        }
      })();
    } else {
      setFormData({ name: '', role: '', description: '' });
      setAvailableDays(defaultDays);
      const base = {} as Record<string, Array<{ start: string; end: string }>>;
      allDays.forEach((d) => { base[d] = [{ start: '08:00', end: '17:00' }]; });
      setOperatingHours(base);
      setSelectedAgendas([]);
    }
  }, [isOpen, editingHost]);

  const addOperatingHour = (day: string) => {
    setOperatingHours((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), { start: '08:00', end: '17:00' }],
    }));
  };

  const removeOperatingHour = (day: string, index: number) => {
    setOperatingHours((prev) => ({
      ...prev,
      [day]: (prev[day] || []).filter((_, i) => i !== index),
    }));
  };

  const updateOperatingHour = (day: string, index: number, field: 'start' | 'end', value: string) => {
    setOperatingHours((prev) => ({
      ...prev,
      [day]: (prev[day] || []).map((hour, i) => (i === index ? { ...hour, [field]: value } : hour)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.role.trim()) {
      toast({ title: 'Erro', description: 'Nome e funcao sao obrigatorios.', variant: 'destructive' });
      return;
    }

    const operatingHoursData = Object.entries(operatingHours)
      .filter(([day]) => availableDays.includes(day))
      .reduce((acc, [day, hours]) => {
        acc[day] = hours;
        return acc;
      }, {} as Record<string, Array<{ start: string; end: string }>>);

    try {
      let employeeId: string;
      if (editingHost) {
        const { error } = await supabase
          .from('employees')
          .update({ name: formData.name, role: formData.role, description: formData.description, available_days: availableDays })
          .eq('id', editingHost.id);
        if (error) throw error;
        employeeId = editingHost.id;
        await supabase.from('employee_agendas').delete().eq('employee_id', employeeId);
        toast({ title: 'Sucesso', description: 'Anfitriao atualizado com sucesso!' });
      } else {
        const { data, error } = await supabase
          .from('employees')
          .insert({ name: formData.name, role: formData.role, description: formData.description, user_id: user?.id, available_days: availableDays })
          .select('id')
          .single();
        if (error || !data) throw error;
        employeeId = data.id;
        toast({ title: 'Sucesso', description: 'Anfitriao adicionado com sucesso!' });
      }

      if (selectedAgendas.length > 0) {
        const rows = selectedAgendas.map((agendaId) => ({ employee_id: employeeId, agenda_id: agendaId }));
        const { error: agendaError } = await supabase.from('employee_agendas').insert(rows);
        if (agendaError) {
          console.error('Erro ao associar agendas:', agendaError);
          toast({ title: 'Aviso', description: 'Anfitriao salvo, mas houve erro ao associar algumas agendas.', variant: 'destructive' });
        }
      }

      onSaved();
      onOpenChange(false);
    } catch (err) {
      console.error('Erro ao salvar anfitriao:', err);
      toast({ title: 'Erro', description: 'Nao foi possivel salvar o anfitriao.', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingHost ? 'Editar Anfitriao' : 'Novo Anfitriao'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Funcao *</Label>
              <Input id="role" value={formData.role} onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descricao</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} />
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-medium">Horario de Funcionamento</Label>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Dias Disponiveis</Label>
              <div className="flex flex-wrap gap-2">
                {allDays.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={day}
                      checked={availableDays.includes(day)}
                      onCheckedChange={(checked) => {
                        if (checked) setAvailableDays((prev) => [...prev, day]);
                        else setAvailableDays((prev) => prev.filter((d) => d !== day));
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
                        <Input type="time" value={hour.start} onChange={(e) => updateOperatingHour(day, index, 'start', e.target.value)} className="w-32" />
                        <span className="text-sm text-muted-foreground">ate</span>
                        <Input type="time" value={hour.end} onChange={(e) => updateOperatingHour(day, index, 'end', e.target.value)} className="w-32" />
                        {operatingHours[day].length > 1 && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeOperatingHour(day, index)}>
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
                  {selectedAgendas.length > 0 ? `${selectedAgendas.length} agendas selecionadas` : 'Selecionar agendas'}
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
                            setSelectedAgendas((prev) => (prev.includes(agendaId) ? prev.filter((id) => id !== agendaId) : [...prev, agendaId]));
                          }}
                        >
                          <div className="flex items-center space-x-2">
                            <Checkbox checked={selectedAgendas.includes(agenda.id.toString())} />
                            <span>{agenda.name}</span>
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{editingHost ? 'Atualizar' : 'Adicionar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default HostFormDialog;


