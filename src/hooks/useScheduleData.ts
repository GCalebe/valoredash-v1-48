import { useState } from 'react';

// Schedule event interface
export interface ScheduleEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  status?: string;
  date: Date;
  clientName: string;
  phone: string;
  service: string;
  notes?: string;
}

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
    loading: false,
    refreshing: false,
    refetch: () => {},
    refetchScheduleData: () => {},
    getEventsByDate: () => [],
    getEventsInRange: () => [],
  };
}