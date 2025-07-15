// Generic API response helpers
export interface SupabaseResponse<T> {
  data: T | null;
  error: any;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
