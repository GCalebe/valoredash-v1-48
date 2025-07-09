import { ChatMessage, N8nChatHistory, Conversation } from "@/types/chat";

export const extractHourFromTimestamp = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error parsing timestamp:", error);
    return "";
  }
};

export const formatMessageTime = (date: Date): string => {
  const now = new Date();
  const diffInDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffInDays === 0) {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diffInDays === 1) {
    return "Ontem";
  } else if (diffInDays < 7) {
    const days = [
      "Domingo",
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta",
      "Sexta",
      "Sábado",
    ];
    return days[date.getDay()];
  } else {
    return date.toLocaleDateString("pt-BR");
  }
};

// Função auxiliar para criar uma mensagem de chat
const createChatMessage = (role: string, content: string, timestamp: string, type?: string): ChatMessage => {
  return {
    role: role as "user" | "assistant" | "human" | "ai" | "unknown",
    content,
    timestamp,
    ...(type && { type }),
  };
};

// Função auxiliar para processar mensagem em formato string
const parseStringMessage = (message: string, timestamp: string): ChatMessage[] => {
  const parsedMessages: ChatMessage[] = [];
  
  try {
    const jsonMessage = JSON.parse(message);
    if (jsonMessage.type && jsonMessage.content) {
      const role = jsonMessage.type === "human" ? "user" : "assistant";
      parsedMessages.push(createChatMessage(role, jsonMessage.content, timestamp, jsonMessage.type));
    }
  } catch (e) {
    parsedMessages.push(createChatMessage("unknown", message, timestamp));
  }
  
  return parsedMessages;
};

// Função para processar mensagem com tipo e conteúdo
const processTypeAndContent = (messageObj: any, timestamp: string): ChatMessage[] => {
  const role = messageObj.type === "human" ? "user" : "assistant";
  return [createChatMessage(role, messageObj.content, timestamp, messageObj.type)];
};

// Função para processar array de mensagens
const processMessageArray = (messages: any[], timestamp: string): ChatMessage[] => {
  const parsedMessages: ChatMessage[] = [];
  
  messages.forEach((msg: any) => {
    if (msg.role && msg.content) {
      parsedMessages.push(createChatMessage(msg.role, msg.content, timestamp));
    }
  });
  
  return parsedMessages;
};

// Função para processar mensagem com role e conteúdo
const processRoleAndContent = (messageObj: any, timestamp: string): ChatMessage[] => {
  return [createChatMessage(messageObj.role, messageObj.content, timestamp)];
};

// Função auxiliar para processar mensagem em formato objeto
const parseObjectMessage = (messageObj: any, timestamp: string): ChatMessage[] => {
  if (messageObj.type && messageObj.content) {
    return processTypeAndContent(messageObj, timestamp);
  } 
  
  if (messageObj.messages && Array.isArray(messageObj.messages)) {
    return processMessageArray(messageObj.messages, timestamp);
  } 
  
  if (messageObj.role && messageObj.content) {
    return processRoleAndContent(messageObj, timestamp);
  }
  
  return [];
};

// Função para extrair timestamp do histórico de chat
const extractTimestampFromHistory = (chatHistory: N8nChatHistory): string => {
  return chatHistory.data ? extractHourFromTimestamp(chatHistory.data) : "";
};

// Função para processar mensagem com base em seu tipo
const processMessageByType = (message: any, timestamp: string): ChatMessage[] => {
  if (typeof message === "string") {
    return parseStringMessage(message, timestamp);
  }
  
  if (message && typeof message === "object") {
    return parseObjectMessage(message, timestamp);
  }
  
  return [];
};

export const parseMessage = (chatHistory: N8nChatHistory): ChatMessage[] => {
  try {
    const timestamp = extractTimestampFromHistory(chatHistory);
    return processMessageByType(chatHistory.message, timestamp);
  } catch (error) {
    console.error("Error parsing message:", error, chatHistory);
    return [];
  }
};
