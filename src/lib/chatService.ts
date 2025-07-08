import { supabase } from "@/integrations/supabase/client";
import { N8nChatHistory } from "@/types/chat";
import { N8nChatMemory } from "@/types/memory";
import { memoryService } from "./memoryService";

/**
 * Busca o histórico de chat para uma conversa específica
 * Esta função foi atualizada para usar a nova estrutura de memória
 * mas mantém compatibilidade com o código existente
 */
export async function fetchChatHistory(conversationId: string) {
  try {
    // Usar o novo serviço de memória para buscar o histórico
    const memories = await memoryService.fetchChatHistory(conversationId);

    // Converter para o formato N8nChatHistory para manter compatibilidade
    return memories.map((memory) => ({
      id: memory.id,
      session_id: memory.session_id,
      message: memory.message,
      data: memory.data || memory.created_at,
      hora: memory.hora || memory.created_at,
    })) as N8nChatHistory[];
  } catch (error) {
    console.error("Erro ao buscar histórico de chat:", error);
    return [] as N8nChatHistory[];
  }
}

/**
 * Assina as atualizações de chat para uma conversa específica
 * Esta função foi atualizada para usar a nova estrutura de memória
 * mas mantém compatibilidade com o código existente
 */
export function subscribeToChat(
  conversationId: string,
  onInsert: (chatHistory: N8nChatHistory) => void,
) {
  try {
    // Assinar a tabela n8n_chat_memory
    const subscription = supabase
      .channel("n8n_chat_memory_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "n8n_chat_memory",
          filter: `session_id=eq.${conversationId}`,
        },
        (payload) => {
          // Converter para o formato N8nChatHistory
          const memory = payload.new as N8nChatMemory;
          const chatHistory: N8nChatHistory = {
            id: memory.id,
            session_id: memory.session_id,
            message: memory.message,
            data: memory.data || memory.created_at,
            hora: memory.hora || memory.created_at,
          };

          // Chamar o callback com o novo item
          onInsert(chatHistory);
        },
      )
      .subscribe();

    // Retornar objeto com método unsubscribe
    return {
      unsubscribe: () => {
        subscription.unsubscribe();
      },
    };
  } catch (error) {
    console.error("Erro ao assinar atualizações de chat:", error);
    // Retornar um objeto com método unsubscribe para manter a compatibilidade
    return {
      unsubscribe: () => {
        console.log("Nenhuma assinatura real para cancelar");
      },
    };
  }
}
