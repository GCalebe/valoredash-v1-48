import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export interface ChatMessage {
  id: number;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  confidence?: number;
  sources?: string[];
}

export interface TestMetrics {
  totalMessages: number;
  averageResponseTime: number;
  confidenceAverage: number;
  successfulResponses: number;
}

export const useAITest = () => {
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const simulateAIResponse = async (userMessage: string): Promise<ChatMessage> => {
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

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

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

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

      setMetrics((prev) => {
        const newTotal = prev.totalMessages + 2;
        const newAvgResponseTime =
          (prev.averageResponseTime * (prev.totalMessages - 1) + responseTime) /
          (newTotal - 1);
        const newAvgConfidence =
          (prev.confidenceAverage * (prev.totalMessages - 1) + (botResponse.confidence || 0)) /
          (newTotal - 1);
        const newSuccessful =
          (botResponse.confidence || 0) > 70 ? prev.successfulResponses + 1 : prev.successfulResponses;

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
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `chat-log-${new Date().toISOString().split("T")[0]}.json`;
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

  return {
    messages,
    inputMessage,
    setInputMessage,
    isTyping,
    testMode,
    setTestMode,
    batchQuestions,
    setBatchQuestions,
    messagesEndRef,
    metrics,
    handleSendMessage,
    handleBatchTest,
    clearChat,
    exportChatLog,
    getConfidenceColor,
  };
};

