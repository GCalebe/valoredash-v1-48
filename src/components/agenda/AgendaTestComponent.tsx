import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAgendas } from '@/hooks/useAgendas';
import { useAgendaAvailability } from '@/hooks/useAgendaAvailability';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function AgendaTestComponent() {
  const { agendas, agendasLoading } = useAgendas();
  const [selectedAgendaId, setSelectedAgendaId] = useState<string>('');
  const [testDate, setTestDate] = useState(new Date());
  
  const {
    agenda,
    operatingHours,
    availableDates,
    bookings,
    loading,
    getAvailableTimeSlots,
    isDateAvailable,
    fetchBookings
  } = useAgendaAvailability(selectedAgendaId);

  const handleTestBookings = async () => {
    if (selectedAgendaId) {
      await fetchBookings(testDate, addDays(testDate, 1));
    }
  };

  const timeSlots = selectedAgendaId ? getAvailableTimeSlots(testDate) : [];

  if (agendasLoading) {
    return <div>Carregando agendas...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Teste do Sistema de Agendamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seleção de Agenda */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Selecionar Agenda:
            </label>
            <select
              value={selectedAgendaId}
              onChange={(e) => setSelectedAgendaId(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Selecione uma agenda</option>
              {agendas.map((agenda) => (
                <option key={agenda.id} value={agenda.id}>
                  {agenda.name} - {agenda.duration_minutes}min
                  {agenda.buffer_time_minutes > 0 && ` (+${agenda.buffer_time_minutes}min buffer)`}
                </option>
              ))}
            </select>
          </div>

          {/* Data de Teste */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Data de Teste:
            </label>
            <input
              type="date"
              value={format(testDate, 'yyyy-MM-dd')}
              onChange={(e) => setTestDate(new Date(e.target.value))}
              className="p-2 border rounded"
            />
          </div>

          <Button onClick={handleTestBookings} disabled={!selectedAgendaId || loading}>
            Buscar Agendamentos
          </Button>
        </CardContent>
      </Card>

      {/* Informações da Agenda */}
      {agenda && (
        <Card>
          <CardHeader>
            <CardTitle>Informações da Agenda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Nome:</strong> {agenda.name}</p>
            <p><strong>Duração:</strong> {agenda.duration_minutes} minutos</p>
            <p><strong>Buffer:</strong> {agenda.buffer_time_minutes} minutos</p>
            <p><strong>Máx. Participantes:</strong> {agenda.max_participants}</p>
            <p><strong>Preço:</strong> {agenda.price ? `R$ ${agenda.price}` : 'Gratuito'}</p>
          </CardContent>
        </Card>
      )}

      {/* Horários de Funcionamento */}
      {operatingHours.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Horários de Funcionamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {operatingHours.map((hour) => (
                <div key={hour.id} className="flex justify-between">
                  <span>
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][hour.day_of_week]}
                  </span>
                  <span>{hour.start_time} - {hour.end_time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status da Data */}
      {selectedAgendaId && (
        <Card>
          <CardHeader>
            <CardTitle>Status da Data Selecionada</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Data:</strong> {format(testDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
            <p>
              <strong>Disponível:</strong> {isDateAvailable(testDate) ? 'Sim' : 'Não'}
            </p>
            <p>
              <strong>Agendamentos:</strong> {bookings.length}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Slots de Tempo */}
      {timeSlots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Slots de Tempo Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((slot) => (
                <div
                  key={slot.time}
                  className={`p-2 text-center rounded border ${
                    slot.available
                      ? 'bg-green-100 border-green-300 text-green-800'
                      : 'bg-red-100 border-red-300 text-red-800'
                  }`}
                  title={slot.reason}
                >
                  {slot.time}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Info */}
      {selectedAgendaId && (
        <Card>
          <CardHeader>
            <CardTitle>Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify({
                selectedAgendaId,
                operatingHoursCount: operatingHours.length,
                availableDatesCount: availableDates.length,
                bookingsCount: bookings.length,
                timeSlotsCount: timeSlots.length,
                loading
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}