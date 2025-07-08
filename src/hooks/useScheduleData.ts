
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { logger } from "@/utils/logger";
import { useScheduleQuery } from "./useScheduleQuery";

export interface ScheduleEvent {
  id: number;
  title: string;
  date: Date;
  time: string;
  clientName: string;
  phone: string;
  service: string;
  status: string;
  notes?: string;
}

export function useScheduleData(hostFilter: string = "all") {
  const [refreshing, setRefreshing] = useState(false);
  
  // Use React Query hook for schedule data
  const { data: events = [], isLoading: loading, refetch } = useScheduleQuery();

  const fetchScheduleData = useCallback(async (showRefreshingState = false) => {
    try {
      if (showRefreshingState) {
        setRefreshing(true);
      }

      logger.debug(`Refetching schedule data for filter: ${hostFilter}`);
      await refetch();

      if (showRefreshingState) {
        toast.success("Dados atualizados", {
          description: `Eventos de agenda carregados com sucesso.`,
        });
      }
    } catch (error) {
      logger.error("Error refetching schedule data:", error);
      toast.error("Erro ao carregar agenda", {
        description: "Ocorreu um erro ao carregar os eventos da agenda. Tente novamente.",
      });
    } finally {
      setRefreshing(false);
    }
  }, [hostFilter, refetch]);

  const refreshScheduleData = useCallback(async () => {
    logger.debug("Manual refresh of schedule data requested");
    await fetchScheduleData(true);
  }, [fetchScheduleData]);

  return {
    events,
    loading,
    refreshing,
    refetchScheduleData: refreshScheduleData,
  };
}
