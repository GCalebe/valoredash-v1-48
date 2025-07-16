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
        <Info className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
      </TooltipTrigger>
      <TooltipContent className="max-w-sm p-3">
        <p className="text-sm leading-relaxed">{text}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const FormField = ({ label, tooltipText, children }: { label: string, tooltipText?: string, children: React.ReactNode }) => (
    <div className="space-y-3">
        <div className="flex items-center gap-2">
            <Label className="text-base font-semibold text-foreground">{label}</Label>
            {tooltipText && <InfoTooltip text={tooltipText} />}
        </div>
        <div className="w-full">{children}</div>
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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Controle de Agenda</h2>
          <p className="text-lg text-muted-foreground mt-1">Gerencie suas agendas e horários de atendimento</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openDialog} size="lg" className="font-semibold">
              Criar Nova Agenda
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="space-y-4 pb-6">
              <div>
                <DialogTitle className="text-2xl font-bold">Nova Agenda - Etapa {step} de 3</DialogTitle>
                <div className="flex gap-2 mt-3">
                  {[1, 2, 3].map((stepNumber) => (
                    <div
                      key={stepNumber}
                      className={`h-2 flex-1 rounded-full transition-colors ${
                        stepNumber <= step ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <DialogDescription className="text-base text-muted-foreground">
                Preencha os detalhes para criar uma nova agenda de atendimento.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
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
                  {/* Datas Disponíveis Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">Datas Disponíveis</h3>
                      <InfoTooltip text={tooltipTexts.availableDates} />
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                      {[
                        { name: 'Janeiro', days: 31 },
                        { name: 'Fevereiro', days: 29 },
                        { name: 'Março', days: 31 },
                        { name: 'Abril', days: 30 },
                        { name: 'Maio', days: 31 },
                        { name: 'Junho', days: 30 },
                        { name: 'Julho', days: 31 },
                        { name: 'Agosto', days: 31 },
                        { name: 'Setembro', days: 30 },
                        { name: 'Outubro', days: 31 },
                        { name: 'Novembro', days: 30 },
                        { name: 'Dezembro', days: 31 }
                      ].map((month) => (
                        <div key={month.name} className="flex items-center gap-4">
                          <div className="flex items-center space-x-2 w-24">
                            <input type="checkbox" className="rounded" defaultChecked />
                            <span className="text-sm font-medium">{month.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select defaultValue="1">
                              <SelectTrigger className="w-16">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: month.days }, (_, i) => i + 1).map((day) => (
                                  <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <span className="text-sm text-muted-foreground">até</span>
                            <Select defaultValue={month.days.toString()}>
                              <SelectTrigger className="w-16">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: month.days }, (_, i) => i + 1).map((day) => (
                                  <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Horário de Funcionamento Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">Horário de Funcionamento</h3>
                      <InfoTooltip text={tooltipTexts.operatingHours} />
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-muted-foreground">
                          Nesta seção você define o horário de abertura e fechamento do seu negócio. 
                          Caso você necessite de intervalos entre turnos (como horário de almoço, por exemplo), 
                          você pode acrescentar faixas de horários clicando no '+'.
                        </p>
                        <span className="text-sm text-muted-foreground">Eastern Time - US & Canada</span>
                      </div>
                      <div className="space-y-3">
                        {[
                          'Domingo',
                          'Segunda-Feira', 
                          'Terça-Feira',
                          'Quarta-Feira',
                          'Quinta-Feira',
                          'Sexta-Feira',
                          'Sábado'
                        ].map((day) => (
                          <div key={day} className="flex items-center gap-4">
                            <div className="flex items-center space-x-2 w-32">
                              <input type="checkbox" className="rounded" defaultChecked />
                              <span className="text-sm font-medium">{day}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input 
                                type="time" 
                                defaultValue="08:00" 
                                className="w-24"
                              />
                              <span className="text-sm text-muted-foreground">até</span>
                              <Input 
                                type="time" 
                                defaultValue="17:00" 
                                className="w-24"
                              />
                              <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-blue-500 hover:text-blue-600">
                                +
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <FormField label="Antecedência (horas)">
                      <Input id="minNotice" type="number" value={currentAgenda.minNotice} onChange={handleInputChange} />
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
        <div className="border-2 border-dashed border-muted rounded-xl p-12 text-center bg-muted/20">
          <p className="text-lg text-muted-foreground">Nenhuma agenda criada ainda.</p>
          <p className="text-base text-muted-foreground mt-2">Clique em "Criar Nova Agenda" para começar.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agendas.map((agenda) => (
            <Card key={agenda.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold text-foreground">{agenda.title}</CardTitle>
                    <CardDescription className="text-base text-muted-foreground mt-1">{agenda.host}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-sm px-3 py-1 font-medium">{agenda.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-base text-muted-foreground leading-relaxed">{agenda.description}</p>
                <div className="flex items-center gap-6 mt-6 text-sm font-medium text-foreground">
                  <span className="flex items-center gap-1">
                    <span className="text-muted-foreground">Duração:</span>
                    {agenda.duration} min
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-muted-foreground">Intervalo:</span>
                    {agenda.breakTime} min
                  </span>
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <Button variant="outline" size="default" className="w-full font-semibold">
                  Editar Agenda
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgendaTab;