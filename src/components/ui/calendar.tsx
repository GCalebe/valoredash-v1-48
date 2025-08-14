import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { ptBR } from "date-fns/locale";

interface CalendarProps {
  readonly selected?: Date | { from?: Date; to?: Date } | null;
  readonly onSelect?: (date: any) => void;
  readonly className?: string;
  readonly mode?: "single" | "range";
}

export function Calendar({ selected, onSelect, className, mode = "single" }: CalendarProps) {
  return (
    <DayPicker
      mode={mode}
      selected={selected}
      onSelect={onSelect}
      locale={ptBR}
      className={`calendar pointer-events-auto ${className || ""}`}
    />
  );
}
Calendar.displayName = "Calendar";

// The Calendar component is already exported via the function declaration
