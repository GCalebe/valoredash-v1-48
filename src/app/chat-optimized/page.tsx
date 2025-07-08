'use client';

import { useState, useEffect } from 'react';
import { ChatAreaOptimized } from '@/components/chat/ChatAreaOptimized';
import { ChatList } from '@/components/chat/ChatList';
import { Chat, Conversation } from '@/types/chat';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { logger } from '@/utils/logger';

/**
 * Página otimizada de chat que demonstra as melhorias de performance
 */
export default function ChatOptimizedPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para formatar os dados de chat recebidos do Supabase
  const formatChatData = (data: any[]): Chat[] => {
    return data.map((chat) => ({
      id: chat.id,
      client: {
        id: chat.client.id,
        name: chat.client.name,
        email: chat.client.email,
      },
      conversations: chat.conversations.map((conv: any) => ({
        id: conv.id,
        name: conv.name,
        created_at: conv.created_at,
      })),
    }));
  };

  // Função para selecionar o chat e conversa iniciais
  const selectInitialChatAndConversation = (chats: Chat[]) => {
    if (chats.length > 0) {
      const firstChat = chats[0];
      setSelectedChat(firstChat);
      
      if (firstChat.conversations.length > 0) {
        setSelectedConversation(firstChat.conversations[0]);
      }
    }
  };

  // Função para buscar chats do Supabase
  const fetchChatsFromSupabase = async () => {
    const { data, error } = await supabase
      .from('n8n_chats')
      .select(`
        id,
        client:n8n_clients!n8n_chats_client_id_fkey(id, name, email),
        conversations:n8n_conversations!n8n_chats_id_fkey(id, name, created_at)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  };

  // Função principal para carregar chats
  const loadChats = async () => {
    try {
      setLoading(true);
      
      const data = await fetchChatsFromSupabase();
      const formattedChats = formatChatData(data);
      
      setChats(formattedChats);
      selectInitialChatAndConversation(formattedChats);
      setError(null);
    } catch (err) {
      logger.error('Erro ao carregar chats:', err);
      setError('Falha ao carregar chats. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Carregar chats ao montar o componente
  useEffect(() => {
    loadChats();
    
    // Configurar subscription para atualizações em tempo real
    const subscription = supabase
      .channel('n8n_chats_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'n8n_chats' }, loadChats)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Manipular seleção de chat
  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    
    // Selecionar primeira conversa por padrão
    if (chat.conversations.length > 0) {
      setSelectedConversation(chat.conversations[0]);
    } else {
      setSelectedConversation(null);
    }
  };

  // Manipular seleção de conversa
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  // Renderizar estado de carregamento
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando chats...</span>
      </div>
    );
  }

  // Renderizar mensagem de erro
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="p-4 bg-red-50 text-red-500 rounded-md">
          <p>{error}</p>
          <button
            className="mt-2 px-4 py-2 bg-primary text-white rounded-md"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Barra lateral com lista de chats */}
      <div className="w-80 border-r">
        <ChatList
          chats={chats}
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
        />
      </div>
      
      {/* Área principal de chat otimizada */}
      <div className="flex-1">
        <ChatAreaOptimized
          selectedChat={selectedChat}
          selectedConversation={selectedConversation}
        />
      </div>
      
      {/* Indicador de versão otimizada */}
      <div className="absolute bottom-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
        Versão Otimizada
      </div>
    </div>
  );
}