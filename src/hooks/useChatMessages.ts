import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { useContactsQuery } from "@/hooks/useContactsQuery";

// Mensagens mockup para demonstração
const generateMockMessages = (sessionId: string, availableContacts: any[]): ChatMessage[] => {
  const client = availableContacts.find((c) => c.sessionId === sessionId);
  if (!client) return [];

  const messages: ChatMessage[] = [];

  // Mensagem inicial do cliente
  messages.push({
    role: "human",
    content: "Olá! Estou interessado em saber mais sobre os serviços de vocês.",
    timestamp: "14:30",
    type: "human",
  });

  // Resposta da Aurora
  messages.push({
    role: "assistant",
    content: `Olá ${client.name}! Seja muito bem-vindo(a)! 🌟\n\nSou a Aurora, assistente virtual da empresa. Fico feliz em saber do seu interesse!\n\nPosso te ajudar com informações sobre nossos serviços. Sobre qual área você gostaria de saber mais?`,
    timestamp: "14:31",
    type: "ai",
  });

  return messages;
};

export function useChatMessages(selectedChat: string | null) {
  const { data: contacts = [], isLoading: contactsLoading } = useContactsQuery();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Use contacts from React Query
  const availableContacts = contacts || [];

  const fetchMessages = useCallback(
    async (conversationId: string) => {
      if (!conversationId) return;
      
      setLoading(true);
      try {
        console.log(`Fetching messages for conversation: ${conversationId}`);
        
        // Buscar mensagens da nova tabela unificada
        const { data: messagesData, error } = await supabase
          .from("n8n_chat_messages")
          .select("*")
          .eq("session_id", conversationId)
          .eq("active", true)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error fetching messages:", error);
          // Fallback para dados fictícios se houver erro
          const mockMessages = generateMockMessages(conversationId, availableContacts);
          setMessages(mockMessages);
          return;
        }

        // Converter para o formato esperado
        const formattedMessages: ChatMessage[] = (messagesData || []).map((msg) => ({
          id: msg.id.toString(),
          content: msg.user_message || msg.bot_message || "",
          role: msg.user_message ? "user" : "assistant",
          timestamp: msg.created_at,
          type: (msg.message_type || "text") as "text" | "image" | "file" | "human" | "ai",
        }));

        console.log(`Fetched ${formattedMessages.length} real messages for conversation ${conversationId}`);
        setMessages(formattedMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
        // Fallback para dados fictícios
        const mockMessages = generateMockMessages(conversationId, availableContacts);
        setMessages(mockMessages);
        
        toast({
          title: "Usando mensagens de exemplo",
          description: "Exibindo conversa de demonstração.",
        });
      } finally {
        setLoading(false);
      }
    },
    [availableContacts, toast],
  );

  // Fetch messages when selected chat changes
  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat);
    } else {
      setMessages([]);
      setLoading(false);
    }
  }, [selectedChat, fetchMessages]);

  const handleNewMessage = (message: ChatMessage) => {
    logger.debug("Adding new message to local state:", message);
    setMessages((currentMessages) => [...currentMessages, message]);
  };

  return { messages, loading, handleNewMessage, fetchMessages };
}