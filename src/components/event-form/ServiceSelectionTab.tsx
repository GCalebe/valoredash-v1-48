import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ServiceSelectionTabProps {
  state: any;
  updateState: (updates: any) => void;
  constants: any;
  onNext: () => void;
  onPrevious: () => void;
}

export function ServiceSelectionTab({
  state,
  updateState,
  constants,
  onNext,
  onPrevious,
}: ServiceSelectionTabProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="service">Serviço Náutico *</Label>
        <Select 
          value={state.selectedService} 
          onValueChange={(value) => updateState({ selectedService: value })}
        >
          <SelectTrigger id="service" className={state.errors.service ? "border-destructive" : ""}>
            <SelectValue placeholder="Selecione um serviço" />
          </SelectTrigger>
          <SelectContent>
            {constants.SERVICES.map((service: string) => (
              <SelectItem key={service} value={service}>
                {service}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.errors.service && (
          <p className="text-sm text-destructive">{state.errors.service}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="collaborator">Responsável / Atendente *</Label>
        <Select 
          value={state.collaborator} 
          onValueChange={(value) => updateState({ collaborator: value })}
        >
          <SelectTrigger id="collaborator" className={state.errors.collaborator ? "border-destructive" : ""}>
            <SelectValue placeholder="Selecione um responsável" />
          </SelectTrigger>
          <SelectContent>
            {constants.COLLABORATORS.map((collab: string) => (
              <SelectItem key={collab} value={collab}>
                {collab}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.errors.collaborator && (
          <p className="text-sm text-destructive">{state.errors.collaborator}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="duration">Duração</Label>
        <Select 
          value={state.selectedDuration.toString()} 
          onValueChange={(value) => updateState({ selectedDuration: parseInt(value) })}
        >
          <SelectTrigger id="duration">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {constants.DURATIONS.map((duration: any) => (
              <SelectItem key={duration.value} value={duration.value.toString()}>
                {duration.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-between items-center pt-2">
        <Button type="button" variant="outline" onClick={onPrevious}>
          Anterior
        </Button>
        
        <Button type="button" onClick={onNext}>
          Próximo
        </Button>
      </div>
    </>
  );
}