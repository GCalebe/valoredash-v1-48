import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useHosts } from '@/hooks/useHosts';
import { useAgendas } from '@/hooks/useAgendas';
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
import { Info, Edit, Trash2, Users, Calendar, Clock, Repeat } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";


type AgendaCategory = 'consulta' | 'evento' | 'classes' | 'recorrente' | '';

type Reminder = {
  id: number;
  when: string;
  subject: string;
  sendTo: 'inscrito' | 'anfitriao';
  channel: 'email' | 'sms';
};

import { Agenda as SupabaseAgenda } from '@/hooks/useAgendas';

type LocalAgenda = {
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
  actionAfterRegistration: 'success_message' | 'redirect_url';
  successMessage?: string;
  redirectUrl?: string;
  sendReminders: boolean;
  reminders: Reminder[];
};

type Agenda = LocalAgenda;

// Mock data removed - now using Supabase data

const initialAgendaState: Omit<LocalAgenda, 'id'> = {
  title: '',
  description: '',
  category: '',
  host: '',
  availabilityInterval: 30,
  duration: 60,
  breakTime: 15,
  operatingHours: '09:00-18:00',
  minNotice: 24,
  actionAfterRegistration: 'success_message',
  successMessage: 'Obrigado por se inscrever!',
  redirectUrl: '',
  sendReminders: false,
  reminders: [],
};

const categoryDetails = {
    consulta: {
        icon: Calendar,
        title: "Consulta",
        description: "Defina seu horário para receber seu convidado."
    },
    evento: {
        icon: Users,
        title: "Evento",
        description: "Defina data, hora e limite de inscrições e permita muitos convidados no mesmo horário."
    },
    classes: {
        icon: Clock,
        title: "Classes",
        description: "Defina seus horários e permita recorrência no mesmo horário para múltiplos convidados."
    },
    recorrente: {
        icon: Repeat,
        title: "Recorrente",
        description: "Defina seus horários e permita recorrência no mesmo horário para um único convidado."
    }
}

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
      <TooltipContent className="max-w-sm p-3 bg-background border">
        <p className="text-sm leading-relaxed text-foreground">{text}</p>
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
  const { hosts, loading: hostsLoading } = useHosts();
  const { agendas: supabaseAgendas, agendasLoading, refetchAgendas } = useAgendas();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [agendas, setAgendas] = useState<LocalAgenda[]>([]);
  const [currentAgenda, setCurrentAgenda] = useState<Omit<LocalAgenda, 'id'>>(initialAgendaState);
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Função para converter agenda do Supabase para formato local
  const convertSupabaseToLocal = (supabaseAgenda: SupabaseAgenda): LocalAgenda => {
    return {
      id: parseInt(supabaseAgenda.id),
      title: supabaseAgenda.name,
      description: supabaseAgenda.description || '',
      category: (supabaseAgenda.category as AgendaCategory) || '',
      host: '', // Será preenchido com dados dos hosts
      duration: supabaseAgenda.duration_minutes,
      breakTime: supabaseAgenda.buffer_time_minutes,
      availabilityInterval: 30, // Valor padrão
      operatingHours: '09:00-18:00', // Valor padrão
      minNotice: 24, // Valor padrão
      maxParticipants: supabaseAgenda.max_participants || undefined,
      actionAfterRegistration: 'success_message',
      successMessage: 'Obrigado por se inscrever!',
      redirectUrl: '',
      sendReminders: false,
      reminders: []
    };
  };

  // Usar dados do Supabase quando disponíveis, senão usar mockados
  const displayAgendas = supabaseAgendas.length > 0 
    ? supabaseAgendas.map(convertSupabaseToLocal)
    : agendas;

  const isLoading = agendasLoading || hostsLoading;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value, type } = e.target;
    setCurrentAgenda((prev) => ({
      ...prev,
      [id]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleCategoryChange = (category: AgendaCategory) => {
    setCurrentAgenda((prev) => ({ ...prev, category }));
  };
  
  const handleSwitchChange = (checked: boolean) => {
    setCurrentAgenda(prev => ({ ...prev, sendReminders: checked }));
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
  };

  const handleEditAgenda = (agenda: LocalAgenda) => {
    setCurrentAgenda({
      title: agenda.title,
      description: agenda.description,
      category: agenda.category,
      host: agenda.host,
      duration: agenda.duration,
      breakTime: agenda.breakTime,
      availabilityInterval: agenda.availabilityInterval || 30,
      operatingHours: agenda.operatingHours || '09:00-18:00',
      minNotice: agenda.minNotice || 24,
      actionAfterRegistration: agenda.actionAfterRegistration || 'success_message',
      successMessage: agenda.successMessage || 'Obrigado por se inscrever!',
      redirectUrl: agenda.redirectUrl || '',
      sendReminders: agenda.sendReminders || false,
      reminders: agenda.reminders || [],
    });
    setStep(1);
    setIsDialogOpen(true);
  };

  const handleDeleteAgenda = async (agendaId: string | number) => {
     if (window.confirm('Tem certeza que deseja excluir esta agenda?')) {
       // TODO: Implementar exclusão no Supabase
       console.log('Deletar agenda:', agendaId);
       // Após implementar a exclusão, chamar refetchAgendas() para atualizar a lista
     }
   };

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
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-background border">
            <DialogHeader className="space-y-4 pb-6">
              <div>
                <DialogTitle className="text-2xl font-bold">Nova Agenda - Etapa {step} de {totalSteps}</DialogTitle>
                <div className="flex gap-2 mt-3">
                  {Array.from({ length: totalSteps }, (_, i) => i + 1).map((stepNumber) => (
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
                {step === 1 ? "Selecione o tipo de agenda que você deseja criar." : "Preencha os detalhes para criar uma nova agenda de atendimento."}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(categoryDetails).map(([key, { icon: Icon, title, description }]) => (
                        <div 
                            key={key}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${currentAgenda.category === key ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/60'}`}
                            onClick={() => handleCategoryChange(key as AgendaCategory)}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`mt-1 p-2 rounded-full ${currentAgenda.category === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground">{title}</h4>
                                    <p className="text-sm text-muted-foreground">{description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
              )}
              
              {step === 2 && (
                <>
                  <FormField label="Título" tooltipText={tooltipTexts.title}>
                      <Input id="title" value={currentAgenda.title} onChange={handleInputChange} />
                  </FormField>
                  <FormField label="Descrição">
                      <Textarea id="description" value={currentAgenda.description} onChange={handleInputChange} />
                  </FormField>
                  <FormField label="Anfitrião" tooltipText={tooltipTexts.host}>
                      <Select 
                        value={currentAgenda.host} 
                        onValueChange={(value) => setCurrentAgenda(prev => ({ ...prev, host: value }))}
                        disabled={hostsLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={hostsLoading ? "Carregando anfitriões..." : "Selecione um anfitrião"} />
                        </SelectTrigger>
                        <SelectContent>
                          {hosts.map((host) => (
                            <SelectItem key={host.id} value={host.name}>
                              {host.name} - {host.role}
                            </SelectItem>
                          ))}
                          {hosts.length === 0 && !hostsLoading && (
                            <div className="p-2 text-sm text-gray-500 text-center">
                              Nenhum anfitrião encontrado
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                  </FormField>
                </>
              )}

              {step === 3 && (
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

              {step === 4 && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">Datas Disponíveis</h3>
                      <InfoTooltip text={tooltipTexts.availableDates} />
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                      {[
                        { name: 'Janeiro', days: 31 }, { name: 'Fevereiro', days: 29 }, { name: 'Março', days: 31 },
                        { name: 'Abril', days: 30 }, { name: 'Maio', days: 31 }, { name: 'Junho', days: 30 },
                        { name: 'Julho', days: 31 }, { name: 'Agosto', days: 31 }, { name: 'Setembro', days: 30 },
                        { name: 'Outubro', days: 31 }, { name: 'Novembro', days: 30 }, { name: 'Dezembro', days: 31 }
                      ].map((month) => (
                        <div key={month.name} className="flex items-center gap-4">
                          <div className="flex items-center space-x-3 w-28">
                            <Checkbox defaultChecked id={`month-${month.name}`} />
                            <Label htmlFor={`month-${month.name}`} className="text-sm font-medium text-foreground cursor-pointer">{month.name}</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select defaultValue="1"><SelectTrigger className="w-16"><SelectValue /></SelectTrigger><SelectContent>{Array.from({ length: month.days }, (_, i) => i + 1).map((day) => (<SelectItem key={day} value={day.toString()}>{day}</SelectItem>))}</SelectContent></Select>
                            <span className="text-sm text-muted-foreground">até</span>
                            <Select defaultValue={month.days.toString()}><SelectTrigger className="w-16"><SelectValue /></SelectTrigger><SelectContent>{Array.from({ length: month.days }, (_, i) => i + 1).map((day) => (<SelectItem key={day} value={day.toString()}>{day}</SelectItem>))}</SelectContent></Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">Horário de Funcionamento</h3>
                      <InfoTooltip text={tooltipTexts.operatingHours} />
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-4">Defina o horário de abertura e fechamento. Para intervalos (como almoço), clique no '+' para adicionar mais faixas de horário.</p>
                      <div className="space-y-3">
                        {['Domingo', 'Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sábado'].map((day) => (
                          <div key={day} className="flex items-center gap-4">
                            <div className="flex items-center space-x-3 w-36">
                              <Checkbox defaultChecked id={`day-${day}`} />
                              <Label htmlFor={`day-${day}`} className="text-sm font-medium text-foreground cursor-pointer">{day}</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input type="time" defaultValue="08:00" className="w-24" />
                              <span className="text-sm text-muted-foreground">até</span>
                              <Input type="time" defaultValue="17:00" className="w-24" />
                              <Button variant="ghost" size="icon" className="w-8 h-8 text-primary hover:text-primary/80 hover:bg-primary/10 font-bold">+</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <FormField label="Antecedência (horas)"><Input id="minNotice" type="number" value={currentAgenda.minNotice} onChange={handleInputChange} /></FormField>
                  {currentAgenda.category === 'evento' && (<FormField label="Limite de Inscrições"><Input id="maxParticipants" type="number" value={currentAgenda.maxParticipants || ''} onChange={handleInputChange} /></FormField>)}
                </>
              )}

              {step === 5 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Ação após a inscrição</h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className={`flex-1 p-4 border-2 rounded-lg cursor-pointer transition-all ${currentAgenda.actionAfterRegistration === 'success_message' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/60'}`} onClick={() => setCurrentAgenda(prev => ({ ...prev, actionAfterRegistration: 'success_message' }))}>
                        <div className="text-center space-y-2">
                          <div className={`mx-auto w-16 h-16 rounded-lg flex items-center justify-center ${currentAgenda.actionAfterRegistration === 'success_message' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}><span className="text-2xl">💬</span></div>
                          <h4 className="font-semibold text-foreground">Exibir mensagem de sucesso</h4>
                          <p className="text-sm text-muted-foreground">Seu cliente verá uma mensagem de confirmação.</p>
                        </div>
                      </div>
                      <div className={`flex-1 p-4 border-2 rounded-lg cursor-pointer transition-all ${currentAgenda.actionAfterRegistration === 'redirect_url' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/60'}`} onClick={() => setCurrentAgenda(prev => ({ ...prev, actionAfterRegistration: 'redirect_url' }))}>
                        <div className="text-center space-y-2">
                          <div className={`mx-auto w-16 h-16 rounded-lg flex items-center justify-center ${currentAgenda.actionAfterRegistration === 'redirect_url' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}><span className="text-2xl">🌐</span></div>
                          <h4 className="font-semibold text-foreground">Redirecionar para URL</h4>
                          <p className="text-sm text-muted-foreground">O cliente será redirecionado para um site externo.</p>
                        </div>
                      </div>
                    </div>
                    {currentAgenda.actionAfterRegistration === 'success_message' && (<div className="space-y-2"><Label className="text-base font-semibold text-foreground">Mensagem de sucesso <span className="text-red-500">*</span></Label><div className="relative"><Textarea id="successMessage" value={currentAgenda.successMessage || ''} onChange={handleInputChange} placeholder="Obrigado por se inscrever!" className="resize-none" maxLength={255} /><div className="absolute bottom-2 right-2 text-xs text-muted-foreground">{(currentAgenda.successMessage || '').length}/255</div></div></div>)}
                    {currentAgenda.actionAfterRegistration === 'redirect_url' && (<div className="space-y-2"><Label className="text-base font-semibold text-foreground">URL de redirecionamento <span className="text-red-500">*</span></Label><Input id="redirectUrl" value={currentAgenda.redirectUrl || ''} onChange={handleInputChange} placeholder="https://example.com" type="url" /></div>)}
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Lembretes</h3>
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sendReminders" className="text-base font-semibold text-foreground cursor-pointer">Enviar lembretes automáticos</Label>
                        <p className="text-sm text-muted-foreground">Notifique os participantes antes do evento.</p>
                      </div>
                      <Switch id="sendReminders" checked={currentAgenda.sendReminders} onCheckedChange={handleSwitchChange} />
                    </div>
                  </div>
                  {currentAgenda.sendReminders && (
                    <div className="space-y-6 border-t pt-6">
                      <div className="border border-border rounded-lg p-6 bg-muted/30">
                        <h4 className="text-lg font-semibold mb-4 text-foreground">Configurar Lembrete</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField label="Quando"><Input type="text" defaultValue="0 Dia(s) 1 Hora(s) 0 Minuto(s) antes" className="w-full" /></FormField>
                          <FormField label="Assunto"><Input type="text" defaultValue="1 hora para a reunião" className="w-full" /></FormField>
                          <FormField label="Enviar para"><Select defaultValue="inscrito"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="inscrito">Inscrito</SelectItem><SelectItem value="anfitriao">Anfitrião</SelectItem></SelectContent></Select></FormField>
                          <FormField label="Canais"><Select defaultValue="whatsapp"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="whatsapp">Whatsapp</SelectItem></SelectContent></Select></FormField>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="flex justify-between w-full pt-6">
                <div>{step > 1 && <Button variant="outline" onClick={() => setStep(s => s - 1)}>Voltar</Button>}</div>
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                    {step < totalSteps && <Button onClick={() => setStep(s => s + 1)} disabled={step === 1 && !currentAgenda.category}>Avançar</Button>}
                    {step === totalSteps && <Button onClick={handleSave}>Salvar</Button>}
                </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="flex flex-col justify-between bg-background border">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="h-6 bg-muted rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-muted rounded animate-pulse w-2/3"></div>
                  </div>
                  <div className="h-6 w-16 bg-muted rounded animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-3/4 mb-6"></div>
                <div className="flex items-center gap-6">
                  <div className="h-4 bg-muted rounded animate-pulse w-20"></div>
                  <div className="h-4 bg-muted rounded animate-pulse w-20"></div>
                </div>
              </CardContent>
              <CardFooter className="pt-4 flex justify-end gap-2 bg-muted/30 p-3 mt-4">
                <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
                <div className="h-8 flex-1 bg-muted rounded animate-pulse"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : displayAgendas.length === 0 ? (
        <div className="border-2 border-dashed border-muted rounded-xl p-12 text-center bg-background">
          <p className="text-lg text-muted-foreground">Nenhuma agenda criada ainda.</p>
          <p className="text-base text-muted-foreground mt-2">Clique em "Criar Nova Agenda" para começar.</p>
        </div>
      ) : (
        <div className="max-h-[800px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayAgendas.map((agenda) => (
            <Card key={agenda.id} className="flex flex-col justify-between bg-background border hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1"><CardTitle className="text-xl font-bold text-foreground">{agenda.title}</CardTitle><CardDescription className="text-base text-muted-foreground mt-1">{agenda.host}</CardDescription></div>
                  <Badge variant="secondary" className="text-sm px-3 py-1 font-medium">{agenda.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-base text-muted-foreground leading-relaxed line-clamp-2 h-12">{agenda.description}</p>
                <div className="flex items-center gap-6 mt-6 text-sm font-medium text-foreground">
                  <span className="flex items-center gap-1.5"><span className="text-muted-foreground">Duração:</span>{agenda.duration} min</span>
                  <span className="flex items-center gap-1.5"><span className="text-muted-foreground">Intervalo:</span>{agenda.breakTime} min</span>
                </div>
              </CardContent>
              <CardFooter className="pt-4 flex justify-end gap-2 bg-muted/30 p-3 mt-4">
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0"
                  onClick={() => handleDeleteAgenda(agenda.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="default" 
                  className="flex-1 font-semibold"
                  onClick={() => handleEditAgenda(agenda)}
                >
                  <Edit className="h-4 w-4 mr-2" />Editar Agenda
                </Button>
              </CardFooter>
            </Card>
          ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaTab;