import React, { useMemo } from "react";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import { isSameDay, parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock } from "lucide-react";

interface EventSidebarProps {
  selectedDate: Date | undefined;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

const salespeople = [
  { id: "joao", name: "João", color: "#4f46e5" },
  { id: "maria", name: "Maria", color: "#10b981" },
  { id: "pedro", name: "Pedro", color: "#f59e0b" },
  { id: "ana", name: "Ana", color: "#ef4444" },
  { id: "arthur", name: "Arthur", color: "#8b5cf6" },
];

export function EventSidebar({
  selectedDate,
  events,
  onEventClick,
}: EventSidebarProps) {
  const eventsForSelectedDay = useMemo(() => {
    if (!selectedDate) return [];
    return events.filter((event) => {
      try {
        const eventDate = parseISO(event.start as unknown as string);
        return isSameDay(eventDate, selectedDate);
      } catch {
        return false;
      }
    });
  }, [events, selectedDate]);

  const eventsBySalesperson = useMemo(() => {
    const grouped: Record<string, Array<CalendarEvent & { time: string; color: string }>> = {};
    eventsForSelectedDay.forEach((event) => {
      let salesperson = "Não atribuído";
      let color = "#6b7280";

      const matchingSalesperson = salespeople.find(
        (sp) => sp.name.toLowerCase() === event.hostName?.toLowerCase(),
      );

      if (matchingSalesperson) {
        salesperson = matchingSalesperson.name;
        color = matchingSalesperson.color;
      }

      if (!grouped[salesperson]) {
        grouped[salesperson] = [];
      }
      grouped[salesperson].push({
        ...event,
        time: format(parseISO(event.start as unknown as string), "HH:mm"),
        color,
      });
    });
    return grouped;
  }, [eventsForSelectedDay]);

  const handleEventCardClick = (event: CalendarEvent) => {
    onEventClick(event);
  };

  return (
    <div className="w-full md:w-80 flex-shrink-0 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700">
      <div className="bg-white dark:bg-gray-800 h-full p-4">
        <div className="mb-4">
          <div className="flex items-center mb-1">
            <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedDate &&
                format(selectedDate, "dd 'de' MMMM 'de' yyyy", {
                  locale: ptBR,
                })}
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {selectedDate && format(selectedDate, "EEEE", { locale: ptBR })}
          </p>
        </div>

        {Object.keys(eventsBySalesperson).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Dia livre</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm text-center">
              Nenhum Anfitrião tem Compromissos para esse dia.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(eventsBySalesperson).map(
              ([salesperson, salespersonEvents]) => (
                <div key={salesperson} className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: salespersonEvents[0].color }}
                    />
                    {salesperson}
                  </h4>
                  <div className="space-y-2">
                    {salespersonEvents.map((event) => (
                      <div
                        key={event.id}
                        className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border border-gray-200 dark:border-gray-600"
                        onClick={() => handleEventCardClick(event)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white">
                              {event.title}
                            </h5>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                              {event.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default EventSidebar;
