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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex">
        {/* Left Side - Agenda Information */}
        <div className="w-80 p-8 ml-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-r border-gray-200/50 dark:border-gray-700/50 shadow-xl rounded-l-2xl">
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                  Agendamento de Consultoria
                </h2>
                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                  Sessão Estratégica Gratuita
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Selecione a data e horário ideais para sua consultoria personalizada e gratuita.
            </p>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 text-lg">
                Consultor Responsável
              </h3>
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-xl border border-blue-100 dark:border-gray-600">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-lg font-bold">{selectedAgendaName.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{selectedAgendaName}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Especialista em Growth</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-gray-50/80 dark:bg-gray-700/30 rounded-xl border border-gray-200/50 dark:border-gray-600/50">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">O que você receberá:</h4>
                <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  Análise completa do seu negócio, estratégias personalizadas de marketing digital e um plano de ação para acelerar seus resultados.
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">1 Sessão Personalizada</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">60 minutos de duração</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Calendar and Time Selection */}
        <div className="flex-1 p-8 flex justify-center">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 shadow-xl w-full max-w-4xl">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Escolha sua data e horário
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Selecione o melhor momento para sua consultoria
              </p>
            </div>
            
            <div className="flex gap-8 justify-center items-start max-w-4xl mx-auto">
              {/* Calendar */}
              <div className="w-80">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-700/50 dark:to-gray-600/30 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-600/50">
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePreviousMonth}
                    className="hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </Button>
                  <h4 className="font-bold text-xl text-gray-900 dark:text-gray-100 capitalize">
                    {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNextMonth}
                    className="hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {weekDays.map((day) => (
                    <div key={day} className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 p-3 uppercase tracking-wide">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-2">
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
                          "h-12 w-12 p-0 text-sm font-semibold rounded-xl transition-all duration-200 transform hover:scale-105",
                          !isCurrentMonth && "text-gray-300 dark:text-gray-600 cursor-not-allowed",
                          isCurrentMonth && "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md text-gray-700 dark:text-gray-300",
                          isSelected && "bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg",
                          isTodayDate && !isSelected && "bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 text-blue-700 dark:text-blue-300 border-2 border-blue-300 dark:border-blue-600"
                        )}
                      >
                        {format(day, 'd')}
                      </button>
                    );
                  })}
                </div>
                </div>
              </div>

              {/* Time Slots */}
              <div className="w-80">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-700/50 dark:to-gray-600/30 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-600/50">
                <div className="text-center mb-6">
                  <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">
                    {selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : 'Selecione uma data'}
                  </h4>
                  {selectedDate && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {format(selectedDate, "yyyy", { locale: ptBR })}
                    </p>
                  )}
                </div>
                
                {selectedDate ? (
                   <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                    {timeSlots.map((slot) => (
                      <Button
                        key={`${slot.time}-${slot.period}`}
                        variant={selectedTime === `${slot.time} ${slot.period}` ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "flex-col h-14 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105",
                          selectedTime === `${slot.time} ${slot.period}` 
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg border-0" 
                            : "hover:bg-blue-50 dark:hover:bg-blue-900/20 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500"
                        )}
                        onClick={() => handleTimeSelect(`${slot.time} ${slot.period}`)}
                      >
                        <span className="text-sm font-bold">{slot.time}</span>
                        <span className={cn(
                          "text-xs font-medium",
                          selectedTime === `${slot.time} ${slot.period}` 
                            ? "text-blue-100" 
                            : "text-gray-500 dark:text-gray-400"
                        )}>{slot.period}</span>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Calendar className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Escolha uma data
                    </h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                      Selecione uma data no calendário para visualizar os horários disponíveis
                    </p>
                  </div>
                )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-8 ml-40">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex items-center gap-3 px-6 py-3 rounded-xl border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-semibold">Voltar</span>
        </Button>
        
        <Button 
          disabled={!selectedDate || !selectedTime}
          className="mr-80 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}