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

      // Segment filter (map to client status for now)
      if (filters.segmentFilter !== "all") {
        // This would need proper mapping based on your business logic
        // For now, we'll use a simple mapping
        const segmentMap: { [key: string]: string } = {
          "leads": "lead",
          "prospects": "prospect", 
          "customers": "customer"
        };
        
        // This would come from the linked contact data
        // For now, we'll skip this filter until proper contact linking is implemented
      }

      // Last contact filter
      if (filters.lastContactFilter !== "all") {
        const lastContact = new Date(conversation.time);
        const now = new Date();
        
        switch (filters.lastContactFilter) {
          case "today":
            if (lastContact.toDateString() !== now.toDateString()) return false;
            break;
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (lastContact < weekAgo) return false;
            break;
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            if (lastContact < monthAgo) return false;
            break;
        }
      }

      // Custom field filters
      for (const customFilter of filters.customFieldFilters) {
        // This would need to be implemented based on how custom fields are stored
        // For now, we'll skip custom field filtering
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