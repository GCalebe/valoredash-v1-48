
// @ts-nocheck

"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// Hooks para integração com banco de dados
import { useConversations } from "@/hooks/useConversations";
import { useChatMessages } from "@/hooks/useChatMessages";
// import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";
import { useToast } from "@/hooks/use-toast";
import { useUnifiedConversationFilters } from "@/hooks/useUnifiedConversationFilters";
import { useConversationTableFilters } from "@/hooks/useConversationTableFilters";
import { Conversation as DBConversation, ChatMessage } from "@/types/chat";

// Componentes refatorados
import ConversationLayout from "@/components/chat/ConversationLayout";
import { ConversationFilterBuilder } from "@/components/conversations/filters/ConversationFilterBuilder";

// Adaptador para converter dados do banco para a interface do componente
interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isOnline: boolean;
  status?: "online" | "away" | "offline";
  phone?: string;
  email?: string;
  sessionId?: string;
}

// Função para converter conversas do banco para o formato do componente
const convertDBConversationToContact = (conversation: DBConversation): Contact => {
  return {
    id: conversation.id,
    name: conversation.name || conversation.clientName || 'Cliente',
    avatar: conversation.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${conversation.name}`,
    lastMessage: conversation.lastMessage || 'Nova conversa',
    timestamp: conversation.time,
    unreadCount: conversation.unread || 0,
    isOnline: Math.random() > 0.5, // Simulação de status online
    status: Math.random() > 0.5 ? 'online' : 'away',
    phone: conversation.phone,
    email: conversation.email,
    sessionId: conversation.sessionId
  };
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case "online": return "bg-green-500";
    case "away": return "bg-yellow-500";
    case "offline": return "bg-gray-400";
    default: return "bg-gray-400";
  }
};

// Layout movido para componente próprio em components/chat/ConversationLayout

export default function Conversations() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  
  // Hooks para integração com banco de dados
  const { conversations, loading: conversationsLoading, fetchConversations } = useConversations();
  const { messages, loading: messagesLoading } = useChatMessages(selectedContact?.sessionId || null);
  const { toast } = useToast();
  const filters = useUnifiedConversationFilters();
  
  // TODO: Configurar atualizações em tempo real
  // useRealtimeUpdates({ updateConversationLastMessage, fetchConversations });
  
  // Carregar conversas ao montar o componente
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);
  
  // Use the filtered conversations
  const { filteredConversations } = useConversationTableFilters({
    conversations,
    filters,
  });
  
  // Converter conversas filtradas para o formato do componente
  const contacts: Contact[] = filteredConversations.map(convertDBConversationToContact);
  
  // Apply search and tab filters on top of the unified filters
  const finalFilteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === "all" || 
                      (activeTab === "unread" && contact.unreadCount && contact.unreadCount > 0) ||
                      (activeTab === "online" && contact.isOnline);
    
    return matchesSearch && matchesTab;
  }).sort((a, b) => {
    if (sortBy === "recent") {
      return b.timestamp.localeCompare(a.timestamp);
    } else if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "unread") {
      return (b.unreadCount || 0) - (a.unreadCount || 0);
    }
    return 0;
  });
  
  const handleContactSelect = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    setSelectedContact(contact || null);
  };
  
  if (conversationsLoading) {
    return (
      <>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando conversas...</p>
          </div>
        </div>
        
        {/* Filter Dialog */}
        <ConversationFilterBuilder
          isOpen={filterDialogOpen}
          onClose={() => setFilterDialogOpen(false)}
          filters={filters}
        />
      </>
    );
  }
  
  return (
    <>
      <ConversationLayout 
        contacts={finalFilteredContacts}
        selectedContactId={selectedContact?.id}
        onContactSelect={handleContactSelect}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterClick={() => setFilterDialogOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sortBy={sortBy}
        onSortChange={setSortBy}
        getStatusColor={getStatusColor}
        messages={messages}
        messagesLoading={messagesLoading}
      />
      
      {/* Filter Dialog */}
      <ConversationFilterBuilder
        isOpen={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        filters={filters}
      />
    </>
  );
}

