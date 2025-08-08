import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Server, Users, MessageSquare, Send, Shield } from "lucide-react";

const HelpSection: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Como Usar o Disparador
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Server className="h-4 w-4" />
              1. Configurar Instâncias
            </h3>
            <p className="text-sm text-muted-foreground">
              Adicione suas instâncias do WhatsApp com nome e APIKEY. Certifique-se de que estejam conectadas.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              2. Importar Contatos
            </h3>
            <p className="text-sm text-muted-foreground">
              Faça upload de um arquivo CSV ou TXT com os contatos no formato: número,nome (um por linha).
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              3. Criar Mensagem
            </h3>
            <p className="text-sm text-muted-foreground">
              Digite sua mensagem e, opcionalmente, adicione uma mídia (imagem, vídeo, áudio ou PDF).
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Send className="h-4 w-4" />
              4. Enviar Campanha
            </h3>
            <p className="text-sm text-muted-foreground">
              Selecione a instância, revise os dados e clique em enviar. Acompanhe o progresso no histórico.
            </p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="flex items-start gap-2">
            <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Dicas de Segurança</h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
                <li>• Respeite os limites de envio do WhatsApp</li>
                <li>• Não envie spam ou mensagens não solicitadas</li>
                <li>• Mantenha suas APIKEYs seguras</li>
                <li>• Teste com poucos contatos primeiro</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HelpSection;


