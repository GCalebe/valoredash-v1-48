import React from "react";
import { CalendarEvent } from "@/types/calendar";
import { DayCell } from "./DayCell";
import { startOfDay } from "date-fns";

interface CalendarWeekProps {
  week: Date[];
  currentMonth: Date;
  selectedDate: Date;
  eventsByDay: Map<string, CalendarEvent[]>;
  onDateChange: (date: Date) => void;
  onEventClick: (event: CalendarEvent, e: React.MouseEvent) => void;
}

export const CalendarWeek = React.memo(function CalendarWeek({
  week,
  currentMonth,
  selectedDate,
  eventsByDay,
  onDateChange,
  onEventClick,
}: CalendarWeekProps) {
  return (
    <div
      className="grid grid-cols-7 border-b last:border-b-0 border-gray-200 dark:border-gray-700 flex-1 min-h-[90px]"
      style={{ minHeight: 0 }}
    >
      {week.map((day) => {
        const dayKey = startOfDay(day).toISOString();
        const dayEvents = eventsByDay.get(dayKey) || [];
        return (
          <DayCell
            key={day.toISOString()}
            day={day}
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            dayEvents={dayEvents}
            onDateChange={onDateChange}
            onEventClick={onEventClick}
          />
        );
      })}
    </div>
  );
});
