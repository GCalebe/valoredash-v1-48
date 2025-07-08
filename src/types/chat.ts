export interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  type?: "text" | "image" | "file";
}

export interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar?: string;
  phone: string;
  email?: string;
  address?: string;
  clientName?: string;
  clientSize?: string;
  clientType?: string;
  sessionId: string;
}

export interface Client {
  id: number;
  nome: string;
  telefone: string;
  email?: string;
  client_name?: string;
  client_size?: string;
  client_type?: string;
  session_id: string;
  created_at?: string;
}

export interface N8nChatHistory {
  id: number;
  session_id: string;
  message: any;
  data?: string;
  hora?: string;
}

export interface ChatMessage {
  id?: number;
  conversation_id?: string;
  phone?: string;
  user_message?: string;
  bot_message?: string;
  message_type?: string;
  created_at?: string;
  active?: boolean;
  data?: string;
  // Add properties that components expect
  content?: string;
  role?: "user" | "assistant" | "human" | "ai" | "unknown";
  type?: "text" | "image" | "file" | "human" | "ai";
  timestamp?: string;
}
