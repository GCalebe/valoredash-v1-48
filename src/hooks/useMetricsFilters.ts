import { useState, useCallback, useMemo } from 'react';
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from 'date-fns';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface MetricsFilters {
  dateRange: DateRange;
  dataPeriod: string;
  dataSource: string;
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
    dataSource: 'all',
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
      datePeriod: period,
      dateRange: { start, end }
    }));
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

  const updateDataSource = useCallback((source: string) => {
    setFilters(prev => ({
      ...prev,
      dataSource: source
    }));
  }, []);

  // Compute filtered query parameters
  const queryParams = useMemo(() => ({
    start_date: filters.dateRange.start.toISOString(),
    end_date: filters.dateRange.end.toISOString(),
    source: filters.dataSource !== 'all' ? filters.dataSource : undefined,
  }), [filters]);

  const resetFilters = useCallback(() => {
    setFilters({
      dateRange: {
        start: startOfDay(subDays(new Date(), 7)),
        end: endOfDay(new Date())
      },
      dataPeriod: 'last7days',
      dataSource: 'all',
    });
  }, []);

  return {
    filters,
    queryParams,
    updateDatePeriod,
    updateCustomDateRange,
    updateDataSource,
    resetFilters,
  };
};