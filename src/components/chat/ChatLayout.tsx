import React from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import ConversationList from "./ConversationList";
import ChatArea from "./ChatArea";
import ClientInfoPanel from "./ClientInfoPanel";
import { Conversation, ChatMessage } from "@/types/chat";

interface ChatLayoutProps {
  conversations: Conversation[];
  filteredConversations: Conversation[];
  selectedChat: string | null;
  setSelectedChat: (id: string) => void;
  isLoading: Record<string, boolean>;
  openPauseDialog: (phoneNumber: string, e: React.MouseEvent) => void;
  startBot: (phoneNumber: string, e: React.MouseEvent) => void;
  loading: boolean;
  messages: ChatMessage[];
  handleNewMessage: (message: ChatMessage) => void;
  selectedConversation?: Conversation;
  markConversationRead: (sessionId: string) => void;
}

const ChatLayout = ({
  conversations,
  filteredConversations,
  selectedChat,
  setSelectedChat,
  isLoading,
  openPauseDialog,
  startBot,
  loading,
  messages,
  handleNewMessage,
  selectedConversation,
  markConversationRead,
}: ChatLayoutProps) => {
  const handleSelectChat = (id: string) => {
    console.log(`Selecting chat with ID: ${id}`);
    setSelectedChat(id);
    markConversationRead(id);
  };

  return (
    <div className="h-full w-full flex overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full min-w-0">
        <ResizablePanel
          defaultSize={25}
          minSize={20}
          maxSize={30}
          className="bg-white dark:bg-gray-800 min-w-0 flex-shrink-0"
        >
          <div className="h-full w-full min-w-0 overflow-hidden">
            <ConversationList
              conversations={conversations}
              filteredConversations={filteredConversations}
              selectedChat={selectedChat}
              setSelectedChat={handleSelectChat}
              isLoading={isLoading}
              openPauseDialog={openPauseDialog}
              startBot={startBot}
              loading={loading}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel
          defaultSize={50}
          minSize={40}
          className="bg-gray-50 dark:bg-gray-900 flex flex-col min-w-0 flex-1"
        >
          <div className="h-full w-full min-w-0 overflow-hidden">
            <ChatArea
              selectedChat={selectedChat}
              selectedConversation={selectedConversation}
              messages={messages}
              loading={loading}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel
          defaultSize={25}
          minSize={20}
          maxSize={30}
          className="bg-white dark:bg-gray-800 min-w-0 flex-shrink-0"
        >
          <div className="h-full w-full min-w-0 overflow-hidden">
            <ClientInfoPanel
              selectedChat={selectedChat}
              selectedConversation={selectedConversation}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default ChatLayout;
