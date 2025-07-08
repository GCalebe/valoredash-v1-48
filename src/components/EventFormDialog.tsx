import React, { useState, useEffect } from "react";
import { format, parse, parseISO } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { EventFormData, CalendarEvent } from "@/hooks/useCalendarEvents";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: EventFormData) => void;
  isSubmitting: boolean;
  event?: CalendarEvent;
  title: string;
  description: string;
  submitLabel: string;
}

const colors = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#14b8a6",
  "#0ea5e9",
  "#6366f1",
  "#8b5cf6",
  "#d946ef",
  "#ec4899",
  "#78716c",
];

const automations = ["Lembrete por E-mail", "Notificação no App", "Nenhum"];
const collaborators = [
  "João Silva",
  "Maria Oliveira",
  "Pedro Santos",
  "Ana Costa",
];

export function EventFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  event,
  title,
  description,
  submitLabel,
}: EventFormDialogProps) {
  const [summary, setSummary] = useState("");
  const [automation, setAutomation] = useState("");
  const [collaborator, setCollaborator] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [email, setEmail] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (event && open) {
      const start = parseISO(event.start);
      const end = parseISO(event.end);
      setSummary(event.summary || "");
      // Assuming 'automation' and 'color' are not part of the event data yet
      // They will be handled via extensions to the calendar event in the future
      setAutomation("");
      setCollaborator(event.hostName || "");
      setEventDescription(event.description || "");
      setEmail(event.attendees?.find((a) => a?.email)?.email || "");
      setStartDateTime(format(start, "yyyy-MM-dd'T'HH:mm"));
      setEndDateTime(format(end, "yyyy-MM-dd'T'HH:mm"));
      // Color is also not in event data yet.
      setSelectedColor(colors[0]);
    } else if (!open) {
      // Reset form when dialog closes
      setSummary("");
      setAutomation("");
      setCollaborator("");
      setEventDescription("");
      setEmail("");
      setStartDateTime("");
      setEndDateTime("");
      setSelectedColor(colors[0]);
      setErrors({});
    }
  }, [event, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!summary.trim()) newErrors.summary = "O título é obrigatório";
    if (!collaborator) newErrors.collaborator = "O colaborador é obrigatório";
    if (!startDateTime)
      newErrors.startDateTime = "A data de início é obrigatória";
    if (!endDateTime) newErrors.endDateTime = "A data de fim é obrigatória";
    if (startDateTime && endDateTime && startDateTime >= endDateTime) {
      newErrors.endDateTime = "A data de fim deve ser posterior à de início";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const startDate = parse(startDateTime, "yyyy-MM-dd'T'HH:mm", new Date());
      const endDate = parse(endDateTime, "yyyy-MM-dd'T'HH:mm", new Date());

      const formData: EventFormData = {
        summary,
        description: eventDescription,
        email,
        date: startDate,
        startTime: format(startDate, "HH:mm"),
        endTime: format(endDate, "HH:mm"),
        hostName: collaborator,
        automation,
        colorId: selectedColor,
      };
      onSubmit(formData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="summary">Título</Label>
            <Input
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Digite o título do evento"
              className={errors.summary ? "border-destructive" : ""}
            />
            {errors.summary && (
              <p className="text-sm text-destructive">{errors.summary}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="automation">Automação</Label>
              <Select value={automation} onValueChange={setAutomation}>
                <SelectTrigger id="automation">
                  <SelectValue placeholder="Selecione uma automação" />
                </SelectTrigger>
                <SelectContent>
                  {automations.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="collaborator">Colaborador</Label>
              <Select value={collaborator} onValueChange={setCollaborator}>
                <SelectTrigger
                  id="collaborator"
                  className={errors.collaborator ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Selecione um colaborador" />
                </SelectTrigger>
                <SelectContent>
                  {collaborators.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.collaborator && (
                <p className="text-sm text-destructive">
                  {errors.collaborator}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventDescription">Descrição</Label>
            <Textarea
              id="eventDescription"
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              placeholder="Adicione uma descrição para o evento..."
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail do cliente</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@exemplo.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDateTime">Início</Label>
              <Input
                id="startDateTime"
                type="datetime-local"
                value={startDateTime}
                onChange={(e) => setStartDateTime(e.target.value)}
                className={errors.startDateTime ? "border-destructive" : ""}
              />
              {errors.startDateTime && (
                <p className="text-sm text-destructive">
                  {errors.startDateTime}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDateTime">Fim</Label>
              <Input
                id="endDateTime"
                type="datetime-local"
                value={endDateTime}
                onChange={(e) => setEndDateTime(e.target.value)}
                className={errors.endDateTime ? "border-destructive" : ""}
              />
              {errors.endDateTime && (
                <p className="text-sm text-destructive">{errors.endDateTime}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cor do Evento</Label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  type="button"
                  key={color}
                  className={cn(
                    "h-8 w-8 rounded-full cursor-pointer transition-transform transform hover:scale-110",
                    selectedColor === color &&
                      "ring-2 ring-offset-2 ring-primary",
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
