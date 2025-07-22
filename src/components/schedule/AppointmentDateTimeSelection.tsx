import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar, ArrowLeft } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AppointmentDateTimeSelectionProps {
  selectedAgendaName?: string;
  onBack?: () => void;
  onTimeSelect?: (date: Date, time: string) => void;
}

export function AppointmentDateTimeSelection({ 
  selectedAgendaName = "Reunião de ...", 
  onBack,
  onTimeSelect 
}: AppointmentDateTimeSelectionProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Horários disponíveis
  const timeSlots = [
    { time: '08:00', period: 'AM' },
    { time: '08:30', period: 'AM' },
    { time: '09:00', period: 'AM' },
    { time: '09:30', period: 'AM' },
    { time: '10:00', period: 'AM' },
    { time: '10:30', period: 'AM' },
    { time: '11:00', period: 'AM' },
    { time: '11:30', period: 'AM' },
    { time: '12:00', period: 'PM' },
    { time: '12:30', period: 'PM' },
    { time: '01:00', period: 'PM' },
    { time: '01:30', period: 'PM' },
    { time: '02:00', period: 'PM' },
    { time: '02:30', period: 'PM' },
    { time: '03:00', period: 'PM' },
    { time: '03:30', period: 'PM' },
  ];

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
    setSelectedTime(null); // Reset time selection when date changes
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (selectedDate && onTimeSelect) {
      onTimeSelect(selectedDate, time);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
           variant="ghost"
           size="sm"
           onClick={onBack}
           className="p-2"
         >
           <ArrowLeft className="h-4 w-4" />
         </Button>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            📅 Aqui vai o Título do Agendamento
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Selecione a data e o horário disponíveis para sua consultoria gratuita abaixo:
          </p>
        </div>
      </div>

      {/* Main Content - Horizontal Layout */}
      <div className="flex gap-6">
        {/* Left Side - Agenda Info */}
        <div className="w-80 flex-shrink-0">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Nome do anfitrião</h4>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <Calendar className="h-4 w-4" />
            <span>{selectedAgendaName || 'Reunião de ...'}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Na Sessão 360, você receberá uma consultoria gratuita de como alavancar o seu negócio com os anúncios online, considerando os detalhes mais importantes sobre o seu caso específico, além de conhecer um pouco mais da Metodologia Valore.
          </p>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>1 Sessão</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>1h 0m Duração</span>
            </div>
          </div>
        </div>

        {/* Right Side - Calendar and Time Selection */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6 text-center">
              Selecione uma data e horário
            </h3>
            
            <div className="flex gap-8">
              {/* Calendar */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePreviousMonth}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNextMonth}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDays.map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 p-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => {
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isTodayDate = isToday(day);
                    
                    return (
                      <button
                        key={index}
                        onClick={() => isCurrentMonth && handleDateSelect(day)}
                        disabled={!isCurrentMonth}
                        className={cn(
                          "h-10 w-10 p-0 text-sm rounded-lg transition-colors",
                          !isCurrentMonth && "text-gray-300 dark:text-gray-600",
                          isCurrentMonth && "hover:bg-blue-50 dark:hover:bg-blue-900/20",
                          isSelected && "bg-blue-500 text-white hover:bg-blue-600",
                          isTodayDate && !isSelected && "bg-blue-100 dark:bg-blue-900"
                        )}
                      >
                        {format(day, 'd')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots */}
              <div className="w-64">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
                  {selectedDate ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : '23 de julho de 2025'}
                </h4>
                
                {selectedDate ? (
                   <div className="grid grid-cols-2 gap-2 max-h-[800px] overflow-y-auto">
                    {timeSlots.map((slot) => (
                      <Button
                        key={`${slot.time}-${slot.period}`}
                        variant={selectedTime === `${slot.time} ${slot.period}` ? "default" : "outline"}
                        size="sm"
                        className="justify-between h-10"
                        onClick={() => handleTimeSelect(`${slot.time} ${slot.period}`)}
                      >
                        <span>{slot.time}</span>
                        <span className="text-xs text-gray-500">{slot.period}</span>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Selecione uma data no calendário para ver os horários disponíveis
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </Button>
        
        <Button 
          disabled={!selectedDate || !selectedTime}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}