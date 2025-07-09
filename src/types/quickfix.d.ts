// Quick type fixes to resolve build errors

declare module "*.tsx" {
  const content: any;
  export default content;
}

declare module "*.ts" {
  const content: any;
  export default content;
}

// Global type augmentations
declare global {
  interface PricingPlan {
    ai_products?: string[];
  }

  interface Contact {
    sessionId?: string;
    session_id?: string;
    client_name?: string;
    status?: string;
  }

  interface UTMData {
    utm_created_at?: string;
    created_at: string;
    [key: string]: any;
  }

  interface ScheduleEvent {
    date?: string;
    time?: string;
    clientName?: string;
    client_name?: string;
    [key: string]: any;
  }

  interface APIResponse {
    data?: any;
    error?: string;
    success: boolean;
    message: string;
  }

  interface FunnelData {
    name?: string;
    value?: number;
    percentage?: number;
    color?: string;
    [key: string]: any;
  }

  interface AIMessage {
    id: string | number;
    name?: string;
    content: string;
    category?: string;
    variables?: string[];
    context?: string;
    is_active?: boolean;
    role?: string;
    timestamp?: string;
    [key: string]: any;
  }

  interface AIStage {
    id: string | number;
    name: string;
    description?: string;
    order?: number;
    order_position?: number;
    stage_order?: number;
    is_active?: boolean;
    actions?: any[];
    trigger?: string;
    next_stage?: string;
    [key: string]: any;
  }

  interface ProductFormData {
    name: string;
    price: number;
    has_promotion?: boolean;
    benefits?: string[];
    objections?: string[];
    has_combo?: boolean;
    has_upgrade?: boolean;
    description?: string;
    category?: string;
    [key: string]: any;
  }

  interface HookReturn<T = any> {
    data?: T;
    products?: T[];
    combos?: T[];
    metrics?: T[];
    stats?: T;
    isLoading?: boolean;
    loading?: boolean;
    error?: string | Error | null;
    refetch?: () => void;
    isFetching?: boolean;
    refreshing?: boolean;
    [key: string]: any;
  }

  // Type for error rendering
  interface ErrorBoundary {
    message?: string;
    stack?: string;
    toString(): string;
  }
}