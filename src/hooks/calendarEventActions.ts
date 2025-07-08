import { format } from "date-fns";
import { toast } from "sonner";
import type { CalendarEvent, EventFormData } from "@/types/calendar";

/**
 * Adiciona um evento na agenda.
 * Retorna true em caso de sucesso.
 */
export async function addCalendarEvent(
  formData: EventFormData,
): Promise<boolean> {
  try {
    const startDateTime = `${format(formData.date, "yyyy-MM-dd")}T${
      formData.startTime
    }:00-03:00`;
    const endDateTime = `${format(formData.date, "yyyy-MM-dd")}T${
      formData.endTime
    }:00-03:00`;
    const eventData = {
      summary: formData.summary,
      description: formData.description,
      start: startDateTime,
      end: endDateTime,
      email: formData.email,
      hostName: formData.hostName,
    };
    const response = await fetch(
      "https://webhook.comercial247.com.br/webhook/agenda/adicionar",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      },
    );
    if (!response.ok)
      throw new Error(
        `Erro ao adicionar evento: ${response.status} ${response.statusText}`,
      );
    toast.success("Evento adicionado com sucesso!");
    return true;
  } catch (err) {
    console.error("[calendarEventActions] Erro ao adicionar evento:", err);
    toast.error("Erro ao adicionar evento. Tente novamente.");
    return false;
  }
}

/**
 * Edita um evento existente.
 */
export async function editCalendarEvent(
  eventId: string,
  formData: EventFormData,
): Promise<boolean> {
  try {
    const startDateTime = `${format(formData.date, "yyyy-MM-dd")}T${
      formData.startTime
    }:00-03:00`;
    const endDateTime = `${format(formData.date, "yyyy-MM-dd")}T${
      formData.endTime
    }:00-03:00`;
    const eventData = {
      id: eventId,
      summary: formData.summary,
      description: formData.description,
      start: startDateTime,
      end: endDateTime,
      email: formData.email,
      hostName: formData.hostName,
    };
    const response = await fetch(
      "https://webhook.n8nlabz.com.br/webhook/agenda/alterar",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      },
    );
    if (!response.ok)
      throw new Error(
        `Erro ao editar evento: ${response.status} ${response.statusText}`,
      );
    toast.success("Evento editado com sucesso!");
    return true;
  } catch (err) {
    console.error("[calendarEventActions] Erro ao editar evento:", err);
    toast.error("Erro ao editar evento. Tente novamente.");
    return false;
  }
}

/**
 * Remove um evento via id, recebendo o próprio evento para manter compatibilidade.
 */
export async function deleteCalendarEvent(
  event: CalendarEvent,
): Promise<boolean> {
  try {
    const eventData = {
      id: event.id,
      summary: event.summary,
      description: event.description || "",
      start: event.start,
      end: event.end,
      email: event.attendees?.find((a) => a?.email)?.email || "",
      hostName: event.hostName || "",
    };
    const response = await fetch(
      "https://webhook.n8nlabz.com.br/webhook/agenda/excluir",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      },
    );
    if (!response.ok)
      throw new Error(
        `Erro ao excluir evento: ${response.status} ${response.statusText}`,
      );
    toast.success("Evento excluído com sucesso!");
    return true;
  } catch (err) {
    console.error("[calendarEventActions] Erro ao excluir evento:", err);
    toast.error("Erro ao excluir evento. Tente novamente.");
    return false;
  }
}
