// Types consumed by React hooks and components
import type { Contact, FunnelData, DashboardMetrics } from "./chat";
import type { MetricsFilters } from "./filters";

export interface UseSupabaseDataReturn {
  contacts: Contact[];
  metrics: DashboardMetrics | null;
  funnelData: FunnelData[];
  loading: boolean;
  error: string | null;
  refetch: (filters?: MetricsFilters) => Promise<void>;
}

export interface ContactFormData {
  name: string;
  email?: string;
  phone?: string;
  clientName?: string;
  clientType?: "pessoa-fisica" | "pessoa-juridica";
  kanbanStage?: string;
  responsibleUser?: string;
  notes?: string;
}
