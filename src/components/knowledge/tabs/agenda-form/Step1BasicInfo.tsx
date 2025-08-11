import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Host } from '@/hooks/useHosts';
import { tooltipTexts, FormField } from '../AgendaTab';
import { LocalAgenda } from '../../agenda/types';

interface Step1BasicInfoProps {
  currentAgenda: Omit<LocalAgenda, 'id'>;
  setCurrentAgenda: React.Dispatch<React.SetStateAction<Omit<LocalAgenda, 'id'>>>;
  hosts: Host[];
  hostsLoading: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

// Interface para armazenar os anfitriões selecionados
interface SelectedHost {
  id: string;
  name: string;
  role: string;
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
      <FormField label="Anfitriões Associados" tooltipText={tooltipTexts.host}>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              {currentAgenda.host ? 
                (Array.isArray(currentAgenda.host) ? 
                  `${currentAgenda.host.length} anfitriões selecionados` : 
                  "1 anfitrião selecionado") : 
                "Selecionar anfitriões"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0">
            <Command>
              <CommandInput placeholder="Buscar anfitriões..." />
              <CommandEmpty>Nenhum anfitrião encontrado.</CommandEmpty>
              <CommandGroup>
                <CommandList>
                  {hostsLoading ? (
                    <div className="p-2 text-sm text-gray-500 text-center">
                      Carregando anfitriões...
                    </div>
                  ) : (
                    hosts.map((host) => (
                      <CommandItem
                        key={host.id}
                        onSelect={() => {
                          const hostId = host.id.toString();
                          const currentHosts = Array.isArray(currentAgenda.host) ? 
                            currentAgenda.host : 
                            currentAgenda.host ? [currentAgenda.host] : [];
                          
                          setCurrentAgenda(prev => ({
                            ...prev,
                            host: currentHosts.includes(hostId)
                              ? currentHosts.filter(id => id !== hostId)
                              : [...currentHosts, hostId]
                          }));
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={
                              Array.isArray(currentAgenda.host) 
                                ? currentAgenda.host.includes(host.id.toString())
                                : currentAgenda.host === host.id.toString()
                            }
                          />
                          <span>{host.name} - {host.role}</span>
                        </div>
                      </CommandItem>
                    ))
                  )}
                  {hosts.length === 0 && !hostsLoading && (
                    <div className="p-2 text-sm text-gray-500 text-center">
                      Nenhum anfitrião encontrado
                    </div>
                  )}
                </CommandList>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </FormField>
      <FormField label="Limite de Inscrições">
        <Input id="maxParticipants" type="number" value={currentAgenda.maxParticipants || ''} onChange={handleInputChange} />
      </FormField>
    </>
  );
};