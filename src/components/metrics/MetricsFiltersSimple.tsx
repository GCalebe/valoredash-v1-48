import React, { useState, useMemo, useCallback } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays, subWeeks, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import { DateRange, PeriodOption } from "@/types/filters";

interface MetricsFiltersSimpleProps {
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

const MetricsFiltersSimple = React.memo<MetricsFiltersSimpleProps>(({
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

  const handleDateSelect = useCallback((newDate: Date | undefined) => {
    const selectedDate = newDate || null;
    setDate(selectedDate);
    onDateChange?.(selectedDate);
  }, [onDateChange]);

  const handlePeriodChange = useCallback((newPeriod: string) => {
    setPeriod(newPeriod);
    onPeriodChange?.(newPeriod);
    
    if (newPeriod !== "custom") {
      const selectedOption = periodOptions.find(opt => opt.value === newPeriod);
      if (selectedOption) {
        const range = selectedOption.getRange();
        setDateRange(range);
        onDateRangeChange?.(range);
      }
    }
  }, [onPeriodChange, onDateRangeChange, periodOptions]);

  const handleDateRangeSelect = useCallback((selectedRange: any) => {
    let newRange: DateRange | null = null;
    
    if (selectedRange?.from && selectedRange?.to) {
      newRange = { from: selectedRange.from, to: selectedRange.to };
    } else if (selectedRange?.from) {
      newRange = { from: selectedRange.from, to: selectedRange.from };
    }
    
    setDateRange(newRange);
    onDateRangeChange?.(newRange);
  }, [onDateRangeChange]);

  const formatDateRange = useCallback((range: DateRange | null) => {
    if (!range) return "Selecione um período";
    if (range.from.getTime() === range.to.getTime()) {
      return format(range.from, "PPP", { locale: ptBR });
    }
    return `${format(range.from, "dd/MM", { locale: ptBR })} - ${format(range.to, "dd/MM/yyyy", { locale: ptBR })}`;
  }, []);

  return (
    <div className="space-y-4">
      {showPeriodSelector && (
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
      )}

      {showDateRange && (
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
                onSelect={handleDateRangeSelect}
                numberOfMonths={2}
                initialFocus
                locale={ptBR}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      {!showPeriodSelector && !showDateRange && (
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
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      {period === "custom" && showPeriodSelector && (
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
                onSelect={handleDateRangeSelect}
                numberOfMonths={2}
                initialFocus
                locale={ptBR}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      {onApplyFilters && (
        <Button onClick={onApplyFilters} className="w-full">
          Aplicar Filtros
        </Button>
      )}
    </div>
  );
});

MetricsFiltersSimple.displayName = 'MetricsFiltersSimple';

export default MetricsFiltersSimple;