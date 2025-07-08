
import React, { useState, useCallback } from "react";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import { ScheduleEvent } from "@/hooks/useScheduleData";
import { Appointment } from "@/types/calendar";
import { ScheduleFilters } from "./ScheduleFilters";
import { CalendarView } from "./CalendarView";
import { EventsTable } from "./EventsTable";
import { CalendarHeaderBar } from "./CalendarHeaderBar";
import { ScheduleMetricsCards } from "./ScheduleMetricsCards";
import { useCalendarNavigation } from "@/hooks/useCalendarNavigation";
import { useFilteredEvents } from "@/hooks/useFilteredEvents";

interface ScheduleContentProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  events: CalendarEvent[];
  appointments: Appointment[];
  selectedTab: string;
  searchTerm: string;
  isAnyLoading: boolean;
  eventsError: Error | null;
  lastUpdated: Date | null;
  setSearchTerm: (term: string) => void;
  setSelectedTab: (tab: string) => void;
  setIsAddEventDialogOpen: (open: boolean) => void;
  openEditEventDialog: (event: CalendarEvent) => void;
  openDeleteEventDialog: (event: CalendarEvent) => void;
  openEventLink: (url: string) => void;
  onPeriodChange?: (start: Date, end: Date) => void;
  calendarViewType: "mes" | "semana" | "dia" | "agenda";
  setCalendarViewType: (v: "mes" | "semana" | "dia" | "agenda") => void;
  scheduleEvents?: ScheduleEvent[];
  statusFilter?: string;
  hostFilter?: string;
}

export function ScheduleContent({
  selectedDate,
  setSelectedDate,
  events,
  appointments,
  selectedTab,
  searchTerm,
  isAnyLoading,
  eventsError,
  lastUpdated,
  setSearchTerm,
  setSelectedTab,
  setIsAddEventDialogOpen,
  openEditEventDialog,
  openDeleteEventDialog,
  openEventLink,
  onPeriodChange,
  calendarViewType,
  setCalendarViewType,
  scheduleEvents = [],
  statusFilter = "all",
  hostFilter = "all",
}: ScheduleContentProps) {
  const [viewMode, setViewMode] = React.useState<"calendar" | "list">("calendar");
  const [calendarFilter, setCalendarFilter] = useState("all");
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  const { goToPrevious, goToNext } = useCalendarNavigation(
    calendarViewType,
    currentMonth,
    selectedDate,
    setCurrentMonth,
    setSelectedDate
  );

  const filteredEvents = useFilteredEvents(
    events,
    scheduleEvents,
    statusFilter,
    viewMode,
    calendarViewType,
    searchTerm,
    selectedDate,
    currentMonth
  );

  console.log("Schedule events recebidos:", scheduleEvents);
  console.log("Eventos filtrados finais:", filteredEvents);

  const handleEventClick = useCallback(
    (event: CalendarEvent) => {
      openEditEventDialog(event);
    },
    [openEditEventDialog],
  );

  const handleAddEventClick = useCallback(
    () => setIsAddEventDialogOpen(true),
    [setIsAddEventDialogOpen],
  );

  // Para a view "agenda", sempre forçar o modo lista
  const effectiveViewMode = calendarViewType === "agenda" ? "list" : viewMode;

  return (
    <div className="w-full h-[calc(100vh-140px)] bg-white dark:bg-gray-900 flex flex-col gap-4 p-0 m-0 min-h-0">
      <ScheduleMetricsCards scheduleEvents={scheduleEvents} />
      
      <div className="flex-1 w-full flex flex-col min-h-0 px-6">
        {effectiveViewMode === "calendar" ? (
          <div className="bg-white dark:bg-gray-800 border rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col">
            <CalendarView
              selectedDate={selectedDate || new Date()}
              onDateChange={(date) => setSelectedDate(date)}
              events={filteredEvents}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              view={calendarViewType}
              onEventClick={handleEventClick}
              onPeriodChange={onPeriodChange}
              goToPrevious={goToPrevious}
              goToNext={goToNext}
            />
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 border rounded-xl shadow-sm flex-1 overflow-auto flex flex-col">
            <CalendarHeaderBar
              view={calendarViewType}
              currentMonth={currentMonth}
              selectedDate={selectedDate || new Date()}
              goToPrevious={goToPrevious}
              goToNext={goToNext}
            />
            <div className="p-6 flex-1 overflow-auto">
              <EventsTable
                events={filteredEvents}
                isLoading={isAnyLoading}
                onEditEvent={openEditEventDialog}
                onDeleteEvent={openDeleteEventDialog}
                onOpenEventLink={openEventLink}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
