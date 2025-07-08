import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

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
      className={`calendar ${className || ""}`}
    />
  );
}
Calendar.displayName = "Calendar";

// The Calendar component is already exported via the function declaration
