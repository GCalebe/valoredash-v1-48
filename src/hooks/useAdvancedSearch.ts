import { useState, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Conversation, ChatMessage } from "@/types/chat";
import { formatMessageTime } from "@/utils/chatUtils";

export type SearchMode = "conversations" | "notes" | "both";

export interface SearchResult {
  type: "conversation" | "note" | "message";
  id: string;
  title: string;
  content: string;
  timestamp: string;
  sessionId?: string;
  conversationName?: string;
  highlighted?: string;
}

export interface AdvancedSearchFilters {
  searchTerm: string;
  searchMode: SearchMode;
  setSearchTerm: (term: string) => void;
  setSearchMode: (mode: SearchMode) => void;
  searchResults: SearchResult[];
  isSearching: boolean;
  performSearch: () => Promise<void>;
  clearSearch: () => void;
}

export function useAdvancedSearch(): AdvancedSearchFilters {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("conversations");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const searchConversations = useCallback(async (term: string): Promise<SearchResult[]> => {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`)
        .order("last_message_time", { ascending: false });

      if (error) throw error;

      return (data || []).map((conv): SearchResult => ({
        type: "conversation",
        id: conv.id,
        title: conv.name || "Cliente",
        content: conv.last_message || "",
        timestamp: conv.last_message_time ? formatMessageTime(new Date(conv.last_message_time)) : "",
        sessionId: conv.session_id,
        conversationName: conv.name,
        highlighted: highlightText(conv.name || "Cliente", term)
      }));
    } catch (error) {
      console.error("Error searching conversations:", error);
      return [];
    }
  }, []);

  const searchNotes = useCallback(async (term: string): Promise<SearchResult[]> => {
    try {
      const { data, error } = await supabase
        .from("contacts")
        .select("id, name, notes, session_id")
        .not("notes", "is", null)
        .ilike("notes", `%${term}%`)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((contact): SearchResult => ({
        type: "note",
        id: contact.id,
        title: `Nota de ${contact.name}`,
        content: contact.notes || "",
        timestamp: "Salvo nas anotações",
        sessionId: contact.session_id,
        conversationName: contact.name,
        highlighted: highlightText(contact.notes || "", term)
      }));
    } catch (error) {
      console.error("Error searching notes:", error);
      return [];
    }
  }, []);

  const searchMessages = useCallback(async (term: string): Promise<SearchResult[]> => {
    try {
      const { data, error } = await supabase
        .from("n8n_chat_messages")
        .select("id, session_id, user_message, bot_message, created_at")
        .or(`user_message.ilike.%${term}%,bot_message.ilike.%${term}%`)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Buscar informações das conversas separadamente
      const sessionIds = [...new Set((data || []).map(msg => msg.session_id))];
      const { data: conversationsData } = await supabase
        .from("conversations")
        .select("session_id, name")
        .in("session_id", sessionIds);

      const conversationMap = new Map(
        (conversationsData || []).map(conv => [conv.session_id, conv.name])
      );

      return (data || []).map((message): SearchResult => {
        const content = message.user_message || message.bot_message || "";
        const conversationName = conversationMap.get(message.session_id) || "Cliente";
        
        return {
          type: "message",
          id: message.id.toString(),
          title: `Mensagem de ${conversationName}`,
          content,
          timestamp: formatMessageTime(new Date(message.created_at)),
          sessionId: message.session_id,
          conversationName,
          highlighted: highlightText(content, term)
        };
      });
    } catch (error) {
      console.error("Error searching messages:", error);
      return [];
    }
  }, []);

  const performSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      let results: SearchResult[] = [];

      if (searchMode === "conversations") {
        results = await searchConversations(searchTerm);
      } else if (searchMode === "notes") {
        results = await searchNotes(searchTerm);
      } else if (searchMode === "both") {
        const [conversationResults, noteResults, messageResults] = await Promise.all([
          searchConversations(searchTerm),
          searchNotes(searchTerm),
          searchMessages(searchTerm)
        ]);
        results = [...conversationResults, ...noteResults, ...messageResults];
      }

      setSearchResults(results);
    } catch (error) {
      console.error("Error performing search:", error);
      toast({
        title: "Erro na busca",
        description: "Não foi possível realizar a busca.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  }, [searchTerm, searchMode, searchConversations, searchNotes, searchMessages, toast]);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setSearchResults([]);
  }, []);

  const highlightText = (text: string, term: string): string => {
    if (!term) return text;
    
    const regex = new RegExp(`(${term})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
  };

  return {
    searchTerm,
    searchMode,
    setSearchTerm,
    setSearchMode,
    searchResults,
    isSearching,
    performSearch,
    clearSearch,
  };
}