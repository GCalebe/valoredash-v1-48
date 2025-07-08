import React from "react";
import { isSameDay, isSameMonth, parseISO } from "date-fns";
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

  // Group events by salesperson to show one dot per salesperson
  const uniqueSalespeople = new Map();
  dayEvents.forEach(event => {
    const hostName = event.hostName || "";
    const attendeeEmail = event.attendees?.[0]?.email || "";
    
    let color = "#6b7280"; // Default gray
    
    // Determine color based on host or attendee
    if (hostName.toLowerCase().includes("joão") || attendeeEmail.toLowerCase().includes("joao")) {
      color = "#4f46e5"; // João - indigo
    } else if (hostName.toLowerCase().includes("maria") || attendeeEmail.toLowerCase().includes("maria")) {
      color = "#10b981"; // Maria - emerald
    } else if (hostName.toLowerCase().includes("pedro") || attendeeEmail.toLowerCase().includes("pedro")) {
      color = "#f59e0b"; // Pedro - amber
    } else if (hostName.toLowerCase().includes("ana") || attendeeEmail.toLowerCase().includes("ana")) {
      color = "#ef4444"; // Ana - red
    } else if (hostName.toLowerCase().includes("arthur") || attendeeEmail.toLowerCase().includes("arthur")) {
      color = "#8b5cf6"; // Arthur - purple
    }
    
    const key = hostName || attendeeEmail;
    if (key && !uniqueSalespeople.has(key)) {
      uniqueSalespeople.set(key, { color });
    }
  });

  return (
    <div
      onClick={() => onDateChange(day)}
      className={`
        relative px-1 pt-1 pb-4 h-full min-h-[90px] cursor-pointer border-l first:border-l-0 border-gray-700
        group transition-colors
        ${isToday ? "bg-blue-900/20" : ""}
        ${isSelected ? "bg-blue-500" : ""}
        ${!isCurrentMonth ? "bg-gray-900/20 text-gray-500" : ""}
        hover:bg-gray-800
      `}
      style={{ minWidth: 0 }}
    >
      <div
        className={`
          flex items-center justify-between z-10 relative
          ${isToday ? "text-blue-400 font-bold" : isSelected ? "text-white font-bold" : ""}
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
      
      {/* Event indicators - colored dots for each salesperson */}
      {uniqueSalespeople.size > 0 && (
        <div className="flex justify-center mt-1 space-x-1">
          {Array.from(uniqueSalespeople.values()).map((person, index) => (
            <div 
              key={index}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: person.color }}
            />
          ))}
        </div>
      )}
      
      {/* Event count indicator */}
      {dayEvents.length > 0 && (
        <div className="flex justify-center mt-1">
          <div className="w-5 h-5 text-xs font-medium text-white bg-green-500 rounded-full flex items-center justify-center">
            {dayEvents.length}
          </div>
        </div>
      )}
    </div>
  );
});