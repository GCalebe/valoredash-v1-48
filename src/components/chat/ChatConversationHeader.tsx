import React from "react";
import { Button } from "@/components/ui/button";
import { Phone, Video, MoreVertical } from "lucide-react";
import { Conversation } from "@/types/chat";
import { useThemeSettings } from "@/context/ThemeSettingsContext";

interface ChatConversationHeaderProps {
  selectedConversation: Conversation | undefined;
}

const ChatConversationHeader = ({
  selectedConversation,
}: ChatConversationHeaderProps) => {
  const { settings } = useThemeSettings();

  return (
    <div className="flex items-center p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-xl mr-3"
        style={{
          backgroundColor: `${settings.secondaryColor}20`,
          color: settings.primaryColor,
        }}
      >
        ⚓
      </div>
      <div className="flex-1">
        <h3 className="font-medium">{selectedConversation?.name}</h3>
        <p className="text-xs" style={{ color: settings.primaryColor }}>
          Navegando em águas digitais
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <Phone size={20} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <Video size={20} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <MoreVertical size={20} />
        </Button>
      </div>
    </div>
  );
};

export default ChatConversationHeader;
