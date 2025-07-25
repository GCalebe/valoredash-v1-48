import React, { useCallback, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  format,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarEvent } from "@/types/calendar";
import { CalendarGridHeader } from "./CalendarGridHeader";
import { CalendarWeek } from "./CalendarWeek";
import { DayEventsView } from "./DayEventsView";
import { CalendarHeaderBar } from "./CalendarHeaderBar";
import { groupEventsByDay } from "@/utils/eventUtils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarViewProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  events: CalendarEvent[];
  currentMonth: Date;
  onMonthChange: (month: Date) => void;
  view: "mes" | "semana" | "dia" | "lista";
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
    const weeks: Date[][] = [];
    
    // For month view, we need to include days from previous/next months to fill the grid
    if (view === "mes") {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
      const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
      
      const allDays = eachDayOfInterval({ start: startDate, end: endDate });
      for (let i = 0; i < allDays.length; i += 7) {
        weeks.push(allDays.slice(i, i + 7));
      }
    } else {
      // For week view, just use the days array
      for (let i = 0; i < daysArr.length; i += 7) {
        weeks.push(daysArr.slice(i, i + 7));
      }
    }
    
    return weeks;
  };

  const weeks = buildWeeks();

  const eventsByDay = useMemo(() => groupEventsByDay(events), [events]);

  const getCalendarTitle = () => {
    switch (view) {
      case "dia":
        return format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
      case "semana": {
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
        return `${format(weekStart, "dd/MM", {
          locale: ptBR,
        })} a ${format(weekEnd, "dd/MM", { locale: ptBR })}`;
      }
      case "lista":
        return "Todos os Agendamentos";
      case "mes":
      default:
        return format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e2330] dark:bg-[#1e2330] border rounded-xl shadow-sm overflow-hidden animate-fade-in text-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">
          {getCalendarTitle()}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPrevious} className="text-white border-gray-600 hover:bg-gray-700">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToNext} className="text-white border-gray-600 hover:bg-gray-700">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

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
        ) : view === "dia" ? (
          <DayEventsView
            selectedDate={selectedDate}
            dayEvents={
              eventsByDay.get(startOfDay(selectedDate).toISOString()) || []
            }
            onEventClick={handleEventClick}
          />
        ) : (
          // Lista de todos os eventos
          <div className="h-full overflow-y-auto p-4">
            <div className="space-y-2">
              {events.length > 0 ? (
                events.map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => handleEventClick(event, e)}
                    className="flex items-center p-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 cursor-pointer"
                  >
                    <div className="w-16 text-center">
                      <div className="text-sm font-medium">
                        {format(new Date(event.start), "dd/MM", { locale: ptBR })}
                      </div>
                      <div className="text-xs text-gray-400">
                        {format(new Date(event.start), "HH:mm")}
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="font-medium">{event.summary}</div>
                      <div className="text-sm text-gray-400">
                        {event.attendees?.[0]?.email || "Sem participante"}
                      </div>
                    </div>
                    <div className="ml-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.status === "confirmed"
                            ? "bg-green-900/30 text-green-300"
                            : event.status === "tentative"
                            ? "bg-yellow-900/30 text-yellow-300"
                            : "bg-red-900/30 text-red-300"
                        }`}
                      >
                        {event.status === "confirmed"
                          ? "Confirmado"
                          : event.status === "tentative"
                          ? "Pendente"
                          : "Cancelado"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  Nenhum evento encontrado
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}