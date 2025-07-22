import React from "react";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import { EventsTable } from "./EventsTable";
import { CalendarHeaderBar } from "./CalendarHeaderBar";
import { useCalendarNavigation } from "@/hooks/useCalendarNavigation";

interface EventListProps {
  events: CalendarEvent[];
  isLoading: boolean;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (event: CalendarEvent) => void;
  onOpenEventLink: (url: string) => void;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

export function EventList({
  events,
  isLoading,
  onEditEvent,
  onDeleteEvent,
  onOpenEventLink,
  currentMonth,
  setCurrentMonth,
  selectedDate,
  setSelectedDate,
}: EventListProps) {
  const { goToPrevious, goToNext } = useCalendarNavigation(
    "lista",
    currentMonth,
    selectedDate,
    setCurrentMonth,
    setSelectedDate,
  );

  return (
    <div className="bg-[#1e2330] dark:bg-[#1e2330] border-0 rounded-xl shadow-sm flex-1 overflow-auto flex flex-col">
      <CalendarHeaderBar
        view="lista"
        currentMonth={currentMonth}
        selectedDate={selectedDate}
        goToPrevious={goToPrevious}
        goToNext={goToNext}
      />
      <div className="p-6 flex-1 overflow-auto">
        <EventsTable
          events={events}
          isLoading={isLoading}
          onEditEvent={onEditEvent}
          onDeleteEvent={onDeleteEvent}
          onOpenEventLink={onOpenEventLink}
        />
      </div>
    </div>
  );
}

export default EventList;