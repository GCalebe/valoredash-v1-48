import * as React from "react";
import type { CalendarEvent, EventFormData } from "@/types/calendar";
import { fetchCalendarEvents } from "./useFetchCalendarEvents";
import { getCacheKey, loadFromCache, saveToCache } from "./calendarCache";
import { useDebouncedCallback } from "./useDebouncedCallback";
import {
  addCalendarEvent,
  editCalendarEvent,
  deleteCalendarEvent,
} from "./calendarEventActions";
import { toast } from "sonner";

type DateRange = { start: Date; end: Date };

export function useCalendarEvents(
  selectedDate?: Date | null,
  dateRange?: DateRange | null,
) {
  const [events, setEvents] = React.useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const lastUpdateRef = React.useRef<number>(0);
  const lastCacheEvents = React.useRef<CalendarEvent[]>([]);

  // Use refs to store the latest values of props for stable callbacks.
  const propsRef = React.useRef({ selectedDate, dateRange });
  React.useEffect(() => {
    propsRef.current = { selectedDate, dateRange };
  }, [selectedDate, dateRange]);

  const fetchFromNetwork = React.useCallback(
    async (isManualRefresh: boolean) => {
      if (isManualRefresh) setIsLoading(true);

      const { selectedDate, dateRange } = propsRef.current;
      const cacheKey = getCacheKey(selectedDate, dateRange);

      try {
        const apiEvents = await fetchCalendarEvents(selectedDate, dateRange);
        setEvents(apiEvents);
        lastCacheEvents.current = apiEvents;
        setLastUpdated(new Date());
        saveToCache(cacheKey, apiEvents);
        setError(null);
        if (isManualRefresh) {
          toast.success("Agenda atualizada com sucesso!");
        }
        lastUpdateRef.current = Date.now();
      } catch (err: any) {
        setError(err instanceof Error ? err : new Error("Erro desconhecido"));
        toast.error("Erro ao buscar eventos. Verifique sua conexão.");
      } finally {
        if (isManualRefresh) setIsLoading(false);
      }
    },
    [],
  );

  const loadData = React.useCallback(() => {
    const { selectedDate, dateRange } = propsRef.current;
    const cacheKey = getCacheKey(selectedDate, dateRange);
    const cached = loadFromCache(cacheKey);

    setIsLoading(true);

    if (cached) {
      setEvents(cached);
      lastCacheEvents.current = cached;
      setLastUpdated(new Date());
      console.log("[useCalendarEvents] Eventos carregados do cache local");
      setIsLoading(false); // Data is loaded, stop loading indicator
      // Fetch fresh data in the background
      fetchFromNetwork(false).then(() => {
        toast.info("Dados da agenda sincronizados em segundo plano.");
      });
    } else {
      // No cache, so fetch and show loading state
      fetchFromNetwork(true);
    }
  }, [fetchFromNetwork]);

  const debouncedLoadData = useDebouncedCallback(loadData, 400);

  React.useEffect(() => {
    debouncedLoadData();
  }, [selectedDate, dateRange, debouncedLoadData]);

  const refreshEventsPost = React.useCallback(() => {
    return fetchFromNetwork(true);
  }, [fetchFromNetwork]);

  React.useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const now = Date.now();
        if (now - lastUpdateRef.current > 2.5 * 60 * 1000) {
          console.log(
            "[useCalendarEvents] Sincronizando agenda ao focar na aba.",
          );
          fetchFromNetwork(false).then(() => {
            toast.info("Agenda sincronizada.");
          });
        }
      }
    };
    window.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      window.removeEventListener("visibilitychange", onVisibilityChange);
  }, [fetchFromNetwork]);

  const addEvent = React.useCallback(
    async (formData: EventFormData) => {
      setIsSubmitting(true);
      const ok = await addCalendarEvent(formData);
      if (ok) await refreshEventsPost();
      setIsSubmitting(false);
      return ok;
    },
    [refreshEventsPost],
  );

  const editEvent = React.useCallback(
    async (eventId: string, formData: EventFormData) => {
      setIsSubmitting(true);
      const ok = await editCalendarEvent(eventId, formData);
      if (ok) await refreshEventsPost();
      setIsSubmitting(false);
      return ok;
    },
    [refreshEventsPost],
  );

  const deleteEvent = React.useCallback(
    async (eventId: string) => {
      setIsSubmitting(true);
      const eventToDelete = events.find((e) => e.id === eventId);
      let ok = false;
      if (!eventToDelete) {
        toast.error("Evento não encontrado");
      } else {
        ok = await deleteCalendarEvent(eventToDelete);
        if (ok) await refreshEventsPost();
      }
      setIsSubmitting(false);
      return ok;
    },
    [refreshEventsPost, events],
  );

  return {
    events,
    isLoading,
    error,
    lastUpdated,
    refreshEvents: refreshEventsPost,
    refreshEventsPost,
    addEvent,
    editEvent,
    deleteEvent,
    isSubmitting,
  };
}

export type { CalendarEvent, EventFormData } from "@/types/calendar";
