import React, { useState, useEffect } from "react";
import { AIMessage } from '@/types/ai';
import { Plus, Edit, Trash2, Save, MessageSquare, Copy, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useKanbanStages } from "@/hooks/useKanbanStages";
import { useAIMessagesQuery, useCreateAIMessageMutation, useUpdateAIMessageMutation, useDeleteAIMessageMutation } from "@/hooks/useAIMessagesQuery";

const AIMessagesTab = () => {
  const { toast } = useToast();
  const { stages, loading: stagesLoading } = useKanbanStages();
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<any>(null);

  // Use Supabase hooks
  const { data: messages = [], isLoading, error } = useAIMessagesQuery();
  const createMessageMutation = useCreateAIMessageMutation();
  const updateMessageMutation = useUpdateAIMessageMutation();
  const deleteMessageMutation = useDeleteAIMessageMutation();

  const [newMessage, setNewMessage] = useState({
    category: "",
    name: "",
    content: "",
    variables: "",
    context: "",
  });

  // Set initial active category when stages are loaded
  useEffect(() => {
    if (stages.length > 0 && !activeCategory) {
      setActiveCategory(stages[0].title);
      
      // Update newMessage with the first stage as default
      setNewMessage(prev => ({
        ...prev,
        category: stages[0].title
      }));
    }
  }, [stages, activeCategory]);

  const getMessagesByCategory = (category: string) =>
    messages.filter((msg) => msg.category === category);

  const handleAddMessage = async () => {
    if (!newMessage.name || !newMessage.content) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e conteúdo são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const extractVariables = (content: string) => {
      const matches = content.match(/\{([^}]+)\}/g);
      return matches ? matches.map((match) => match.slice(1, -1)) : [];
    };

    const messageData = {
      category: newMessage.category,
      name: newMessage.name,
      content: newMessage.content,
      variables: extractVariables(newMessage.content),
      context: newMessage.context,
      is_active: true,
    };

    try {
      await createMessageMutation.mutateAsync(messageData);
      setNewMessage({
        category: activeCategory,
        name: "",
        content: "",
        variables: "",
        context: "",
      });
      setIsAddDialogOpen(false);

      toast({
        title: "Mensagem adicionada",
        description: "Nova mensagem criada com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar mensagem.",
        variant: "destructive",
      });
    }
  };

  const handleEditMessage = (message: AIMessage) => {
    setEditingMessage(message);
    setNewMessage({
      category: message.category,
      name: message.name,
      content: message.content,
      variables: message.variables.join(", "),
      context: message.context,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateMessage = async () => {
    if (!editingMessage || !newMessage.name || !newMessage.content) return;

    const extractVariables = (content: string) => {
      const matches = content.match(/\{([^}]+)\}/g);
      return matches ? matches.map((match) => match.slice(1, -1)) : [];
    };

    const updatedData = {
      name: newMessage.name,
      content: newMessage.content,
      variables: extractVariables(newMessage.content),
      context: newMessage.context,
      category: newMessage.category,
    };

    try {
      await updateMessageMutation.mutateAsync({
        id: editingMessage.id,
        ...updatedData,
      });

      setNewMessage({
        category: activeCategory,
        name: "",
        content: "",
        variables: "",
        context: "",
      });
      setEditingMessage(null);
      setIsEditDialogOpen(false);

      toast({
        title: "Mensagem atualizada",
        description: "Mensagem atualizada com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar mensagem.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMessage = async (id: number) => {
    try {
      await deleteMessageMutation.mutateAsync(id);
      toast({
        title: "Mensagem excluída",
        description: "Mensagem removida com sucesso!",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir mensagem.",
        variant: "destructive",
      });
    }
  };

  const handleToggleMessage = async (id: number) => {
    const message = messages.find(msg => msg.id === id);
    if (!message) return;

    try {
      await updateMessageMutation.mutateAsync({
        id,
        is_active: !message.is_active,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar status da mensagem.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copiado!",
      description: "Conteúdo copiado para a área de transferência.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
            Configuração das Mensagens da IA
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie as mensagens que a IA utiliza em diferentes etapas do funil
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Mensagem
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Mensagem</DialogTitle>
              <DialogDescription>
                Crie uma nova mensagem para a IA utilizar em situações
                específicas.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome da Mensagem *</Label>
                  <Input
                    id="name"
                    value={newMessage.name}
                    onChange={(e) =>
                      setNewMessage({ ...newMessage, name: e.target.value })
                    }
                    placeholder="Ex: Saudação Matinal"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Etapa do Funil</Label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    value={newMessage.category}
                    onChange={(e) =>
                      setNewMessage({ ...newMessage, category: e.target.value })
                    }
                  >
                    {stagesLoading ? (
                      <option value="">Carregando etapas...</option>
                    ) : (
                      stages.map((stage) => (
                        <option key={stage.id} value={stage.title}>
                          {stage.title}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="content">Conteúdo da Mensagem *</Label>
                <Textarea
                  id="content"
                  value={newMessage.content}
                  onChange={(e) =>
                    setNewMessage({ ...newMessage, content: e.target.value })
                  }
                  placeholder="Digite a mensagem... Use {variavel} para inserir variáveis"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use {`{nomeVariavel}`} para inserir variáveis dinâmicas na
                  mensagem
                </p>
              </div>

              <div>
                <Label htmlFor="context">Contexto de Uso</Label>
                <Input
                  id="context"
                  value={newMessage.context}
                  onChange={(e) =>
                    setNewMessage({ ...newMessage, context: e.target.value })
                  }
                  placeholder="Ex: Horário comercial, Fora do horário..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleAddMessage}
                disabled={createMessageMutation.isPending}
              >
                {createMessageMutation.isPending ? "Adicionando..." : "Adicionar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Kanban Stages Tabs */}
      {stagesLoading || isLoading ? (
        <div className="space-y-4">
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 border-4 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-300">Carregando...</span>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ) : (
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${stages.length}, 1fr)` }}>
            {stages.map((stage) => (
              <TabsTrigger
                key={stage.id}
                value={stage.title}
                className="text-xs"
              >
                {stage.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {stages.map((stage) => (
            <TabsContent key={stage.id} value={stage.title} className="mt-6">
              <div className="space-y-4">
                {getMessagesByCategory(stage.title).length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <h3 className="text-lg font-medium mb-1">
                      Nenhuma mensagem em {stage.title}
                    </h3>
                    <p className="text-sm">
                      Adicione mensagens para esta etapa do funil.
                    </p>
                  </div>
                ) : (
                  getMessagesByCategory(stage.title).map((message) => (
                    <Card
                      key={message.id}
                      className={`${!message.is_active ? "opacity-50" : ""}`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">
                              {message.name}
                            </CardTitle>
                            {message.context && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Contexto: {message.context}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(message.content)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditMessage(message)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMessage(message.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                            <p className="text-sm">{message.content}</p>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  message.is_active ? "default" : "secondary"
                                }
                              >
                                {message.is_active ? "Ativa" : "Inativa"}
                              </Badge>
                              {message.variables.length > 0 && (
                                <div className="flex gap-1">
                                  {message.variables.map((variable, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {variable}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleMessage(message.id)}
                              disabled={updateMessageMutation.isPending}
                            >
                              {message.is_active ? "Desativar" : "Ativar"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Mensagem</DialogTitle>
            <DialogDescription>
              Modifique o conteúdo da mensagem.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Nome da Mensagem *</Label>
                <Input
                  id="edit-name"
                  value={newMessage.name}
                  onChange={(e) =>
                    setNewMessage({ ...newMessage, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Etapa do Funil</Label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={newMessage.category}
                  onChange={(e) =>
                    setNewMessage({ ...newMessage, category: e.target.value })
                  }
                >
                  {stagesLoading ? (
                    <option value="">Carregando etapas...</option>
                  ) : (
                    stages.map((stage) => (
                      <option key={stage.id} value={stage.title}>
                        {stage.title}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-content">Conteúdo da Mensagem *</Label>
              <Textarea
                id="edit-content"
                value={newMessage.content}
                onChange={(e) =>
                  setNewMessage({ ...newMessage, content: e.target.value })
                }
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="edit-context">Contexto de Uso</Label>
              <Input
                id="edit-context"
                value={newMessage.context}
                onChange={(e) =>
                  setNewMessage({ ...newMessage, context: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdateMessage}
              disabled={updateMessageMutation.isPending}
            >
              {updateMessageMutation.isPending ? "Atualizando..." : "Atualizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIMessagesTab;