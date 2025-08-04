import * as React from "react";
import { toast } from "sonner";
import { addDays, subDays, startOfMonth, endOfMonth } from "date-fns";
import type { CalendarEvent, EventFormData } from "@/types/calendar";
import { fetchCalendarEvents } from "./useFetchCalendarEvents";
import { getCacheKey, loadFromCache, saveToCache, clearCache } from "./calendarCache";
import {
  addCalendarEvent,
  editCalendarEvent,
  deleteCalendarEvent,
} from "./calendarEventActions";

type UseCalendarEventsProps = {
  currentMonth: Date;
  calendarViewType?: "mes" | "semana" | "dia" | "lista";
};

export function useCalendarEvents({ currentMonth, calendarViewType }: UseCalendarEventsProps) {
  const [events, setEvents] = React.useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const lastFetchedMonth = React.useRef<string | null>(null);

  const fetchEventsForMonth = React.useCallback(async (month: Date, forceRefresh = false) => {
    const cacheKey = getCacheKey(month, calendarViewType);
    
    if (!forceRefresh) {
      const cachedEvents = loadFromCache(cacheKey);
      if (cachedEvents) {
        setEvents(cachedEvents);
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      let fetchedEvents;
      if (calendarViewType === "lista") {
        // Para visualização de lista, buscar todos os eventos
        fetchedEvents = await fetchCalendarEvents();
      } else {
        // Para outras visualizações, buscar apenas do mês atual
        const range = { start: startOfMonth(month), end: endOfMonth(month) };
        fetchedEvents = await fetchCalendarEvents(undefined, range);
      }
      
      setEvents(fetchedEvents || []);
      saveToCache(cacheKey, fetchedEvents || []);
      
      if (forceRefresh) {
        toast.success("Agenda atualizada com sucesso!");
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(err?.message || "Erro desconhecido");
      setError(error);
      toast.error(`Erro ao buscar eventos: ${error.message}`);
    } finally {
      setIsLoading(false);
      lastFetchedMonth.current = cacheKey;
    }
  }, [calendarViewType]);

  React.useEffect(() => {
    const monthCacheKey = getCacheKey(currentMonth);
    if (monthCacheKey !== lastFetchedMonth.current) {
      fetchEventsForMonth(currentMonth);
    }
  }, [currentMonth]); // Remove fetchEventsForMonth dependency to prevent unnecessary re-renders

  const refreshEvents = React.useCallback(() => {
    clearCache();
    fetchEventsForMonth(currentMonth, true);
  }, [currentMonth, fetchEventsForMonth]);

  const handleApiAction = async (action: Promise<boolean>, successMessage: string) => {
    setIsSubmitting(true);
    try {
      const success = await action;
      if (success) {
        toast.success(successMessage);
        refreshEvents();
      }
      return success;
    } finally {
      setIsSubmitting(false);
    }
  };

  const addEvent = (formData: EventFormData) => 
    handleApiAction(addCalendarEvent(formData), "Evento adicionado com sucesso!");

  const editEvent = (eventId: string, formData: EventFormData) => 
    handleApiAction(editCalendarEvent(eventId, formData), "Evento atualizado com sucesso!");

  const deleteEvent = (eventId: string) => {
    const eventToDelete = events.find((e) => e.id === eventId);
    if (!eventToDelete) {
      toast.error("Evento não encontrado");
      return Promise.resolve(false);
    }
    return handleApiAction(deleteCalendarEvent(eventToDelete), "Evento excluído com sucesso!");
  };

  return {
    events,
    isLoading,
    error,
    isSubmitting,
    refreshEvents,
    addEvent,
    editEvent,
    deleteEvent,
  };
}

export type { CalendarEvent, EventFormData } from "@/types/calendar";

// Mock data and functions for testing
export const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    summary: "Consulta com Dr. Smith",
    start: new Date(2024, 6, 22, 10, 0).toISOString(),
    end: new Date(2024, 6, 22, 11, 0).toISOString(),
    description: "Check-up anual",
    status: "confirmed",
    htmlLink: "#1",
    hostName: "Dr. Smith"
  },
  {
    id: "2",
    summary: "Reunião de Projeto",
    start: new Date(2024, 6, 22, 14, 0).toISOString(),
    end: new Date(2024, 6, 22, 15, 0).toISOString(),
    description: "Discussão sobre o novo design",
    status: "confirmed",
    htmlLink: "#2",
    hostName: "Maria Santos"
  },
  {
    id: "3",
    summary: "Almoço com a Equipe",
    start: subDays(new Date(), 1).toISOString(),
    end: subDays(new Date(), 1).toISOString(),
    description: "Confraternização",
    status: "confirmed",
    htmlLink: "#3",
    hostName: "Pedro Costa"
  },
  {
    id: "4",
    summary: "Dentista",
    start: addDays(new Date(), 2).toISOString(),
    end: addDays(new Date(), 2).toISOString(),
    description: "Limpeza de rotina",
    status: "pending",
    htmlLink: "#4",
    hostName: "Ana Silva"
  },
];
