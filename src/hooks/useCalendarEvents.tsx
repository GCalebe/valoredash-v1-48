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
};

export function useCalendarEvents({ currentMonth }: UseCalendarEventsProps) {
  const [events, setEvents] = React.useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const lastFetchedMonth = React.useRef<string | null>(null);

  const fetchEventsForMonth = React.useCallback(async (month: Date, forceRefresh = false) => {
    const cacheKey = getCacheKey(month);
    
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
      const range = { start: startOfMonth(month), end: endOfMonth(month) };
      const fetchedEvents = await fetchCalendarEvents(undefined, range);
      
      setEvents(fetchedEvents || []);
      saveToCache(cacheKey, fetchedEvents || []);
      
      if (forceRefresh) {
        toast.success("Agenda atualizada com sucesso!");
      }
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      toast.error(`Erro ao buscar eventos: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      lastFetchedMonth.current = cacheKey;
    }
  }, []);

  React.useEffect(() => {
    const monthCacheKey = getCacheKey(currentMonth);
    if (monthCacheKey !== lastFetchedMonth.current) {
      fetchEventsForMonth(currentMonth);
    }
  }, [currentMonth, fetchEventsForMonth]);

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
    title: "Consulta com Dr. Smith",
    start: new Date(2024, 6, 22, 10, 0),
    end: new Date(2024, 6, 22, 11, 0),
    description: "Check-up anual",
    status: "confirmed",
    client_id: "client-123",
    professional_id: "prof-456",
    service_id: "service-789",
    location: "Consultório 1",
    notes: "Trazer exames anteriores",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Reunião de Projeto",
    start: new Date(2024, 6, 22, 14, 0),
    end: new Date(2024, 6, 22, 15, 0),
    description: "Discussão sobre o novo design",
    status: "confirmed",
    client_id: "client-124",
    professional_id: "prof-457",
    service_id: "service-790",
    location: "Sala de Reuniões 2",
    notes: "Preparar apresentação",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Almoço com a Equipe",
    start: subDays(new Date(), 1),
    end: subDays(new Date(), 1),
    description: "Confraternização",
    status: "confirmed",
    client_id: "client-125",
    professional_id: "prof-458",
    service_id: "service-791",
    location: "Restaurante Central",
    notes: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Dentista",
    start: addDays(new Date(), 2),
    end: addDays(new Date(), 2),
    description: "Limpeza de rotina",
    status: "pending",
    client_id: "client-126",
    professional_id: "prof-459",
    service_id: "service-792",
    location: "Clínica Odontológica",
    notes: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
