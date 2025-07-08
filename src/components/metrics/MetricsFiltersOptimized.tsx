import React, { useState, useMemo, useCallback } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays, subWeeks, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";

type DateRange = {
  from: Date;
  to: Date;
};

type PeriodOption = {
  label: string;
  value: string;
  getRange: () => DateRange;
};

interface MetricsFiltersOptimizedProps {
  selectedDate?: Date | null;
  selectedDateRange?: DateRange | null;
  selectedPeriod?: string;
  onDateChange?: (date: Date | null) => void;
  onDateRangeChange?: (range: DateRange | null) => void;
  onPeriodChange?: (period: string) => void;
  onApplyFilters?: () => void;
  showPeriodSelector?: boolean;
  showDateRange?: boolean;
}

/**
 * Componente de filtros otimizado com memoização e callbacks otimizados
 * Evita re-renders desnecessários e melhora a performance
 */
const MetricsFiltersOptimized = React.memo<MetricsFiltersOptimizedProps>(({
  selectedDate,
  selectedDateRange,
  selectedPeriod = "today",
  onDateChange,
  onDateRangeChange,
  onPeriodChange,
  onApplyFilters,
  showPeriodSelector = true,
  showDateRange = false,
}) => {
  const [date, setDate] = useState<Date | null>(selectedDate || null);
  const [dateRange, setDateRange] = useState<DateRange | null>(selectedDateRange || null);
  const [period, setPeriod] = useState<string>(selectedPeriod);

  // Memoizar opções de período para evitar recriação
  const periodOptions: PeriodOption[] = useMemo(() => [
    {
      label: "Hoje",
      value: "today",
      getRange: () => ({ from: new Date(), to: new Date() })
    },
    {
      label: "Ontem",
      value: "yesterday",
      getRange: () => {
        const yesterday = subDays(new Date(), 1);
        return { from: yesterday, to: yesterday };
      }
    },
    {
      label: "Últimos 7 dias",
      value: "last7days",
      getRange: () => ({ from: subDays(new Date(), 7), to: new Date() })
    },
    {
      label: "Esta semana",
      value: "thisWeek",
      getRange: () => ({ from: startOfWeek(new Date(), { locale: ptBR }), to: endOfWeek(new Date(), { locale: ptBR }) })
    },
    {
      label: "Semana passada",
      value: "lastWeek",
      getRange: () => {
        const lastWeek = subWeeks(new Date(), 1);
        return { from: startOfWeek(lastWeek, { locale: ptBR }), to: endOfWeek(lastWeek, { locale: ptBR }) };
      }
    },
    {
      label: "Últimos 30 dias",
      value: "last30days",
      getRange: () => ({ from: subDays(new Date(), 30), to: new Date() })
    },
    {
      label: "Este mês",
      value: "thisMonth",
      getRange: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) })
    },
    {
      label: "Mês passado",
      value: "lastMonth",
      getRange: () => {
        const lastMonth = subMonths(new Date(), 1);
        return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
      }
    },
    {
      label: "Personalizado",
      value: "custom",
      getRange: () => ({ from: new Date(), to: new Date() })
    }
  ], []);

  // Callbacks otimizados com useCallback
  const handleDateSelect = useCallback((newDate: Date | null) => {
    setDate(newDate);
    onDateChange?.(newDate);
  }, [onDateChange]);

  const handlePeriodChange = useCallback((newPeriod: string) => {
    setPeriod(newPeriod);
    onPeriodChange?.(newPeriod);
    
    // Se não for personalizado, atualiza automaticamente o range
    if (newPeriod !== "custom") {
      const selectedOption = periodOptions.find(opt => opt.value === newPeriod);
      if (selectedOption) {
        const range = selectedOption.getRange();
        setDateRange(range);
        onDateRangeChange?.(range);
      }
    }
  }, [onPeriodChange, onDateRangeChange, periodOptions]);

  const handleDateRangeSelect = useCallback((newRange: DateRange | null) => {
    setDateRange(newRange);
    onDateRangeChange?.(newRange);
  }, [onDateRangeChange]);

  // Formatação de data range memoizada
  const formatDateRange = useCallback((range: DateRange | null) => {
    if (!range) return "Selecione um período";
    if (range.from.getTime() === range.to.getTime()) {
      return format(range.from, "PPP", { locale: ptBR });
    }
    return `${format(range.from, "dd/MM", { locale: ptBR })} - ${format(range.to, "dd/MM/yyyy", { locale: ptBR })}`;
  }, []);

  // Componentes memoizados
  const PeriodSelector = useMemo(() => {
    if (!showPeriodSelector) return null;

    return (
      <div>
        <label className="text-sm font-medium mb-2 block flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Período de Análise
        </label>
        <Select value={period} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione um período" />
          </SelectTrigger>
          <SelectContent>
            {periodOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }, [showPeriodSelector, period, handlePeriodChange, periodOptions]);

  const DateRangeSelector = useMemo(() => {
    if (!showDateRange) return null;

    return (
      <div>
        <label className="text-sm font-medium mb-2 block">Período Personalizado</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDateRange(dateRange)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange ? { from: dateRange.from, to: dateRange.to } : undefined}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  handleDateRangeSelect({ from: range.from, to: range.to });
                } else if (range?.from) {
                  handleDateRangeSelect({ from: range.from, to: range.from });
                } else {
                  handleDateRangeSelect(null);
                }
              }}
              numberOfMonths={2}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }, [showDateRange, dateRange, formatDateRange, handleDateRangeSelect]);

  const SingleDateSelector = useMemo(() => {
    if (showPeriodSelector || showDateRange) return null;

    return (
      <div>
        <label className="text-sm font-medium mb-2 block">Data</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? (
                format(date, "PPP", { locale: ptBR })
              ) : (
                <span>Selecione uma data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }, [showPeriodSelector, showDateRange, date, handleDateSelect]);

  const CustomRangeSelector = useMemo(() => {
    if (period !== "custom" || !showPeriodSelector) return null;

    return (
      <div>
        <label className="text-sm font-medium mb-2 block">Período Personalizado</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDateRange(dateRange)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange ? { from: dateRange.from, to: dateRange.to } : undefined}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  handleDateRangeSelect({ from: range.from, to: range.to });
                } else if (range?.from) {
                  handleDateRangeSelect({ from: range.from, to: range.from });
                } else {
                  handleDateRangeSelect(null);
                }
              }}
              numberOfMonths={2}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }, [period, showPeriodSelector, dateRange, formatDateRange, handleDateRangeSelect]);

  return (
    <div className="space-y-4">
      {PeriodSelector}
      {DateRangeSelector}
      {SingleDateSelector}
      {CustomRangeSelector}

      {onApplyFilters && (
        <Button onClick={onApplyFilters} className="w-full">
          Aplicar Filtros
        </Button>
      )}
    </div>
  );
});

// Função de comparação personalizada para React.memo
MetricsFiltersOptimized.displayName = 'MetricsFiltersOptimized';

export default MetricsFiltersOptimized;