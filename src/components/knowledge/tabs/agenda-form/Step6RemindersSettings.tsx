import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { LocalAgenda, FormField } from '../AgendaTab';

interface ReminderType {
  id: number;
  days: number;
  hours: number;
  minutes: number;
  subject: string;
  sendTo: 'inscrito' | 'anfitriao';
  channel: 'whatsapp' | 'email';
}

interface Step6RemindersSettingsProps {
  currentAgenda: Omit<LocalAgenda, 'id'>;
  handleSwitchChange: (checked: boolean) => void;
  reminders: ReminderType[];
  addReminder: () => void;
  removeReminder: (id: number) => void;
  updateReminder: (id: number, field: string, value: any) => void;
}

export const Step6RemindersSettings: React.FC<Step6RemindersSettingsProps> = ({
  currentAgenda,
  handleSwitchChange,
  reminders,
  addReminder,
  removeReminder,
  updateReminder
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Lembretes</h3>
      <div className="p-4 border rounded-lg bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="sendReminders" className="text-base font-semibold text-foreground cursor-pointer">
              Enviar lembretes automáticos
            </Label>
            <p className="text-sm text-muted-foreground">Notifique os participantes antes do evento.</p>
          </div>
          <Switch id="sendReminders" checked={currentAgenda.sendReminders} onCheckedChange={handleSwitchChange} />
        </div>
      </div>
      
      {currentAgenda.sendReminders && (
        <div className="space-y-6 border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-foreground">Configurar Lembretes</h4>
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              onClick={addReminder}
              className="flex items-center gap-2"
            >
              + Adicionar Lembrete
            </Button>
          </div>
          <div className="space-y-4">
            {reminders.map((reminder, index) => (
              <div key={reminder.id} className="border border-border rounded-lg p-6 bg-muted/30">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-medium text-foreground">Lembrete {index + 1}</h5>
                  {reminders.length > 1 && (
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeReminder(reminder.id)}
                      className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                    >
                      ×
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Quando">
                    <div className="flex gap-2 items-center">
                      <div className="flex-1">
                        <Select 
                          value={reminder.days.toString()} 
                          onValueChange={(value) => updateReminder(reminder.id, 'days', Number(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 8 }, (_, i) => (
                              <SelectItem key={i} value={i.toString()}>
                                {i} dia{i !== 1 ? 's' : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        <Select 
                          value={reminder.hours.toString()} 
                          onValueChange={(value) => updateReminder(reminder.id, 'hours', Number(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => (
                              <SelectItem key={i} value={i.toString()}>
                                {i} hora{i !== 1 ? 's' : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        <Select 
                          value={reminder.minutes.toString()} 
                          onValueChange={(value) => updateReminder(reminder.id, 'minutes', Number(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 4 }, (_, i) => i * 15).map((minutes) => (
                              <SelectItem key={minutes} value={minutes.toString()}>
                                {minutes} min
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">antes</span>
                    </div>
                  </FormField>
                  <FormField label="Assunto">
                    <Input 
                      type="text" 
                      value={reminder.subject} 
                      onChange={(e) => updateReminder(reminder.id, 'subject', e.target.value)}
                      className="w-full" 
                    />
                  </FormField>
                  <FormField label="Enviar para">
                    <Select 
                      value={reminder.sendTo} 
                      onValueChange={(value) => updateReminder(reminder.id, 'sendTo', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inscrito">Inscrito</SelectItem>
                        <SelectItem value="anfitriao">Anfitrião</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Canal">
                    <Select 
                      value={reminder.channel} 
                      onValueChange={(value) => updateReminder(reminder.id, 'channel', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};