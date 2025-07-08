import React, { useState } from "react";
import { Plus, Edit, Trash2, Save, MessageSquare, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

interface AIMessage {
  id: number;
  category: string;
  name: string;
  content: string;
  variables: string[];
  context: string;
  isActive: boolean;
}

const AIMessagesTab = () => {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("greeting");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<AIMessage | null>(null);

  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 1,
      category: "greeting",
      name: "Saudação Padrão",
      content:
        "Olá! Sou o {assistantName} e estou aqui para ajudá-lo. Como posso auxiliá-lo hoje?",
      variables: ["assistantName"],
      context: "Início de conversa",
      isActive: true,
    },
    {
      id: 2,
      category: "greeting",
      name: "Saudação Personalizada",
      content:
        "Olá, {userName}! É um prazer falar com você novamente. Em que posso ajudá-lo hoje?",
      variables: ["userName"],
      context: "Usuário retornante",
      isActive: true,
    },
    {
      id: 3,
      category: "farewell",
      name: "Despedida Padrão",
      content:
        "Foi um prazer ajudá-lo! Se precisar de mais alguma coisa, estarei aqui. Tenha um ótimo dia!",
      variables: [],
      context: "Fim de conversa",
      isActive: true,
    },
    {
      id: 4,
      category: "error",
      name: "Não Entendimento",
      content:
        "Desculpe, não consegui entender sua solicitação. Poderia reformular sua pergunta?",
      variables: [],
      context: "Erro de compreensão",
      isActive: true,
    },
    {
      id: 5,
      category: "transfer",
      name: "Transferência para Humano",
      content:
        "Vou transferir você para um de nossos especialistas que poderá ajudá-lo melhor. Um momento, por favor.",
      variables: [],
      context: "Escalação para humano",
      isActive: true,
    },
    {
      id: 6,
      category: "waiting",
      name: "Aguardando Resposta",
      content:
        "Estou processando sua solicitação. Por favor, aguarde um momento...",
      variables: [],
      context: "Processamento",
      isActive: true,
    },
  ]);

  const [newMessage, setNewMessage] = useState({
    category: "greeting",
    name: "",
    content: "",
    variables: "",
    context: "",
  });

  const categories = [
    { id: "greeting", name: "Saudações", icon: "👋" },
    { id: "farewell", name: "Despedidas", icon: "👋" },
    { id: "error", name: "Erros", icon: "❌" },
    { id: "transfer", name: "Transferências", icon: "📞" },
    { id: "waiting", name: "Aguardando", icon: "⏳" },
    { id: "help", name: "Ajuda", icon: "❓" },
  ];

  const getMessagesByCategory = (category: string) =>
    messages.filter((msg) => msg.category === category);

  const handleAddMessage = () => {
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

    const message: AIMessage = {
      id: Date.now(),
      category: newMessage.category,
      name: newMessage.name,
      content: newMessage.content,
      variables: extractVariables(newMessage.content),
      context: newMessage.context,
      isActive: true,
    };

    setMessages([...messages, message]);
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

  const handleUpdateMessage = () => {
    if (!editingMessage || !newMessage.name || !newMessage.content) return;

    const extractVariables = (content: string) => {
      const matches = content.match(/\{([^}]+)\}/g);
      return matches ? matches.map((match) => match.slice(1, -1)) : [];
    };

    const updatedMessage: AIMessage = {
      ...editingMessage,
      name: newMessage.name,
      content: newMessage.content,
      variables: extractVariables(newMessage.content),
      context: newMessage.context,
    };

    setMessages(
      messages.map((msg) =>
        msg.id === editingMessage.id ? updatedMessage : msg,
      ),
    );

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
  };

  const handleDeleteMessage = (id: number) => {
    setMessages(messages.filter((msg) => msg.id !== id));
    toast({
      title: "Mensagem excluída",
      description: "Mensagem removida com sucesso!",
      variant: "destructive",
    });
  };

  const handleToggleMessage = (id: number) => {
    setMessages(
      messages.map((msg) =>
        msg.id === id ? { ...msg, isActive: !msg.isActive } : msg,
      ),
    );
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
            Gerencie as mensagens que a IA utiliza em diferentes situações
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
                  <Label htmlFor="category">Categoria</Label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    value={newMessage.category}
                    onChange={(e) =>
                      setNewMessage({ ...newMessage, category: e.target.value })
                    }
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
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
              <Button onClick={handleAddMessage}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-6">
          {categories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="text-xs"
            >
              {category.icon} {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-6">
            <div className="space-y-4">
              {getMessagesByCategory(category.id).length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <h3 className="text-lg font-medium mb-1">
                    Nenhuma mensagem em {category.name}
                  </h3>
                  <p className="text-sm">
                    Adicione mensagens para esta categoria.
                  </p>
                </div>
              ) : (
                getMessagesByCategory(category.id).map((message) => (
                  <Card
                    key={message.id}
                    className={`${!message.isActive ? "opacity-50" : ""}`}
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
                                message.isActive ? "default" : "secondary"
                              }
                            >
                              {message.isActive ? "Ativa" : "Inativa"}
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
                          >
                            {message.isActive ? "Desativar" : "Ativar"}
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
                <Label htmlFor="edit-category">Categoria</Label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={newMessage.category}
                  onChange={(e) =>
                    setNewMessage({ ...newMessage, category: e.target.value })
                  }
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
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
            <Button onClick={handleUpdateMessage}>Atualizar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIMessagesTab;
