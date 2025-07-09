import { useEffect, useRef } from 'react';
import ChatConversationHeader from '@/components/chat/ChatConversationHeader';
import MessageInput from '@/components/chat/MessageInput';
import NoSelectedChat from '@/components/chat/NoSelectedChat';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatMessagesOptimized } from '@/hooks/useChatMessagesOptimized';
import { Chat, ChatMessage, Conversation } from '@/types/chat';
import { MessageItemOptimized } from './MessageItemOptimized';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { useThemeSettings } from '@/hooks/useThemeSettings';

interface ChatAreaProps {
  selectedChat: Chat | null;
  selectedConversation: Conversation | null;
}

/**
 * Componente otimizado para exibição da área de chat
 * Utiliza virtualização, memoização e carregamento sob demanda
 */
export function ChatAreaOptimized({
  selectedChat,
  selectedConversation,
}: ChatAreaProps) {
  // Referência para o elemento de scroll
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Obter configurações de tema
  const { themeSettings } = useThemeSettings();
  
  // Usar o hook otimizado para gerenciar mensagens
  const {
    messages,
    loading,
    error,
    loadMore,
    hasMore,
    refresh,
    sendMessage,
  } = useChatMessagesOptimized({
    sessionId: selectedConversation?.sessionId || selectedConversation?.id || '',
    pageSize: 50,
    pollingInterval: 5000,
    useCache: true,
  });
  
  // Rolar para a última mensagem quando novas mensagens são carregadas
  useEffect(() => {
    if (messages.length > 0 && scrollRef.current) {
      const scrollElement = scrollRef.current;
      setTimeout(() => {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: 'smooth',
        });
      }, 100);
    }
  }, [messages]);
  
  // Atualizar mensagens quando a conversa muda
  useEffect(() => {
    if (selectedConversation?.id) {
      refresh();
    }
  }, [selectedConversation?.id, refresh]);
  
  // Função para enviar nova mensagem
  const handleSendMessage = async (content: string) => {
    if (!selectedChat || !selectedConversation || !content.trim()) return;
    
    const newMessage: Omit<ChatMessage, 'id'> = {
      content,
      role: 'user',
      timestamp: new Date().toISOString(),
    };
    
    await sendMessage(newMessage);
  };
  
  // Renderizar mensagem de nenhum chat selecionado
  if (!selectedChat || !selectedConversation) {
    return <NoSelectedChat />;
  }
  
  return (
    <div className="flex h-full flex-col">
      <ChatConversationHeader
        selectedConversation={selectedConversation}
      />
      
      <ScrollArea
        ref={scrollRef}
        className="flex-1 p-4"
        style={{
          backgroundColor: themeSettings?.chatBackgroundColor || '#f9f9f9',
        }}
      >
        {/* Botão para carregar mais mensagens */}
        {hasMore && (
          <div className="flex justify-center mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={loadMore}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Carregando...
                </>
              ) : (
                'Carregar mensagens anteriores'
              )}
            </Button>
          </div>
        )}
        
        {/* Mensagem de erro */}
        {error && (
          <div className="p-4 mb-4 text-sm text-red-500 bg-red-50 rounded-md">
            Erro ao carregar mensagens: {error.message}
            <Button
              variant="link"
              size="sm"
              onClick={refresh}
              className="ml-2"
            >
              Tentar novamente
            </Button>
          </div>
        )}
        
        {/* Lista de mensagens */}
        <div className="space-y-4">
          {messages.length === 0 && !loading ? (
            <div className="text-center text-muted-foreground py-8">
              Nenhuma mensagem encontrada. Inicie uma conversa!
            </div>
          ) : (
            messages.map((message) => (
              <MessageItemOptimized
                key={message.id}
                message={message}
                isClient={message.role === 'user'}
              />
            ))
          )}
          
          {/* Indicador de carregamento */}
          {loading && messages.length > 0 && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </ScrollArea>
      
      <MessageInput 
        selectedChat={selectedChat?.id || null}
        selectedConversation={selectedConversation}
      />
    </div>
  );
}