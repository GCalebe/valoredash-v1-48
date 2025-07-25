import React from "react";

interface ScheduleFiltersProps {
  viewMode: "calendar" | "list";
  onViewModeChange: (mode: "calendar" | "list") => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  calendarFilter: string;
  onCalendarFilterChange: (calendar: string) => void;
  hostFilter: string;
  onHostFilterChange: (host: string) => void;
  onAddEvent: () => void;
}

export function ScheduleFilters(props: ScheduleFiltersProps) {
  // Layout vazio (sem filtros/seletores)
  return null;
}
