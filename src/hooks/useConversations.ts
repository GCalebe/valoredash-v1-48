import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Conversation, N8nChatHistory } from "@/types/chat";
import { formatMessageTime } from "@/utils/chatUtils";
import { generateFictitiousConversations } from "@/utils/fictitiousMessages";
import { useContactsQuery } from "./useContactsQuery";

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
  const { data: supabaseContacts = [], isLoading: contactsLoading, refetch: fetchContacts } = useContactsQuery();

  // Extrai o conteúdo da última mensagem com base no tipo de dados
  const extractLastMessageContent = (message: any): string => {
    let lastMessageContent = "Sem mensagem";
    
    if (!message) return lastMessageContent;
    
    if (typeof message === "string") {
      try {
        const jsonMessage = JSON.parse(message);
        if (jsonMessage.type && jsonMessage.content) {
          return jsonMessage.content;
        }
      } catch (e) {
        return message;
      }
    } else if (typeof message === "object") {
      if (message.messages && Array.isArray(message.messages)) {
        const lastMsg = message.messages[message.messages.length - 1];
        return lastMsg?.content || "Sem mensagem";
      } else if (message.type && message.content) {
        return message.content;
      } else if (message.content) {
        return message.content;
      }
    }
    
    return lastMessageContent;
  };

  // Determina a data da mensagem a partir dos campos disponíveis
  const getMessageDate = (chatHistory: N8nChatHistory): Date => {
    if (chatHistory.hora) return new Date(chatHistory.hora);
    if (chatHistory.data) return new Date(chatHistory.data);
    return new Date();
  };

  // Atualiza uma conversa específica com a última mensagem
  const updateConversationWithLastMessage = (currentConversations: Conversation[], sessionId: string, lastMessageContent: string, messageDate: Date): Conversation[] => {
    return currentConversations.map((conv) => {
      if (conv.id === sessionId) {
        return {
          ...conv,
          lastMessage: lastMessageContent || "Sem mensagem",
          time: formatMessageTime(messageDate),
          unread: conv.unread + 1,
        };
      }
      return conv;
    });
  };

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
        const lastMessageContent = extractLastMessageContent(chatHistory.message);
        const messageDate = getMessageDate(chatHistory);

        setConversations((currentConversations) => {
          return updateConversationWithLastMessage(currentConversations, sessionId, lastMessageContent, messageDate);
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

  // Converte contato do Supabase para conversa
  const createConversationFromSupabaseContact = (contact: any): Conversation => {
    const sessionId = contact.session_id || `session_${contact.id}`;
    
    return {
      id: sessionId,
      name: contact.nome || contact.client_name || "Cliente sem nome",
      lastMessage: "Última mensagem...",
      time: "agora",
      unread: 0,
      avatar: "👤",
      phone: contact.telefone || "Não informado",
      email: contact.email || "Sem email",
      address: "Não informado",
      clientName: contact.client_name || "Não informado",
      clientSize: contact.client_size || "Não informado",
      clientType: contact.client_type || "Não informado",
      sessionId: sessionId,
    };
  };

  // Adiciona sessionId aos clientes mockup que não possuem
  const ensureClientSessionIds = (clients: any[]): any[] => {
    return clients.map((client) => {
      if (!client.sessionId) {
        return {
          ...client,
          sessionId: `session_${client.id}`,
        };
      }
      return client;
    });
  };

  // Converte um cliente mockup para o formato de conversa
  const convertClientToConversation = (client: any): Conversation => ({
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
  });

  // Cria conversas vazias quando não há dados do Supabase
  const createEmptyConversations = (): Conversation[] => {
    return [];
  };

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      console.log("🔍 Buscando conversas do Supabase...");

      // Contatos são carregados automaticamente pelo React Query
      
      // Se temos contatos do Supabase, usar eles
      if (supabaseContacts && supabaseContacts.length > 0) {
        console.log("📞 Criando conversas a partir dos contatos do Supabase:", supabaseContacts.length);
        const conversationsFromSupabase = supabaseContacts.map(createConversationFromSupabaseContact);
        setConversations(conversationsFromSupabase);
        
        // Atualizar última mensagem para cada conversa
        for (const conversation of conversationsFromSupabase) {
          await updateConversationLastMessage(conversation.sessionId);
        }
        
        console.log("🎉 Conversas do Supabase carregadas:", conversationsFromSupabase.length);
        return;
      }

      // Fallback: usar dados vazios se não há contatos no Supabase
      console.log("📋 Nenhum contato encontrado no Supabase");
      const conversationsData = createEmptyConversations();
      console.log("🎉 Lista de conversas vazia criada:", conversationsData.length);
      setConversations(conversationsData);
      
    } catch (error) {
      console.error("❌ Erro geral ao buscar conversas:", error);

      // Fallback para dados vazios em caso de erro
      const conversationsData = createEmptyConversations();
      console.log(
        "🎉 Lista de conversas vazia criada (erro geral):",
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

  // Effect para carregamento inicial
  useEffect(() => {
    console.log("🚀 useConversations: Iniciando carregamento inicial");
    fetchConversations();
  }, [fetchConversations]);

  // Effect separado para reagir às mudanças dos contatos do Supabase
  useEffect(() => {
    if (!contactsLoading && supabaseContacts) {
      fetchConversations();
    }
  }, [supabaseContacts, contactsLoading, fetchConversations]);

  return {
    conversations,
    setConversations,
    loading,
    updateConversationLastMessage,
    fetchConversations,
  };
}
