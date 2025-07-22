import React, { useState, useCallback } from "react";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import { ScheduleEvent } from "@/hooks/useScheduleData";
import { Appointment } from "@/types/calendar";
import { CalendarView } from "./CalendarView";
import { EventList } from "./EventList";
import { EventSidebar } from "./EventSidebar";
import { AgendaSelectionTab } from "./AgendaSelectionTab";
import { AppointmentDateTimeSelection } from "./AppointmentDateTimeSelection";
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
  showAgendaSelection?: boolean;
  selectedAgendaId?: string | null;
  selectedAgendaName?: string | null;
  onAgendaSelect?: (agendaId: string, agendaName: string) => void;
  onProceedWithAgenda?: () => void;
  onBackToAgendaSelection?: () => void;
  showDateTimeSelection?: boolean;
  onBackToAgendaFromDateTime?: () => void;
  onTimeSelect?: (date: Date, time: string) => void;
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
  showAgendaSelection = false,
  selectedAgendaId = null,
  selectedAgendaName = null,
  onAgendaSelect,
  onProceedWithAgenda,
  onBackToAgendaSelection,
  showDateTimeSelection = false,
  onBackToAgendaFromDateTime,
  onTimeSelect,
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

  if (showDateTimeSelection) {
    return (
      <AppointmentDateTimeSelection
        selectedAgendaName={selectedAgendaName || undefined}
        onBack={onBackToAgendaFromDateTime}
        onTimeSelect={onTimeSelect}
      />
    );
  }

  if (showAgendaSelection) {
    return (
      <div className="w-full h-full flex flex-col gap-4 min-h-0">
        <div className="flex items-center gap-4 mb-4">
          {selectedAgendaId && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBackToAgendaSelection}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para seleção
            </Button>
          )}
          {selectedAgendaName && (
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              Agenda selecionada: {selectedAgendaName}
            </div>
          )}
        </div>

        <AgendaSelectionTab
          selectedAgendaId={selectedAgendaId}
          onAgendaSelect={onAgendaSelect}
          onProceed={onProceedWithAgenda}
        />
      </div>
    );
  }

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
