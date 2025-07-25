import { useMemo, useCallback } from "react";
import { parseISO, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import { ScheduleEvent } from "@/hooks/useScheduleData";
import { convertScheduleEventsToCalendarEvents } from "@/utils/scheduleUtils";

export function useFilteredEvents(
  events: CalendarEvent[],
  scheduleEvents: ScheduleEvent[],
  statusFilter: string,
  calendarViewType: "mes" | "semana" | "dia" | "lista",
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
      case "semana": {
        const weekStart = startOfWeek(selectedDate || today, {
          weekStartsOn: 0,
        });
        const weekEnd = endOfWeek(selectedDate || today, { weekStartsOn: 0 });
        return { start: weekStart, end: weekEnd };
      }
      case "mes":
        return {
          start: startOfMonth(currentMonth),
          end: endOfMonth(currentMonth),
        };
      case "lista":
        // For "lista" view, don't apply date filtering
        return null;
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
    // Convert schedule events to calendar events
    const convertedScheduleEvents = convertScheduleEventsToCalendarEvents(scheduleEvents);
    
    // Combine events from calendar with events from schedule
    const allEvents = [...events, ...convertedScheduleEvents];
    
    return allEvents
      .filter((event) => {
        if (!event.start || typeof event.start !== "string") return false;
        if (statusFilter !== "all" && event.status !== statusFilter)
          return false;
        
        // Apply date filtering based on calendar view type
        if (calendarViewType === "lista") {
          // For "lista" view, don't apply date filtering
          return true;
        } else {
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
          // For "lista" view, sort by most recent first
          if (calendarViewType === "lista") {
            return dateB.getTime() - dateA.getTime();
          }
          return dateA.getTime() - dateB.getTime();
        } catch {
          return 0;
        }
      });
  }, [events, scheduleEvents, statusFilter, calendarViewType, getListModeFilterPeriod, searchTerm]);

  return filteredEvents;
}