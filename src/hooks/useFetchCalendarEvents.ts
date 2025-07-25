import { CalendarEvent } from "@/types/calendar";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

// Função principal de busca - agora usa Supabase como fonte primária
export async function fetchCalendarEvents(
  date?: Date,
  range?: { start: Date; end: Date },
): Promise<CalendarEvent[]> {
  try {
    let query = supabase
      .from('calendar_events')
      .select('*')
      .order('start_time', { ascending: true });

    // Filtrar por range de datas
    if (range) {
      const start = format(range.start, "yyyy-MM-dd") + "T00:00:00.000Z";
      const end = format(range.end, "yyyy-MM-dd") + "T23:59:59.999Z";
      query = query.gte('start_time', start).lte('start_time', end);
    } else if (date) {
      const start = format(date, "yyyy-MM-dd") + "T00:00:00.000Z";
      const end = format(date, "yyyy-MM-dd") + "T23:59:59.999Z";
      query = query.gte('start_time', start).lte('start_time', end);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar eventos do Supabase:', error);
      throw error;
    }

    // Mapear dados do Supabase para CalendarEvent
    return (data || []).map((event: unknown) => ({
      id: event.id,
      summary: event.summary || event.title || "Evento sem título",
      description: event.description || "",
      start: event.start_time,
      end: event.end_time,
      status: event.status || "confirmed",
      htmlLink: event.html_link || "#",
      attendees: [], // Pode ser expandido para buscar de calendar_attendees
      hostName: event.host_name || "",
    }));

  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    return [];
  }
}

// ========== API EXTERNA DESATIVADA ==========
// Mantida para referência mas não utilizada
/*
export async function fetchCalendarEventsFromExternalAPI(
  date?: Date,
  range?: { start: Date; end: Date },
): Promise<CalendarEvent[]> {
  return retryFetch(
    async () => {
      let start: string;
      let end: string;
      if (range) {
        start = format(range.start, "yyyy-MM-dd") + "T00:00:00.000-03:00";
        end = format(range.end, "yyyy-MM-dd") + "T23:59:59.999-03:00";
      } else {
        const dateToUse = date || new Date();
        start = format(dateToUse, "yyyy-MM-dd") + "T00:00:00.000-03:00";
        end = format(dateToUse, "yyyy-MM-dd") + "T23:59:59.999-03:00";
      }

      const url = new URL("https://webhook.comercial247.com.br/webhook/agenda");
      url.searchParams.append("start", start);
      url.searchParams.append("end", end);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(
          `Erro na requisição (${response.status}): ${
            msg || response.statusText
          }`,
        );
      }

      const data = await response.json();
      const eventsArray = Array.isArray(data) ? data : data.events || [];
      
      return eventsArray
        .map((event: unknown) => ({
          id: event.id || `event-${Date.now()}-${Math.random()}`,
          summary: event.summary || "Evento sem título",
          description: event.description || "",
          start: event.start,
          end: event.end,
          status: event.status || "confirmed",
          htmlLink: event.htmlLink || "#",
          attendees: event.attendees || [],
          hostName: event.hostName || "",
        }))
        .filter(
          (e) =>
            e.start && e.end && e.summary && e.summary !== "Evento sem título",
        );
    },
    2,
    800,
  );
}
*/
