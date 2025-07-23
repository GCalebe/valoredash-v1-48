import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { TimeSlotSelector } from './TimeSlotSelector';
import { useAgendas } from '@/hooks/useAgendas';
import { Calendar, Clock, User, Phone, Mail, FileText } from 'lucide-react';

interface BookingFormData {
  agendaId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes: string;
  date?: Date;
  time?: string;
}

export function AgendaBookingForm() {
  const [formData, setFormData] = useState<BookingFormData>({
    agendaId: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    notes: '',
  });
  const [currentStep, setCurrentStep] = useState<'agenda' | 'date' | 'time' | 'details'>('agenda');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { agendas, agendasLoading } = useAgendas();
  const { toast } = useToast();

  const handleAgendaSelect = (agendaId: string) => {
    setFormData(prev => ({ ...prev, agendaId }));
    setCurrentStep('date');
  };

  const handleDateSelect = (date: Date | undefined) => {
    setFormData(prev => ({ ...prev, date }));
    if (date) {
      setCurrentStep('time');
    }
  };

  const handleTimeSelect = (time: string | undefined) => {
    setFormData(prev => ({ ...prev, time }));
    if (time) {
      setCurrentStep('details');
    }
  };

  const handleSubmit = async () => {
    if (!formData.agendaId || !formData.date || !formData.time || !formData.clientName) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement actual booking creation
      console.log('Creating booking:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Agendamento criado!",
        description: "O agendamento foi criado com sucesso.",
      });

      // Reset form
      setFormData({
        agendaId: '',
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        notes: '',
      });
      setCurrentStep('agenda');
    } catch (error) {
      toast({
        title: "Erro ao criar agendamento",
        description: "Não foi possível criar o agendamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAgenda = agendas.find(a => a.id === formData.agendaId);

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {['agenda', 'date', 'time', 'details'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep === step || (index < ['agenda', 'date', 'time', 'details'].indexOf(currentStep)) 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'}
                `}>
                  {index + 1}
                </div>
                {index < 3 && (
                  <div className={`
                    w-full h-0.5 mx-2
                    ${index < ['agenda', 'date', 'time', 'details'].indexOf(currentStep) 
                      ? 'bg-primary' 
                      : 'bg-muted'}
                  `} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Agenda</span>
            <span>Data</span>
            <span>Horário</span>
            <span>Detalhes</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Step 1: Agenda Selection */}
        {currentStep === 'agenda' && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Selecione a Agenda
              </CardTitle>
            </CardHeader>
            <CardContent>
              {agendasLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {agendas.map((agenda) => (
                    <Card 
                      key={agenda.id}
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => handleAgendaSelect(agenda.id)}
                    >
                      <CardContent className="p-4">
                        <h3 className="font-medium">{agenda.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {agenda.description}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {agenda.duration_minutes}min
                          </span>
                          {agenda.price && (
                            <span>R$ {agenda.price.toFixed(2)}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Date Selection */}
        {currentStep === 'date' && formData.agendaId && (
          <>
            <AvailabilityCalendar
              agendaId={formData.agendaId}
              selectedDate={formData.date}
              onDateSelect={handleDateSelect}
            />
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Agenda Selecionada</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedAgenda && (
                    <div className="space-y-2">
                      <h3 className="font-medium">{selectedAgenda.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedAgenda.description}
                      </p>
                      <div className="text-sm text-muted-foreground">
                        Duração: {selectedAgenda.duration_minutes} minutos
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep('agenda')}
                className="w-full"
              >
                Voltar para Agendas
              </Button>
            </div>
          </>
        )}

        {/* Step 3: Time Selection */}
        {currentStep === 'time' && formData.agendaId && formData.date && (
          <>
            <TimeSlotSelector
              agendaId={formData.agendaId}
              selectedDate={formData.date}
              selectedTime={formData.time}
              onTimeSelect={handleTimeSelect}
            />
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Agenda:</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {selectedAgenda?.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Data:</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {formData.date.toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep('date')}
                className="w-full"
              >
                Voltar para Datas
              </Button>
            </div>
          </>
        )}

        {/* Step 4: Details Form */}
        {currentStep === 'details' && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Dados do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Nome *</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                    placeholder="Nome completo do cliente"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientPhone">Telefone *</Label>
                  <Input
                    id="clientPhone"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientEmail">E-mail</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                  placeholder="cliente@email.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Informações adicionais sobre o agendamento"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep('time')}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Criando...' : 'Criar Agendamento'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}