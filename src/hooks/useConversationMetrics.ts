import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { mockConversationMetrics } from "@/mocks/metricsMock";

interface LeadData {
  id: string;
  name: string;
  lastContact: string;
  status: string;
  value: number;
}

interface FunnelStage {
  name: string;
  value: number;
  percentage: number;
  color?: string;
}

interface ConversionByTime {
  day: string;
  morning: number;
  afternoon: number;
  evening: number;
}

interface LeadsBySource {
  name: string;
  value: number;
  color: string;
}

interface LeadsOverTime {
  month: string;
  clients: number;
  leads: number;
}

interface ConversationMetrics {
  totalConversations: number;
  responseRate: number;
  totalRespondidas: number;
  avgResponseTime: number;
  conversionRate: number;
  avgClosingTime: number;
  avgResponseStartTime: number; // Nova métrica
  conversationData: any[];
  funnelData: FunnelStage[];
  conversionByTimeData: ConversionByTime[];
  leadsAverageByTimeData: ConversionByTime[]; // Nova métrica
  leadsData: LeadData[];
  secondaryResponseRate: number;
  totalSecondaryResponses: number;
  negotiatedValue: number;
  averageNegotiatedValue: number;
  totalNegotiatingValue: number;
  previousPeriodValue: number;
  leadsBySource: LeadsBySource[];
  leadsOverTime: LeadsOverTime[];
  leadsByArrivalFunnel: FunnelStage[];
  isStale: boolean;
}

export function useConversationMetrics(
  dateFilter: string = "week",
  customDate?: Date,
) {
  const [metrics, setMetrics] = useState<ConversationMetrics>({
    ...mockConversationMetrics,
    totalNegotiatingValue: 125000, // Nova métrica
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const refetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Using mock data for conversation metrics...");

      // Ensure all arrays are properly initialized to prevent undefined errors
      const safeMetrics = {
        ...mockConversationMetrics,
        totalNegotiatingValue: 125000, // Valor total sendo negociado
        conversationData: mockConversationMetrics.conversationData || [],
        funnelData: mockConversationMetrics.funnelData || [],
        conversionByTimeData:
          mockConversationMetrics.conversionByTimeData || [],
        leadsAverageByTimeData:
          mockConversationMetrics.leadsAverageByTimeData || [], // Nova métrica
        leadsData: mockConversationMetrics.leadsData || [],
        leadsBySource: mockConversationMetrics.leadsBySource || [],
        leadsOverTime: mockConversationMetrics.leadsOverTime || [],
        leadsByArrivalFunnel:
          mockConversationMetrics.leadsByArrivalFunnel || [],
      };

      setMetrics(safeMetrics);

      console.log("Mock conversation metrics loaded successfully");
    } catch (error) {
      console.error("Error loading conversation metrics:", error);
      toast({
        title: "Erro ao atualizar métricas",
        description:
          "Problema ao buscar as métricas de conversas. Usando dados de exemplo.",
        variant: "destructive",
      });

      // Even in error case, ensure safe data structure
      const safeMetrics = {
        ...mockConversationMetrics,
        totalNegotiatingValue: 125000,
        conversationData: [],
        funnelData: [],
        conversionByTimeData: [],
        leadsAverageByTimeData: [], // Nova métrica
        leadsData: [],
        leadsBySource: [],
        leadsOverTime: [],
        leadsByArrivalFunnel: [],
      };
      setMetrics(safeMetrics);
    } finally {
      setLoading(false);
    }
  }, [toast, dateFilter, customDate]);

  return { metrics, loading, refetchMetrics };
}
