// Mock schedule metrics hook
export function useScheduleMetrics(selectedDate: string) {
  return {
    total: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
    isLoading: false,
  };
}