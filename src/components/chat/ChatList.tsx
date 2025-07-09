import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Chat, Conversation } from '@/types/chat';
import { cn } from '@/lib/utils';
import { MessageCircle, Phone } from 'lucide-react';

interface ChatListProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
}

export function ChatList({
  chats,
  selectedChat,
  onSelectChat,
  selectedConversation,
  onSelectConversation,
}: ChatListProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Conversas</h2>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {chats.map((chat) => (
            <div key={chat.id} className="mb-4">
              {/* Chat Header */}
              <Button
                variant={selectedChat?.id === chat.id ? "default" : "ghost"}
                className="w-full justify-start mb-2"
                onClick={() => onSelectChat(chat)}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {chat.client.name}
              </Button>
              
              {/* Conversations List */}
              {selectedChat?.id === chat.id && (
                <div className="ml-4 space-y-1">
                  {chat.conversations.map((conversation) => (
                    <Button
                      key={conversation.id}
                      variant={selectedConversation?.id === conversation.id ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "w-full justify-start text-left",
                        selectedConversation?.id === conversation.id && "bg-muted"
                      )}
                      onClick={() => onSelectConversation(conversation)}
                    >
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <div className="flex flex-col items-start">
                          <span className="text-sm">{conversation.name}</span>
                          {conversation.phone && (
                            <span className="text-xs text-muted-foreground">
                              {conversation.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {chats.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              Nenhuma conversa encontrada
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}