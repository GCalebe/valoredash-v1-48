import React, { useState, useRef } from "react";
import { Send, Paperclip, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Conversation } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";
import { useThemeSettings } from "@/context/ThemeSettingsContext";

interface MessageInputProps {
  selectedChat: string | null;
  selectedConversation?: Conversation;
}

const MessageInput = ({
  selectedChat,
  selectedConversation,
}: MessageInputProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { settings } = useThemeSettings();

  // Common emojis for quick access
  const quickEmojis = ["😊", "👍", "❤️", "😂", "🤔", "👋", "🙏", "✅"];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || !selectedConversation?.phone)
      return;

    try {
      setIsSending(true);

      const response = await fetch(
        "https://webhook.comercial247.com.br/webhook/envia_mensagem",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: newMessage,
            phoneNumber: selectedConversation.phone,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Falha ao enviar mensagem");
      }

      setNewMessage("");

      toast({
        title: "Mensagem navegou com sucesso",
        description: "Sua mensagem foi enviada pelas águas digitais.",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Erro na navegação",
        description:
          "Não foi possível enviar sua mensagem. Tente navegar novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, just show a toast - file upload functionality would need backend implementation
      toast({
        title: "Arquivo selecionado",
        description: `Arquivo "${file.name}" pronto para envio`,
      });
    }
  };

  const addEmoji = (emoji: string) => {
    setNewMessage((prev) => prev + emoji);
  };

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  return (
    <div className="relative">
      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg z-10">
          <div className="grid grid-cols-4 gap-2">
            {quickEmojis.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                onClick={() => {
                  addEmoji(emoji);
                  setShowEmojiPicker(false);
                }}
                className="h-8 w-8 p-0 text-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>
      )}

      <form
        onSubmit={handleSendMessage}
        className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleFileClick}
            disabled={isSending}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Paperclip size={18} />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={isSending}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Smile size={18} />
          </Button>

          <Input
            placeholder="Digite sua mensagem para navegar..."
            className="flex-1"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSending}
          />

          <Button
            type="submit"
            size="icon"
            className="text-white"
            style={{ backgroundColor: settings.primaryColor }}
            disabled={isSending}
          >
            <Send size={18} />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
