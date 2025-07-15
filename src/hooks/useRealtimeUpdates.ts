
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseRealtimeUpdatesProps {
  updateConversationLastMessage: (sessionId: string) => Promise<void>;
  fetchConversations: () => Promise<void>;
}

export function useRealtimeUpdates({
  updateConversationLastMessage,
  fetchConversations,
}: UseRealtimeUpdatesProps) {
  useEffect(() => {
    console.log("🔄 Configurando atualizações em tempo real para chat");

    // Subscribe to new messages in n8n_chat_messages
    const messagesSubscription = supabase
      .channel("n8n_chat_messages_updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "n8n_chat_messages",
        },
        (payload) => {
          console.log("📨 Nova mensagem de chat detectada:", payload);

          const sessionId = payload.new.session_id;
          console.log(`🔄 Processando mensagem para sessão: ${sessionId}`);

          // Update the conversation last message
          updateConversationLastMessage(sessionId)
            .then(() =>
              console.log(`✅ Última mensagem atualizada para conversa: ${sessionId}`)
            )
            .catch((error) =>
              console.error(`❌ Erro ao atualizar conversa: ${error}`)
            );
        },
      )
      .subscribe();

    // Subscribe to conversations table changes
    const conversationsSubscription = supabase
      .channel("conversations_updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        (payload) => {
          console.log("🔄 Mudança na tabela de conversas:", payload.eventType);
          
          // Refresh conversations list when there are changes
          fetchConversations()
            .then(() => console.log("✅ Lista de conversas atualizada"))
            .catch((error) => console.error("❌ Erro ao atualizar lista:", error));
        },
      )
      .subscribe();

    // Subscribe to contacts table changes as fallback
    const contactsSubscription = supabase
      .channel("contacts_updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "contacts",
        },
        (payload) => {
          console.log("👤 Mudança na tabela de contatos:", payload.eventType);
          
          // If conversations table is empty, this might help populate it
          fetchConversations()
            .then(() => console.log("✅ Lista de conversas atualizada via contatos"))
            .catch((error) => console.error("❌ Erro ao atualizar via contatos:", error));
        },
      )
      .subscribe();

    console.log("✅ Assinaturas de tempo real estabelecidas");

    return () => {
      console.log("🧹 Limpando assinaturas de tempo real");
      messagesSubscription.unsubscribe();
      conversationsSubscription.unsubscribe();
      contactsSubscription.unsubscribe();
    };
  }, [updateConversationLastMessage, fetchConversations]);
}
