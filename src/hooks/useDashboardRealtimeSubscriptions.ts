import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardSubscriptionsProps {
  debouncedClientUpdate: () => void;
  debouncedConversationUpdate: () => void;
  debouncedScheduleUpdate: () => void;
  debouncedServicesUpdate: () => void;
  debounceMs: number;
}

export const useDashboardRealtimeSubscriptions = ({
  debouncedClientUpdate,
  debouncedConversationUpdate,
  debouncedScheduleUpdate,
  debouncedServicesUpdate,
  debounceMs,
}: DashboardSubscriptionsProps) => {
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
};