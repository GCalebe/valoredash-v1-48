// Generic API response helpers
export interface SupabaseResponse<T> {
  data: T | null;
  error: unknown;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  page: number;
  totalCount: number;
  totalPages: number;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  refetch: () => void;
}
