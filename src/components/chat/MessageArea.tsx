import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/types/chat";

interface MessageAreaProps {
  messages: ChatMessage[];
  loading: boolean;
}

export default function MessageArea({ messages, loading }: MessageAreaProps) {
  // Dados mockados para demonstração
  const mockMessages = [
    {
      id: "1",
      text: "Olá! Como posso ajudá-lo hoje?",
      sender: "bot",
      timestamp: "10:30",
      status: "read" as const
    },
    {
      id: "2", 
      text: "Gostaria de saber mais sobre seus produtos.",
      sender: "user",
      timestamp: "10:32",
      status: "read" as const
    },
    {
      id: "3",
      text: "Claro! Temos uma ampla gama de produtos. Qual categoria te interessa mais?",
      sender: "bot",
      timestamp: "10:33",
      status: "read" as const
    },
    {
      id: "4",
      text: "Estou interessado em soluções de automação.",
      sender: "user",
      timestamp: "10:35",
      status: "delivered" as const
    }
  ];

  const displayMessages = messages.length > 0 ? messages : mockMessages;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {displayMessages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.sender === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[70%] rounded-lg px-3 py-2 text-sm",
                message.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <p>{message.text}</p>
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-xs opacity-70">{message.timestamp}</span>
                {message.sender === "user" && (
                  <div className="text-xs">
                    {message.status === "delivered" ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <CheckCheck className="h-3 w-3" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}