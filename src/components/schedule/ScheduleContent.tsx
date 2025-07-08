import React, { useState, useCallback, useMemo } from "react";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import { ScheduleEvent } from "@/hooks/useScheduleData";
import { Appointment } from "@/types/calendar";
import { CalendarView } from "./CalendarView";
import { EventsTable } from "./EventsTable";
import { CalendarHeaderBar } from "./CalendarHeaderBar";
import { ScheduleMetricsCards } from "./ScheduleMetricsCards";
import { useCalendarNavigation } from "@/hooks/useCalendarNavigation";
import { useFilteredEvents } from "@/hooks/useFilteredEvents";
import { isSameDay, parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock } from "lucide-react";

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
    calendarViewType,
    searchTerm,
    selectedDate,
    currentMonth
  );

  const handleEventClick = useCallback(
    (event: CalendarEvent) => {
      openEditEventDialog(event);
    },
    [openEditEventDialog],
  );

  // Função para lidar com cliques nos cards de eventos na barra lateral
  const handleEventCardClick = useCallback(
    (eventId: string) => {
      const fullEvent = filteredEvents.find(e => e.id === eventId);
      if (fullEvent) handleEventClick(fullEvent);
    },
    [filteredEvents, handleEventClick],
  );

  // Define salespeople data for the calendar legend
  const salespeople = [
    { id: "joao", name: "João", color: "#4f46e5" },
    { id: "maria", name: "Maria", color: "#10b981" },
    { id: "pedro", name: "Pedro", color: "#f59e0b" },
    { id: "ana", name: "Ana", color: "#ef4444" },
    { id: "arthur", name: "Arthur", color: "#8b5cf6" }
  ];

  // Filter events for the selected date to pass to EventSidebar
  const eventsForSelectedDay = useMemo(() => {
    if (!selectedDate) return [];
    
    return filteredEvents.filter(event => {
      try {
        const eventDate = parseISO(event.start);
        return isSameDay(eventDate, selectedDate);
      } catch {
        return false;
      }
    });
  }, [filteredEvents, selectedDate]);

  // Group events by salesperson
  const eventsBySalesperson = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    
    eventsForSelectedDay.forEach(event => {
      // Determine salesperson based on attendees or hostName
      let salesperson = event.hostName || "Não atribuído";
      let color = "#6b7280"; // Default gray
      
      // Find matching salesperson color
      const matchingSalesperson = salespeople.find(sp => 
        sp.name.toLowerCase() === salesperson.toLowerCase()
      );
      
      if (matchingSalesperson) {
        color = matchingSalesperson.color;
      } else if (event.attendees && event.attendees.length > 0 && event.attendees[0]?.email) {
        // Try to match by email
        const email = event.attendees[0].email.toLowerCase();
        if (email.includes('joao')) {
          salesperson = "João";
          color = "#4f46e5";
        } else if (email.includes('maria')) {
          salesperson = "Maria";
          color = "#10b981";
        } else if (email.includes('pedro')) {
          salesperson = "Pedro";
          color = "#f59e0b";
        } else if (email.includes('ana')) {
          salesperson = "Ana";
          color = "#ef4444";
        } else if (email.includes('arthur')) {
          salesperson = "Arthur";
          color = "#8b5cf6";
        }
      }
      
      if (!grouped[salesperson]) {
        grouped[salesperson] = [];
      }
      
      grouped[salesperson].push({
        id: event.id,
        title: event.summary,
        time: format(parseISO(event.start), 'HH:mm'),
        color
      });
    });
    
    return grouped;
  }, [eventsForSelectedDay, salespeople]);

  return (
    <div className="w-full h-full flex flex-col gap-4 min-h-0">
      <div className="flex-1 w-full flex flex-col min-h-0">
        {calendarViewType !== "lista" ? (
          <div className="bg-[#1e2330] dark:bg-[#1e2330] border-0 rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Calendar View (Left Side) */}
              <div className="flex-1 min-w-0 overflow-hidden">
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
              
              {/* Event Sidebar (Right Side) */}
              <div className="w-full md:w-80 flex-shrink-0 border-t md:border-t-0 md:border-l border-gray-700">
                <div className="bg-gray-800 h-full p-4">
                  <div className="mb-4">
                    <div className="flex items-center mb-1">
                      <Clock className="h-5 w-5 text-purple-400 mr-2" />
                      <h3 className="text-lg font-semibold text-white">
                        {selectedDate && format(selectedDate, 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })}
                      </h3>
                    </div>
                    <p className="text-gray-400 text-sm">
                      {selectedDate && format(selectedDate, 'EEEE', { locale: ptBR })}
                    </p>
                  </div>

                  {Object.keys(eventsBySalesperson).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                        <Calendar className="h-8 w-8 text-gray-500" />
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">Dia livre</h3>
                      <p className="text-gray-400 text-sm text-center">
                        Nenhum Vendedor tem Compromissos para esse dia.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(eventsBySalesperson).map(([salesperson, salespersonEvents]) => (
                        <div key={salesperson} className="space-y-2">
                          <h4 className="text-sm font-medium text-white flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: salespersonEvents[0].color }}
                            />
                            {salesperson}
                          </h4>
                          <div className="space-y-2">
                            {salespersonEvents.map(event => (
                              <div 
                                key={event.id} 
                                className="bg-gray-700 rounded-md p-3 hover:bg-gray-600 cursor-pointer"
                                onClick={() => handleEventCardClick(event.id)}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h5 className="font-medium text-white">{event.title}</h5>
                                    <p className="text-gray-400 text-sm">{event.time}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Calendar Legend (Bottom) */}
            <div className="border-t border-gray-700 p-4">
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
                {salespeople.map(person => (
                  <div key={person.id} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-1"
                      style={{ backgroundColor: person.color }}
                    />
                    <span className="text-gray-400">{person.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#1e2330] dark:bg-[#1e2330] border-0 rounded-xl shadow-sm flex-1 overflow-auto flex flex-col">
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