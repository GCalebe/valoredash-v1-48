import React from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { tooltipTexts, FormField } from '../AgendaTab';
import { LocalAgenda } from '../../agenda/types';

interface Step2TimeSettingsProps {
  currentAgenda: Omit<LocalAgenda, 'id'>;
  setCurrentAgenda: React.Dispatch<React.SetStateAction<Omit<LocalAgenda, 'id'>>>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const Step2TimeSettings: React.FC<Step2TimeSettingsProps> = ({
  currentAgenda,
  setCurrentAgenda,
  handleInputChange
}) => {
  return (
    <>
      <FormField label="Duração de Cada Sessão (em Minutos)" tooltipText={tooltipTexts.duration}>
        <Select 
          value={currentAgenda.duration.toString()} 
          onValueChange={(value) => setCurrentAgenda(prev => ({ ...prev, duration: Number(value) }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a duração" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 24 }, (_, i) => (i + 1) * 15).map((minutes) => (
              <SelectItem key={minutes} value={minutes.toString()}>
                {minutes} minutos
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <FormField label="Margem de Segurança entre Sessões (em Minutos)" tooltipText={tooltipTexts.breakTime}>
        <Select 
          value={currentAgenda.breakTime.toString()} 
          onValueChange={(value) => setCurrentAgenda(prev => ({ ...prev, breakTime: Number(value) }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o intervalo" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 16 }, (_, i) => i * 15).map((minutes) => (
              <SelectItem key={minutes} value={minutes.toString()}>
                {minutes} minutos
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <FormField label="Espaçamento de Disponibilidade entre Sessões (em Minutos)" tooltipText={tooltipTexts.availabilityInterval}>
        <Select 
          value={currentAgenda.availabilityInterval.toString()} 
          onValueChange={(value) => setCurrentAgenda(prev => ({ ...prev, availabilityInterval: Number(value) }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o incremento" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 16 }, (_, i) => (i + 1) * 15).map((minutes) => (
              <SelectItem key={minutes} value={minutes.toString()}>
                {minutes} minutos
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <FormField label="Antecedência (horas)">
        <Input id="minNotice" type="number" value={currentAgenda.minNotice} onChange={handleInputChange} />
      </FormField>
    </>
  );
};