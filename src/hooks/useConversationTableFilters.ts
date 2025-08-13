import { useMemo } from "react";
import { Conversation } from "@/types/chat";
import { UnifiedConversationFilters } from "./useUnifiedConversationFilters";

interface UseConversationTableFiltersProps {
  conversations: Conversation[];
  filters: UnifiedConversationFilters;
}

interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isOnline: boolean;
  status?: "online" | "away" | "offline";
  phone?: string;
  email?: string;
  sessionId?: string;
  // Client data from linked contact
  clientName?: string;
  clientType?: string;
  clientStatus?: string;
  clientTags?: string[];
  clientBudget?: number;
  clientSales?: number;
}

export function useConversationTableFilters({ conversations, filters }: UseConversationTableFiltersProps) {
  const filteredConversations = useMemo(() => {
    return conversations.filter((conversation) => {
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          conversation.name?.toLowerCase().includes(searchLower) ||
          conversation.clientName?.toLowerCase().includes(searchLower) ||
          conversation.lastMessage?.toLowerCase().includes(searchLower) ||
          conversation.phone?.toLowerCase().includes(searchLower) ||
          conversation.email?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.statusFilter !== "all") {
        // Map conversation status to filter values
        const conversationStatus = conversation.unread > 0 ? "active" : "inactive";
        if (conversationStatus !== filters.statusFilter) return false;
      }

      // Unread filter
      if (filters.unreadFilter !== "all") {
        if (filters.unreadFilter === "unread" && (!conversation.unread || conversation.unread === 0)) {
          return false;
        }
        if (filters.unreadFilter === "read" && conversation.unread && conversation.unread > 0) {
          return false;
        }
      }

      // Last message filter
      if (filters.lastMessageFilter !== "all") {
        const messageTime = new Date(conversation.time);
        const now = new Date();
        const diffHours = (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60);
        
        if (filters.lastMessageFilter === "recent" && diffHours > 24) {
          return false;
        }
        if (filters.lastMessageFilter === "older" && diffHours <= 24) {
          return false;
        }
      }

      // Client type filter
      if (filters.clientTypeFilter !== "all") {
        if (conversation.clientType !== filters.clientTypeFilter) {
          return false;
        }
      }

      // Segment filter (map to kanbanStageId)
      if (filters.segmentFilter !== "all") {
        if (!conversation.kanbanStageId || conversation.kanbanStageId !== filters.segmentFilter) {
          return false;
        }
      }

      // Last contact filter (usar lastContact se disponível; senão, cair para time)
      if (filters.lastContactFilter !== "all") {
        const base = conversation.lastContact || conversation.time;
        if (!base) return false;
        const lastContact = new Date(base);
        const now = new Date();
        
        if (filters.lastContactFilter === "today") {
          if (lastContact.toDateString() !== now.toDateString()) return false;
        } else if (filters.lastContactFilter === "week") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (lastContact < weekAgo) return false;
        } else if (filters.lastContactFilter === "month") {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (lastContact < monthAgo) return false;
        }
      }

      // Tags filter (selectedTags)
      if (Array.isArray(filters.selectedTags) && filters.selectedTags.length > 0) {
        const tags = conversation.clientTags || [];
        const hasAny = filters.selectedTags.some((t) => tags.includes(t));
        if (!hasAny) return false;
      }

      // Custom field filters (a serem aplicados no backend em cenários complexos)
      for (const customFilter of filters.customFieldFilters) {
        // Placeholder: sem implementação local; preferir aplicação no Supabase
      }

      // Advanced rules filtering
      if (filters.hasAdvancedRules) {
        // This would need proper implementation of advanced rule evaluation
        // For now, we'll skip advanced filtering
      }

      return true;
    });
  }, [conversations, filters]);

  return { filteredConversations };
}