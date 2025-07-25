import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";

export function useDashboardRealtime() {
  const queryClient = useQueryClient();

  // Debounced invalidation functions to prevent excessive cache invalidations
  const { debouncedCallback: debouncedInvalidateClientStats } = useDebouncedCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['client-stats'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
  }, 1000);

  const { debouncedCallback: debouncedInvalidateConversations } = useDebouncedCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['conversation-metrics'] });
  }, 1000);

  const { debouncedCallback: debouncedInvalidateSchedule } = useDebouncedCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['schedule'] });
    queryClient.invalidateQueries({ queryKey: ['client-stats'] });
  }, 1000);

  const { debouncedCallback: debouncedInvalidateServices } = useDebouncedCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['services'] });
    queryClient.invalidateQueries({ queryKey: ['client-stats'] });
  }, 1000);

  const { debouncedCallback: debouncedInvalidateUTM } = useDebouncedCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['utm-metrics'] });
  }, 1000);

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
            // Use debounced invalidation to prevent excessive cache invalidations
            debouncedInvalidateClientStats();
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
            // Use debounced invalidation to prevent excessive cache invalidations
            debouncedInvalidateConversations();
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
            // Use debounced invalidation to prevent excessive cache invalidations
            debouncedInvalidateSchedule();
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
            // Use debounced invalidation to prevent excessive cache invalidations
            debouncedInvalidateServices();
          } catch (error) {
            console.error(
              "Error refreshing stats after services change:",
              error,
            );
          }
        },
      )
      .subscribe();

    // Subscribe to changes in UTM tracking
    const utmSubscription = supabase
      .channel("dashboard_utm_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "utm_tracking",
        },
        async (payload) => {
          console.log("UTM data changed:", payload);
          try {
            // Use debounced invalidation to prevent excessive cache invalidations
            debouncedInvalidateUTM();
          } catch (error) {
            console.error(
              "Error refreshing UTM data after change:",
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
      utmSubscription.unsubscribe();
    };
  }, [queryClient]);
}
