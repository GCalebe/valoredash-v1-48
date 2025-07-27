import React from "react";
import { format, isSameDay, isSameMonth } from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  salesperson: string;
  color: string;
}

interface CalendarDayProps {
  day: Date;
  currentMonth: Date;
  selectedDate: Date;
  events: CalendarEvent[];
  onDateClick: (day: Date) => void;
}

const CalendarDay: React.FC<CalendarDayProps> = ({ 
  day, 
  currentMonth, 
  selectedDate, 
  events,
  onDateClick 
}) => {
  const isSelected = isSameDay(day, selectedDate);
  const isCurrentMonth = isSameMonth(day, currentMonth);
  
  // Group events by salesperson to show one dot per salesperson
  const uniqueSalespeople = events.reduce((acc, event) => {
    if (!acc[event.salesperson]) {
      acc[event.salesperson] = event;
    }
    return acc;
  }, {} as Record<string, CalendarEvent>);
  
  return (
    <div
      className={`
        min-h-[60px] p-1 rounded-md cursor-pointer
        ${isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}
        ${isSelected ? 'bg-blue-500' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}
        ${events.length > 0 && !isSelected ? 'border border-gray-200 dark:border-gray-700' : ''}
        transition-colors
      `}
      onClick={() => onDateClick(day)}
    >
      <div className="text-center py-1">
        {format(day, 'd')}
      </div>
      
      {/* Event indicators */}
      {events.length > 0 && (
        <div className="flex justify-center mt-1 space-x-1">
          {Object.values(uniqueSalespeople).map((event, i) => (
            <div 
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: event.color }}
            />
          ))}
        </div>
      )}
      
      {/* Show number of events if more than 1 */}
      {events.length > 1 && (
        <div className="flex justify-center items-center mt-1">
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
            <span className="text-xs text-white font-medium">{events.length}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarDay;