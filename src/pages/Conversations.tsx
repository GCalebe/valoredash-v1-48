
// @ts-nocheck

"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// Hooks para integração com banco de dados
import { useConversations } from "@/hooks/useConversations";
import { useChatMessages } from "@/hooks/useChatMessages";
// import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";
import { useToast } from "@/hooks/use-toast";
import { useConversationFilters } from "@/hooks/useConversationFilters";
import { Conversation as DBConversation, ChatMessage } from "@/types/chat";

// Componentes refatorados
import ConversationListPanel from "@/components/chat/ConversationListPanel";
import ConversationHeader from "@/components/chat/ConversationHeader";
import MessageArea from "@/components/chat/MessageArea";
import MessageInput from "@/components/chat/MessageInput";
import ContactInfo from "@/components/chat/ContactInfo";
import ResizeHandle from "@/components/chat/ResizeHandle";
import ConversationFilterDialog from "@/components/chat/ConversationFilterDialog";

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

interface ConversationLayoutProps {
  contacts: Contact[];
  selectedContactId?: string;
  onContactSelect: (contactId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterClick: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  messages: ChatMessage[];
  messagesLoading: boolean;
  className?: string;
}

function ConversationLayout({
  contacts,
  selectedContactId,
  onContactSelect,
  searchQuery,
  onSearchChange,
  onFilterClick,
  activeTab,
  onTabChange,
  sortBy,
  onSortChange,
  messages,
  messagesLoading,
  className,
}: ConversationLayoutProps) {
  const [leftPanelWidth, setLeftPanelWidth] = useState(320);
  const [rightPanelWidth, setRightPanelWidth] = useState(320);
  const [isResizing, setIsResizing] = useState<'left' | 'right' | null>(null);
  
  const handleMouseDown = (panel: 'left' | 'right') => {
    setIsResizing(panel);
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    if (isResizing === 'left') {
      const newWidth = Math.max(250, Math.min(500, e.clientX));
      setLeftPanelWidth(newWidth);
    } else if (isResizing === 'right') {
      const newWidth = Math.max(250, Math.min(500, window.innerWidth - e.clientX));
      setRightPanelWidth(newWidth);
    }
  };
  
  const handleMouseUp = () => {
    setIsResizing(null);
  };
  
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const selectedContactData = contacts.find(c => c.id === selectedContactId);

  const handleSendMessage = (message: string) => {
    // TODO: Implementar envio de mensagem
    console.log('Enviando mensagem:', message);
  };

  return (
    <div className={cn("flex h-screen bg-background", className)}>
      {/* Left Panel - Conversation List */}
      <ConversationListPanel
        contacts={contacts}
        selectedContactId={selectedContactId}
        onContactSelect={onContactSelect}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onFilterClick={onFilterClick}
        activeTab={activeTab}
        onTabChange={onTabChange}
        sortBy={sortBy}
        onSortChange={onSortChange}
        getStatusColor={getStatusColor}
        width={leftPanelWidth}
      />

      {/* Left Resize Handle */}
      <ResizeHandle onMouseDown={() => handleMouseDown('left')} />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedContactData ? (
          <>
            {/* Chat Header */}
            <ConversationHeader 
              contact={selectedContactData}
              getStatusColor={getStatusColor}
            />

            {/* Messages Area */}
            <MessageArea 
              messages={messages}
              loading={messagesLoading}
            />

            {/* Message Input */}
            <MessageInput 
              onSendMessage={handleSendMessage}
              disabled={messagesLoading}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Selecione uma conversa</h3>
              <p className="text-muted-foreground">Escolha uma conversa da lista para começar a conversar</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Resize Handle */}
      {selectedContactData && (
        <ResizeHandle onMouseDown={() => handleMouseDown('right')} />
      )}

      {/* Right Panel - Contact Info */}
      {selectedContactData && (
        <ContactInfo 
          contact={selectedContactData}
          getStatusColor={getStatusColor}
          width={rightPanelWidth}
        />
      )}
    </div>
  );
}

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
  const filters = useConversationFilters();
  
  // TODO: Configurar atualizações em tempo real
  // useRealtimeUpdates({ updateConversationLastMessage, fetchConversations });
  
  // Carregar conversas ao montar o componente
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);
  
  // Converter conversas do banco para o formato do componente
  const contacts: Contact[] = conversations.map(convertDBConversationToContact);
  
  const filteredContacts = contacts.filter(contact => {
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
        <ConversationFilterDialog
          isOpen={filterDialogOpen}
          onOpenChange={setFilterDialogOpen}
          statusFilter={filters.statusFilter}
          segmentFilter={filters.segmentFilter}
          lastContactFilter={filters.lastContactFilter}
          unreadFilter={filters.unreadFilter}
          lastMessageFilter={filters.lastMessageFilter}
          clientTypeFilter={filters.clientTypeFilter}
          customFieldFilters={filters.customFieldFilters}
          onStatusFilterChange={filters.setStatusFilter}
          onSegmentFilterChange={filters.setSegmentFilter}
          onLastContactFilterChange={filters.setLastContactFilter}
          onUnreadFilterChange={filters.setUnreadFilter}
          onLastMessageFilterChange={filters.setLastMessageFilter}
          onClientTypeFilterChange={filters.setClientTypeFilter}
          onAddCustomFieldFilter={filters.addCustomFieldFilter}
          onRemoveCustomFieldFilter={filters.removeCustomFieldFilter}
          onClearFilters={() => filters.clearAll()}
          onClearCustomFieldFilters={() => filters.clearAll("customFields")}
          hasActiveFilters={filters.hasActiveFilters}
        />
      </>
    );
  }
  
  return (
    <>
      <ConversationLayout 
        contacts={filteredContacts}
        selectedContactId={selectedContact?.id}
        onContactSelect={handleContactSelect}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterClick={() => setFilterDialogOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sortBy={sortBy}
        onSortChange={setSortBy}
        messages={messages}
        messagesLoading={messagesLoading}
      />
      
      {/* Filter Dialog */}
      <ConversationFilterDialog
        isOpen={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        statusFilter={filters.statusFilter}
        segmentFilter={filters.segmentFilter}
        lastContactFilter={filters.lastContactFilter}
        unreadFilter={filters.unreadFilter}
        lastMessageFilter={filters.lastMessageFilter}
        clientTypeFilter={filters.clientTypeFilter}
        customFieldFilters={filters.customFieldFilters}
        onStatusFilterChange={filters.setStatusFilter}
        onSegmentFilterChange={filters.setSegmentFilter}
        onLastContactFilterChange={filters.setLastContactFilter}
        onUnreadFilterChange={filters.setUnreadFilter}
        onLastMessageFilterChange={filters.setLastMessageFilter}
        onClientTypeFilterChange={filters.setClientTypeFilter}
        onAddCustomFieldFilter={filters.addCustomFieldFilter}
        onRemoveCustomFieldFilter={filters.removeCustomFieldFilter}
        onClearFilters={() => filters.clearAll()}
        onClearCustomFieldFilters={() => filters.clearAll("customFields")}
        hasActiveFilters={filters.hasActiveFilters}
      />
    </>
  );
}

