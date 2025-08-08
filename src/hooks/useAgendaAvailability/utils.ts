// @ts-nocheck
import { format, addDays } from 'date-fns';

export const toYmd = (date: Date) => format(date, 'yyyy-MM-dd');

export const enumerateDates = (start: Date, end: Date) => {
  const dates: Date[] = [];
  for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
    dates.push(new Date(d));
  }
  return dates;
};


