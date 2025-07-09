import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage } from '@/types/chat';
import { memoryService } from '@/lib/memoryService';
import { logger } from '@/utils/logger';

interface UseChatMessagesOptions {
  sessionId: string;
  pageSize?: number;
  initialPage?: number;
  pollingInterval?: number;
  useCache?: boolean;
}

interface UseChatMessagesResult {
  messages: ChatMessage[];
  loading: boolean;
  error: Error | null;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  refresh: () => Promise<void>;
  sendMessage: (message: Omit<ChatMessage, 'id'>) => Promise<void>;
}

/**
 * Hook otimizado para gerenciar mensagens de chat com suporte a cache e paginação
 */
export function useChatMessagesOptimized({
  sessionId,
  pageSize = 50,
  initialPage = 1,
  pollingInterval = 5000,
  useCache = true,
}: UseChatMessagesOptions): UseChatMessagesResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState<number>(initialPage);
  const [hasMore, setHasMore] = useState<boolean>(true);
  
  // Referências para controle de polling e estado atual
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const messagesRef = useRef<ChatMessage[]>(messages);
  
  // Atualizar a referência quando as mensagens mudarem
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  
  // Função para carregar mensagens
  const loadMessages = useCallback(async (currentPage: number, refresh = false) => {
    if (!sessionId) return;
    
    try {
      setLoading(true);
      
      // Buscar mensagens com paginação
      const chatMemories = await memoryService.fetchChatHistory(
        sessionId,
        pageSize,
        currentPage,
        useCache
      );
      
      // Converter memórias para formato ChatMessage
      const newMessages = chatMemories.map(memory => ({
        id: memory.id.toString(),
        content: memory.message?.content || '',
        role: memory.message?.role || 'user',
        timestamp: memory.created_at || new Date().toISOString(),
        sender: memory.message?.sender || { id: 'unknown', name: 'Unknown' },
      }));
      
      // Atualizar estado com base em refresh ou append
      if (refresh) {
        setMessages(newMessages);
      } else {
        setMessages(prev => [...prev, ...newMessages]);
      }
      
      // Verificar se há mais mensagens para carregar
      setHasMore(newMessages.length === pageSize);
      setError(null);
    } catch (err) {
      logger.error('Erro ao carregar mensagens:', err);
      setError(err instanceof Error ? err : new Error('Erro ao carregar mensagens'));
    } finally {
      setLoading(false);
    }
  }, [sessionId, pageSize, useCache]);
  
  // Função para carregar mais mensagens (paginação)
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    const nextPage = page + 1;
    await loadMessages(nextPage, false);
    setPage(nextPage);
  }, [loading, hasMore, page, loadMessages]);
  
  // Função para atualizar mensagens
  const refresh = useCallback(async () => {
    setPage(initialPage);
    await loadMessages(initialPage, true);
  }, [initialPage, loadMessages]);
  
  // Função para enviar mensagem
  const sendMessage = useCallback(async (message: Omit<ChatMessage, 'id'>) => {
    if (!sessionId) return;
    
    try {
      // Preparar mensagem para armazenamento
      const chatMemory = {
        session_id: sessionId,
        message: {
          content: message.content,
          role: message.role,
          sender: message.sender,
        },
        created_at: message.timestamp || new Date().toISOString(),
        memory_type: 'contextual' as any,
        memory_level: 'short_term' as any,
      };
      
      // Adicionar mensagem otimisticamente à UI
      const optimisticMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        ...message,
        timestamp: message.timestamp || new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      
      // Enviar mensagem para o servidor
      const result = await memoryService.storeMemory(chatMemory);
      
      if (result) {
        // Substituir mensagem temporária pela real
        setMessages(prev => 
          prev.map(msg => 
            msg.id === optimisticMessage.id 
              ? {
                  ...msg,
                  id: result.id.toString(),
                }
              : msg
          )
        );
      } else {
        // Remover mensagem otimista em caso de erro
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
        throw new Error('Falha ao enviar mensagem');
      }
    } catch (err) {
      logger.error('Erro ao enviar mensagem:', err);
      setError(err instanceof Error ? err : new Error('Erro ao enviar mensagem'));
    }
  }, [sessionId]);
  
  // Função para buscar mensagens recentes durante o polling
  const fetchLatestMessages = useCallback(async () => {
    if (!sessionId || !isMountedRef.current) return;
    
    try {
      // Buscar apenas as mensagens mais recentes
      const latestMemories = await memoryService.fetchChatHistory(
        sessionId,
        20, // Buscar apenas as 20 mais recentes
        1,
        false // Não usar cache para polling
      );
      
      // Converter para formato ChatMessage
      const latestMessages = latestMemories.map(memory => ({
        id: memory.id.toString(),
        content: memory.message?.content || '',
        role: memory.message?.role || 'user',
        timestamp: memory.created_at || new Date().toISOString(),
        sender: memory.message?.sender || { id: 'unknown', name: 'Unknown' },
      }));
      
      // Verificar se há novas mensagens
      if (latestMessages.length > 0) {
        const currentIds = new Set(messagesRef.current.map(msg => msg.id));
        const newMessages = latestMessages.filter(msg => !currentIds.has(msg.id));
        
        if (newMessages.length > 0) {
          setMessages(prev => [...prev, ...newMessages]);
        }
      }
    } catch (err) {
      logger.error('Erro no polling de mensagens:', err);
    }
  }, [sessionId]);
  
  // Função para parar o polling
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);
  
  // Função para iniciar o polling
  const startPolling = useCallback(() => {
    stopPolling();
    
    pollingRef.current = setInterval(fetchLatestMessages, pollingInterval);
  }, [fetchLatestMessages, pollingInterval, stopPolling]);
  
  // Configurar polling para novas mensagens
  useEffect(() => {
    if (!sessionId || pollingInterval <= 0) return;
    
    // Iniciar carregamento inicial e polling
    loadMessages(initialPage, true);
    startPolling();
    
    return () => {
      isMountedRef.current = false;
      stopPolling();
    };
  }, [sessionId, initialPage, pollingInterval, loadMessages, startPolling, stopPolling]);
  
  return {
    messages,
    loading,
    error,
    loadMore,
    hasMore,
    refresh,
    sendMessage,
  };
}