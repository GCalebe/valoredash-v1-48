// Aggregated statistic types
import type { FunnelData } from "./chat";

export interface ContactStats {
  total: number;
  active: number;
  inactive: number;
  byStage: Record<string, number>;
  bySector: Record<string, number>;
  byResponsibleUser: Record<string, number>;
}

export interface ConversionStats {
  totalConversations: number;
  responseRate: number;
  conversionRate: number;
  averageResponseTime: number;
  funnelData: FunnelData[];
}

export interface CampaignStats {
  totalCampaigns: number;
  totalLeads: number;
  conversionRate: number;
  topCampaigns: Array<{
    name: string;
    leads: number;
    conversions: number;
    value: number;
  }>;
}
