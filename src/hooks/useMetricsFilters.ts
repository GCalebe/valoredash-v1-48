import { useState, useCallback, useMemo, useRef } from 'react';
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from 'date-fns';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface MetricsFilters {
  dateRange: DateRange;
  dataPeriod: string;
  customStartDate?: string;
  customEndDate?: string;
}

export const useMetricsFilters = () => {
  const [filters, setFilters] = useState<MetricsFilters>({
    dateRange: {
      start: startOfDay(subDays(new Date(), 7)),
      end: endOfDay(new Date())
    },
    dataPeriod: 'last7days',
  });

  // Debounce ref para evitar múltiplas chamadas
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const updateDatePeriod = useCallback((period: string) => {
    console.log('🔄 updateDatePeriod chamado com:', period);
    
    // Limpar debounce anterior
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce de 100ms para evitar múltiplas atualizações
    debounceRef.current = setTimeout(() => {
      console.log('✅ Aplicando mudança de período:', period);
      
      const now = new Date();
      let start: Date;
      let end: Date = endOfDay(now);

      switch (period) {
        case 'today':
          start = startOfDay(now);
          break;
        case 'last7days':
          start = startOfDay(subDays(now, 7));
          break;
        case 'last30days':
          start = startOfDay(subDays(now, 30));
          break;
        case 'thisMonth':
          start = startOfMonth(now);
          end = endOfMonth(now);
          break;
        default:
          start = startOfDay(subDays(now, 7));
      }

      setFilters(prev => {
        console.log('📊 Estado anterior:', prev.dataPeriod);
        console.log('📊 Novo estado:', period);
        
        return {
          ...prev,
          dataPeriod: period,
          dateRange: { start, end }
        };
      });
    }, 100);
  }, []);

  const updateCustomDateRange = useCallback((startDate: string, endDate: string) => {
    if (startDate && endDate) {
      setFilters(prev => ({
        ...prev,
        datePeriod: 'custom',
        customStartDate: startDate,
        customEndDate: endDate,
        dateRange: {
          start: startOfDay(new Date(startDate)),
          end: endOfDay(new Date(endDate))
        }
      }));
    }
  }, []);


  // Compute filtered query parameters
  const queryParams = useMemo(() => ({
    start_date: filters.dateRange.start.toISOString(),
    end_date: filters.dateRange.end.toISOString(),
  }), [filters]);

  const resetFilters = useCallback(() => {
    setFilters({
      dateRange: {
        start: startOfDay(subDays(new Date(), 7)),
        end: endOfDay(new Date())
      },
      dataPeriod: 'last7days',
    });
  }, []);

  return {
    filters,
    queryParams,
    updateDatePeriod,
    updateCustomDateRange,
    resetFilters,
  };
};