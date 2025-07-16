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
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

const tooltipTexts = {
  title: "O titulo da agenda que será visivel para seus cliente",
  host: "Anfitriões são as pessoas responsáveis pela organização, execução e atendimento do agendamento. Por exemplo, se você estiver criando um calendário para uma clínica odontológica, o anfitrião será o dentista.",
  availabilityInterval: "Com esse recurso, você pode definir os intervalos de tempo que podem ser agendados, quanto menor o tempo, maior a quantidade de horários disponíveis. ex: o cliente pode marcar a cada 30 minutos.",
  duration: "A duração da sessão determina a duração de cada agendamento. Por exemplo, se você é cabeleireiro, é aqui que você determina quanto tempo leva para cortar o cabelo.",
  breakTime: "Defina um intervalo de tempo livre entre seus agendamentos. Você pode utilizar esse intervalo para descansar, se planejar.",
  operatingHours: "Especifique quais dias e horários da semana estarão disponíveis. O horário de abertura e fechamento do seu negócio.",
  availableDates: "Especifique quais meses e o intervalo de datas que estar�� com essa agenda disponível.",
};

const InfoTooltip = ({ text }: { text: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-4 w-4 text-gray-500 cursor-pointer ml-2" />
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs">{text}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const FormField = ({ label, tooltipText, children }: { label: string, tooltipText?: string, children: React.ReactNode }) => (
    <div className="grid grid-cols-4 items-center gap-4">
        <div className="flex items-center justify-end text-right">
            <Label>{label}</Label>
            {tooltipText && <InfoTooltip text={tooltipText} />}
        </div>
        <div className="col-span-3">{children}</div>
    </div>
);

const AgendaTab = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [agendas, setAgendas] = useState<Agenda[]>(mockAgendas);
  const [currentAgenda, setCurrentAgenda] = useState<Omit<Agenda, 'id'>>(initialAgendaState);
  const [step, setStep] = useState(1);

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
    setStep(1);
  };
  
  const openDialog = () => {
    setCurrentAgenda(initialAgendaState);
    setStep(1);
    setIsDialogOpen(true);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Controle de Agenda</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openDialog}>Criar Nova Agenda</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Agenda - Etapa {step} de 3</DialogTitle>
              <DialogDescription>
                Preencha os detalhes para criar uma nova agenda.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {step === 1 && (
                <>
                  <FormField label="Título" tooltipText={tooltipTexts.title}>
                      <Input id="title" value={currentAgenda.title} onChange={handleInputChange} />
                  </FormField>
                  <FormField label="Descrição">
                      <Textarea id="description" value={currentAgenda.description} onChange={handleInputChange} />
                  </FormField>
                  <FormField label="Categoria">
                      <Select onValueChange={handleSelectChange} value={currentAgenda.category}>
                          <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="consulta">Consulta</SelectItem>
                              <SelectItem value="evento">Evento</SelectItem>
                              <SelectItem value="classes">Classes</SelectItem>
                              <SelectItem value="recorrente">Recorrente</SelectItem>
                          </SelectContent>
                      </Select>
                  </FormField>
                  <FormField label="Anfitrião" tooltipText={tooltipTexts.host}>
                      <Input id="host" value={currentAgenda.host} onChange={handleInputChange} />
                  </FormField>
                </>
              )}

              {step === 2 && (
                <>
                  <FormField label="Duração (min)" tooltipText={tooltipTexts.duration}>
                      <Input id="duration" type="number" value={currentAgenda.duration} onChange={handleInputChange} />
                  </FormField>
                  <FormField label="Intervalo (min)" tooltipText={tooltipTexts.breakTime}>
                      <Input id="breakTime" type="number" value={currentAgenda.breakTime} onChange={handleInputChange} />
                  </FormField>
                  <FormField label="Incremento (min)" tooltipText={tooltipTexts.availabilityInterval}>
                      <Input id="availabilityInterval" type="number" value={currentAgenda.availabilityInterval} onChange={handleInputChange} />
                  </FormField>
                </>
              )}

              {step === 3 && (
                <>
                  <FormField label="Horário" tooltipText={tooltipTexts.operatingHours}>
                      <Input id="operatingHours" value={currentAgenda.operatingHours} onChange={handleInputChange} placeholder="ex: 09:00-17:00" />
                  </FormField>
                  <FormField label="Antecedência (horas)">
                      <Input id="minNotice" type="number" value={currentAgenda.minNotice} onChange={handleInputChange} />
                  </FormField>
                   <FormField label="Datas Disponíveis" tooltipText={tooltipTexts.availableDates}>
                      <Input id="availableDates" onChange={handleInputChange} placeholder="ex: 2024-12-01 a 2024-12-31" />
                  </FormField>
                  {currentAgenda.category === 'evento' && (
                    <FormField label="Limite de Inscrições">
                        <Input id="maxParticipants" type="number" value={currentAgenda.maxParticipants || ''} onChange={handleInputChange} />
                    </FormField>
                  )}
                </>
              )}
            </div>

            <DialogFooter className="flex justify-between w-full">
                <div>
                    {step > 1 && <Button variant="outline" onClick={() => setStep(s => s - 1)}>Voltar</Button>}
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                    {step < 3 && <Button onClick={() => setStep(s => s + 1)}>Avançar</Button>}
                    {step === 3 && <Button onClick={handleSave}>Salvar</Button>}
                </div>
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