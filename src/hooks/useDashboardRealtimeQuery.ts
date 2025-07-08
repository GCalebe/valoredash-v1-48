import { useEffect, useCallback, useRef } from "react";
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { queryKeys, cacheUtils } from '../lib/queryClient';

interface UseDashboardRealtimeProps {
  refetchScheduleData?: () => Promise<void>;
  debounceMs?: number; // Tempo de debounce em ms (padrão: 1000ms)
}

// Hook para debounce de funções
const useDebounce = (callback: () => void, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(callback, delay);
  }, [callback, delay]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { debouncedCallback, cancel };
};

export function useDashboardRealtimeQuery(props?: UseDashboardRealtimeProps) {
  const queryClient = useQueryClient();
  const debounceMs = props?.debounceMs || 1000;

  // Funções de invalidação otimizadas
  const invalidateClientData = useCallback(() => {
    console.log("Invalidating client data queries");
    queryClient.invalidateQueries({ queryKey: queryKeys.clientStats.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.metrics });
  }, [queryClient]);

  const invalidateConversationData = useCallback(() => {
    console.log("Invalidating conversation data queries");
    queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.conversations.metrics });
    queryClient.invalidateQueries({ queryKey: queryKeys.conversations.latest });
  }, [queryClient]);

  const invalidateScheduleData = useCallback(async () => {
    console.log("Invalidating schedule data queries");
    queryClient.invalidateQueries({ queryKey: queryKeys.schedule?.all || ['schedule'] });
    if (props?.refetchScheduleData) {
      await props.refetchScheduleData();
    }
  }, [queryClient, props?.refetchScheduleData]);

  const invalidateServicesData = useCallback(() => {
    console.log("Invalidating services data queries");
    queryClient.invalidateQueries({ queryKey: queryKeys.services?.all || ['services'] });
    queryClient.invalidateQueries({ queryKey: queryKeys.clientStats.all });
  }, [queryClient]);

  // Debounced callbacks para evitar atualizações excessivas
  const { debouncedCallback: debouncedClientUpdate } = useDebounce(invalidateClientData, debounceMs);
  const { debouncedCallback: debouncedConversationUpdate } = useDebounce(invalidateConversationData, debounceMs);
  const { debouncedCallback: debouncedScheduleUpdate } = useDebounce(invalidateScheduleData, debounceMs);
  const { debouncedCallback: debouncedServicesUpdate } = useDebounce(invalidateServicesData, debounceMs);

  useEffect(() => {
    console.log("Setting up optimized dashboard realtime updates with debounce:", debounceMs + "ms");

    // Subscribe to changes in the clients table
    const clientsSubscription = supabase
      .channel("dashboard_clients_changes_optimized")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "dados_cliente",
        },
        (payload) => {
          console.log("Client data changed (debounced):", payload.eventType);
          debouncedClientUpdate();
          // Para mudanças críticas, também atualizar conversações
          if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
            debouncedConversationUpdate();
          }
        },
      )
      .subscribe();

    // Subscribe to changes in chat histories
    const chatSubscription = supabase
      .channel("dashboard_chat_changes_optimized")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "n8n_chat_histories",
        },
        (payload) => {
          console.log("Chat history changed (debounced):", payload.eventType);
          debouncedConversationUpdate();
        },
      )
      .subscribe();

    // Subscribe to changes in appointments/schedule
    const scheduleSubscription = supabase
      .channel("dashboard_schedule_changes_optimized")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "agendamentos",
        },
        (payload) => {
          console.log("Schedule data changed (debounced):", payload.eventType);
          debouncedScheduleUpdate();
          // Agendamentos podem afetar estatísticas de clientes
          if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
            debouncedClientUpdate();
          }
        },
      )
      .subscribe();

    // Subscribe to changes in services
    const servicesSubscription = supabase
      .channel("dashboard_services_changes_optimized")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "servicos",
        },
        (payload) => {
          console.log("Services data changed (debounced):", payload.eventType);
          debouncedServicesUpdate();
        },
      )
      .subscribe();

    // Subscribe to conversation metrics for real-time updates
    const metricsSubscription = supabase
      .channel("dashboard_metrics_changes_optimized")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversation_metrics",
        },
        (payload) => {
          console.log("Conversation metrics changed (debounced):", payload.eventType);
          debouncedConversationUpdate();
        },
      )
      .subscribe();

    return () => {
      console.log("Cleaning up optimized dashboard realtime subscriptions");
      clientsSubscription.unsubscribe();
      chatSubscription.unsubscribe();
      scheduleSubscription.unsubscribe();
      servicesSubscription.unsubscribe();
      metricsSubscription.unsubscribe();
    };
  }, [debouncedClientUpdate, debouncedConversationUpdate, debouncedScheduleUpdate, debouncedServicesUpdate, debounceMs]);

  // Utilitários para invalidação manual
  const utils = {
    invalidateAll: () => {
      cacheUtils.invalidateAll(queryClient);
    },
    invalidateClientData,
    invalidateConversationData,
    invalidateScheduleData,
    invalidateServicesData,
    prefetchCriticalData: () => {
      // Prefetch dados críticos
      queryClient.prefetchQuery({
        queryKey: queryKeys.clientStats.all,
        staleTime: 30000, // 30 segundos
      });
      queryClient.prefetchQuery({
        queryKey: queryKeys.conversations.latest,
        staleTime: 10000, // 10 segundos
      });
    },
  };

  return utils;
}