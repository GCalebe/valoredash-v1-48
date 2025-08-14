// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import ConversationListPanel from '@/components/chat/ConversationListPanel';
import ConversationHeader from '@/components/chat/ConversationHeader';
import MessageArea from '@/components/chat/MessageArea';
import MessageInput from '@/components/chat/MessageInput';
import ContactInfo from '@/components/chat/ContactInfo';
import ResizeHandle from '@/components/chat/ResizeHandle';

export interface ContactMinimal {
  id: string; // id da conversa
  contactId?: string; // id real do contato na tabela contacts
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isOnline: boolean;
  status?: 'online' | 'away' | 'offline';
  phone?: string;
  email?: string;
  sessionId?: string;
}

export interface ConversationLayoutProps {
  contacts: ContactMinimal[];
  selectedContactId?: string;
  onContactSelect: (contactId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterClick: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  messages: any[];
  messagesLoading: boolean;
  className?: string;
  getStatusColor: (status?: string) => string;
}

const ConversationLayout: React.FC<ConversationLayoutProps> = ({
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
  getStatusColor,
}) => {
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

  const selectedContactData = contacts.find((c) => c.id === selectedContactId);

  const handleSendMessage = (message: string) => {
    // TODO: integrar envio
    console.log('Enviando mensagem:', message);
  };

  return (
    <div className={cn('flex h-screen bg-background', className)}>
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

      <ResizeHandle onMouseDown={() => handleMouseDown('left')} />

      <div className="flex-1 flex flex-col min-w-0">
        {selectedContactData ? (
          <>
            <ConversationHeader contact={selectedContactData} getStatusColor={getStatusColor} />
            <MessageArea messages={messages} loading={messagesLoading} />
            <MessageInput onSendMessage={handleSendMessage} disabled={messagesLoading} />
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

      {selectedContactData && <ResizeHandle onMouseDown={() => handleMouseDown('right')} />}

      {selectedContactData && (
        <ContactInfo
          contact={selectedContactData}
          getStatusColor={getStatusColor}
          width={rightPanelWidth}
          onTagsChange={(newTags) => {
            // Atualiza o objeto local para refletir tags também na lista, se necessário
            // Nota: se a lista que alimenta contacts não usa tags, não terá efeito visual, mas mantemos consistência
            // Este set é feito no pai via setState quando necessário; aqui apenas log para debug
            console.log("Tags atualizadas no header:", newTags);
          }}
        />
      )}
    </div>
  );
};

export default ConversationLayout;


