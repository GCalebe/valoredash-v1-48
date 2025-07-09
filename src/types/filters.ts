// =====================================================
// TIPOS PADRONIZADOS PARA FILTROS
// =====================================================

export interface DateRange {
  from: Date;
  to: Date;
}

export interface MetricsFilterState {
  selectedDate?: Date | null;
  selectedDateRange?: DateRange | null;
  selectedPeriod?: string;
}

export interface PeriodOption {
  label: string;
  value: string;
  getRange: () => DateRange;
}

export interface CalendarProps {
  selected?: Date | DateRange;
  onSelect?: (date: Date | DateRange | undefined) => void;
  mode?: "single" | "range";
  numberOfMonths?: number;
  initialFocus?: boolean;
  locale?: any;
  disabled?: (date: Date) => boolean;
  className?: string;
}

// Tipos para status de eventos
export type ScheduleEventStatus = "scheduled" | "completed" | "cancelled" | "rescheduled";
export type CalendarViewType = "mes" | "semana" | "dia" | "lista";

// Interface padronizada para eventos de agenda
export interface StandardScheduleEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  date: string;
  status: ScheduleEventStatus;
  clientName: string;
  clientPhone?: string;
  location?: string;
  type?: string;
  notes?: string;
}