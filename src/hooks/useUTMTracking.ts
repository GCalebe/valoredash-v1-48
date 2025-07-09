import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUTMMetricsQuery, useMetricsByCampaignQuery } from "./useUTMMetricsQuery";

export function useUTMTracking(
  selectedCampaign: string = "all",
  selectedDevice: string = "all",
) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // Use React Query hooks for UTM metrics
  const { data: allMetrics = [], refetch: refetchAllMetrics } = useUTMMetricsQuery();
  const { data: campaignMetrics = [], refetch: refetchCampaignMetrics } = useMetricsByCampaignQuery(
    selectedCampaign !== "all" ? selectedCampaign : undefined
  );
  
  // Calculate metrics based on current data
  const currentMetrics = selectedCampaign !== "all" ? campaignMetrics : allMetrics;
  const totalClicks = currentMetrics.length; // Count of metrics as clicks proxy
  const totalConversions = currentMetrics.filter(metric => metric.utm_conversion === true).length;
  const totalCost = 0; // No cost data in simplified model
  
  const metrics = {
    totalClicks,
    totalConversions,
    totalCost,
    conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
    costPerClick: totalClicks > 0 ? totalCost / totalClicks : 0,
    costPerConversion: totalConversions > 0 ? totalCost / totalConversions : 0,
    campaigns: [],
    devices: [],
    sources: [],
    timeData: [],
  };

  const refetchUTMData = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Refetching UTM metrics...");

      if (selectedCampaign !== "all") {
        await refetchCampaignMetrics();
        console.log("Campaign UTM metrics refetched successfully");
      } else {
        await refetchAllMetrics();
        console.log("All UTM metrics refetched successfully");
      }
    } catch (error) {
      console.error("Error refetching UTM metrics:", error);
      toast({
        title: "Erro ao atualizar métricas UTM",
        description: "Problema ao buscar as métricas UTM. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, selectedCampaign, refetchAllMetrics, refetchCampaignMetrics]);

  return { metrics, loading, refetchUTMData };
}
