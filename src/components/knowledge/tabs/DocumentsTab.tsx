import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, Upload, Trash2, Send, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Document {
  id: string;
  name: string;
  content: string;
  uploadedAt: string;
  size: string;
  type: string;
}

const DocumentsTab = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [newDocument, setNewDocument] = useState({
    name: "",
    content: ""
  });
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setNewDocument(prev => ({
        ...prev,
        name: file.name
      }));

      // Read file content
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setNewDocument(prev => ({
          ...prev,
          content: content
        }));
      };
      reader.readAsText(file);
    }
  };

  const handleAddDocument = () => {
    if (!newDocument.name || !newDocument.content) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const document: Document = {
      id: Date.now().toString(),
      name: newDocument.name,
      content: newDocument.content,
      uploadedAt: new Date().toLocaleDateString("pt-BR"),
      size: selectedFile ? `${(selectedFile.size / 1024).toFixed(2)} KB` : "N/A",
      type: selectedFile?.type || "text/plain"
    };

    setDocuments(prev => [...prev, document]);
    setNewDocument({ name: "", content: "" });
    setSelectedFile(null);

    toast({
      title: "Sucesso",
      description: "Documento adicionado com sucesso!",
    });
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    toast({
      title: "Documento removido",
      description: "O documento foi removido da lista",
    });
  };

  const handleSendToN8N = async () => {
    if (!webhookUrl) {
      toast({
        title: "Erro",
        description: "Por favor, configure a URL do webhook do n8n",
        variant: "destructive",
      });
      return;
    }

    if (documents.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhum documento para enviar",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          documents: documents,
          timestamp: new Date().toISOString(),
          source: "knowledge-manager"
        }),
      });

      toast({
        title: "Documentos enviados",
        description: "Os documentos foram enviados para o n8n com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao enviar documentos:", error);
      toast({
        title: "Erro",
        description: "Falha ao enviar documentos para o n8n",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Gerenciar Documentos
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Adicione e gerencie documentos para integração com n8n
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          {documents.length} documento(s)
        </Badge>
      </div>

      {/* Configuração do Webhook */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Configuração do n8n
          </CardTitle>
          <CardDescription>
            Configure a URL do webhook do n8n para enviar os documentos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">URL do Webhook do n8n</Label>
            <Input
              id="webhook-url"
              type="url"
              placeholder="https://seu-n8n.com/webhook/documentos"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleSendToN8N} 
            disabled={isUploading || !webhookUrl || documents.length === 0}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {isUploading ? "Enviando..." : "Enviar Documentos para n8n"}
          </Button>
        </CardContent>
      </Card>

      {/* Adicionar Novo Documento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Adicionar Documento
          </CardTitle>
          <CardDescription>
            Faça upload de um arquivo ou insira o conteúdo manualmente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Fazer Upload de Arquivo</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".txt,.md,.json,.csv,.xml"
              onChange={handleFileSelect}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="doc-name">Nome do Documento *</Label>
            <Input
              id="doc-name"
              placeholder="Digite o nome do documento"
              value={newDocument.name}
              onChange={(e) => setNewDocument(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="doc-content">Conteúdo *</Label>
            <Textarea
              id="doc-content"
              placeholder="Digite ou cole o conteúdo do documento"
              value={newDocument.content}
              onChange={(e) => setNewDocument(prev => ({ ...prev, content: e.target.value }))}
              rows={8}
            />
          </div>

          <Button onClick={handleAddDocument} className="w-full">
            <FileText className="h-4 w-4 mr-2" />
            Adicionar Documento
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Documentos */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos Carregados</CardTitle>
          <CardDescription>
            Lista de todos os documentos disponíveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Nenhum documento carregado ainda
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Adicione documentos usando o formulário acima
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {doc.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Adicionado em {doc.uploadedAt} • {doc.size}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentsTab;