import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Info } from 'lucide-react';
import { useAgendaAvailability, type TimeSlot } from '@/hooks/useAgendaAvailability';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface TimeSlotSelectorProps {
  agendaId: string;
  selectedDate: Date;
  selectedTime?: string;
  onTimeSelect: (time: string | undefined) => void;
  className?: string;
}

export function TimeSlotSelector({ 
  agendaId, 
  selectedDate, 
  selectedTime, 
  onTimeSelect, 
  className 
}: TimeSlotSelectorProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const { 
    agenda,
    loading,
    getAvailableTimeSlots,
    getOperatingHoursForDate,
    fetchBookings
  } = useAgendaAvailability(agendaId);

  // Load time slots when date changes
  useEffect(() => {
    if (selectedDate && agenda) {
      // Fetch bookings for the selected date and surrounding dates
      const startDate = new Date(selectedDate);
      const endDate = new Date(selectedDate);
      
      fetchBookings(startDate, endDate).then(() => {
        const slots = getAvailableTimeSlots(selectedDate);
        setTimeSlots(slots);
      });
    }
  }, [selectedDate, agenda, fetchBookings, getAvailableTimeSlots]);

  const operatingHours = getOperatingHoursForDate(selectedDate);
  const availableSlots = timeSlots.filter(slot => slot.available);
  const unavailableSlots = timeSlots.filter(slot => !slot.available);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Horários Disponíveis</CardTitle>
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
          <CardTitle>Horários Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Selecione uma agenda para ver os horários
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!operatingHours) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Horários Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Não há horários disponíveis para esta data
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Horários Disponíveis
          <Badge variant="outline">
            {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
          </Badge>
        </CardTitle>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>
              Funcionamento: {operatingHours.start} às {operatingHours.end}
            </span>
          </div>
          
          {agenda.max_participants > 1 && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Máximo {agenda.max_participants} participantes por horário</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span>
              Duração: {agenda.duration_minutes}min
              {agenda.buffer_time_minutes > 0 && ` (+${agenda.buffer_time_minutes}min intervalo)`}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {availableSlots.length === 0 && unavailableSlots.length === 0 && (
          <p className="text-muted-foreground text-center py-4">
            Nenhum horário encontrado para esta data
          </p>
        )}
        
        {availableSlots.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3 text-primary">
              Horários Disponíveis ({availableSlots.length})
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {availableSlots.map((slot) => (
                <Button
                  key={slot.time}
                  variant={selectedTime === slot.time ? "default" : "outline"}
                  size="sm"
                  onClick={() => onTimeSelect(slot.time)}
                  className={cn(
                    "h-9 text-xs",
                    selectedTime === slot.time && "ring-2 ring-primary ring-offset-2"
                  )}
                >
                  {slot.time}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {unavailableSlots.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3 text-muted-foreground">
              Horários Ocupados ({unavailableSlots.length})
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {unavailableSlots.map((slot) => (
                <Button
                  key={slot.time}
                  variant="ghost"
                  size="sm"
                  disabled
                  className="h-9 text-xs opacity-50"
                  title={slot.reason}
                >
                  {slot.time}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {selectedTime && (
          <div className="mt-6 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Horário selecionado</p>
                <p className="text-lg font-bold text-primary">{selectedTime}</p>
              </div>
              <Badge variant="secondary">
                {agenda.duration_minutes} min
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}