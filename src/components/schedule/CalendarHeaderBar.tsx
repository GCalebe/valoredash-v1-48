import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { pt } from "date-fns/locale";

interface CalendarHeaderBarProps {
  view: "mes" | "semana" | "dia" | "agenda";
  currentMonth: Date;
  selectedDate: Date;
  goToPrevious: () => void;
  goToNext: () => void;
}

export function CalendarHeaderBar({
  view,
  currentMonth,
  selectedDate,
  goToPrevious,
  goToNext,
}: CalendarHeaderBarProps) {
  const getCalendarTitle = () => {
    switch (view) {
      case "dia":
        return format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: pt });
      case "semana": {
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
        return `Semana de ${format(weekStart, "dd/MM", {
          locale: pt,
        })} a ${format(weekEnd, "dd/MM", { locale: pt })}`;
      }
      case "agenda":
      case "mes":
      default:
        return format(currentMonth, "MMMM 'de' yyyy", { locale: pt });
    }
  };
  const showNavigation =
    view === "mes" || view === "semana" || view === "dia" || view === "agenda";
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        {getCalendarTitle()}
      </h2>
      {showNavigation && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
