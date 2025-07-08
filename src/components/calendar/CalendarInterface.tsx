import React, { useState, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, ChevronLeft, ChevronRight, Clock, Loader2 } from "lucide-react";
import { useCalendarEventsByMonth, CalendarEvent } from "@/hooks/useCalendarEventsQuery";

interface Salesperson {
  id: string;
  name: string;
  color: string;
}

// Sample salespeople data for colors
const salespeople: Salesperson[] = [
  { id: "1", name: "João", color: "#4f46e5" },
  { id: "2", name: "Maria", color: "#10b981" },
  { id: "3", name: "Pedro", color: "#f59e0b" },
  { id: "4", name: "Ana", color: "#ef4444" },
  { id: "5", name: "Arthur", color: "#8b5cf6" }
];

const CalendarInterface: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date()); // Current month
  const [selectedDate, setSelectedDate] = useState(new Date()); // Current date
  
  // Buscar eventos do Supabase
  const { data: events = [], isLoading, error } = useCalendarEventsByMonth(currentMonth);

  // Navigation functions
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Get days for the calendar grid
  const getDaysInMonth = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        days.push(day);
        day = addDays(day, 1);
      }
      rows.push(days);
      days = [];
    }

    return rows;
  };

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(day, event.date));
  };

  // Group events by salesperson
  const getEventsBySalesperson = (day: Date) => {
    const dayEvents = getEventsForDay(day);
    const eventsBySalesperson: Record<string, CalendarEvent[]> = {};
    
    dayEvents.forEach(event => {
      if (!eventsBySalesperson[event.salesperson]) {
        eventsBySalesperson[event.salesperson] = [];
      }
      eventsBySalesperson[event.salesperson].push(event);
    });
    
    return eventsBySalesperson;
  };

  // Group events by salesperson for indicators
  const groupEventsBySalesperson = (events: CalendarEvent[]) => {
    return events.reduce((acc, event) => {
      const key = event.contact_name || event.salesperson || 'Sistema';
      acc[key] = event;
      return acc;
    }, {} as Record<string, CalendarEvent>);
  };

  // Render event indicators for a day
  const renderEventIndicators = (events: CalendarEvent[]) => {
    if (events.length === 0) return null;
    
    const groupedEvents = groupEventsBySalesperson(events);
    
    return (
      <div className="flex justify-center mt-1 space-x-1">
        {Object.values(groupedEvents).map((event, i) => (
          <div 
            key={i}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: event.color }}
          />
        ))}
      </div>
    );
  };

  // Render event count badge
  const renderEventCountBadge = (count: number) => {
    if (count <= 1) return null;
    
    return (
      <div className="flex justify-center items-center mt-1">
        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
          <span className="text-xs text-white font-medium">{count}</span>
        </div>
      </div>
    );
  };

  // Render the calendar header with month and navigation
  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Calendar className="h-6 w-6 text-blue-400 mr-2" />
          <div>
            <h2 className="text-lg font-semibold text-white">Calendário</h2>
            <div className="flex items-center text-gray-400 text-xs">
              <span className="flex items-center gap-1">
                <input type="checkbox" className="rounded bg-gray-700 border-gray-600" checked />
                <span>Todos os eventos</span>
              </span>
              {isLoading && <Loader2 className="h-3 w-3 animate-spin ml-2" />}
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <div className="text-right mr-4">
            <div className="text-white font-medium">{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</div>
            <div className="text-gray-400 text-xs">
              {isLoading ? 'Carregando...' : `${events.length} eventos`}
              {error && <span className="text-red-400 ml-1">Erro ao carregar</span>}
            </div>
          </div>
          <button 
            onClick={prevMonth}
            className="p-1 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white"
            disabled={isLoading}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button 
            onClick={nextMonth}
            className="p-1 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white"
            disabled={isLoading}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  };

  // Render the days of the week header
  const renderDays = () => {
    const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
    return (
      <div className="grid grid-cols-7 gap-1 mb-1">
        {days.map(day => (
          <div 
            key={day} 
            className="text-center py-2 text-xs font-semibold text-gray-400"
          >
            {day}
          </div>
        ))}
      </div>
    );
  };

  // Render the cells for each day
  const renderCells = () => {
    const monthDays = getDaysInMonth();
    
    return (
      <div className="grid gap-1">
        {monthDays.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-7 gap-1">
            {row.map((day, dayIndex) => {
              const dayEvents = getEventsForDay(day);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              
              return (
                <div
                  key={dayIndex}
                  className={`
                    min-h-[60px] p-1 rounded-md cursor-pointer
                    ${isCurrentMonth ? 'text-white' : 'text-gray-600'}
                    ${isSelected ? 'bg-blue-500' : 'bg-gray-800 hover:bg-gray-700'}
                    ${dayEvents.length > 0 && !isSelected ? 'border border-gray-700' : ''}
                    transition-colors
                  `}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className="text-center py-1">
                    {format(day, 'd')}
                  </div>
                  
                  {/* Event indicators */}
                  {dayEvents.length > 0 && renderEventIndicators(dayEvents)}
                  
                  {/* Show number of events if more than 1 */}
                  {renderEventCountBadge(dayEvents.length)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  // Render the sidebar with selected date events
  const renderSidebar = () => {
    const dayEvents = getEventsForDay(selectedDate);
    const eventsBySalesperson = getEventsBySalesperson(selectedDate);
    
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="mb-4">
          <div className="flex items-center mb-1">
            <Clock className="h-5 w-5 text-purple-400 mr-2" />
            <h3 className="text-lg font-semibold text-white">
              {format(selectedDate, 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })}
            </h3>
          </div>
          <p className="text-gray-400 text-sm">
            {format(selectedDate, 'EEEE', { locale: ptBR })}
          </p>
        </div>

        {dayEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Dia livre</h3>
            <p className="text-gray-400 text-sm text-center">
              Nenhum corretor tem compromissos agendados para este dia
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
    );
  };

  // Render the color legend
  const renderLegend = () => {
    return (
      <div className="flex items-center justify-center space-x-4 mt-4 text-xs">
        {salespeople.map(person => (
          <div key={person.id} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-1"
              style={{ backgroundColor: person.color }}
            />
            <span className="text-gray-400">{person.name}</span>
          </div>
        ))}
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full mr-1 bg-blue-500" />
          <span className="text-gray-400">Selecionado</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full mr-1 bg-gray-500" />
          <span className="text-gray-400">Com eventos</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-900 text-white p-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-4">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
            {renderLegend()}
          </div>
          <div className="lg:col-span-1">
            {renderSidebar()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarInterface;