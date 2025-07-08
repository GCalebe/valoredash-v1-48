import { CalendarEvent } from "@/types/calendar";
import { format } from "date-fns";
import { retryFetch } from "./utils/retryFetch";

// Função isolada de busca da API (utilizada pelo hook principal)
export async function fetchCalendarEvents(
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
        // Mensagem de erro mais clara
        const msg = await response.text();
        throw new Error(
          `Erro na requisição (${response.status}): ${
            msg || response.statusText
          }`,
        );
      }

      const data = await response.json();

      // Accepts both array or object with .events
      const eventsArray = Array.isArray(data) ? data : data.events || [];
      // Map para CalendarEvent (segue lógica original)
      return eventsArray
        .map((event: any) => ({
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
  ); // 2 tentativas extras (total 3), delay inicial 800ms
}
