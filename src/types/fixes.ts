// Comprehensive type fixes

// Product types
export interface ProductFormData {
  name: string;
  price: number;
  has_promotion: boolean;
  benefits?: string[];
  objections?: string[];
  has_combo?: boolean;
  has_upgrade?: boolean;
  description?: string;
  category?: string;
}

// Funnel data with all required properties
export interface FunnelDataComplete {
  id: string;
  name: string;
  value: number;
  percentage: number;
  color: string;
  created_at?: string;
}

// UTM metrics with all properties
export interface UTMMetricsComplete {
  id: string;
  total_clients: number;
  total_chats: number;
  conversion_rate: number;
  negotiated_value: number;
  new_clients_this_month: number;
  response_rate: number;
  total_campaigns: number;
  [key: string]: any;
}

// API Response with error
export interface ApiResponseWithError {
  data?: any;
  success: boolean;
  message: string;
  error?: string;
}

// Leads and metrics types
export interface LeadsAverageByTimeDataComplete {
  date: string;
  day: number;
  morning: number;
  afternoon: number;
  evening: number;
}

export interface ClientWithMetrics {
  id: string;
  name: string;
  marketingClients: number;
  lastVisit: string;
}

export interface LeadComplete {
  id: string;
  name: string;
  lastContact: string;
  status: string;
  email?: string;
  phone?: string;
}

// Hook return types with proper structure
export interface QueryHookReturnComplete<T> {
  data: T;
  isLoading: boolean;
  loading: boolean;
  error?: string | Error;
  refetch?: () => void;
}

export interface ProductHookReturn {
  products: any[];
  combos?: any[];
  loading: boolean;
  refreshing?: boolean;
  error?: string | null;
  isLoading: boolean;
  data: any[];
  fetchProducts?: () => Promise<void>;
  refreshProducts?: () => Promise<void>;
}