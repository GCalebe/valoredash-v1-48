import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { X, Plus } from "lucide-react";

interface BlockedDateFormProps {
  state: any;
  updateState: (updates: any) => void;
  constants: any;
  addTag: () => void;
  removeTag: (id: string) => void;
}

export function BlockedDateForm({
  state,
  updateState,
  constants,
  addTag,
  removeTag,
}: BlockedDateFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="block-startDateTime">Data e Hora de Início *</Label>
        <Input
          id="block-startDateTime"
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
        <Label htmlFor="block-endDateTime">Data e Hora de Término</Label>
        <Input
          id="block-endDateTime"
          type="datetime-local"
          value={state.endDateTime}
          onChange={(e) => updateState({ endDateTime: e.target.value })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="block-reason">Motivo do Bloqueio *</Label>
        <Input
          id="block-reason"
          value={state.blockReason}
          onChange={(e) => updateState({ blockReason: e.target.value })}
          placeholder="Ex: Feriado, Manutenção, etc."
          className={state.errors.blockReason ? "border-destructive" : ""}
        />
        {state.errors.blockReason && (
          <p className="text-sm text-destructive">{state.errors.blockReason}</p>
        )}
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
        <Label>Tags Personalizadas</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {state.tags.map((tag: any) => (
            <Badge 
              key={tag.id} 
              style={{backgroundColor: tag.color}}
              className="text-white flex items-center gap-1"
            >
              {tag.text}
              <button 
                type="button" 
                onClick={() => removeTag(tag.id)}
                className="ml-1 hover:bg-white/20 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Nova tag..."
              value={state.newTag}
              onChange={(e) => updateState({ newTag: e.target.value })}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            />
            <input
              type="color"
              value={state.newTagColor}
              onChange={(e) => updateState({ newTagColor: e.target.value })}
              className="w-10 h-10 rounded border cursor-pointer"
            />
          </div>
          <Button type="button" onClick={addTag} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="block-notes">Observações (opcional)</Label>
        <Textarea
          id="block-notes"
          value={state.eventDescription}
          onChange={(e) => updateState({ eventDescription: e.target.value })}
          placeholder="Observações adicionais sobre o bloqueio..."
          className="min-h-[80px]"
        />
      </div>
    </div>
  );
}