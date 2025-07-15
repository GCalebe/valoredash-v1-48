// Filter parameters used when querying Supabase
export interface DateRangeFilter {
  startDate: string;
  endDate: string;
}

export interface ContactFilters {
  status?: "Active" | "Inactive";
  kanbanStage?: string;
  responsibleUser?: string;
  clientSector?: string;
  dateRange?: DateRangeFilter;
}

export interface MetricsFilters {
  dateRange?: DateRangeFilter;
  compareWithPrevious?: boolean;
}
