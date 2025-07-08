import React, { useCallback, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
} from "date-fns";
import { CalendarEvent } from "@/types/calendar";
import { CalendarGridHeader } from "./CalendarGridHeader";
import { CalendarWeek } from "./CalendarWeek";
import { DayEventsView } from "./DayEventsView";
import { CalendarHeaderBar } from "./CalendarHeaderBar";
import { groupEventsByDay } from "@/utils/eventUtils";

interface CalendarViewProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  events: CalendarEvent[];
  currentMonth: Date;
  onMonthChange: (month: Date) => void;
  view: "mes" | "semana" | "dia" | "agenda";
  onEventClick?: (event: CalendarEvent) => void;
  onPeriodChange?: (start: Date, end: Date) => void;
  goToPrevious: () => void;
  goToNext: () => void;
}

export function CalendarView({
  selectedDate,
  onDateChange,
  events,
  currentMonth,
  onMonthChange,
  view,
  onEventClick,
  onPeriodChange,
  goToPrevious,
  goToNext,
}: CalendarViewProps) {
  // Determinar o período de exibição com useMemo para otimização
  const displayPeriod = useMemo(() => {
    switch (view) {
      case "dia":
        return {
          start: startOfDay(selectedDate),
          end: endOfDay(selectedDate),
        };
      case "semana": {
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
        return { start: weekStart, end: weekEnd };
      }
      case "mes":
      default:
        return {
          start: startOfMonth(currentMonth),
          end: endOfMonth(currentMonth),
        };
    }
  }, [view, selectedDate, currentMonth]);

  React.useEffect(() => {
    if (onPeriodChange) {
      onPeriodChange(displayPeriod.start, displayPeriod.end);
    }
  }, [onPeriodChange, displayPeriod.start, displayPeriod.end]);

  const days = eachDayOfInterval({
    start: displayPeriod.start,
    end: displayPeriod.end,
  });

  const handleEventClick = useCallback(
    (event: CalendarEvent, e: React.MouseEvent) => {
      e.stopPropagation();
      if (onEventClick) {
        onEventClick(event);
      }
    },
    [onEventClick],
  );

  const isMonthOrWeekMode = view === "mes" || view === "semana";

  const buildWeeks = () => {
    const daysArr = [...days];
    let weeks: Date[][] = [];
    for (let i = 0; i < daysArr.length; i += 7) {
      weeks.push(daysArr.slice(i, i + 7));
    }
    return weeks;
  };

  const weeks = buildWeeks();

  const eventsByDay = useMemo(() => groupEventsByDay(events), [events]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border rounded-xl shadow-sm overflow-hidden animate-fade-in">
      {/* Header */}
      <CalendarHeaderBar
        view={view}
        currentMonth={currentMonth}
        selectedDate={selectedDate}
        goToPrevious={goToPrevious}
        goToNext={goToNext}
      />
      {/* Grid principal */}
      <div className="px-2 pb-2 pt-3 animate-fade-in flex-1 min-h-0">
        {isMonthOrWeekMode && <CalendarGridHeader />}

        {isMonthOrWeekMode ? (
          <div className="flex flex-col gap-0 h-full min-h-0">
            {weeks.map((week, weekIdx) => (
              <CalendarWeek
                key={weekIdx}
                week={week}
                currentMonth={currentMonth}
                selectedDate={selectedDate}
                eventsByDay={eventsByDay}
                onDateChange={onDateChange}
                onEventClick={handleEventClick}
              />
            ))}
          </div>
        ) : (
          <DayEventsView
            selectedDate={selectedDate}
            dayEvents={
              eventsByDay.get(startOfDay(selectedDate).toISOString()) || []
            }
            onEventClick={handleEventClick}
          />
        )}
      </div>
    </div>
  );
}
