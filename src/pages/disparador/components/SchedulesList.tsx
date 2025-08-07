// @ts-nocheck
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Trash2 } from "lucide-react";

interface Schedule {
  id: string;
  scheduledDateTime: Date;
  instanceId: string;
  contacts: Array<{ number: string; name?: string }>;
}

interface Instance { id: string; name: string }

interface SchedulesListProps {
  schedules: Schedule[];
  instances: Instance[];
  onCancelSchedule: (id: string) => void;
  timeRemaining: (date: Date) => string;
}

const SchedulesList: React.FC<SchedulesListProps> = ({ schedules, instances, onCancelSchedule, timeRemaining }) => {
  const active = schedules.filter(s => (s as any).status === 'scheduled');
  if (active.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Agendamentos Ativos
          <Badge variant="secondary">{active.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {active.map((schedule) => {
            const instance = instances.find(i => i.id === schedule.instanceId);
            return (
              <Card key={schedule.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold">Agendado para {schedule.scheduledDateTime.toLocaleString('pt-BR')}</h4>
                    <p className="text-sm text-muted-foreground">Instância: {instance?.name || 'Desconhecida'} • {(schedule.contacts || []).length} contatos</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{timeRemaining(schedule.scheduledDateTime)}</Badge>
                    <Button variant="destructive" size="sm" onClick={() => onCancelSchedule(schedule.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SchedulesList;


