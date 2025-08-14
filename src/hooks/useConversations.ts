
// @ts-nocheck
import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Conversation } from "@/types/chat";
import { formatMessageTime } from "@/utils/chatUtils";
import { ConversationFiltersService } from "@/services/conversationFiltersService";
import { UnifiedConversationFilters } from "@/hooks/useUnifiedConversationFilters";

export function useConversations(filters?: UnifiedConversationFilters) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const filtersRef = useRef<UnifiedConversationFilters | undefined>(filters);
  const isFetchingRef = useRef<boolean>(false);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const fetchConversations = useCallback(async (overrideFilters?: UnifiedConversationFilters) => {
    try {
      if (isFetchingRef.current) {
        return;
      }
      isFetchingRef.current = true;
      setLoading(true);
      console.log("🔍 Buscando conversas da tabela unificada...");

      // First check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("❌ Usuário não autenticado");
        setConversations([]);
        setLoading(false);
        return;
      }

      console.log("👤 Usuário autenticado:", user.id);

      // Decide entre busca simples ou com aplicação de filtros no backend
      const effectiveFilters = overrideFilters ?? filtersRef.current;
      const shouldApplyServerFilters = Boolean(
        effectiveFilters && (
          effectiveFilters.hasAdvancedRules ||
          (Array.isArray(effectiveFilters.selectedTags) && effectiveFilters.selectedTags.length > 0) ||
          (effectiveFilters.segmentFilter && effectiveFilters.segmentFilter !== 'all') ||
          (Array.isArray(effectiveFilters.customFieldFilters) && effectiveFilters.customFieldFilters.length > 0)
        )
      );

      let conversationsData: any[] | null = null;
      let conversationsError: any = null;

      if (shouldApplyServerFilters) {
        const { data, error } = await ConversationFiltersService.fetchConversationsWithFilters({
          userId: user.id,
          filters: effectiveFilters,
          limit: 1000,
          offset: 0,
        });
        conversationsData = data as any[];
        if (error) conversationsError = { message: error };
      } else {
        const simple = await supabase
          .from("conversations")
          .select(`
            *,
            contact:contacts(
              id,
              name,
              email,
              phone,
              client_name,
              client_type,
              client_size,
              status,
              tags,
              budget,
              sales,
              responsible_hosts,
              kanban_stage_id,
              consultation_stage,
              last_contact
            )
          `)
          .eq("user_id", user.id)
          .order("last_message_time", { ascending: false });
        conversationsData = simple.data as any[];
        conversationsError = simple.error;
      }

      if (conversationsError) {
        console.error("Error fetching conversations:", conversationsError);
        // If conversations table fails, try contacts table as fallback
        const { data: contactsData, error: contactsError } = await supabase
          .from("contacts")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50);

        if (contactsError) {
          console.error("Error fetching contacts fallback:", contactsError);
          throw contactsError;
        }

        // Convert contacts to conversations format
      const formattedConversations: Conversation[] = (contactsData || []).map((contact, index) => ({
          id: contact.id,
          contactId: contact.id,
          name: contact.name || contact.client_name || `Cliente ${index + 1}`,
          lastMessage: contact.last_message || "Nova conversa",
          time: contact.last_message_time ? formatMessageTime(new Date(contact.last_message_time)) : formatMessageTime(new Date(contact.created_at)),
          unread: contact.unread_count || 0,
          avatar: "👤",
          phone: contact.phone || "",
          email: contact.email || "",
          address: contact.address || "",
          clientName: contact.client_name || "",
          clientSize: contact.client_size || "",
          clientType: contact.client_type || "",
          sessionId: contact.session_id || contact.id,
        }));

        console.log("📞 Fallback para dados de contatos:", formattedConversations.length);
        setConversations(formattedConversations);
        setLoading(false);
        return;
      }

      console.log("📊 Dados de conversas recebidos:", conversationsData?.length || 0);

      if (!conversationsData || conversationsData.length === 0) {
        // If no conversations exist, create some sample data or show empty state
        console.log("📝 Nenhuma conversa encontrada, criando dados de exemplo...");
        
        // Try to create a sample conversation for demonstration
        const sampleConversation = {
          user_id: user.id,
          session_id: `demo_${Date.now()}`,
          name: "Conversa de Demonstração",
          phone: "+55 11 99999-9999",
          last_message: "Olá! Esta é uma conversa de demonstração.",
          last_message_time: new Date().toISOString(),
          unread_count: 1,
          client_data: {
            client_name: "Cliente Demo",
            client_type: "Pessoa Física",
            address: "São Paulo, SP"
          }
        };

        const { data: newConversation, error: insertError } = await supabase
          .from("conversations")
          .insert(sampleConversation)
          .select()
          .single();

        if (insertError) {
          console.error("Erro ao criar conversa de exemplo:", insertError);
        } else {
          console.log("✅ Conversa de exemplo criada:", newConversation);
        }

        // Set empty state for now
        setConversations([]);
        setLoading(false);
        return;
      }

      const formattedConversations: Conversation[] = conversationsData.map((conv) => ({
        id: conv.id,
        contactId: conv.contact?.id ?? conv.contact_id ?? undefined,
        name: conv.name || conv?.contact?.name || "Cliente",
        lastMessage: conv.last_message || "",
        time: conv.last_message_time ? formatMessageTime(new Date(conv.last_message_time)) : "",
        unread: conv.unread_count || 0,
        avatar: conv.avatar || "👤",
        phone: conv.phone || conv?.contact?.phone || "",
        email: conv.email || conv?.contact?.email || "",
        address: (conv.client_data as { address?: string })?.address || "",
        clientName: conv?.contact?.client_name || (conv.client_data as { client_name?: string })?.client_name || "",
        clientSize: conv?.contact?.client_size || (conv.client_data as { client_size?: string })?.client_size || "",
        clientType: conv?.contact?.client_type || (conv.client_data as { client_type?: string })?.client_type || "",
        clientTags: conv?.contact?.tags || [],
        responsibleHosts: conv?.contact?.responsible_hosts || [],
        kanbanStageId: conv?.contact?.kanban_stage_id || undefined,
        consultationStage: conv?.contact?.consultation_stage || undefined,
        lastContact: conv?.contact?.last_contact || undefined,
        sessionId: conv.session_id || "",
      }));

      console.log("✅ Conversas formatadas:", formattedConversations.length);
      setConversations(formattedConversations);
      
    } catch (error) {
      console.error("❌ Erro ao buscar conversas:", error);
      setConversations([]);
      toast({
        title: "Erro ao carregar conversas",
        description: "Não foi possível carregar as conversas. Tentando novamente...",
        variant: "destructive",
      });
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
      console.log("🏁 Busca de conversas finalizada.");
    }
  }, [toast]);

  const updateConversationLastMessage = useCallback(async (sessionId: string) => {
    try {
      console.log(`📨 Atualizando última mensagem para sessão: ${sessionId}`);
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("❌ Usuário não autenticado para atualização");
        return;
      }

      // First try to get the latest message from n8n_chat_messages
      const { data: messageData, error: messageError } = await supabase
        .from("n8n_chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (messageError) {
        console.error("Erro ao buscar mensagens:", messageError);
        return;
      }

      if (messageData && messageData.length > 0) {
        const lastMessage = messageData[0];
        const messageContent = lastMessage.user_message || lastMessage.bot_message || "Nova mensagem";
        
        console.log(`📝 Conteúdo da última mensagem: ${messageContent}`);

        // Get current unread count first
        const { data: currentConv } = await supabase
          .from("conversations")
          .select("unread_count")
          .eq("session_id", sessionId)
          .eq("user_id", user.id)
          .single();

        const currentUnreadCount = currentConv?.unread_count || 0;

        // Update the conversation with the new message
        const { error: updateError } = await supabase
          .from("conversations")
          .update({
            last_message: messageContent,
            last_message_time: new Date().toISOString(),
            unread_count: currentUnreadCount + 1
          })
          .eq("session_id", sessionId)
          .eq("user_id", user.id);

        if (updateError) {
          console.error("Erro ao atualizar conversa:", updateError);
        } else {
          console.log(`✅ Conversa atualizada com sucesso: ${sessionId}`);
          
          // Update local state immediately
          setConversations(prev => 
            prev.map(conv => 
              conv.sessionId === sessionId 
                ? { 
                    ...conv, 
                    lastMessage: messageContent, 
                    time: formatMessageTime(new Date()),
                    unread: conv.unread + 1 
                  }
                : conv
            )
          );
        }
      }
    } catch (error) {
      console.error("❌ Erro em updateConversationLastMessage:", error);
    }
  }, []);

  // Removido o efeito interno de refetch para evitar loops; o componente pai controla quando buscar

  return {
    conversations,
    setConversations,
    loading,
    updateConversationLastMessage,
    fetchConversations,
  };
}
