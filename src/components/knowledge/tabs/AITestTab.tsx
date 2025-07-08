import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, RotateCcw, Download, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: number;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  confidence?: number;
  sources?: string[];
}

interface TestMetrics {
  totalMessages: number;
  averageResponseTime: number;
  confidenceAverage: number;
  successfulResponses: number;
}

const AITestTab = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      type: "bot",
      content:
        "Olá! Sou o Assistente Virtual e estou aqui para ajudá-lo. Como posso auxiliá-lo hoje?",
      timestamp: new Date(),
      confidence: 100,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [testMode, setTestMode] = useState<"manual" | "batch">("manual");
  const [batchQuestions, setBatchQuestions] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [metrics, setMetrics] = useState<TestMetrics>({
    totalMessages: 1,
    averageResponseTime: 0,
    confidenceAverage: 100,
    successfulResponses: 1,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateAIResponse = async (
    userMessage: string,
  ): Promise<ChatMessage> => {
    // Simulate API delay
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 2000),
    );

    // Simulate different types of responses based on input
    const responses = [
      {
        content:
          "Entendi sua pergunta. Com base nas informações da nossa base de conhecimento, posso ajudá-lo com isso.",
        confidence: 95,
        sources: ["Base de Conhecimento", "FAQ"],
      },
      {
        content:
          "Essa é uma excelente pergunta! Deixe-me verificar as informações mais atualizadas para você.",
        confidence: 88,
        sources: ["Documentos", "Website"],
      },
      {
        content:
          "Posso ajudá-lo com isso. Aqui está a informação que você precisa...",
        confidence: 92,
        sources: ["FAQ", "Documentos"],
      },
      {
        content:
          "Desculpe, não tenho informações suficientes sobre isso. Gostaria que eu transfira você para um especialista?",
        confidence: 45,
        sources: [],
      },
    ];

    const randomResponse =
      responses[Math.floor(Math.random() * responses.length)];

    return {
      id: Date.now(),
      type: "bot",
      content: randomResponse.content,
      timestamp: new Date(),
      confidence: randomResponse.confidence,
      sources: randomResponse.sources,
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const startTime = Date.now();
      const botResponse = await simulateAIResponse(inputMessage);
      const responseTime = Date.now() - startTime;

      setMessages((prev) => [...prev, botResponse]);

      // Update metrics
      setMetrics((prev) => {
        const newTotal = prev.totalMessages + 2;
        const newAvgResponseTime =
          (prev.averageResponseTime * (prev.totalMessages - 1) + responseTime) /
          (newTotal - 1);
        const newAvgConfidence =
          (prev.confidenceAverage * (prev.totalMessages - 1) +
            (botResponse.confidence || 0)) /
          (newTotal - 1);
        const newSuccessful =
          (botResponse.confidence || 0) > 70
            ? prev.successfulResponses + 1
            : prev.successfulResponses;

        return {
          totalMessages: newTotal,
          averageResponseTime: newAvgResponseTime,
          confidenceAverage: newAvgConfidence,
          successfulResponses: newSuccessful,
        };
      });
    } catch (error) {
      toast({
        title: "Erro no teste",
        description: "Não foi possível processar a mensagem.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleBatchTest = async () => {
    if (!batchQuestions.trim()) return;

    const questions = batchQuestions.split("\n").filter((q) => q.trim());

    for (const question of questions) {
      setInputMessage(question);
      await handleSendMessage();
      // Small delay between messages
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setBatchQuestions("");
    toast({
      title: "Teste em lote concluído",
      description: `${questions.length} perguntas foram testadas.`,
    });
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: "bot",
        content:
          "Olá! Sou o Assistente Virtual e estou aqui para ajudá-lo. Como posso auxiliá-lo hoje?",
        timestamp: new Date(),
        confidence: 100,
      },
    ]);
    setMetrics({
      totalMessages: 1,
      averageResponseTime: 0,
      confidenceAverage: 100,
      successfulResponses: 1,
    });
  };

  const exportChatLog = () => {
    const chatLog = messages.map((msg) => ({
      timestamp: msg.timestamp.toISOString(),
      type: msg.type,
      content: msg.content,
      confidence: msg.confidence,
      sources: msg.sources,
    }));

    const dataStr = JSON.stringify(chatLog, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `chat-log-${
      new Date().toISOString().split("T")[0]
    }.json`;
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Log exportado",
      description: "Histórico do chat foi baixado com sucesso!",
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80)
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    if (confidence >= 60)
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
            Área de Teste da IA
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Teste e avalie o desempenho da IA em tempo real
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={clearChat}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Limpar
          </Button>
          <Button variant="outline" onClick={exportChatLog}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {metrics.totalMessages}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total de Mensagens
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {Math.round(metrics.averageResponseTime)}ms
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tempo Médio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {Math.round(metrics.confidenceAverage)}%
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Confiança Média
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {Math.round(
                (metrics.successfulResponses /
                  Math.max(Math.floor(metrics.totalMessages / 2), 1)) *
                  100,
              )}
              %
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Taxa de Sucesso
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-2">
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
                      className={`flex ${
                        message.type === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
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
                                className={`text-xs ${getConfidenceColor(
                                  message.confidence,
                                )}`}
                              >
                                Confiança: {message.confidence}%
                              </Badge>
                            )}
                            {message.sources && message.sources.length > 0 && (
                              <div className="flex gap-1">
                                {message.sources.map((source, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs"
                                  >
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

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4" />
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>

              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Digite sua mensagem de teste..."
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    disabled={isTyping}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isTyping || !inputMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Controles de Teste
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Modo de Teste</label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={testMode === "manual" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTestMode("manual")}
                  >
                    Manual
                  </Button>
                  <Button
                    variant={testMode === "batch" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTestMode("batch")}
                  >
                    Lote
                  </Button>
                </div>
              </div>

              {testMode === "batch" && (
                <div>
                  <label className="text-sm font-medium">
                    Perguntas para Teste em Lote
                  </label>
                  <Textarea
                    value={batchQuestions}
                    onChange={(e) => setBatchQuestions(e.target.value)}
                    placeholder="Digite uma pergunta por linha&#10;Exemplo:&#10;Qual o horário de funcionamento?&#10;Como faço um agendamento?&#10;Quais são os valores?"
                    rows={6}
                    className="mt-2"
                  />
                  <Button
                    onClick={handleBatchTest}
                    disabled={!batchQuestions.trim()}
                    className="w-full mt-2"
                  >
                    Executar Teste em Lote
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Perguntas Sugeridas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  "Qual o horário de funcionamento?",
                  "Como fazer um agendamento?",
                  "Quais são os valores dos serviços?",
                  "Onde vocês estão localizados?",
                  "Como posso entrar em contato?",
                ].map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start"
                    onClick={() => setInputMessage(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AITestTab;
