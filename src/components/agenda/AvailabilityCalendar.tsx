import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAgendaAvailability } from '@/hooks/useAgendaAvailability';
import { format, isSameMonth, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AvailabilityCalendarProps {
  agendaId: string;
  selectedDate?: Date;
  onDateSelect: (date: Date | undefined) => void;
  className?: string;
}

export function AvailabilityCalendar({ 
  agendaId, 
  selectedDate, 
  onDateSelect, 
  className 
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { 
    agenda,
    loading,
    isDateAvailable,
    getAvailableDatesForMonth
  } = useAgendaAvailability(agendaId);

  // Get available dates for current month view
  const availableDates = getAvailableDatesForMonth(
    currentMonth.getFullYear(),
    currentMonth.getMonth()
  );

  // Custom modifiers for the calendar
  const modifiers = {
    available: (date: Date) => isDateAvailable(date),
    unavailable: (date: Date) => !isDateAvailable(date) && isSameMonth(date, currentMonth),
  };

  const modifiersStyles = {
    available: { 
      backgroundColor: 'hsl(var(--primary))',
      color: 'hsl(var(--primary-foreground))',
      borderRadius: '6px'
    },
    unavailable: { 
      opacity: 0.3,
      textDecoration: 'line-through'
    },
  };

  const handleDateSelect = (date: Date | undefined) => {
    // Only allow selection of available dates
    if (date && isDateAvailable(date)) {
      onDateSelect(date);
    }
  };

  const handleMonthChange = (month: Date) => {
    setCurrentMonth(month);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Calendário de Disponibilidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!agenda) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Calendário de Disponibilidade</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Selecione uma agenda para ver a disponibilidade
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Calendário de Disponibilidade
          <Badge variant="outline">
            {agenda.name}
          </Badge>
        </CardTitle>
        <div className="flex gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-primary rounded-sm"></div>
            <span>Disponível</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-muted rounded-sm opacity-50"></div>
            <span>Indisponível</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md p-4">
          <Calendar
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="w-full"
          />
        </div>
        
        {selectedDate && (
          <div className="mt-4 p-3 rounded-lg bg-muted">
            <p className="text-sm font-medium">
              Data selecionada: {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Duração: {agenda.duration_minutes} minutos
              {agenda.buffer_time_minutes > 0 && ` (+${agenda.buffer_time_minutes}min buffer)`}
            </p>
          </div>
        )}
        
        <div className="mt-4 text-xs text-muted-foreground">
          <p>
            {availableDates.length} dias disponíveis em{' '}
            {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}