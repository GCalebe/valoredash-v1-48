import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';

type AgendaCategory = 'consulta' | 'evento' | 'classes' | 'recorrente' | '';

type Agenda = {
  id: number;
  title: string;
  description: string;
  category: AgendaCategory;
  host: string;
  duration: number;
  breakTime: number;
  availabilityInterval: number;
  operatingHours: string;
  minNotice: number;
  maxParticipants?: number;
};

const mockAgendas: Agenda[] = [
  { id: 1, title: "Consulta de Terapia", description: "Sessão individual de terapia.", category: "consulta", host: "Dr. Freud", duration: 50, breakTime: 10, availabilityInterval: 15, operatingHours: "09:00-18:00", minNotice: 24 },
  { id: 2, title: "Webinar de Marketing", description: "Aprenda as novas estratégias de marketing digital.", category: "evento", host: "Neil Patel", duration: 90, breakTime: 0, availabilityInterval: 30, operatingHours: "19:00-21:00", minNotice: 48, maxParticipants: 100 },
  { id: 3, title: "Aula de Yoga", description: "Yoga para iniciantes.", category: "classes", host: "Adriene Mishler", duration: 60, breakTime: 0, availabilityInterval: 60, operatingHours: "08:00-12:00", minNotice: 12 },
];

const initialAgendaState: Omit<Agenda, 'id'> = {
  title: '',
  description: '',
  category: '',
  host: '',
  availabilityInterval: 30,
  duration: 60,
  breakTime: 15,
  operatingHours: '09:00-18:00',
  minNotice: 24,
};

const AgendaTab = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [agendas, setAgendas] = useState<Agenda[]>(mockAgendas);
  const [currentAgenda, setCurrentAgenda] = useState<Omit<Agenda, 'id'>>(initialAgendaState);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value, type } = e.target;
    setCurrentAgenda((prev) => ({
      ...prev,
      [id]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSelectChange = (value: AgendaCategory) => {
    setCurrentAgenda((prev) => ({ ...prev, category: value }));
  };

  const handleSave = () => {
    setAgendas(prev => [...prev, { ...currentAgenda, id: Math.random() }]);
    setIsDialogOpen(false);
    setCurrentAgenda(initialAgendaState);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Controle de Agenda</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setCurrentAgenda(initialAgendaState)}>Criar Nova Agenda</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Agenda</DialogTitle>
              <DialogDescription>
                Preencha os detalhes para criar uma nova agenda.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Título</Label>
                <Input id="title" value={currentAgenda.title} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Descrição</Label>
                <Textarea id="description" value={currentAgenda.description} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Categoria</Label>
                <Select onValueChange={handleSelectChange} value={currentAgenda.category}>
                  <SelectTrigger className="col-span-3"><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consulta">Consulta</SelectItem>
                    <SelectItem value="evento">Evento</SelectItem>
                    <SelectItem value="classes">Classes</SelectItem>
                    <SelectItem value="recorrente">Recorrente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="host" className="text-right">Anfitrião</Label>
                <Input id="host" value={currentAgenda.host} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">Duração (min)</Label>
                <Input id="duration" type="number" value={currentAgenda.duration} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="breakTime" className="text-right">Intervalo (min)</Label>
                <Input id="breakTime" type="number" value={currentAgenda.breakTime} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="availabilityInterval" className="text-right">Incremento (min)</Label>
                <Input id="availabilityInterval" type="number" value={currentAgenda.availabilityInterval} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="operatingHours" className="text-right">Horário</Label>
                <Input id="operatingHours" value={currentAgenda.operatingHours} onChange={handleInputChange} className="col-span-3" placeholder="ex: 09:00-17:00" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="minNotice" className="text-right">Antecedência (horas)</Label>
                <Input id="minNotice" type="number" value={currentAgenda.minNotice} onChange={handleInputChange} className="col-span-3" />
              </div>
              {currentAgenda.category === 'evento' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="maxParticipants" className="text-right">Limite de Inscrições</Label>
                  <Input id="maxParticipants" type="number" value={currentAgenda.maxParticipants || ''} onChange={handleInputChange} className="col-span-3" />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" onClick={handleSave}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {agendas.length === 0 ? (
        <div className="border rounded-lg p-4 text-center">
          <p className="text-gray-500 dark:text-gray-400">Nenhuma agenda criada ainda. Clique em "Criar Nova Agenda" para começar.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agendas.map((agenda) => (
            <Card key={agenda.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{agenda.title}</CardTitle>
                    <CardDescription>{agenda.host}</CardDescription>
                  </div>
                  <Badge variant="secondary">{agenda.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{agenda.description}</p>
                <div className="flex items-center mt-4 text-sm">
                  <span className="mr-4">Dur: {agenda.duration} min</span>
                  <span>Intervalo: {agenda.breakTime} min</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" size="sm">Editar</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgendaTab;
