
import { useMemo } from "react";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ScheduleEvent } from "@/hooks/useScheduleData";

export function useScheduleMetrics(scheduleEvents: ScheduleEvent[]) {
  return useMemo(() => {
    const today = new Date();
    const todayEvents = scheduleEvents.filter(event => 
      event.date.toDateString() === today.toDateString()
    );
    
    const thisWeekStart = startOfWeek(today, { weekStartsOn: 0 });
    const thisWeekEnd = endOfWeek(today, { weekStartsOn: 0 });
    const thisWeekEvents = scheduleEvents.filter(event => 
      isWithinInterval(event.date, { start: thisWeekStart, end: thisWeekEnd })
    );
    
    const thisMonthStart = startOfMonth(today);
    const thisMonthEnd = endOfMonth(today);
    const thisMonthEvents = scheduleEvents.filter(event => 
      isWithinInterval(event.date, { start: thisMonthStart, end: thisMonthEnd })
    );
    
    const confirmedEvents = scheduleEvents.filter(event => 
      event.status === "confirmado"
    );

    return {
      today: todayEvents.length,
      thisWeek: thisWeekEvents.length,
      thisMonth: thisMonthEvents.length,
      confirmed: confirmedEvents.length,
      total: scheduleEvents.length
    };
  }, [scheduleEvents]);
}
