import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pause, Play, RefreshCw } from "lucide-react";
import { Conversation } from "@/types/chat";
import { useThemeSettings } from "@/context/ThemeSettingsContext";

interface ConversationListProps {
  conversations: Conversation[];
  selectedChat: string | null;
  setSelectedChat: (id: string) => void;
  isLoading: Record<string, boolean>;
  openPauseDialog: (phoneNumber: string, e: React.MouseEvent) => void;
  startBot: (phoneNumber: string, e: React.MouseEvent) => void;
  loading: boolean;
}

const ConversationList = ({
  conversations,
  selectedChat,
  setSelectedChat,
  isLoading,
  openPauseDialog,
  startBot,
  loading,
}: ConversationListProps) => {
  const { settings } = useThemeSettings();

  console.log("🎨 ConversationList renderizando com:");
  console.log("📊 Número de conversas:", conversations.length);
  console.log("📋 Conversas:", conversations);
  console.log("⏳ Loading:", loading);
  console.log("🎯 Chat selecionado:", selectedChat);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Conversas
          </h2>
          {loading && (
            <RefreshCw className="h-4 w-4 animate-spin text-gray-500" />
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {conversations.length} conversas ativas
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2 p-2">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Carregando conversas...
              </p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Nenhuma conversa encontrada
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Verificando logs do console para diagnóstico...
              </p>
            </div>
          ) : (
            conversations.map((conversation) => {
              console.log(
                "🔄 Renderizando conversa:",
                conversation.name,
                "ID:",
                conversation.id,
              );
              return (
                <div
                  key={conversation.id}
                  className={`relative p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                    selectedChat === conversation.id
                      ? "border-blue-300 dark:border-blue-600 shadow-sm"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  } ${
                    selectedChat === conversation.id
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => {
                    console.log("🖱️ Clicando na conversa:", conversation.id);
                    setSelectedChat(conversation.id);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {conversation.name}
                        </h3>
                        {conversation.unread > 0 && (
                          <Badge className="bg-red-500 text-white text-xs px-2 py-0.5">
                            {conversation.unread}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-1">
                        {conversation.phone}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                        {conversation.lastMessage}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {conversation.time}
                      </span>

                      {/* Bot control buttons */}
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={(e) =>
                            openPauseDialog(conversation.phone, e)
                          }
                          disabled={isLoading[`pause-${conversation.phone}`]}
                          className="h-6 px-2 text-xs"
                          style={{
                            borderColor: settings.primaryColor,
                            color: settings.primaryColor,
                          }}
                        >
                          {isLoading[`pause-${conversation.phone}`] ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <Pause className="h-3 w-3 mr-1" />
                              Pausar Aurora
                            </>
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          size="xs"
                          onClick={(e) => startBot(conversation.phone, e)}
                          disabled={isLoading[`start-${conversation.phone}`]}
                          className="h-6 px-2 text-xs"
                          style={{
                            borderColor: settings.secondaryColor,
                            color: settings.secondaryColor,
                          }}
                        >
                          {isLoading[`start-${conversation.phone}`] ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <Play className="h-3 w-3 mr-1" />
                              Iniciar Aurora
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConversationList;
