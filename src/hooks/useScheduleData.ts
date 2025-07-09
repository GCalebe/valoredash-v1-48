import { useState } from 'react';

// Mock schedule data hook since the table structure is different
export function useScheduleData() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  return {
    events: [],
    selectedDate,
    setSelectedDate,
    isLoading: false,
    refetch: () => {},
    getEventsByDate: () => [],
    getEventsInRange: () => [],
  };
}

// Mock type export
export interface ScheduleEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  status?: string;
}

export type { ScheduleEvent };