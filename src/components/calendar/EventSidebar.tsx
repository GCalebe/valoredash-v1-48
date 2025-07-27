import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock } from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  salesperson: string;
  color: string;
}

interface EventSidebarProps {
  selectedDate: Date;
  events: CalendarEvent[];
}

const EventSidebar: React.FC<EventSidebarProps> = ({ selectedDate, events }) => {
  // Group events by salesperson
  const eventsBySalesperson: Record<string, CalendarEvent[]> = {};
  
  events.forEach(event => {
    if (!eventsBySalesperson[event.salesperson]) {
      eventsBySalesperson[event.salesperson] = [];
    }
    eventsBySalesperson[event.salesperson].push(event);
  });
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="mb-4">
        <div className="flex items-center mb-1">
          <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {format(selectedDate, 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })}
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {format(selectedDate, 'EEEE', { locale: ptBR })}
        </p>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Dia livre</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm text-center">
            Nenhum corretor tem compromissos agendados para este dia
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(eventsBySalesperson).map(([salesperson, salespersonEvents]) => (
            <div key={salesperson} className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
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
                    className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white">{event.title}</h5>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{event.time}</p>
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

export default EventSidebar;