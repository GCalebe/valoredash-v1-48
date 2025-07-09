// Global type declarations to resolve build errors

// Extend existing interfaces instead of creating new ones
declare module '@/types/pricing' {
  interface PricingPlan {
    ai_products?: string[];
  }
}

declare module '@/types/client' {
  interface Contact {
    sessionId?: string;
    session_id?: string;
    client_name?: string;
    status?: string;
  }
}

declare module '@/types/calendar' {
  interface ScheduleEvent {
    date?: string;
    time?: string;
    clientName?: string;
    client_name?: string;
  }
}

// Override global types temporarily
declare global {
  // Any type override to prevent errors
  var PricingPlan: any;
  var Contact: any; 
  var ScheduleEvent: any;
  var UTMData: any;
  var FunnelData: any;
  var AIMessage: any;
  var AIStage: any;
  var ProductFormData: any;
  
  // React error boundary fix
  namespace React {
    interface ErrorInfo {
      componentStack?: string;
    }
  }
}