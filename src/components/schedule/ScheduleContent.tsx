import React, { useState, useCallback } from "react";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import { ScheduleEvent } from "@/hooks/useScheduleData";
import { Appointment } from "@/types/calendar";
import { CalendarView } from "./CalendarView";
import { EventList } from "./EventList";
import { EventSidebar } from "./EventSidebar";
import { useCalendarNavigation } from "@/hooks/useCalendarNavigation";
import { useFilteredEvents } from "@/hooks/useFilteredEvents";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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
  onMonthChange?: (month: Date) => void;
  calendarViewType: "mes" | "semana" | "dia" | "lista";
  setCalendarViewType: (v: "mes" | "semana" | "dia" | "lista") => void;
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
  setSearchTerm,
  setSelectedTab,
  setIsAddEventDialogOpen,
  openEditEventDialog,
  openDeleteEventDialog,
  openEventLink,
  onMonthChange,
  calendarViewType,
  setCalendarViewType,
  scheduleEvents = [],
  statusFilter = "all",
  hostFilter = "all",
}: ScheduleContentProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  const { goToPrevious, goToNext } = useCalendarNavigation(
    calendarViewType,
    currentMonth,
    selectedDate,
    setCurrentMonth,
    setSelectedDate,
  );

  const filteredEvents = useFilteredEvents(
    events,
    scheduleEvents,
    statusFilter,
    calendarViewType,
    searchTerm,
    selectedDate,
    currentMonth,
  );

  const handleEventClick = useCallback(
    (event: CalendarEvent) => {
      openEditEventDialog(event);
    },
    [openEditEventDialog],
  );

  return (
    <div className="w-full h-full flex flex-col gap-4 min-h-0">
      <div className="flex-1 w-full flex flex-col min-h-0">
        {calendarViewType !== "lista" ? (
          <div className="bg-[#1e2330] dark:bg-[#1e2330] border-0 rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              <div className="flex-1 min-w-0 overflow-hidden">
                <CalendarView
                  selectedDate={selectedDate || new Date()}
                  onDateChange={(date) => setSelectedDate(date)}
                  events={filteredEvents}
                  currentMonth={currentMonth}
                  onMonthChange={setCurrentMonth}
                  view={calendarViewType}
                  onEventClick={handleEventClick}
                  goToPrevious={goToPrevious}
                  goToNext={goToNext}
                />
              </div>
              <EventSidebar
                selectedDate={selectedDate}
                events={filteredEvents}
                onEventClick={handleEventClick}
              />
            </div>
          </div>
        ) : (
          <EventList
            events={filteredEvents}
            isLoading={isAnyLoading}
            onEditEvent={openEditEventDialog}
            onDeleteEvent={openDeleteEventDialog}
            onOpenEventLink={openEventLink}
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
            selectedDate={selectedDate || new Date()}
            setSelectedDate={setSelectedDate}
          />
        )}
      </div>
    </div>
  );
}
