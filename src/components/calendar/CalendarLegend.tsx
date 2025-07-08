import React from "react";

interface Salesperson {
  id: string;
  name: string;
  color: string;
}

interface CalendarLegendProps {
  salespeople: Salesperson[];
}

const CalendarLegend: React.FC<CalendarLegendProps> = ({ salespeople }) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs">
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

export default CalendarLegend;