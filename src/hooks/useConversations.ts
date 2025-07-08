import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Conversation, N8nChatHistory } from "@/types/chat";
import { formatMessageTime } from "@/utils/chatUtils";
import { generateFictitiousConversations } from "@/utils/fictitiousMessages";
import { mockClients } from "@/mocks/clientsMock";

// Simple interface that avoids complex type inference
interface ClientRecord {
  asaas_customer_id?: string | null;
  client_name?: string | null;
  client_size?: string | null;
  client_type?: string | null;
  cpf_cnpj?: string | null;
  created_at?: string;
  email?: string | null;
  id: number;
  kanban_stage?: string | null;
  nome?: string | null;
  nome_pet?: string | null;
  payments?: any;
  porte_pet?: string | null;
  raca_pet?: string | null;
  session_id?: string | null;
  telefone?: string | null;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const updateConversationLastMessage = async (sessionId: string) => {
    try {
      const { data: historyData, error: historyError } = await supabase
        .from("n8n_chat_histories")
        .select("*")
        .eq("session_id", sessionId)
        .order("id", { ascending: false })
        .limit(1);

      if (historyError) throw historyError;

      if (historyData && historyData.length > 0) {
        const chatHistory = historyData[0] as N8nChatHistory;

        setConversations((currentConversations) => {
          return currentConversations.map((conv) => {
            if (conv.id === sessionId) {
              let lastMessageContent = "Sem mensagem";
              if (chatHistory.message) {
                if (typeof chatHistory.message === "string") {
                  try {
                    const jsonMessage = JSON.parse(chatHistory.message);
                    if (jsonMessage.type && jsonMessage.content) {
                      lastMessageContent = jsonMessage.content;
                    }
                  } catch (e) {
                    lastMessageContent = chatHistory.message;
                  }
                } else if (typeof chatHistory.message === "object") {
                  if (
                    chatHistory.message.messages &&
                    Array.isArray(chatHistory.message.messages)
                  ) {
                    const lastMsg =
                      chatHistory.message.messages[
                        chatHistory.message.messages.length - 1
                      ];
                    lastMessageContent = lastMsg?.content || "Sem mensagem";
                  } else if (
                    chatHistory.message.type &&
                    chatHistory.message.content
                  ) {
                    lastMessageContent = chatHistory.message.content;
                  } else if (chatHistory.message.content) {
                    lastMessageContent = chatHistory.message.content;
                  }
                }
              }

              // Use hora field if available, otherwise fall back to data field
              const messageDate = chatHistory.hora
                ? new Date(chatHistory.hora)
                : chatHistory.data
                  ? new Date(chatHistory.data)
                  : new Date();

              return {
                ...conv,
                lastMessage: lastMessageContent || "Sem mensagem",
                time: formatMessageTime(messageDate),
                unread: conv.unread + 1,
              };
            }
            return conv;
          });
        });
      }
    } catch (error) {
      console.error("Error updating conversation last message:", error);
    }
  };

  const createConversationFromClient = (client: ClientRecord): Conversation => {
    // Handle missing or null session_id safely
    const sessionId = client.session_id || `fallback_${client.id}`;

    return {
      id: sessionId,
      name: client.nome || "Cliente sem nome",
      lastMessage: "Carregando mensagem...",
      time: "...",
      unread: 0,
      avatar: "👤",
      phone: client.telefone || "Não informado",
      email: client.email || "Sem email",
      address: "Não informado",
      clientName: client.client_name || "Não informado",
      clientSize: client.client_size || "Não informado",
      clientType: client.client_type || "Não informado",
      sessionId: sessionId,
    };
  };

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      console.log("🔍 Buscando conversas...");

      // Desativando busca do Supabase e usando apenas dados mockup
      console.log("Usando apenas dados mockup conforme solicitado");

      // Garantir que todos os clientes mockup tenham sessionId
      const clientsWithSessionId = mockClients.map((client) => {
        if (!client.sessionId) {
          return {
            ...client,
            sessionId: `session_${client.id}`,
          };
        }
        return client;
      });

      const mockConversations =
        generateFictitiousConversations(clientsWithSessionId);
      const conversationsData: Conversation[] = mockConversations.map(
        (client) => ({
          id: client.sessionId || `session_${client.id}`,
          name: client.name,
          lastMessage: client.lastMessage || "Mensagem de exemplo",
          time: client.lastMessageTime || "2 min",
          unread: client.unreadCount || 0,
          avatar: "👤",
          phone: client.phone,
          email: client.email || "Sem email",
          address: client.address || "Não informado",
          clientName: client.clientName || "Não informado",
          clientSize: client.clientSize || "Não informado",
          clientType: client.clientType || "Não informado",
          sessionId: client.sessionId || `session_${client.id}`,
        }),
      );

      console.log("🎉 Conversas mockup criadas:", conversationsData.length);
      setConversations(conversationsData);
      setLoading(false);
      return;

      // Todo o código de busca no Supabase foi removido para usar apenas dados mockup

      // Todo o código de busca no Supabase foi removido para usar apenas dados mockup

      // Todo o código de busca no Supabase foi removido para usar apenas dados mockup
    } catch (error) {
      console.error("❌ Erro geral ao buscar conversas:", error);

      // ... keep existing code (general error fallback to mock)
      // Garantir que todos os clientes mockup tenham sessionId
      const clientsWithSessionId = mockClients.map((client) => {
        if (!client.sessionId) {
          return {
            ...client,
            sessionId: `session_${client.id}`,
          };
        }
        return client;
      });

      const mockConversations =
        generateFictitiousConversations(clientsWithSessionId);
      const conversationsData: Conversation[] = mockConversations.map(
        (client) => ({
          id: client.sessionId || `session_${client.id}`,
          name: client.name,
          lastMessage: client.lastMessage || "Mensagem de exemplo",
          time: client.lastMessageTime || "2 min",
          unread: client.unreadCount || 0,
          avatar: "👤",
          phone: client.phone,
          email: client.email || "Sem email",
          address: client.address || "Não informado",
          clientName: client.clientName || "Não informado",
          clientSize: client.clientSize || "Não informado",
          clientType: client.clientType || "Não informado",
          sessionId: client.sessionId || `session_${client.id}`,
        }),
      );

      console.log(
        "🎉 Conversas mockup criadas (erro geral):",
        conversationsData.length,
      );
      setConversations(conversationsData);

      toast({
        title: "Usando dados de exemplo",
        description:
          "Não foi possível conectar ao banco de dados. Exibindo conversas de exemplo.",
      });
    } finally {
      setLoading(false);
      console.log("🏁 Busca de conversas finalizada.");
    }
  }, [toast]);

  useEffect(() => {
    console.log("🚀 useConversations: Iniciando carregamento inicial");
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
