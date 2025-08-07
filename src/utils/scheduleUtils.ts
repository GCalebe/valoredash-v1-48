
import { ScheduleEvent } from "@/hooks/useScheduleData";
import { CalendarEvent } from "@/types/calendar";
import { format } from "date-fns";

export function convertScheduleEventsToCalendarEvents(scheduleEvents: ScheduleEvent[]): CalendarEvent[] {
  return scheduleEvents.map(event => ({
    id: `schedule-${event.id}`,
    summary: event.title,
    start: event.date ? `${event.date}T${event.start_time?.split('T')[1] || '09:00:00'}` : event.start_time || '',
    end: event.end_time || (event.date ? `${event.date}T${event.start_time?.split('T')[1]?.replace(/(\d{2}):(\d{2}):(\d{2})/, (match, h, m, s) => `${String(Number(h) + 1).padStart(2, '0')}:${m}:${s}`) || '10:00:00'}` : ''),
    status: event.status === "scheduled" ? "confirmed" : event.status === "completed" ? "confirmed" : event.status === "cancelled" ? "cancelled" : "tentative",
    htmlLink: `#schedule-${event.id}`,
    description: `Cliente: ${event.clientName}\nTelefone: ${event.phone || ''}\nServiço: ${event.service || ''}${event.notes ? `\nObservações: ${event.notes}` : ''}`,
    attendees: [{
      email: `${event.clientName?.toLowerCase().replace(/\s+/g, '.') || 'cliente'}@cliente.com`,
      responseStatus: event.status === "scheduled" ? "accepted" : event.status === "completed" ? "accepted" : "declined"
    }],
    hostName: event.host_name || "Sistema de Agenda"
  }));
}
