// Global type declarations for backwards compatibility

// Extend PricingPlan to include ai_products
declare module '@/types/pricing' {
  interface PricingPlan {
    ai_products?: string[];
  }
}

// Extend Contact to include session fields
declare module '@/types/client' {
  interface Contact {
    sessionId?: string;
    session_id?: string;
    client_name?: string;
    status?: string;
  }
}

// Extend Product to include category
declare module '@/types/product' {
  interface Product {
    category?: string;
  }
}

// Extend ScheduleEvent with missing properties
interface ScheduleEvent {
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

// Hook return types
interface QueryResult<T> {
  data?: T;
  isLoading?: boolean;
  loading?: boolean;
  error?: string | Error;
  refetch?: () => void;
}

// API Response type
interface ApiResponse<T> {
  data?: T;
  success: boolean;
  message: string;
  error?: string;
}

// Funnel Data type
interface FunnelData {
  id: string;
  name: string;
  value: number;
  percentage: number;
  color: string;
}

// UTM Data type
interface UTMData {
  id: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  utm_created_at: string;
  created_at: string;
  device_type?: string;
  [key: string]: any;
}

// Global types
declare global {
  interface Window {
    __APP_VERSION__?: string;
  }
}

export {};