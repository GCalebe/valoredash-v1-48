import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { ptBR } from "date-fns/locale";

interface CalendarProps {
  selected?: Date | null;
  onSelect?: (date: Date | null) => void;
  className?: string;
}

export function Calendar({ selected, onSelect, className }: CalendarProps) {
  return (
    <DayPicker
      mode="single"
      selected={selected}
      onSelect={onSelect}
      locale={ptBR}
      className={`calendar pointer-events-auto ${className || ""}`}
    />
  );
}
Calendar.displayName = "Calendar";

// The Calendar component is already exported via the function declaration
