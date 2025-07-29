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
import { Badge } from '@/components/ui/badge';
import { Host } from '@/hooks/useHosts';
import { LocalAgenda, AgendaCategory, categoryDetails, tooltipTexts, InfoTooltip, FormField } from './AgendaTab';
import { Step1BasicInfo } from './agenda-form/Step1BasicInfo';
import { Step2TimeSettings } from './agenda-form/Step2TimeSettings';
import { Step3AvailabilitySettings } from './agenda-form/Step3AvailabilitySettings';
import { Step4ServiceTypes } from './agenda-form/Step4ServiceTypes';
import { Step5PostRegistrationActions } from './agenda-form/Step5PostRegistrationActions';
import { Step6RemindersSettings } from './agenda-form/Step6RemindersSettings';

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

  // Estado para gerenciar múltiplos lembretes
  const [reminders, setReminders] = useState<Array<{
    id: number;
    days: number;
    hours: number;
    minutes: number;
    subject: string;
    sendTo: 'inscrito' | 'anfitriao';
    channel: 'whatsapp' | 'email';
  }>>([{
    id: 1,
    days: 0,
    hours: 1,
    minutes: 0,
    subject: '1 hora para a reunião',
    sendTo: 'inscrito',
    channel: 'whatsapp'
  }]);

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

  // Funções para gerenciar lembretes
  const addReminder = () => {
    const newId = Math.max(...reminders.map(r => r.id), 0) + 1;
    setReminders(prev => [...prev, {
      id: newId,
      days: 0,
      hours: 1,
      minutes: 0,
      subject: 'Lembrete do agendamento',
      sendTo: 'inscrito',
      channel: 'whatsapp'
    }]);
  };

  const removeReminder = (id: number) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
  };

  const updateReminder = (id: number, field: string, value: any) => {
    setReminders(prev => prev.map(reminder => 
      reminder.id === id ? { ...reminder, [field]: value } : reminder
    ));
  };

  const handleSaveClick = () => {
    onSave(currentAgenda);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[900px] h-[700px] max-w-none max-h-none bg-background border flex flex-col">
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

        <div className="flex-1 overflow-y-auto py-4 pr-2 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
          {step === 1 && (
            <Step1BasicInfo 
              currentAgenda={currentAgenda}
              setCurrentAgenda={setCurrentAgenda}
              handleInputChange={handleInputChange}
              hosts={hosts}
              hostsLoading={hostsLoading}
            />
          )}
          
          {step === 2 && (
             <Step2TimeSettings 
               currentAgenda={currentAgenda}
               setCurrentAgenda={setCurrentAgenda}
               handleInputChange={handleInputChange}
             />
           )}

          {step === 3 && (
            <Step3AvailabilitySettings 
              currentAgenda={currentAgenda}
              setCurrentAgenda={setCurrentAgenda}
              handleInputChange={handleInputChange}
              availableDates={availableDates}
              setAvailableDates={setAvailableDates}
              operatingHours={operatingHours}
              setOperatingHours={setOperatingHours}
              addAvailableDate={addAvailableDate}
              removeAvailableDate={removeAvailableDate}
              updateAvailableDate={updateAvailableDate}
              addOperatingHour={addOperatingHour}
              removeOperatingHour={removeOperatingHour}
              updateOperatingHour={updateOperatingHour}
            />
          )}

          {step === 4 && (
            <Step4ServiceTypes 
              currentAgenda={currentAgenda}
              setCurrentAgenda={setCurrentAgenda}
            />
          )}

          {step === 5 && (
            <Step5PostRegistrationActions 
              currentAgenda={currentAgenda}
              setCurrentAgenda={setCurrentAgenda}
              handleInputChange={handleInputChange}
            />
          )}

          {step === 6 && (
             <Step6RemindersSettings 
               currentAgenda={currentAgenda}
               handleSwitchChange={handleSwitchChange}
               reminders={reminders}
               addReminder={addReminder}
               removeReminder={removeReminder}
               updateReminder={updateReminder}
             />
           )}
        </div>

        <DialogFooter className="flex justify-between w-full pt-6 border-t bg-background mt-auto">
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