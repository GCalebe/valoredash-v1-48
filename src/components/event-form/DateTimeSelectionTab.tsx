import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { EventFormState } from "@/types/eventForm";

interface Duration {
  label: string;
  value: number;
}

interface DateTimeSelectionTabProps {
  state: EventFormState;
  updateState: (updates: Partial<EventFormState>) => void;
  constants: {
    DURATIONS: Duration[];
    COLORS: string[];
    [key: string]: unknown;
  };
  onNext: () => void;
  onPrevious: () => void;
}

export function DateTimeSelectionTab({
  state,
  updateState,
  constants,
  onNext,
  onPrevious,
}: DateTimeSelectionTabProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="startDateTime">Data e Hora de Início *</Label>
        <Input
          id="startDateTime"
          type="datetime-local"
          value={state.startDateTime}
          onChange={(e) => updateState({ startDateTime: e.target.value })}
          className={state.errors.startDateTime ? "border-destructive" : ""}
        />
        {state.errors.startDateTime && (
          <p className="text-sm text-destructive">{state.errors.startDateTime}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="endDateTime">Data e Hora de Término (calculado automaticamente)</Label>
        <Input
          id="endDateTime"
          type="datetime-local"
          value={state.endDateTime}
          readOnly
          className="bg-gray-100 dark:bg-gray-800"
        />
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
            {constants.DURATIONS.map((duration: Duration) => (
              <SelectItem key={duration.value} value={duration.value.toString()}>
                {duration.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Cor do Evento</Label>
        <div className="flex flex-wrap gap-2">
          {constants.COLORS.map((color: string) => (
            <button
              type="button"
              key={color}
              className={cn(
                "h-8 w-8 rounded-full cursor-pointer transition-transform transform hover:scale-110",
                state.selectedColor === color &&
                  "ring-2 ring-offset-2 ring-primary",
              )}
              style={{ backgroundColor: color }}
              onClick={() => updateState({ selectedColor: color })}
            />
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="initialStatus">Status Inicial</Label>
        <Select 
          value={state.initialStatus} 
          onValueChange={(value) => updateState({ initialStatus: value })}
        >
          <SelectTrigger id="initialStatus">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="confirmado">Confirmado</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
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