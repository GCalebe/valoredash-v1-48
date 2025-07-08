import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage, N8nChatHistory } from "@/types/chat";
import { parseMessage } from "@/utils/chatUtils";
import { fetchChatHistory, subscribeToChat } from "@/lib/chatService";
import { logger } from "@/utils/logger";
import { mockClients } from "@/mocks/clientsMock";

// Mensagens mockup para demonstração
const generateMockMessages = (sessionId: string): ChatMessage[] => {
  const client = mockClients.find((c) => c.sessionId === sessionId);
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

  // Mensagem específica baseada no tipo de cliente
  if (client.clientType === "pessoa-juridica") {
    messages.push({
      role: "human",
      content: `Minha empresa é do setor ${client.clientSector} e estamos buscando ${client.clientObjective}. Vocês têm experiência nessa área?`,
      timestamp: "14:33",
      type: "human",
    });

    messages.push({
      role: "assistant",
      content: `Perfeito! Temos bastante experiência com empresas do setor ${client.clientSector}. Para ${client.clientObjective}, temos soluções personalizadas que podem se adequar perfeitamente às suas necessidades.\n\nVocê gostaria de agendar uma reunião para conversarmos com mais detalhes? Posso apresentar cases de sucesso similares ao seu!`,
      timestamp: "14:35",
      type: "ai",
    });
  } else {
    messages.push({
      role: "human",
      content:
        client.clientObjective ||
        "Preciso de uma consultoria personalizada para minha situação.",
      timestamp: "14:33",
      type: "human",
    });

    messages.push({
      role: "assistant",
      content:
        "Entendo perfeitamente sua necessidade! Trabalhamos com consultoria personalizada para cada cliente.\n\nVou te conectar com um dos nossos especialistas. Qual seria o melhor horário para você ter uma conversa mais detalhada?",
      timestamp: "14:35",
      type: "ai",
    });
  }

  // Mensagem baseada no estágio atual
  if (client.kanbanStage === "Negociação") {
    messages.push({
      role: "human",
      content:
        "Gostei da proposta que vocês enviaram. Podemos conversar sobre os valores?",
      timestamp: "15:20",
      type: "human",
    });

    messages.push({
      role: "assistant",
      content:
        "Que ótimo que gostou da proposta! 😊\n\nVou te conectar com nosso especialista comercial para conversarmos sobre os valores e condições de pagamento. Ele pode te apresentar algumas opções que podem ser interessantes para você.",
      timestamp: "15:22",
      type: "ai",
    });
  }

  if (client.kanbanStage === "Projeto cancelado – perdido") {
    messages.push({
      role: "human",
      content:
        "Infelizmente precisamos cancelar o projeto por questões orçamentárias.",
      timestamp: "16:10",
      type: "human",
    });

    messages.push({
      role: "assistant",
      content:
        "Compreendo perfeitamente sua situação. Obrigada pela transparência!\n\nFicaremos aqui caso no futuro vocês queiram retomar o projeto. Estaremos sempre à disposição para ajudar! 🤝",
      timestamp: "16:12",
      type: "ai",
    });
  }

  // Última mensagem baseada na mensagem atual do cliente
  if (
    client.lastMessage &&
    client.lastMessage !== messages[messages.length - 1]?.content
  ) {
    messages.push({
      role: "human",
      content: client.lastMessage,
      timestamp: "Agora",
      type: "human",
    });
  }

  return messages;
};

export function useChatMessages(selectedChat: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMessages = useCallback(
    async (conversationId: string) => {
      try {
        setLoading(true);
        logger.debug(
          `Gerando mensagens mockup para a sessão ${conversationId}...`,
        );

        // Desativando busca de mensagens reais e usando apenas mensagens mockup
        logger.debug("Usando apenas mensagens mockup conforme solicitado");
        const mockMessages = generateMockMessages(conversationId);
        setMessages(mockMessages);
        logger.debug("Generated mock messages:", mockMessages.length);
      } catch (error) {
        logger.error("Error fetching messages:", error);

        // Em caso de erro, sempre tenta usar dados mockup
        const mockMessages = generateMockMessages(selectedChat || "");
        setMessages(mockMessages);

        toast({
          title: "Usando mensagens de exemplo",
          description: "Exibindo conversa de demonstração.",
        });
      } finally {
        setLoading(false);
      }
    },
    [toast, selectedChat],
  );

  // Assinatura em tempo real desativada para usar apenas dados mockup
  useEffect(() => {
    if (!selectedChat) return;

    logger.debug(
      `Assinatura em tempo real desativada para a sessão ${selectedChat}...`,
    );
    logger.debug("Usando apenas dados mockup conforme solicitado");

    // Não há necessidade de limpar assinatura, pois não estamos configurando nenhuma
    return () => {
      logger.debug(
        `Nenhuma assinatura para cancelar para a sessão ${selectedChat}...`,
      );
    };
  }, [selectedChat]);

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
