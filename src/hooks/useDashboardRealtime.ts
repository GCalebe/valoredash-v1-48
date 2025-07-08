import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useClientStats } from "./useClientStats";
import { useConversations } from "./useConversations";

interface UseDashboardRealtimeProps {
  refetchScheduleData?: () => Promise<void>;
}

export function useDashboardRealtime(props?: UseDashboardRealtimeProps) {
  const { fetchConversations } = useConversations();
  const { refetchStats } = useClientStats();

  useEffect(() => {
    console.log("Setting up dashboard-wide realtime updates");

    // Subscribe to changes in the clients table
    const clientsSubscription = supabase
      .channel("dashboard_clients_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "dados_cliente",
        },
        async (payload) => {
          console.log("Client data changed:", payload);
          try {
            await refetchStats();
            await fetchConversations();
          } catch (error) {
            console.error("Error refreshing data after client change:", error);
          }
        },
      )
      .subscribe();

    // Subscribe to changes in chat histories
    const chatSubscription = supabase
      .channel("dashboard_chat_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "n8n_chat_histories",
        },
        async (payload) => {
          console.log("Chat history changed:", payload);
          try {
            await fetchConversations();
          } catch (error) {
            console.error(
              "Error refreshing conversations after chat change:",
              error,
            );
          }
        },
      )
      .subscribe();

    // Subscribe to changes in appointments/schedule
    const scheduleSubscription = supabase
      .channel("dashboard_schedule_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "agendamentos",
        },
        async (payload) => {
          console.log("Schedule data changed:", payload);
          try {
            await refetchStats();
            if (props?.refetchScheduleData) {
              await props.refetchScheduleData();
            }
          } catch (error) {
            console.error(
              "Error refreshing stats after schedule change:",
              error,
            );
          }
        },
      )
      .subscribe();

    // Subscribe to changes in services
    const servicesSubscription = supabase
      .channel("dashboard_services_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "servicos",
        },
        async (payload) => {
          console.log("Services data changed:", payload);
          try {
            await refetchStats();
          } catch (error) {
            console.error(
              "Error refreshing stats after services change:",
              error,
            );
          }
        },
      )
      .subscribe();

    return () => {
      console.log("Cleaning up dashboard realtime subscriptions");
      clientsSubscription.unsubscribe();
      chatSubscription.unsubscribe();
      scheduleSubscription.unsubscribe();
      servicesSubscription.unsubscribe();
    };
  }, [refetchStats, fetchConversations, props?.refetchScheduleData]);
}
