import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus } from "lucide-react";
import { useAgendaServiceTypes } from "@/hooks/useAgendaServiceTypes";
import { Tag } from "@/types/eventForm";

interface EventFormState {
  tags: Tag[];
  [key: string]: unknown;
}

interface EventFormConstants {
  [key: string]: unknown;
}

interface AttendanceSelectionTabProps {
  state: EventFormState;
  updateState: (updates: Partial<EventFormState>) => void;
  constants: EventFormConstants;
  addTag: () => void;
  removeTag: (id: string) => void;
  onPrevious: () => void;
  selectedAgendaId?: string;
}

export function AttendanceSelectionTab({
  state,
  updateState,
  constants,
  addTag,
  removeTag,
  onPrevious,
  selectedAgendaId,
}: AttendanceSelectionTabProps) {
  const { serviceTypes, loading } = useAgendaServiceTypes(selectedAgendaId);
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="attendanceType">Tipo de Atendimento</Label>
        <Select 
          value={String(state.attendanceType || "")} 
          onValueChange={(value) => updateState({ attendanceType: value })}
        >
          <SelectTrigger id="attendanceType">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {loading ? (
              <SelectItem value="loading" disabled>
                Carregando tipos de atendimento...
              </SelectItem>
            ) : serviceTypes.length > 0 ? (
              serviceTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-types" disabled>
                Nenhum tipo de atendimento disponível
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      
      {state.attendanceType === "presencial" ? (
        <div className="space-y-2">
          <Label htmlFor="location">Local do Atendimento *</Label>
          <Input
            id="location"
            value={String(state.location || "")}
            onChange={(e) => updateState({ location: e.target.value })}
            placeholder="Endereço ou local do atendimento"
            className={(state as any).errors?.location ? "border-destructive" : ""}
          />
          {(state as any).errors?.location && (
            <p className="text-sm text-destructive">{(state as any).errors.location}</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="meetingLink">Link da Reunião *</Label>
          <Input
            id="meetingLink"
            value={String(state.meetingLink || "")}
            onChange={(e) => updateState({ meetingLink: e.target.value })}
            placeholder="https://meet.google.com/abc-def-ghi"
            className={(state as any).errors?.meetingLink ? "border-destructive" : ""}
          />
          {(state as any).errors?.meetingLink && (
            <p className="text-sm text-destructive">{(state as any).errors.meetingLink}</p>
          )}
        </div>
      )}
      
      <div className="space-y-2">
        <Label>Tags Personalizadas</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {(state.tags || []).map((tag: Tag) => (
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
              value={String(state.newTagColor || "#000000")}
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
        <Label htmlFor="eventDescription">Observações (opcional)</Label>
        <Textarea
          id="eventDescription"
          value={state.eventDescription}
          onChange={(e) => updateState({ eventDescription: e.target.value })}
          placeholder="Informações adicionais sobre o evento..."
          className="min-h-[80px]"
        />
      </div>
      
      <div className="flex justify-between items-center pt-2">
        <Button type="button" variant="outline" onClick={onPrevious}>
          Anterior
        </Button>
        
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Pronto para salvar
        </div>
      </div>
    </>
  );
}