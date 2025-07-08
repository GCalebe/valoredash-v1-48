
import { useCallback } from "react";

export function useCalendarNavigation(
  calendarViewType: "mes" | "semana" | "dia" | "agenda",
  currentMonth: Date,
  selectedDate: Date | undefined,
  setCurrentMonth: (date: Date) => void,
  setSelectedDate: (date: Date | undefined) => void
) {
  const goToPrevious = useCallback(() => {
    switch (calendarViewType) {
      case "mes": {
        const prevMonth = new Date(currentMonth);
        prevMonth.setMonth(prevMonth.getMonth() - 1);
        setCurrentMonth(prevMonth);
        break;
      }
      case "semana": {
        const prevWeek = new Date(selectedDate || new Date());
        prevWeek.setDate(prevWeek.getDate() - 7);
        setSelectedDate(prevWeek);
        break;
      }
      case "dia": {
        const prevDay = new Date(selectedDate || new Date());
        prevDay.setDate(prevDay.getDate() - 1);
        setSelectedDate(prevDay);
        break;
      }
      case "agenda": {
        const prevMonth = new Date(currentMonth);
        prevMonth.setMonth(prevMonth.getMonth() - 1);
        setCurrentMonth(prevMonth);
        break;
      }
    }
  }, [calendarViewType, currentMonth, selectedDate, setCurrentMonth, setSelectedDate]);

  const goToNext = useCallback(() => {
    switch (calendarViewType) {
      case "mes": {
        const nextMonth = new Date(currentMonth);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        setCurrentMonth(nextMonth);
        break;
      }
      case "semana": {
        const nextWeek = new Date(selectedDate || new Date());
        nextWeek.setDate(nextWeek.getDate() + 7);
        setSelectedDate(nextWeek);
        break;
      }
      case "dia": {
        const nextDay = new Date(selectedDate || new Date());
        nextDay.setDate(nextDay.getDate() + 1);
        setSelectedDate(nextDay);
        break;
      }
      case "agenda": {
        const nextMonth = new Date(currentMonth);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        setCurrentMonth(nextMonth);
        break;
      }
    }
  }, [calendarViewType, currentMonth, selectedDate, setCurrentMonth, setSelectedDate]);

  return { goToPrevious, goToNext };
}
