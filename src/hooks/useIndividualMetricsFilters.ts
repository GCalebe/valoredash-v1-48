import { useState, useCallback, useMemo } from 'react';
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from 'date-fns';

export interface SectionDateRange {
  start: Date;
  end: Date;
}

export interface SectionFilters {
  dateRange: SectionDateRange;
  dataPeriod: string;
  customStartDate?: string;
  customEndDate?: string;
  inheritGlobal: boolean;
}

export const useIndividualMetricsFilters = (sectionId: string, globalFilters?: any) => {
  const [filters, setFilters] = useState<SectionFilters>({
    dateRange: {
      start: startOfDay(subDays(new Date(), 7)),
      end: endOfDay(new Date())
    },
    dataPeriod: 'last7days',
    inheritGlobal: true,
  });

  const updateDatePeriod = useCallback((period: string) => {
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

    setFilters(prev => ({
      ...prev,
      dataPeriod: period,
      dateRange: { start, end },
      inheritGlobal: false,
    }));
  }, []);

  const updateCustomDateRange = useCallback((startDate: string, endDate: string) => {
    if (startDate && endDate) {
      setFilters(prev => ({
        ...prev,
        dataPeriod: 'custom',
        customStartDate: startDate,
        customEndDate: endDate,
        dateRange: {
          start: startOfDay(new Date(startDate)),
          end: endOfDay(new Date(endDate))
        },
        inheritGlobal: false,
      }));
    }
  }, []);

  const toggleInheritGlobal = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      inheritGlobal: !prev.inheritGlobal,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      dateRange: {
        start: startOfDay(subDays(new Date(), 7)),
        end: endOfDay(new Date())
      },
      dataPeriod: 'last7days',
      inheritGlobal: true,
    });
  }, []);

  // Use global filters if inheritGlobal is true
  const effectiveFilters = useMemo(() => {
    if (filters.inheritGlobal && globalFilters) {
      return {
        ...filters,
        dateRange: globalFilters.dateRange,
        dataPeriod: globalFilters.dataPeriod,
        customStartDate: globalFilters.customStartDate,
        customEndDate: globalFilters.customEndDate,
      };
    }
    return filters;
  }, [filters, globalFilters]);

  const queryParams = useMemo(() => ({
    start_date: effectiveFilters.dateRange.start.toISOString(),
    end_date: effectiveFilters.dateRange.end.toISOString(),
  }), [effectiveFilters]);

  return {
    filters: effectiveFilters,
    queryParams,
    updateDatePeriod,
    updateCustomDateRange,
    toggleInheritGlobal,
    resetFilters,
    isInheritingGlobal: filters.inheritGlobal,
  };
};