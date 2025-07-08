import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { mockUTMMetrics } from "@/mocks/metricsMock";

export function useUTMTracking(
  selectedCampaign: string = "all",
  selectedDevice: string = "all",
) {
  const [metrics, setMetrics] = useState(mockUTMMetrics);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const refetchUTMData = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Using mock data for UTM tracking...");

      // Use mock data directly
      setMetrics(mockUTMMetrics);

      console.log("Mock UTM metrics loaded successfully");
    } catch (error) {
      console.error("Error loading UTM metrics:", error);
      toast({
        title: "Erro ao atualizar métricas UTM",
        description:
          "Problema ao buscar as métricas UTM. Usando dados de exemplo.",
        variant: "destructive",
      });
      setMetrics(mockUTMMetrics);
    } finally {
      setLoading(false);
    }
  }, [toast, selectedCampaign, selectedDevice]);

  return { metrics, loading, refetchUTMData };
}
