import { format, parseISO } from 'date-fns';
import { Contact } from '@/types/client';
import { CalendarEvent } from '@/hooks/useCalendarEvents';
import { EventFormState } from '@/types/eventForm';
import { COLORS, SERVICES } from '@/constants/eventFormConstants';
import { extractTags } from '@/utils/eventFormHelpers';
import { EventProcessor } from './types';

/**
 * Cria um processador de eventos para extrair informações de eventos existentes
 * @param contacts Lista de contatos disponíveis
 * @param updateState Função para atualizar o estado do formulário
 * @returns Objeto com funções de processamento
 */
export const createEventProcessor = (
  contacts: Contact[],
  updateState: (updates: Partial<EventFormState>) => void
): EventProcessor => {
  
  /**
   * Define informações básicas do evento
   */
  const setBasicEventInfo = (event: CalendarEvent) => {
    const start = parseISO(event.start);
    const end = parseISO(event.end);
    const durationInMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    
    updateState({
      summary: event.summary || "",
      automation: "",
      collaborator: event.hostName || "",
      eventDescription: event.description || "",
      email: event.attendees?.find((a) => a?.email)?.email || "",
      startDateTime: format(start, "yyyy-MM-dd'T'HH:mm"),
      endDateTime: format(end, "yyyy-MM-dd'T'HH:mm"),
      selectedColor: COLORS[0],
      selectedDuration: durationInMinutes,
    });
  };

  /**
   * Encontra informações do serviço baseado na descrição do evento
   */
  const findServiceInfo = (event: CalendarEvent) => {
    const foundService = SERVICES.find(service => 
      event.summary?.includes(service) || event.description?.includes(service)
    );
    
    if (foundService) {
      updateState({ selectedService: foundService });
    }
  };

  /**
   * Encontra informações do cliente baseado nos participantes do evento
   */
  const findClientInfo = (event: CalendarEvent) => {
    const clientEmail = event.attendees?.find((a) => a?.email)?.email;
    if (clientEmail) {
      const foundClient = contacts.find(c => c.email === clientEmail);
      if (foundClient) {
        updateState({
          selectedClient: foundClient,
          isNewClient: false,
        });
      }
    }
  };

  /**
   * Determina tipo de atendimento e localização/link baseado na descrição
   */
  const determineAttendanceInfo = (event: CalendarEvent) => {
    if (event.description?.toLowerCase().includes("online") || 
        event.description?.toLowerCase().includes("zoom") || 
        event.description?.toLowerCase().includes("meet")) {
      // Tenta extrair link da reunião
      const linkMatch = event.description?.match(/(https?:\/\/[^\s]+)/);
      
      updateState({
        attendanceType: "online",
        meetingLink: linkMatch ? linkMatch[0] : "",
      });
    } else {
      // Tenta extrair localização
      const locationLines = event.description?.split('\n').filter(line => 
        line.toLowerCase().includes("local") || 
        line.toLowerCase().includes("endereço") ||
        line.toLowerCase().includes("localização")
      );
      
      updateState({
        attendanceType: "presencial",
        location: locationLines && locationLines.length > 0 ?
          locationLines[0].replace(/local|endereço|localização/i, "").trim() : "",
      });
    }
  };

  /**
   * Verifica se a data está bloqueada e extrai o motivo
   */
  const checkBlockedDate = (event: CalendarEvent) => {
    if (event.summary?.toLowerCase().includes("bloqueado") || 
        event.description?.toLowerCase().includes("bloqueado")) {
      // Tenta extrair motivo do bloqueio
      const reasonLines = event.description?.split('\n').filter(line => 
        line.toLowerCase().includes("motivo") || 
        line.toLowerCase().includes("razão")
      );
      
      updateState({
        isBlockingDate: true,
        blockReason: reasonLines && reasonLines.length > 0 ?
          reasonLines[0].replace(/motivo|razão/i, "").trim() : "",
      });
    }
  };

  /**
   * Determina status inicial baseado no status do evento
   */
  const determineInitialStatus = (event: CalendarEvent) => {
    if (event.status === "confirmed") {
      updateState({ initialStatus: "confirmado" });
    } else if (event.status === "tentative") {
      updateState({ initialStatus: "pendente" });
    }
  };

  return {
    setBasicEventInfo,
    findServiceInfo,
    findClientInfo,
    determineAttendanceInfo,
    checkBlockedDate,
    determineInitialStatus,
  };
};

/**
 * Processa um evento completo extraindo todas as informações relevantes
 * @param event Evento do calendário
 * @param contacts Lista de contatos
 * @param updateState Função para atualizar estado
 */
export const processEvent = (
  event: CalendarEvent,
  contacts: Contact[],
  updateState: (updates: Partial<EventFormState>) => void
) => {
  const processor = createEventProcessor(contacts, updateState);
  
  // Processa todas as informações do evento
  processor.setBasicEventInfo(event);
  processor.findServiceInfo(event);
  processor.findClientInfo(event);
  processor.determineAttendanceInfo(event);
  processor.checkBlockedDate(event);
  processor.determineInitialStatus(event);
  
  // Extrai tags da descrição
  const extractedTags = extractTags(event.description);
  updateState({ tags: extractedTags });
};

/**
 * Utilitários para processamento de eventos
 */
export const eventProcessorUtils = {
  /**
   * Extrai duração em minutos entre duas datas
   */
  extractDuration: (start: string, end: string): number => {
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
  },

  /**
   * Verifica se um evento é de bloqueio
   */
  isBlockedEvent: (event: CalendarEvent): boolean => {
    return event.summary?.toLowerCase().includes("bloqueado") ||
           event.description?.toLowerCase().includes("bloqueado") ||
           false;
  },

  /**
   * Verifica se um evento é online
   */
  isOnlineEvent: (event: CalendarEvent): boolean => {
    const description = event.description?.toLowerCase() || "";
    return description.includes("online") ||
           description.includes("zoom") ||
           description.includes("meet") ||
           description.includes("teams");
  },

  /**
   * Extrai email do primeiro participante
   */
  extractAttendeeEmail: (event: CalendarEvent): string | null => {
    return event.attendees?.find((a) => a?.email)?.email || null;
  },

  /**
   * Extrai links de reunião da descrição
   */
  extractMeetingLinks: (description?: string): string[] => {
    if (!description) return [];
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    return description.match(linkRegex) || [];
  },

  /**
   * Extrai informações de localização da descrição
   */
  extractLocationInfo: (description?: string): string | null => {
    if (!description) return null;
    
    const locationLines = description.split('\n').filter(line => 
      line.toLowerCase().includes("local") || 
      line.toLowerCase().includes("endereço") ||
      line.toLowerCase().includes("localização")
    );
    
    return locationLines.length > 0 ?
      locationLines[0].replace(/local|endereço|localização/i, "").trim() :
      null;
  }
};