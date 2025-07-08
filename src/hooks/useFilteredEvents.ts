
import { useMemo, useCallback } from "react";
import { parseISO, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import { ScheduleEvent } from "@/hooks/useScheduleData";
import { convertScheduleEventsToCalendarEvents } from "@/utils/scheduleUtils";

export function useFilteredEvents(
  events: CalendarEvent[],
  scheduleEvents: ScheduleEvent[],
  statusFilter: string,
  viewMode: "calendar" | "list",
  calendarViewType: "mes" | "semana" | "dia" | "agenda",
  searchTerm: string,
  selectedDate: Date | undefined,
  currentMonth: Date
) {
  const getListModeFilterPeriod = useCallback(() => {
    const today = new Date();
    switch (calendarViewType) {
      case "dia":
        if (selectedDate) {
          return {
            start: new Date(
              selectedDate.getFullYear(),
              selectedDate.getMonth(),
              selectedDate.getDate(),
            ),
            end: new Date(
              selectedDate.getFullYear(),
              selectedDate.getMonth(),
              selectedDate.getDate(),
              23,
              59,
              59,
            ),
          };
        }
        return null;
      case "semana":
        const weekStart = startOfWeek(selectedDate || today, {
          weekStartsOn: 0,
        });
        const weekEnd = endOfWeek(selectedDate || today, { weekStartsOn: 0 });
        return { start: weekStart, end: weekEnd };
      case "mes":
      case "agenda":
        return {
          start: startOfMonth(currentMonth),
          end: endOfMonth(currentMonth),
        };
      default:
        return {
          start: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
          ),
          end: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            23,
            59,
            59,
          ),
        };
    }
  }, [calendarViewType, selectedDate, currentMonth]);

  const filteredEvents = useMemo(() => {
    // Converter eventos de agenda para o formato CalendarEvent
    const convertedScheduleEvents = convertScheduleEventsToCalendarEvents(scheduleEvents);
    
    // Combinar eventos do calendário com eventos convertidos da agenda
    const allEvents = [...events, ...convertedScheduleEvents];
    
    console.log("Eventos combinados:", allEvents);
    console.log("Eventos de agenda convertidos:", convertedScheduleEvents);
    
    return allEvents
      .filter((event) => {
        if (!event.start || typeof event.start !== "string") return false;
        if (statusFilter !== "all" && event.status !== statusFilter)
          return false;
        if (viewMode === "list" || calendarViewType === "agenda") {
          try {
            const eventDate = parseISO(event.start);
            if (isNaN(eventDate.getTime())) return false;
            const filterPeriod = getListModeFilterPeriod();
            if (!filterPeriod) return true;
            return isWithinInterval(eventDate, {
              start: filterPeriod.start,
              end: filterPeriod.end,
            });
          } catch {
            return false;
          }
        }
        return true;
      })
      .filter((event) => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
          (event.summary &&
            event.summary.toLowerCase().includes(searchLower)) ||
          (event.description &&
            event.description.toLowerCase().includes(searchLower)) ||
          (event.attendees &&
            event.attendees.some(
              (attendee) =>
                attendee?.email &&
                attendee.email.toLowerCase().includes(searchLower),
            ))
        );
      })
      .sort((a, b) => {
        try {
          const dateA = a.start ? parseISO(a.start) : new Date(0);
          const dateB = b.start ? parseISO(b.start) : new Date(0);
          return dateA.getTime() - dateB.getTime();
        } catch {
          return 0;
        }
      });
  }, [events, scheduleEvents, statusFilter, viewMode, calendarViewType, getListModeFilterPeriod, searchTerm]);

  return filteredEvents;
}
