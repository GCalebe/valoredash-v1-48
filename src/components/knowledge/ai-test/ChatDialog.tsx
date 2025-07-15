import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Send } from "lucide-react";
import { ChatMessage } from "@/hooks/useAITest";

interface ChatDialogProps {
  messages: ChatMessage[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  inputMessage: string;
  isTyping: boolean;
  onInputChange: (val: string) => void;
  onSendMessage: () => void;
  getConfidenceColor: (c: number) => string;
}

const ChatDialog: React.FC<ChatDialogProps> = ({
  messages,
  messagesEndRef,
  inputMessage,
  isTyping,
  onInputChange,
  onSendMessage,
  getConfidenceColor,
}) => (
  <Card className="h-[600px] flex flex-col">
    <CardHeader className="pb-2">
      <CardTitle className="flex items-center">
        <Bot className="h-5 w-5 mr-2" />
        Chat de Teste
      </CardTitle>
    </CardHeader>
    <CardContent className="flex-1 flex flex-col p-0">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                }`}
              >
                <div className="flex items-start gap-2 mb-2">
                  {message.type === "user" ? (
                    <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>

                {message.type === "bot" && (
                  <div className="mt-2 space-y-1">
                    {message.confidence && (
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getConfidenceColor(message.confidence)}`}
                      >
                        Confiança: {message.confidence}%
                      </Badge>
                    )}
                    {message.sources && message.sources.length > 0 && (
                      <div className="flex gap-1">
                        {message.sources.map((source, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {source}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Digite sua mensagem de teste..."
            onKeyPress={(e) => e.key === "Enter" && onSendMessage()}
            disabled={isTyping}
          />
          <Button onClick={onSendMessage} disabled={isTyping || !inputMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default ChatDialog;

