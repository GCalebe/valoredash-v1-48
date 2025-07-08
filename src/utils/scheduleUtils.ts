
import { ScheduleEvent } from "@/hooks/useScheduleData";
import { CalendarEvent } from "@/types/calendar";
import { format } from "date-fns";

export function convertScheduleEventsToCalendarEvents(scheduleEvents: ScheduleEvent[]): CalendarEvent[] {
  return scheduleEvents.map(event => ({
    id: `schedule-${event.id}`,
    summary: event.title,
    start: event.date.toISOString(),
    end: new Date(event.date.getTime() + 60 * 60 * 1000).toISOString(), // 1 hora de duração padrão
    status: event.status === "confirmado" ? "confirmed" : event.status === "pendente" ? "tentative" : "cancelled",
    htmlLink: `#schedule-${event.id}`,
    description: `Cliente: ${event.clientName}\nTelefone: ${event.phone}\nServiço: ${event.service}${event.notes ? `\nObservações: ${event.notes}` : ''}`,
    attendees: [{
      email: `${event.clientName.toLowerCase().replace(/\s+/g, '.')}@cliente.com`,
      responseStatus: event.status === "confirmado" ? "accepted" : event.status === "pendente" ? "needsAction" : "declined"
    }],
    hostName: "Sistema de Agenda"
  }));
}
