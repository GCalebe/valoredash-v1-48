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
import { Checkbox } from '@/components/ui/checkbox';
import { tooltipTexts, InfoTooltip, FormField } from '../AgendaTab';
import { LocalAgenda } from '../../agenda/types';

interface Step3AvailabilitySettingsProps {
  currentAgenda: Omit<LocalAgenda, 'id'>;
  setCurrentAgenda: React.Dispatch<React.SetStateAction<Omit<LocalAgenda, 'id'>>>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  operatingHours: Record<string, Array<{start: string, end: string}>>;
  availableDates: Record<string, Array<{start: number, end: number}>>;
  addOperatingHour: (day: string) => void;
  removeOperatingHour: (day: string, index: number) => void;
  updateOperatingHour: (day: string, index: number, field: 'start' | 'end', value: string) => void;
  addAvailableDate: (month: string) => void;
  removeAvailableDate: (month: string, index: number) => void;
  updateAvailableDate: (month: string, index: number, field: 'start' | 'end', value: number) => void;
}

export const Step3AvailabilitySettings: React.FC<Step3AvailabilitySettingsProps> = ({
  currentAgenda,
  handleInputChange,
  operatingHours,
  availableDates,
  addOperatingHour,
  removeOperatingHour,
  updateOperatingHour,
  addAvailableDate,
  removeAvailableDate,
  updateAvailableDate
}) => {
  const monthsData = [
    { name: 'Janeiro', days: 31 }, { name: 'Fevereiro', days: 29 }, { name: 'Março', days: 31 },
    { name: 'Abril', days: 30 }, { name: 'Maio', days: 31 }, { name: 'Junho', days: 30 },
    { name: 'Julho', days: 31 }, { name: 'Agosto', days: 31 }, { name: 'Setembro', days: 30 },
    { name: 'Outubro', days: 31 }, { name: 'Novembro', days: 30 }, { name: 'Dezembro', days: 31 }
  ];

  const daysOfWeek = [
    'Domingo', 'Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 
    'Quinta-Feira', 'Sexta-Feira', 'Sábado'
  ];

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Datas Disponíveis</h3>
          <InfoTooltip text={tooltipTexts.availableDates} />
        </div>
        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
          {monthsData.map((month) => (
            <div key={month.name} className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-3 w-28">
                  <Checkbox defaultChecked id={`month-${month.name}`} />
                  <Label htmlFor={`month-${month.name}`} className="text-sm font-medium text-foreground cursor-pointer">{month.name}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-8 h-8 text-primary hover:text-primary/80 hover:bg-primary/10 font-bold"
                    onClick={() => addAvailableDate(month.name)}
                  >
                    +
                  </Button>
                </div>
              </div>
              <div className="ml-32 space-y-2">
                {availableDates[month.name]?.map((dateRange, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select 
                      value={dateRange.start.toString()} 
                      onValueChange={(value) => updateAvailableDate(month.name, index, 'start', parseInt(value))}
                    >
                      <SelectTrigger className="w-16">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: month.days }, (_, i) => i + 1).map((day) => (
                          <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">até</span>
                    <Select 
                      value={dateRange.end.toString()} 
                      onValueChange={(value) => updateAvailableDate(month.name, index, 'end', parseInt(value))}
                    >
                      <SelectTrigger className="w-16">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: month.days }, (_, i) => i + 1).map((day) => (
                          <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {availableDates[month.name].length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-8 h-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                        onClick={() => removeAvailableDate(month.name, index)}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Horários de Funcionamento</h3>
          <InfoTooltip text={tooltipTexts.operatingHours} />
        </div>
        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
          {daysOfWeek.map((day) => (
            <div key={day} className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-3 w-40">
                  <Checkbox defaultChecked id={`day-${day}`} />
                  <Label htmlFor={`day-${day}`} className="text-sm font-medium text-foreground cursor-pointer">{day}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-8 h-8 text-primary hover:text-primary/80 hover:bg-primary/10 font-bold"
                    onClick={() => addOperatingHour(day)}
                  >
                    +
                  </Button>
                </div>
              </div>
              <div className="ml-40 space-y-2">
                {operatingHours[day]?.map((timeRange, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input 
                      type="time" 
                      value={timeRange.start} 
                      onChange={(e) => updateOperatingHour(day, index, 'start', e.target.value)}
                      className="w-24" 
                    />
                    <span className="text-sm text-muted-foreground">até</span>
                    <Input 
                      type="time" 
                      value={timeRange.end} 
                      onChange={(e) => updateOperatingHour(day, index, 'end', e.target.value)}
                      className="w-24" 
                    />
                    {operatingHours[day].length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-8 h-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                        onClick={() => removeOperatingHour(day, index)}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </>
  );
};