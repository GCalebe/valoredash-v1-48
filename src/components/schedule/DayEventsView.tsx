import React from "react";
import { CalendarEvent } from "@/types/calendar";
import { parseISO, format } from "date-fns";
import { pt } from "date-fns/locale";

interface DayEventsViewProps {
  selectedDate: Date;
  dayEvents: CalendarEvent[];
  onEventClick: (event: CalendarEvent, e: React.MouseEvent) => void;
}

export const DayEventsView = React.memo(function DayEventsView({
  selectedDate,
  dayEvents,
  onEventClick,
}: DayEventsViewProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg min-h-[300px] border border-gray-100 dark:border-gray-700 p-2 flex-1">
      <div className="text-lg font-bold my-2 text-blue-700 dark:text-blue-400">
        {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: pt })}
      </div>
      <div className="space-y-2">
        {dayEvents.map((event) => (
          <div
            key={event.id}
            onClick={(e) => onEventClick(event, e)}
            className={`
              flex items-center px-3 py-2 rounded bg-blue-100
              dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-900/70
              text-blue-800 dark:text-blue-200 shadow-sm cursor-pointer
            `}
            style={{
              maxWidth: "100%",
              overflow: "hidden",
            }}
            title={event.summary}
          >
            <span className="font-bold mr-2">
              {format(parseISO(event.start), "HH:mm")}
            </span>
            <span className="truncate">{event.summary}</span>
          </div>
        ))}
        {dayEvents.length === 0 && (
          <div className="text-gray-400 text-sm px-4 py-5 text-center">
            Nenhum evento para este dia.
          </div>
        )}
      </div>
    </div>
  );
});
