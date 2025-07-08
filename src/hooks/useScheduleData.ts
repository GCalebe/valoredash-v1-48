
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { mockScheduleData } from "@/mocks/scheduleMock";
import { logger } from "@/utils/logger";

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
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchScheduleData = useCallback(async (showRefreshingState = false) => {
    try {
      if (showRefreshingState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      logger.debug(`Fetching mock schedule data for filter: ${hostFilter}`);

      // Simular delay de carregamento para parecer real
      await new Promise(resolve => setTimeout(resolve, 800));

      // Buscar dados mockup baseado no filtro
      const filteredEvents = mockScheduleData[hostFilter] || mockScheduleData.all;
      
      logger.debug(`Found ${filteredEvents.length} mock schedule events for ${hostFilter}`);

      setEvents(filteredEvents);

      if (showRefreshingState) {
        toast.success("Dados atualizados", {
          description: `${filteredEvents.length} eventos de agenda carregados com sucesso.`,
        });
      }
    } catch (error) {
      logger.error("Error fetching mock schedule data:", error);
      toast.error("Erro ao carregar agenda", {
        description: "Ocorreu um erro ao carregar os eventos da agenda. Tente novamente.",
      });
      setEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [hostFilter]);

  const refreshScheduleData = useCallback(async () => {
    logger.debug("Manual refresh of mock schedule data requested");
    await fetchScheduleData(true);
  }, [fetchScheduleData]);

  useEffect(() => {
    logger.debug(`useScheduleData: Initial data fetch for ${hostFilter}`);
    fetchScheduleData();
  }, [fetchScheduleData]);

  return {
    events,
    loading,
    refreshing,
    refetchScheduleData: refreshScheduleData,
  };
}
