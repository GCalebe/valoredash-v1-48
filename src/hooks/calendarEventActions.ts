import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { CalendarEvent, EventFormData } from "@/types/calendar";

/**
 * Adiciona um evento na agenda usando Supabase.
 * Retorna true em caso de sucesso.
 */
export async function addCalendarEvent(
  formData: EventFormData,
): Promise<boolean> {
  try {
    const startDateTime = `${format(formData.date, "yyyy-MM-dd")}T${
      formData.startTime
    }:00.000Z`;
    const endDateTime = `${format(formData.date, "yyyy-MM-dd")}T${
      formData.endTime
    }:00.000Z`;
    
    const eventData = {
      title: formData.summary,
      summary: formData.summary,
      description: formData.description,
      start_time: startDateTime,
      end_time: endDateTime,
      host_name: formData.hostName,
      status: 'scheduled',
      event_type: 'meeting',
      user_id: (await supabase.auth.getUser()).data.user?.id,
      // New fields from the updated schema
      attendance_type: formData.attendanceType,
      employee_id: formData.employeeId,
      product_id: formData.productId,
      service_name: formData.serviceName,
      tags: formData.tags || [],
      client_email: formData.clientEmail,
      client_phone: formData.clientPhone,
      meeting_link: formData.meetingLink,
      meeting_location: formData.location,
    };

    const { data, error } = await supabase
      .from('calendar_events')
      .insert(eventData)
      .select()
      .single();

    if (error) {
      console.error("[calendarEventActions] Erro do Supabase:", error);
      throw error;
    }

    toast.success("Evento adicionado com sucesso!");
    return true;
  } catch (err) {
    console.error("[calendarEventActions] Erro ao adicionar evento:", err);
    toast.error("Erro ao adicionar evento. Tente novamente.");
    return false;
  }
}

/**
 * Edita um evento existente usando Supabase.
 */
export async function editCalendarEvent(
  eventId: string,
  formData: EventFormData,
): Promise<boolean> {
  try {
    const startDateTime = `${format(formData.date, "yyyy-MM-dd")}T${
      formData.startTime
    }:00.000Z`;
    const endDateTime = `${format(formData.date, "yyyy-MM-dd")}T${
      formData.endTime
    }:00.000Z`;
    
    const updateData = {
      title: formData.summary,
      summary: formData.summary,
      description: formData.description,
      start_time: startDateTime,
      end_time: endDateTime,
      host_name: formData.hostName,
      // New fields from the updated schema
      attendance_type: formData.attendanceType,
      employee_id: formData.employeeId,
      product_id: formData.productId,
      service_name: formData.serviceName,
      tags: formData.tags || [],
      client_email: formData.clientEmail,
      client_phone: formData.clientPhone,
      meeting_link: formData.meetingLink,
      meeting_location: formData.location,
    };

    const { data, error } = await supabase
      .from('calendar_events')
      .update(updateData)
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      console.error("[calendarEventActions] Erro do Supabase:", error);
      throw error;
    }

    toast.success("Evento editado com sucesso!");
    return true;
  } catch (err) {
    console.error("[calendarEventActions] Erro ao editar evento:", err);
    toast.error("Erro ao editar evento. Tente novamente.");
    return false;
  }
}

/**
 * Remove um evento usando Supabase.
 */
export async function deleteCalendarEvent(
  event: CalendarEvent,
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', event.id);

    if (error) {
      console.error("[calendarEventActions] Erro do Supabase:", error);
      throw error;
    }

    toast.success("Evento excluído com sucesso!");
    return true;
  } catch (err) {
    console.error("[calendarEventActions] Erro ao excluir evento:", err);
    toast.error("Erro ao excluir evento. Tente novamente.");
    return false;
  }
}

// ========== FUNÇÕES DA API EXTERNA DESATIVADAS ==========
// Mantidas para referência mas não utilizadas
/*
export async function addCalendarEventToExternalAPI(
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

export async function editCalendarEventFromExternalAPI(
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

export async function deleteCalendarEventFromExternalAPI(
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
*/
