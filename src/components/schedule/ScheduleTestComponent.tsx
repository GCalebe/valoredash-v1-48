import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppointmentDateTimeSelection } from './AppointmentDateTimeSelection';
import { NewAppointmentFlow } from './NewAppointmentFlow';
import { useAgendas } from '@/hooks/useAgendas';
import { EventFormData } from '@/hooks/useCalendarEvents';

export function ScheduleTestComponent() {
  const { agendas, agendasLoading } = useAgendas();
  const [selectedAgendaId, setSelectedAgendaId] = useState<string>('');
  const [showAppointmentSelection, setShowAppointmentSelection] = useState(false);
  const [showNewAppointmentFlow, setShowNewAppointmentFlow] = useState(false);

  const handleFormSubmit = (formData: EventFormData) => {
    console.log('Form submitted:', formData);
    setShowAppointmentSelection(false);
    setShowNewAppointmentFlow(false);
  };

  if (agendasLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showAppointmentSelection) {
    return (
      <AppointmentDateTimeSelection
        selectedAgendaId={selectedAgendaId}
        onBack={() => setShowAppointmentSelection(false)}
        onContinue={() => console.log('Continue clicked')}
        onFormSubmit={handleFormSubmit}
      />
    );
  }

  if (showNewAppointmentFlow) {
    return (
      <NewAppointmentFlow
        selectedAgendaId={selectedAgendaId}
        onBack={() => setShowNewAppointmentFlow(false)}
        onFormSubmit={handleFormSubmit}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Teste dos Componentes de Agendamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Selecionar Agenda:
            </label>
            <Select value={selectedAgendaId} onValueChange={setSelectedAgendaId}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha uma agenda" />
              </SelectTrigger>
              <SelectContent>
                {agendas.map((agenda) => (
                  <SelectItem key={agenda.id} value={agenda.id}>
                    {agenda.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => setShowAppointmentSelection(true)}
              disabled={!selectedAgendaId}
            >
              Testar AppointmentDateTimeSelection
            </Button>
            
            <Button
              onClick={() => setShowNewAppointmentFlow(true)}
              disabled={!selectedAgendaId}
              variant="outline"
            >
              Testar NewAppointmentFlow
            </Button>
          </div>

          {selectedAgendaId && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Agenda Selecionada:</strong> {agendas.find(a => a.id === selectedAgendaId)?.name}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>ID:</strong> {selectedAgendaId}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}