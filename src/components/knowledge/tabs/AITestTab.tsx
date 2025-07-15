import React from "react";
import { RotateCcw, Download, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import ChatDialog from "../ai-test/ChatDialog";
import SuggestedQuestions from "../ai-test/SuggestedQuestions";
import { useAITest } from "@/hooks/useAITest";

const AITestTab = () => {
  const {
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
  } = useAITest();

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
            <p className="text-sm text-gray-600 dark:text-gray-400">Total de Mensagens</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {Math.round(metrics.averageResponseTime)}ms
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tempo Médio</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {Math.round(metrics.confidenceAverage)}%
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Confiança Média</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {Math.round(
                (metrics.successfulResponses / Math.max(Math.floor(metrics.totalMessages / 2), 1)) *
                  100,
              )}
              %
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Taxa de Sucesso</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChatDialog
            messages={messages}
            messagesEndRef={messagesEndRef}
            inputMessage={inputMessage}
            isTyping={isTyping}
            onInputChange={setInputMessage}
            onSendMessage={handleSendMessage}
            getConfidenceColor={getConfidenceColor}
          />
        </div>

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
                  <label className="text-sm font-medium">Perguntas para Teste em Lote</label>
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

          <SuggestedQuestions onSelect={setInputMessage} />
        </div>
      </div>
    </div>
  );
};

export default AITestTab;

