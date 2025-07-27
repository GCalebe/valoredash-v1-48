import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog, // Keep for structure if needed, but content is main focus
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Badge } from '@/components/ui/badge';
import { Info, Edit, Trash2, Users, Calendar, Clock, Repeat } from 'lucide-react';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Host } from '@/hooks/useHosts';
import { LocalAgenda, AgendaCategory, categoryDetails, tooltipTexts, InfoTooltip, FormField } from './AgendaTab';

const initialAgendaState: Omit<LocalAgenda, 'id'> = {
  title: '',
  description: '',
  category: 'consulta', // Categoria padrão definida
  host: '',
  availabilityInterval: 30,
  duration: 60,
  breakTime: 15,
  operatingHours: '09:00-18:00',
  minNotice: 24,
  serviceTypes: ['Online', 'Presencial'],
  actionAfterRegistration: 'success_message',
  successMessage: 'Obrigado por se inscrever!',
  redirectUrl: '',
  sendReminders: false,
  reminders: [],
};

interface AgendaFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (agenda: Omit<LocalAgenda, 'id'>) => void;
  editingAgenda: LocalAgenda | null;
  hosts: Host[];
  hostsLoading: boolean;
}

export const AgendaForm: React.FC<AgendaFormProps> = ({ isOpen, onOpenChange, onSave, editingAgenda, hosts, hostsLoading }) => {
  const [currentAgenda, setCurrentAgenda] = useState<Omit<LocalAgenda, 'id'>>(initialAgendaState);
  const [step, setStep] = useState(1);
  const totalSteps = 6;

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

  // Estado para gerenciar múltiplas datas disponíveis
  const [availableDates, setAvailableDates] = useState<Record<string, Array<{start: number, end: number}>>>({
    'Janeiro': [{start: 1, end: 31}],
    'Fevereiro': [{start: 1, end: 29}],
    'Março': [{start: 1, end: 31}],
    'Abril': [{start: 1, end: 30}],
    'Maio': [{start: 1, end: 31}],
    'Junho': [{start: 1, end: 30}],
    'Julho': [{start: 1, end: 31}],
    'Agosto': [{start: 1, end: 31}],
    'Setembro': [{start: 1, end: 30}],
    'Outubro': [{start: 1, end: 31}],
    'Novembro': [{start: 1, end: 30}],
    'Dezembro': [{start: 1, end: 31}]
  });

  useEffect(() => {
    if (editingAgenda) {
      setCurrentAgenda(editingAgenda);
    } else {
      setCurrentAgenda({ ...initialAgendaState, category: 'consulta' }); // Define categoria padrão
    }
    setStep(1); // Reset step when dialog opens or editingAgenda changes
  }, [editingAgenda, isOpen]);

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

  // Funções para gerenciar datas disponíveis
  const addAvailableDate = (month: string) => {
    const monthData = [
      { name: 'Janeiro', days: 31 }, { name: 'Fevereiro', days: 29 }, { name: 'Março', days: 31 },
      { name: 'Abril', days: 30 }, { name: 'Maio', days: 31 }, { name: 'Junho', days: 30 },
      { name: 'Julho', days: 31 }, { name: 'Agosto', days: 31 }, { name: 'Setembro', days: 30 },
      { name: 'Outubro', days: 31 }, { name: 'Novembro', days: 30 }, { name: 'Dezembro', days: 31 }
    ];
    const monthInfo = monthData.find(m => m.name === month);
    const maxDays = monthInfo ? monthInfo.days : 31;
    
    setAvailableDates(prev => ({
      ...prev,
      [month]: [...prev[month], { start: 1, end: maxDays }]
    }));
  };

  const removeAvailableDate = (month: string, index: number) => {
    setAvailableDates(prev => ({
      ...prev,
      [month]: prev[month].filter((_, i) => i !== index)
    }));
  };

  const updateAvailableDate = (month: string, index: number, field: 'start' | 'end', value: number) => {
    setAvailableDates(prev => ({
      ...prev,
      [month]: prev[month].map((date, i) => 
        i === index ? { ...date, [field]: value } : date
      )
    }));
  };

  const handleSaveClick = () => {
    onSave(currentAgenda);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-background border">
        <DialogHeader className="space-y-4 pb-6">
          <div>
            <DialogTitle className="text-2xl font-bold">{editingAgenda ? 'Editar' : 'Nova'} Agenda - Etapa {step} de {totalSteps}</DialogTitle>
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
                  <FormField label="Limite de Inscrições">
                      <Input id="maxParticipants" type="number" value={currentAgenda.maxParticipants || ''} onChange={handleInputChange} />
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
                        <div key={month.name} className="space-y-2">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center space-x-3 w-28">
                              <Checkbox defaultChecked id={`month-${month.name}`} />
                              <Label htmlFor={`month-${month.name}`} className="text-sm font-medium text-foreground cursor-pointer">{month.name}</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="w-8 h-8 text-primary hover:text-primary/80 hover:bg-primary/10 font-bold"
                                onClick={() => addAvailableDate(month.name)}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                          <div className="ml-32 space-y-2">
                            {availableDates[month.name]?.map((dateRange, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Select 
                                  value={dateRange.start.toString()} 
                                  onValueChange={(value) => updateAvailableDate(month.name, index, 'start', parseInt(value))}
                                >
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
                                <Select 
                                  value={dateRange.end.toString()} 
                                  onValueChange={(value) => updateAvailableDate(month.name, index, 'end', parseInt(value))}
                                >
                                  <SelectTrigger className="w-16">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from({ length: month.days }, (_, i) => i + 1).map((day) => (
                                      <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {availableDates[month.name].length > 1 && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="w-8 h-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                                    onClick={() => removeAvailableDate(month.name, index)}
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

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">Horário de Funcionamento</h3>
                      <InfoTooltip text={tooltipTexts.operatingHours} />
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-4">Defina o horário de abertura e fechamento. Para intervalos (como almoço), clique no '+' para adicionar mais faixas de horário.</p>
                      <div className="space-y-3">
                        {['Domingo', 'Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sábado'].map((day) => (
                          <div key={day} className="space-y-2">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center space-x-3 w-36">
                                <Checkbox defaultChecked id={`day-${day}`} />
                                <Label htmlFor={`day-${day}`} className="text-sm font-medium text-foreground cursor-pointer">{day}</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="w-8 h-8 text-primary hover:text-primary/80 hover:bg-primary/10 font-bold"
                                  onClick={() => addOperatingHour(day)}
                                >
                                  +
                                </Button>
                              </div>
                            </div>
                            <div className="ml-40 space-y-2">
                              {operatingHours[day]?.map((timeRange, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Input 
                                    type="time" 
                                    value={timeRange.start} 
                                    onChange={(e) => updateOperatingHour(day, index, 'start', e.target.value)}
                                    className="w-24" 
                                  />
                                  <span className="text-sm text-muted-foreground">até</span>
                                  <Input 
                                    type="time" 
                                    value={timeRange.end} 
                                    onChange={(e) => updateOperatingHour(day, index, 'end', e.target.value)}
                                    className="w-24" 
                                  />
                                  {operatingHours[day].length > 1 && (
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="w-8 h-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                                      onClick={() => removeOperatingHour(day, index)}
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
                  </div>

                  <FormField label="Antecedência (horas)"><Input id="minNotice" type="number" value={currentAgenda.minNotice} onChange={handleInputChange} /></FormField>
                </>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Tipos de Atendimento</h3>
                  <p className="text-sm text-muted-foreground">Selecione os tipos de atendimento disponíveis para esta agenda. Você pode escolher múltiplas opções.</p>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        currentAgenda.serviceTypes.includes('Online') 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/60'
                      }`} onClick={() => {
                        const newTypes = currentAgenda.serviceTypes.includes('Online')
                          ? currentAgenda.serviceTypes.filter(type => type !== 'Online')
                          : [...currentAgenda.serviceTypes, 'Online'];
                        setCurrentAgenda(prev => ({ ...prev, serviceTypes: newTypes }));
                      }}>
                        <div className="text-center space-y-2">
                          <div className={`mx-auto w-16 h-16 rounded-lg flex items-center justify-center ${
                            currentAgenda.serviceTypes.includes('Online') 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            <span className="text-2xl">💻</span>
                          </div>
                          <h4 className="font-semibold text-foreground">Online</h4>
                          <p className="text-sm text-muted-foreground">Atendimento virtual via videochamada</p>
                        </div>
                      </div>
                      
                      <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        currentAgenda.serviceTypes.includes('Presencial') 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/60'
                      }`} onClick={() => {
                        const newTypes = currentAgenda.serviceTypes.includes('Presencial')
                          ? currentAgenda.serviceTypes.filter(type => type !== 'Presencial')
                          : [...currentAgenda.serviceTypes, 'Presencial'];
                        setCurrentAgenda(prev => ({ ...prev, serviceTypes: newTypes }));
                      }}>
                        <div className="text-center space-y-2">
                          <div className={`mx-auto w-16 h-16 rounded-lg flex items-center justify-center ${
                            currentAgenda.serviceTypes.includes('Presencial') 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            <span className="text-2xl">🏢</span>
                          </div>
                          <h4 className="font-semibold text-foreground">Presencial</h4>
                          <p className="text-sm text-muted-foreground">Atendimento no local físico</p>
                        </div>
                      </div>
                    </div>
                    
                    {currentAgenda.serviceTypes.length === 0 && (
                      <p className="text-sm text-destructive text-center">Selecione pelo menos um tipo de atendimento</p>
                    )}
                  </div>
                </div>
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
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            {step < totalSteps && <Button onClick={() => setStep(s => s + 1)}>Avançar</Button>}
            {step === totalSteps && <Button onClick={handleSaveClick}>{editingAgenda ? 'Atualizar' : 'Salvar'}</Button>}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};