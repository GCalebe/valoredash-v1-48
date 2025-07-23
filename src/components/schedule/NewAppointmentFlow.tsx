import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar, ArrowLeft } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ClientSelectionTab } from '@/components/event-form/ClientSelectionTab';
import { ServiceSelectionTab } from '@/components/event-form/ServiceSelectionTab';
import { AttendanceSelectionTab } from '@/components/event-form/AttendanceSelectionTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEventFormDialog } from '@/hooks/useEventFormDialog';
import { EventFormData } from '@/types/event';
import { useContactsData } from '@/hooks/useContactsData';
import { AgendaSelectionTab } from './AgendaSelectionTab';
import { useAgendas } from '@/hooks/useAgendas';
import { useAgendaAvailability } from '@/hooks/useAgendaAvailability';

interface NewAppointmentFlowProps {
  selectedAgendaId?: string;
  onBack: () => void;
  onFormSubmit?: (formData: EventFormData) => void;
}

export function NewAppointmentFlow({ selectedAgendaId, onBack, onFormSubmit }: NewAppointmentFlowProps) {
  const [currentStep, setCurrentStep] = useState<'agenda' | 'datetime' | 'form'>('agenda');
  
  // Agenda selection state
  const [internalSelectedAgendaId, setInternalSelectedAgendaId] = useState<string | null>(selectedAgendaId || null);
  const [selectedAgendaName, setSelectedAgendaName] = useState<string | null>(null);

  // DateTime selection state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<Array<{time: string, available: boolean, reason?: string}>>([]);
  
  const {
    getAvailableTimeSlots,
    isDateAvailable,
    loading: agendaLoading
  } = useAgendaAvailability(selectedAgendaId || internalSelectedAgendaId || '');
  
  // Form state
  const {
    state,
    updateState,
    filteredContacts,
    constants,
    validateForm,
    handleSubmit,
    handleSelectClient,
    handleNewClient,
    handleSaveNewClient,
    addTag,
    removeTag
  } = useEventFormDialog({ open: true });
  
  // Mock constants and tag functions for now
  const formConstants = { services: [], attendanceTypes: [] };
  const formAddTag = (tag: string) => console.log('Add tag:', tag);
  const formRemoveTag = (tag: string) => console.log('Remove tag:', tag);

  // Load available time slots when date changes
  useEffect(() => {
    const agendaId = selectedAgendaId || internalSelectedAgendaId;
    if (selectedDate && agendaId) {
      const slots = getAvailableTimeSlots(selectedDate);
      setAvailableTimeSlots(slots);
    } else {
      setAvailableTimeSlots([]);
    }
  }, [selectedDate, selectedAgendaId, internalSelectedAgendaId, getAvailableTimeSlots]);
  
  // Reset selected time when date changes
  useEffect(() => {
    setSelectedTime('');
  }, [selectedDate]);
  
  // Function to check if a date is bookable
  const isDateBookable = (date: Date): boolean => {
    const agendaId = selectedAgendaId || internalSelectedAgendaId;
    if (!agendaId) return false;
    return isDateAvailable(date);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset time selection when date changes
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };
  
  const handleContinueToForm = () => {
    if (selectedDate && selectedTime) {
      // Set the selected date and time in the form state
      const dateTimeString = format(selectedDate, "yyyy-MM-dd'T'") + selectedTime.split(' ')[0];
      updateState({
        startDateTime: dateTimeString,
        selectedDate: selectedDate,
        selectedTime: selectedTime
      });
      setCurrentStep('form');
    }
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
    const formData = handleSubmit(e);
    if (formData && onFormSubmit) {
      onFormSubmit(formData);
    }
  };

  const handleAgendaSelect = (agendaId: string, agendaName: string) => {
    setInternalSelectedAgendaId(agendaId);
    setSelectedAgendaName(agendaName);
  };

  const renderAgendaStep = () => (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Selecione a Agenda
        </h2>
        <p className="text-muted-foreground text-lg">
          Escolha o tipo de agendamento que melhor atende suas necessidades
        </p>
      </div>
      
      <AgendaSelectionTab
        onAgendaSelect={handleAgendaSelect}
        selectedAgendaId={selectedAgendaId || internalSelectedAgendaId}
      />
    </div>
  );

  const renderDateTimeStep = () => (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Escolha Data e Horário
        </h2>
        <p className="text-muted-foreground text-lg">
          Agenda: <span className="font-medium text-foreground">{selectedAgendaName}</span>
        </p>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Calendar */}
        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreviousMonth}
              className="hover:bg-muted"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="font-semibold text-lg text-foreground capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
              className="hover:bg-muted"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-4">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2 uppercase">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);
              const isBookable = isCurrentMonth && isDateBookable(day);
              
              return (
                <button
                  key={index}
                  onClick={() => isCurrentMonth && isBookable && handleDateSelect(day)}
                  disabled={!isCurrentMonth || !isBookable}
                  className={cn(
                    "h-10 w-10 text-sm font-medium rounded-lg transition-colors",
                    !isCurrentMonth && "text-muted-foreground/50 cursor-not-allowed",
                    isCurrentMonth && !isBookable && "text-muted-foreground/50 cursor-not-allowed",
                    isCurrentMonth && isBookable && "hover:bg-muted text-foreground",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                    isTodayDate && !isSelected && isBookable && "bg-muted text-foreground font-semibold"
                  )}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slots */}
        <div className="bg-card rounded-xl border p-6">
          <div className="text-center mb-6">
            <h3 className="font-semibold text-lg text-foreground mb-2">
              {selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : 'Selecione uma data'}
            </h3>
            {selectedDate && (
              <p className="text-sm text-muted-foreground">
                {format(selectedDate, "yyyy", { locale: ptBR })}
              </p>
            )}
          </div>
          
          {selectedDate ? (
            <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
              {agendaLoading ? (
                <div className="col-span-2 text-center py-8">
                  <p className="text-muted-foreground">Carregando horários...</p>
                </div>
              ) : availableTimeSlots.length > 0 ? (
                availableTimeSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={selectedTime === slot.time ? "default" : "outline"}
                    size="sm"
                    className="flex-col h-12"
                    onClick={() => slot.available && handleTimeSelect(slot.time)}
                    disabled={!slot.available}
                    title={!slot.available ? slot.reason : undefined}
                  >
                    <span className="text-sm font-medium">{slot.time}</span>
                    {!slot.available && (
                      <span className="text-xs text-muted-foreground">Indisponível</span>
                    )}
                  </Button>
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  <p className="text-muted-foreground">Nenhum horário disponível para esta data</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Selecione uma data no calendário para ver os horários disponíveis
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderFormStep = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Finalizar Agendamento
        </h2>
        <p className="text-muted-foreground text-lg">
          Preencha os dados para confirmar seu agendamento
        </p>
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm">
            <span className="font-medium">Agenda:</span> {selectedAgendaName} • 
            <span className="font-medium ml-2">Data:</span> {selectedDate && format(selectedDate, "dd/MM/yyyy", { locale: ptBR })} • 
            <span className="font-medium ml-2">Horário:</span> {selectedTime}
          </p>
        </div>
      </div>
      
      <div className="bg-card rounded-xl border p-6">
        <form id="event-form" onSubmit={handleFormSubmit}>
          <Tabs value={state.activeTab} onValueChange={(value) => updateState({ activeTab: value })} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="client">1. Cliente</TabsTrigger>
              <TabsTrigger value="service">2. Serviço</TabsTrigger>
              <TabsTrigger value="attendance">3. Atendimento</TabsTrigger>
            </TabsList>
            
            <TabsContent value="client" className="space-y-4">
              <ClientSelectionTab
                state={state}
                updateState={updateState}
                filteredContacts={filteredContacts}
                onSelectClient={handleSelectClient}
                onNewClient={handleNewClient}
                onSaveNewClient={handleSaveNewClient}
                onNext={() => updateState({ activeTab: "service" })}
              />
            </TabsContent>
            
            <TabsContent value="service" className="space-y-4">
              <ServiceSelectionTab
                state={state}
                updateState={updateState}
                constants={formConstants}
                onNext={() => updateState({ activeTab: "attendance" })}
                onPrevious={() => updateState({ activeTab: "client" })}
              />
            </TabsContent>
            
            <TabsContent value="attendance" className="space-y-4">
              <AttendanceSelectionTab
                state={state}
                updateState={updateState}
                constants={formConstants}
                addTag={() => formAddTag}
                removeTag={() => formRemoveTag}
                onPrevious={() => updateState({ activeTab: "service" })}
              />
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentStep) {
      case 'agenda':
        return renderAgendaStep();
      case 'datetime':
        return renderDateTimeStep();
      case 'form':
        return renderFormStep();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    currentStep === 'agenda' ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`} />
                  <span className={`text-sm font-medium ${
                    currentStep === 'agenda' ? 'text-foreground' : 'text-muted-foreground'
                  }`}>Agenda</span>
                </div>
                <div className="w-8 h-0.5 bg-muted-foreground/20" />
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    currentStep === 'datetime' ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`} />
                  <span className={`text-sm font-medium ${
                    currentStep === 'datetime' ? 'text-foreground' : 'text-muted-foreground'
                  }`}>Data/Hora</span>
                </div>
                <div className="w-8 h-0.5 bg-muted-foreground/20" />
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    currentStep === 'form' ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`} />
                  <span className={`text-sm font-medium ${
                    currentStep === 'form' ? 'text-foreground' : 'text-muted-foreground'
                  }`}>Dados</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {currentStep === 'datetime' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentStep('agenda')}
                >
                  Voltar
                </Button>
              )}
              {currentStep === 'form' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentStep('datetime')}
                >
                  Voltar
                </Button>
              )}
              
              {currentStep === 'agenda' && (selectedAgendaId || internalSelectedAgendaId) && (
                <Button onClick={() => setCurrentStep('datetime')} size="sm">
                  Continuar
                </Button>
              )}
              {currentStep === 'datetime' && selectedDate && selectedTime && (
                <Button onClick={handleContinueToForm} size="sm">
                  Continuar
                </Button>
              )}
              {currentStep === 'form' && (
                <Button form="event-form" type="submit" size="sm">
                  Finalizar
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Optimized Layout */}
      <main className="container mx-auto px-6 py-8">
        {renderContent()}
      </main>
    </div>
  );
}