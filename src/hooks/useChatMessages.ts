
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

// Mensagens mockup para demonstração
const generateMockMessages = (sessionId: string): ChatMessage[] => {
  return [
    {
      id: "1",
      role: "human",
      content: "Olá! Estou interessado em saber mais sobre os serviços de vocês.",
      timestamp: new Date(Date.now() - 30000).toISOString(),
      type: "human",
    },
    {
      id: "2",
      role: "assistant",
      content: `Olá! Seja muito bem-vindo(a)! 🌟\n\nSou a Aurora, assistente virtual da empresa. Fico feliz em saber do seu interesse!\n\nPosso te ajudar com informações sobre nossos serviços. Sobre qual área você gostaria de saber mais?`,
      timestamp: new Date(Date.now() - 25000).toISOString(),
      type: "ai",
    },
    {
      id: "3",
      role: "human",
      content: "Quais são os valores dos seus produtos?",
      timestamp: new Date(Date.now() - 20000).toISOString(),
      type: "human",
    },
    {
      id: "4",
      role: "assistant",
      content: "Nossos produtos têm valores variados dependendo de suas necessidades específicas. Vou te explicar nossas principais opções:\n\n• **Plano Básico**: A partir de R$ 99/mês\n• **Plano Profissional**: R$ 199/mês\n• **Plano Enterprise**: R$ 399/mês\n\nCada plano inclui diferentes funcionalidades. Gostaria que eu detalhe algum específico?",
      timestamp: new Date(Date.now() - 15000).toISOString(),
      type: "ai",
    },
  ];
};

export function useChatMessages(selectedChat: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMessages = useCallback(
    async (conversationId: string) => {
      if (!conversationId) return;
      
      setLoading(true);
      try {
        console.log(`📱 Buscando mensagens para conversa: ${conversationId}`);
        
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log("❌ Usuário não autenticado");
          // Show mock messages for demo
          const mockMessages = generateMockMessages(conversationId);
          setMessages(mockMessages);
          setLoading(false);
          return;
        }
        
        // First, try to find the session_id from conversations or contacts
        let sessionId = conversationId;
        
        // Try to get session_id from conversations table
        const { data: convData } = await supabase
          .from("conversations")
          .select("session_id")
          .eq("id", conversationId)
          .eq("user_id", user.id)
          .single();

        if (convData?.session_id) {
          sessionId = convData.session_id;
        } else {
          // Try to get session_id from contacts table
          const { data: contactData } = await supabase
            .from("contacts")
            .select("session_id")
            .eq("id", conversationId)
            .eq("user_id", user.id)
            .single();

          if (contactData?.session_id) {
            sessionId = contactData.session_id;
          }
        }

        console.log(`🔍 Usando session_id: ${sessionId}`);
        
        // Fetch messages from the unified table filtered by user_id and session_id
        const { data: messagesData, error } = await supabase
          .from("n8n_chat_messages")
          .select("*")
          .eq("session_id", sessionId)
          .eq("user_id", user.id)
          .eq("active", true)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("❌ Erro ao buscar mensagens:", error);
          // Fallback to mock messages
          const mockMessages = generateMockMessages(conversationId);
          setMessages(mockMessages);
          
          toast({
            title: "Usando mensagens de exemplo",
            description: "Exibindo conversa de demonstração.",
          });
          return;
        }

        if (!messagesData || messagesData.length === 0) {
          console.log("📝 Nenhuma mensagem encontrada, usando dados de exemplo");
          // Show mock messages for better UX
          const mockMessages = generateMockMessages(conversationId);
          setMessages(mockMessages);
          return;
        }

        // Convert to the expected format
        const formattedMessages: ChatMessage[] = messagesData.map((msg) => ({
          id: msg.id.toString(),
          content: msg.user_message || msg.bot_message || "",
          role: msg.user_message ? "user" : "assistant",
          timestamp: msg.created_at,
          type: (msg.message_type || "text") as "text" | "image" | "file" | "human" | "ai",
        }));

        console.log(`✅ ${formattedMessages.length} mensagens carregadas para conversa ${conversationId}`);
        setMessages(formattedMessages);
        
      } catch (error) {
        console.error("❌ Erro ao buscar mensagens:", error);
        // Fallback to mock messages
        const mockMessages = generateMockMessages(conversationId);
        setMessages(mockMessages);
        
        toast({
          title: "Erro ao carregar mensagens",
          description: "Exibindo conversa de demonstração.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [toast],
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
    logger.debug("📨 Adicionando nova mensagem ao estado local:", message);
    setMessages((currentMessages) => [...currentMessages, message]);
  };

  return { messages, loading, handleNewMessage, fetchMessages };
}
