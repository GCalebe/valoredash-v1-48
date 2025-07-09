// Utility types for backwards compatibility

// Add missing properties to existing interfaces
export interface PricingPlanWithAI {
  ai_products?: string[];
  billing_period: 'monthly' | 'yearly';
}

// Schedule types with missing properties
export interface ScheduleEventExtended {
  id: string;
  title: string;
  date?: string;
  time?: string;
  start_time?: string;
  end_time?: string;
  clientName?: string;
  client_name?: string;
  description?: string;
  status?: string;
}

// UTM Data with all required fields
export interface UTMDataComplete {
  id: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  utm_created_at: string;
  created_at: string;
  device_type?: string;
  fbclid?: string;
  first_seen_at?: string;
  first_utm_campaign?: string;
  first_utm_content?: string;
  first_utm_created_at?: string;
  first_utm_medium?: string;
  [key: string]: any;
}

// Product types with category
export interface ProductWithCategory {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category?: string;
}

// Contact with all required fields
export interface ContactComplete {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  client_name?: string | null;
  status?: string;
  sessionId?: string;
  session_id?: string;
}

// Funnel data with all fields
export interface FunnelDataComplete {
  id: string;
  name: string;
  value: number;
  percentage: number;
  color: string;
}

// Metrics with all required fields
export interface MetricsComplete {
  total_clients?: number;
  total_chats?: number;
  conversion_rate?: number;
  negotiated_value?: number;
  new_clients_this_month?: number;
  response_rate?: number;
  total_campaigns?: number;
  [key: string]: any;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  success: boolean;
  message: string;
  error?: string;
}

// Hook return types with isLoading
export interface QueryHookReturn<T> {
  data?: T;
  isLoading: boolean;
  loading: boolean;
  error?: string | Error;
  refetch: () => void;
}

// Chart data types
export interface LeadsAverageByTimeDataComplete {
  date: string;
  day: number;
  morning: number;
  afternoon: number;
  evening: number;
}

// Client types for compatibility
export interface ClientWithMetrics {
  id: string;
  name: string;
  marketingClients?: number;
  lastVisit?: string;
}