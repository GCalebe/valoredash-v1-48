import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { mockClientStats } from "@/mocks/metricsMock";

export function useClientStats() {
  const [stats, setStats] = useState(mockClientStats);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const refetchStats = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Using mock data for client stats...");

      // Ensure all arrays are properly initialized to prevent undefined errors
      const safeStats = {
        ...mockClientStats,
        monthlyGrowth: mockClientStats.monthlyGrowth || [],
        ChatBreeds: mockClientStats.ChatBreeds || [],
        recentClients: mockClientStats.recentClients || [],
      };

      setStats(safeStats);

      console.log("Mock client stats loaded successfully");
    } catch (error) {
      console.error("Error loading client stats:", error);
      toast({
        title: "Erro ao atualizar estatísticas",
        description:
          "Problema ao buscar as estatísticas de clientes. Usando dados de exemplo.",
        variant: "destructive",
      });

      // Even in error case, ensure safe data structure
      const safeStats = {
        ...mockClientStats,
        monthlyGrowth: [],
        ChatBreeds: [],
        recentClients: [],
      };
      setStats(safeStats);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return { stats, loading, refetchStats };
}
