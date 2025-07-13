import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Conversation } from "@/types/chat";
import { formatMessageTime } from "@/utils/chatUtils";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      console.log("🔍 Buscando conversas da tabela unificada...");

      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .order("last_message_time", { ascending: false });

      if (error) {
        console.error("Error fetching conversations:", error);
        throw error;
      }

      console.log("Raw conversations data:", data);

      const formattedConversations: Conversation[] = (data || []).map((conv) => ({
        id: conv.id,
        name: conv.name || "Cliente",
        lastMessage: conv.last_message || "",
        time: conv.last_message_time ? formatMessageTime(new Date(conv.last_message_time)) : "",
        unread: conv.unread_count || 0,
        avatar: conv.avatar || "👤",
        phone: conv.phone || "",
        email: conv.email || "",
        address: (conv.client_data as any)?.address || "",
        clientName: (conv.client_data as any)?.client_name || "",
        clientSize: (conv.client_data as any)?.client_size || "",
        clientType: (conv.client_data as any)?.client_type || "",
        sessionId: conv.session_id || "",
      }));

      console.log("Formatted conversations:", formattedConversations);
      setConversations(formattedConversations);
      
    } catch (error) {
      console.error("❌ Erro ao buscar conversas:", error);
      setConversations([]);
      toast({
        title: "Erro ao carregar conversas",
        description: "Não foi possível carregar as conversas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      console.log("🏁 Busca de conversas finalizada.");
    }
  }, [toast]);

  const updateConversationLastMessage = useCallback(async (sessionId: string) => {
    try {
      console.log(`Updating last message for session: ${sessionId}`);
      
      // Buscar a última mensagem da nova tabela unificada
      const { data: messageData, error: messageError } = await supabase
        .from("n8n_chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (messageError) {
        console.error("Error fetching chat messages:", messageError);
        return;
      }

      if (messageData && messageData.length > 0) {
        const lastMessage = messageData[0];
        const messageContent = lastMessage.user_message || lastMessage.bot_message || "Nova mensagem";
        
        console.log(`Last message content: ${messageContent}`);

        // A conversa será atualizada automaticamente pelo trigger
        // Mas podemos atualizar a lista local para feedback imediato
        setConversations(prev => 
          prev.map(conv => 
            conv.sessionId === sessionId 
              ? { 
                  ...conv, 
                  lastMessage: messageContent, 
                  time: formatMessageTime(new Date()),
                  unread: conv.unread + 1 
                }
              : conv
          )
        );

        console.log(`Successfully updated conversation for session: ${sessionId}`);
      }
    } catch (error) {
      console.error("Error in updateConversationLastMessage:", error);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    setConversations,
    loading,
    updateConversationLastMessage,
    fetchConversations,
  };
}