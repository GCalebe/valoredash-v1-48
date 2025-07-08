import React from "react";
import { isSameDay, isSameMonth, parseISO, format } from "date-fns";
import { CalendarEvent } from "@/types/calendar";

interface DayCellProps {
  day: Date;
  currentMonth: Date;
  selectedDate: Date;
  dayEvents: CalendarEvent[];
  onDateChange: (date: Date) => void;
  onEventClick: (event: CalendarEvent, e: React.MouseEvent) => void;
}

export const DayCell = React.memo(function DayCell({
  day,
  currentMonth,
  selectedDate,
  dayEvents,
  onDateChange,
  onEventClick,
}: DayCellProps) {
  const isSelected = isSameDay(day, selectedDate);
  const isCurrentMonth = isSameMonth(day, currentMonth);
  const isToday = isSameDay(day, new Date());

  return (
    <div
      key={day.toISOString()}
      onClick={() => onDateChange(day)}
      className={`
        relative px-1 pt-1 pb-4 h-full min-h-[90px] cursor-pointer border-l first:border-l-0 border-gray-100 dark:border-gray-700
        group transition-colors
        ${isToday ? "bg-blue-50 dark:bg-blue-900/20" : ""}
        ${isSelected ? "ring-2 ring-blue-500 z-10" : ""}
        ${
          !isCurrentMonth
            ? "bg-gray-50 dark:bg-gray-900/20 text-gray-400 dark:text-gray-500"
            : ""
        }
        hover:bg-gray-100/60 dark:hover:bg-gray-700
      `}
      style={{ minWidth: 0 }}
    >
      {isToday && (
        <div className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r-full z-20 animate-fade-in"></div>
      )}
      <div
        className={`
          flex items-center justify-between z-10 relative
          ${
            isToday
              ? "text-blue-600 font-bold"
              : isSelected
                ? "text-blue-700 font-bold"
                : ""
          }
          pl-2 pr-1
        `}
      >
        <span
          className={`
            text-xs select-none
            ${isCurrentMonth ? "" : "opacity-50"}
          `}
        >
          {day.getDate()}
        </span>
      </div>
      <div className="flex flex-col gap-1 mt-1">
        {dayEvents.slice(0, 4).map((event) => (
          <div
            key={event.id}
            title={event.summary}
            onClick={(e) => onEventClick(event, e)}
            className={`
              truncate rounded px-2 py-1 text-xs font-medium cursor-pointer
              mb-[2px]
              bg-blue-100 text-blue-900
              dark:bg-blue-800/60 dark:text-white
              border border-blue-200 dark:border-blue-500/30
              hover:bg-blue-300/70 dark:hover:bg-blue-700/90
              transition
              shadow-sm
            `}
            style={{
              maxWidth: "100%",
              width: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {format(parseISO(event.start), "HH:mm")} {event.summary}
          </div>
        ))}
        {dayEvents.length > 4 && (
          <div className="text-[11px] text-gray-400 mt-1 pl-2">
            +{dayEvents.length - 4} mais
          </div>
        )}
      </div>
    </div>
  );
});
