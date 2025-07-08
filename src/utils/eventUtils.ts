import { CalendarEvent } from "@/types/calendar";
import { startOfDay, parseISO } from "date-fns";

export const groupEventsByDay = (
  events: CalendarEvent[],
): Map<string, CalendarEvent[]> => {
  const eventsByDay = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    if (event.start) {
      try {
        const eventDate = parseISO(event.start);
        const dayKey = startOfDay(eventDate).toISOString();
        if (!eventsByDay.has(dayKey)) {
          eventsByDay.set(dayKey, []);
        }
        const dayEvents = eventsByDay.get(dayKey);
        if (dayEvents) {
          dayEvents.push(event);
        }
      } catch (e) {
        // Ignora datas de eventos inválidas para não quebrar a UI
      }
    }
  }
  return eventsByDay;
};
