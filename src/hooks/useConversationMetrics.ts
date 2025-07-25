import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useConversationMetricsQuery, useMetricsByDateRangeQuery } from "./useConversationMetricsQuery";
import { useFunnelByDateRangeQuery } from "./useFunnelDataQuery";
import { useClientStatsQuery, useDashboardMetricsQuery } from "./useClientStatsQuery";

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
  avgResponseStartTime: number; // Nova métrica em minutos
  conversationData: unknown[];
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
  dateFilter: string = "week"
) {
  const [metrics, setMetrics] = useState<ConversationMetrics>({
    totalConversations: 0,
    responseRate: 0,
    totalRespondidas: 0,
    avgResponseTime: 0,
    conversionRate: 0,
    avgClosingTime: 0,
    avgResponseStartTime: 0,
    conversationData: [],
    funnelData: [],
    conversionByTimeData: [],
    leadsAverageByTimeData: [],
    leadsData: [],
    secondaryResponseRate: 0,
    totalSecondaryResponses: 0,
    negotiatedValue: 0,
    averageNegotiatedValue: 0,
    totalNegotiatingValue: 125000,
    previousPeriodValue: 0,
    leadsBySource: [],
    leadsOverTime: [],
    leadsByArrivalFunnel: [],
    isStale: false,
  });
  const { toast } = useToast();
  
  // Calculate date range based on filter
  const endDate = new Date().toISOString().split('T')[0];
  let startDate = new Date();
  
  if (dateFilter === "week") {
    startDate.setDate(startDate.getDate() - 7);
  } else if (dateFilter === "month") {
    startDate.setMonth(startDate.getMonth() - 1);
  } else if (dateFilter === "year") {
    startDate.setFullYear(startDate.getFullYear() - 1);
  }
  
  const startDateStr = startDate.toISOString().split('T')[0];
  
  // React Query hooks
  const { data: conversationMetrics, isLoading: isLoadingConversation } = useMetricsByDateRangeQuery(startDateStr, endDate);
  const { data: dashboardMetrics, isLoading: isLoadingDashboard } = useDashboardMetricsQuery();
  const { stats: latestStats, loading: isLoadingStats } = useClientStatsQuery();
  const { data: funnelData = [], isLoading: isLoadingFunnel } = useFunnelByDateRangeQuery(startDateStr, endDate);
  
  const loading = isLoadingConversation || isLoadingDashboard || isLoadingStats || isLoadingFunnel;

  const refetchMetrics = useCallback(async () => {
    try {
      console.log("Fetching metrics with filter:", dateFilter);

      // Funnel data is already available from React Query hook

      // Transform data to match the expected format
      let transformedMetrics = {
        totalConversations: 0,
        responseRate: 0,
        totalRespondidas: 0,
        avgResponseTime: 0,
        conversionRate: 0,
        avgClosingTime: 0,
        avgResponseStartTime: 0,
        conversationData: [],
        funnelData: [],
        conversionByTimeData: [],
        leadsAverageByTimeData: [],
        leadsData: [],
        secondaryResponseRate: 0,
        totalSecondaryResponses: 0,
        negotiatedValue: 0,
        averageNegotiatedValue: 0,
        totalNegotiatingValue: 0,
        previousPeriodValue: 0,
        leadsBySource: [],
        leadsOverTime: [],
        leadsByArrivalFunnel: [],
        isStale: false,
      };
      
      if (conversationMetrics && conversationMetrics.length > 0) {
        // Use real data from React Query
        const realMetrics = conversationMetrics[0];
        transformedMetrics = {
          ...transformedMetrics,
          totalConversations: realMetrics.total_conversations || 0,
          responseRate: realMetrics.response_rate || 0,
          totalRespondidas: realMetrics.total_respondidas || 0,
          avgResponseTime: realMetrics.avg_response_time || 0,
          conversionRate: realMetrics.conversion_rate || 0,
          avgClosingTime: realMetrics.avg_closing_time || 0,
        };
      }

      // Transform funnel data if available
      if (funnelData && funnelData.length > 0) {
        transformedMetrics.funnelData = funnelData.map((item: unknown) => ({
          name: item.stage_name || item.name,
          value: item.count || item.value || 0,
          percentage: item.percentage || 0,
          color: item.color || '#8884d8'
        }));
      }

      setMetrics({
        ...transformedMetrics,
        totalNegotiatingValue: 125000, // Set default value since field doesn't exist
        isStale: false
      });

      console.log("Metrics fetched successfully from React Query");
    } catch (error) {
      console.error("Error loading conversation metrics:", error);
      toast({
        title: "Erro ao atualizar métricas",
        description:
          "Problema ao buscar as métricas de conversas. Usando dados de exemplo.",
        variant: "destructive",
      });

      // Fallback to empty data in case of error
      const safeMetrics = {
        totalConversations: 0,
        responseRate: 0,
        totalRespondidas: 0,
        avgResponseTime: 0,
        conversionRate: 0,
        avgClosingTime: 0,
        avgResponseStartTime: 0,
        conversationData: [],
        funnelData: [],
        conversionByTimeData: [],
        leadsAverageByTimeData: [],
        leadsData: [],
        secondaryResponseRate: 0,
        totalSecondaryResponses: 0,
        negotiatedValue: 0,
        averageNegotiatedValue: 0,
        totalNegotiatingValue: 125000,
        previousPeriodValue: 0,
        leadsBySource: [],
        leadsOverTime: [],
        leadsByArrivalFunnel: [],
        isStale: true
      };
      setMetrics(safeMetrics);
    }
  }, [toast, dateFilter, conversationMetrics, latestStats, funnelData, startDateStr, endDate]);

  return { metrics, loading, refetchMetrics };
}