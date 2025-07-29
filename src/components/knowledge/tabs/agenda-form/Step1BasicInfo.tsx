import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Host } from '@/hooks/useHosts';
import { LocalAgenda, tooltipTexts, FormField } from '../AgendaTab';

interface Step1BasicInfoProps {
  currentAgenda: Omit<LocalAgenda, 'id'>;
  setCurrentAgenda: React.Dispatch<React.SetStateAction<Omit<LocalAgenda, 'id'>>>;
  hosts: Host[];
  hostsLoading: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const Step1BasicInfo: React.FC<Step1BasicInfoProps> = ({
  currentAgenda,
  setCurrentAgenda,
  hosts,
  hostsLoading,
  handleInputChange
}) => {
  return (
    <>
      <FormField label="Título" tooltipText={tooltipTexts.title}>
        <Input id="title" value={currentAgenda.title} onChange={handleInputChange} />
      </FormField>
      <FormField label="Descrição">
        <Textarea id="description" value={currentAgenda.description} onChange={handleInputChange} />
      </FormField>
      <FormField label="Anfitrião" tooltipText={tooltipTexts.host}>
        <Select 
          value={currentAgenda.host} 
          onValueChange={(value) => setCurrentAgenda(prev => ({ ...prev, host: value }))}
          disabled={hostsLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder={hostsLoading ? "Carregando anfitriões..." : "Selecione um anfitrião"} />
          </SelectTrigger>
          <SelectContent>
            {hosts.map((host) => (
              <SelectItem key={host.id} value={host.name}>
                {host.name} - {host.role}
              </SelectItem>
            ))}
            {hosts.length === 0 && !hostsLoading && (
              <div className="p-2 text-sm text-gray-500 text-center">
                Nenhum anfitrião encontrado
              </div>
            )}
          </SelectContent>
        </Select>
      </FormField>
      <FormField label="Limite de Inscrições">
        <Input id="maxParticipants" type="number" value={currentAgenda.maxParticipants || ''} onChange={handleInputChange} />
      </FormField>
    </>
  );
};