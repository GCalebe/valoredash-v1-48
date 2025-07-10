import { useMemo } from "react";
import { Conversation } from "@/types/chat";
import { ConversationCustomFieldFilter } from "@/hooks/useConversationFilters";
import { isDateInPeriod } from "@/utils/dateUtils";

interface UseConversationTableFiltersProps {
  conversations: Conversation[];
  searchTerm: string;
  statusFilter: string;
  segmentFilter: string;
  lastContactFilter: string;
  unreadFilter: string;
  lastMessageFilter: string;
  clientTypeFilter: string;
  customFieldFilters: ConversationCustomFieldFilter[];
}

export const useConversationTableFilters = ({
  conversations,
  searchTerm,
  statusFilter,
  segmentFilter,
  lastContactFilter,
  unreadFilter,
  lastMessageFilter,
  clientTypeFilter,
  customFieldFilters,
}: UseConversationTableFiltersProps) => {
  const filteredConversations = useMemo(() => {
    return conversations.filter((conversation) => {
      // Filtro de busca por texto
      const matchesSearch =
        conversation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (conversation.email &&
          conversation.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (conversation.clientName &&
          conversation.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (conversation.clientType &&
          conversation.clientType.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (conversation.phone && conversation.phone.includes(searchTerm));

      // Filtro de status (pode ser usado para status de conversa específicos)
      const matchesStatus = statusFilter === "all";

      // Filtro de segmento (usando clientType como proxy)
      const matchesSegment =
        segmentFilter === "all" || conversation.clientType === segmentFilter;

      // Filtro de último contato (usando o campo time)
      const matchesLastContact =
        lastContactFilter === "all" ||
        isDateInPeriod(conversation.time, lastContactFilter);

      // Filtro de mensagens não lidas
      let matchesUnread = unreadFilter === "all";
      if (unreadFilter === "unread") {
        matchesUnread = conversation.unread > 0;
      } else if (unreadFilter === "read") {
        matchesUnread = conversation.unread === 0;
      }

      // Filtro de última mensagem
      let matchesLastMessage = lastMessageFilter === "all";
      if (lastMessageFilter === "recent") {
        // Conversas com mensagens nas últimas 24h
        const now = new Date();
        const messageTime = new Date(conversation.time);
        const diffHours = (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60);
        matchesLastMessage = diffHours <= 24;
      } else if (lastMessageFilter === "older") {
        // Conversas com mensagens mais antigas que 24h
        const now = new Date();
        const messageTime = new Date(conversation.time);
        const diffHours = (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60);
        matchesLastMessage = diffHours > 24;
      }

      // Filtro de tipo de cliente
      const matchesClientType =
        clientTypeFilter === "all" || conversation.clientType === clientTypeFilter;

      // Filtro de campos personalizados (placeholder - pode ser implementado se necessário)
      const matchesCustomFields = customFieldFilters.length === 0;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSegment &&
        matchesLastContact &&
        matchesUnread &&
        matchesLastMessage &&
        matchesClientType &&
        matchesCustomFields
      );
    });
  }, [
    conversations,
    searchTerm,
    statusFilter,
    segmentFilter,
    lastContactFilter,
    unreadFilter,
    lastMessageFilter,
    clientTypeFilter,
    customFieldFilters,
  ]);

  return { filteredConversations };
};