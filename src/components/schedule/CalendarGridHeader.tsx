import React from "react";

export function CalendarGridHeader() {
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return (
    <div className="grid grid-cols-7 gap-0 border-b border-gray-200 dark:border-gray-700 mb-1">
      {weekDays.map((day) => (
        <div
          key={day}
          className="text-xs font-semibold text-gray-700 dark:text-gray-200 text-center uppercase py-2"
        >
          {day}
        </div>
      ))}
    </div>
  );
}
