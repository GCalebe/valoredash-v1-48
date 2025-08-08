// @ts-nocheck
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, UserCheck, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DateTimeStepProps {
  currentDate: Date;
  setCurrentDate: (d: Date) => void;
  selectedDate: Date | null;
  onSelectDate: (d: Date) => void;
  selectedTime: string;
  onSelectTime: (t: string) => void;
  availableTimeSlots: Array<{ time: string; available: boolean; reason?: string }>;
  agendaLoading: boolean;
  selectedAgendaName?: string | null;
  selectedAgendaHost?: string;
  selectedAgenda?: { name?: string; description?: string; duration_minutes?: number } | null;
  isDateBookable: (d: Date) => boolean;
}

const DateTimeStep: React.FC<DateTimeStepProps> = ({
  currentDate,
  setCurrentDate,
  selectedDate,
  onSelectDate,
  selectedTime,
  onSelectTime,
  availableTimeSlots,
  agendaLoading,
  selectedAgendaName,
  selectedAgendaHost,
  selectedAgenda,
  isDateBookable,
}) => {
  const weekDays = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handlePreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Escolha Data e Horário</h2>
        <p className="text-muted-foreground text-lg">
          Agenda: <span className="font-medium text-foreground">{selectedAgendaName}</span>
        </p>
      </div>

      {/* Agenda Details */}
      {selectedAgenda && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <CalendarIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{selectedAgenda?.name}</h3>
                <p className="text-sm text-gray-600">Título do Agendamento</p>
              </div>
              <div>
                <p className="text-sm text-gray-900 mb-1 line-clamp-2">{selectedAgenda?.description || 'Sem descrição disponível'}</p>
                <p className="text-xs text-gray-600">Descrição</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <UserCheck className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-900">{selectedAgendaHost || 'Carregando...'}</span>
                </div>
                <p className="text-xs text-gray-600">Anfitrião/Consultor</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-900">{selectedAgenda?.duration_minutes} minutos</span>
                </div>
                <p className="text-xs text-gray-600">Duração</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Calendar */}
        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="sm" onClick={handlePreviousMonth} className="hover:bg-muted">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="font-semibold text-lg text-foreground capitalize">{format(currentDate, 'MMMM yyyy', { locale: ptBR })}</h3>
            <Button variant="ghost" size="sm" onClick={handleNextMonth} className="hover:bg-muted">
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
              const bookable = isCurrentMonth && isDateBookable(day);
              return (
                <button
                  key={index}
                  onClick={() => isCurrentMonth && bookable && onSelectDate(day)}
                  disabled={!isCurrentMonth || !bookable}
                  className={cn(
                    'h-10 w-10 text-sm font-medium rounded-lg transition-colors',
                    !isCurrentMonth && 'text-muted-foreground/50 cursor-not-allowed',
                    isCurrentMonth && !bookable && 'text-muted-foreground/50 cursor-not-allowed',
                    isCurrentMonth && bookable && 'hover:bg-muted text-foreground',
                    isSelected && 'bg-primary text-primary-foreground hover:bg-primary/90',
                    isTodayDate && !isSelected && bookable && 'bg-muted text-foreground font-semibold',
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
            {selectedDate && <p className="text-sm text-muted-foreground">{format(selectedDate, 'yyyy', { locale: ptBR })}</p>}
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
                    variant={selectedTime === slot.time ? 'default' : 'outline'}
                    size="sm"
                    className="flex-col h-12"
                    onClick={() => slot.available && onSelectTime(slot.time)}
                    disabled={!slot.available}
                    title={!slot.available ? slot.reason : undefined}
                  >
                    <span className="text-sm font-medium">{slot.time}</span>
                    {!slot.available && <span className="text-xs text-muted-foreground">Indisponível</span>}
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
              <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Selecione uma data no calendário para ver os horários disponíveis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DateTimeStep;


