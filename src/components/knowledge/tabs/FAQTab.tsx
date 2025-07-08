import React, { useState } from "react";
import { Plus, Edit, Trash2, Search, Download, Filter, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useFAQQuery, useCreateFAQMutation, useUpdateFAQMutation, useDeleteFAQMutation } from "@/hooks/useFAQQuery";

const FAQTab = () => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Use Supabase hooks
  const { data: faqs = [], isLoading, error } = useFAQQuery();
  const createFAQMutation = useCreateFAQMutation();
  const updateFAQMutation = useUpdateFAQMutation();
  const deleteFAQMutation = useDeleteFAQMutation();

  const [newFAQ, setNewFAQ] = useState({
    question: "",
    answer: "",
    category: "Geral",
    tags: "",
  });

  // Get unique categories
  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  // Filter FAQs
  const filteredFAQs = faqs.filter((item) => {
    const matchesSearch = 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const addFAQ = async () => {
    if (!newFAQ.question || !newFAQ.answer) {
      toast({
        title: "Campos obrigatórios",
        description: "Pergunta e resposta são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createFAQMutation.mutateAsync({
        question: newFAQ.question,
        answer: newFAQ.answer,
        category: newFAQ.category || "Geral",
        tags: newFAQ.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      });
      setNewFAQ({ question: "", answer: "", category: "Geral", tags: "" });
      setIsAddDialogOpen(false);
      toast({
        title: "FAQ adicionado",
        description: "Item de FAQ cadastrado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar FAQ.",
        variant: "destructive",
      });
    }
  };

  const editFAQ = (item: any) => {
    setEditingFAQ({
      ...item,
      tags: Array.isArray(item.tags) ? item.tags.join(", ") : "",
    });
    setIsEditDialogOpen(true);
  };

  const saveEditedFAQ = async () => {
    if (!editingFAQ) return;

    try {
      await updateFAQMutation.mutateAsync({
        id: editingFAQ.id,
        question: editingFAQ.question,
        answer: editingFAQ.answer,
        category: editingFAQ.category,
        tags: editingFAQ.tags.split(",").map((tag: string) => tag.trim()).filter(Boolean),
      });
      setEditingFAQ(null);
      setIsEditDialogOpen(false);
      toast({
        title: "FAQ atualizado",
        description: "Item de FAQ atualizado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar FAQ.",
        variant: "destructive",
      });
    }
  };

  const deleteFAQ = async (id: string) => {
    try {
      await deleteFAQMutation.mutateAsync(id);
      toast({
        title: "FAQ removido",
        description: "Item de FAQ removido com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover FAQ.",
        variant: "destructive",
      });
    }
  };

  const exportFAQs = () => {
    const dataStr = JSON.stringify(faqs, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = "faqs.json";
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HelpCircle className="h-5 w-5" />
            <h2 className="text-xl font-semibold">FAQ Perguntas Frequentes</h2>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full mb-2" />
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <HelpCircle className="h-5 w-5" />
          <h2 className="text-xl font-semibold">FAQ Perguntas Frequentes</h2>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-destructive text-center">
              Erro ao carregar FAQs. Tente novamente.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
          Perguntas & Respostas (FAQ)
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Gerencie as perguntas frequentes da base de conhecimento
        </p>
      </div>

      {/* Search and Actions */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar FAQ..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportFAQs}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar FAQ
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova FAQ</DialogTitle>
                <DialogDescription>
                  Crie uma nova pergunta e resposta para a base de conhecimento.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="question">Pergunta *</Label>
                  <Textarea
                    id="question"
                    placeholder="Digite a pergunta..."
                    value={newFAQ.question}
                    onChange={(e) =>
                      setNewFAQ({ ...newFAQ, question: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="answer">Resposta *</Label>
                  <Textarea
                    id="answer"
                    placeholder="Digite a resposta..."
                    value={newFAQ.answer}
                    onChange={(e) =>
                      setNewFAQ({ ...newFAQ, answer: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    placeholder="ex: Agendamento, Valores..."
                    value={newFAQ.category}
                    onChange={(e) =>
                      setNewFAQ({ ...newFAQ, category: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                  <Input
                    id="tags"
                    placeholder="ex: agendamento, consulta, preço"
                    value={newFAQ.tags}
                    onChange={(e) =>
                      setNewFAQ({ ...newFAQ, tags: e.target.value })
                    }
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
                  onClick={addFAQ}
                  disabled={createFAQMutation.isPending}
                >
                  {createFAQMutation.isPending ? "Adicionando..." : "Adicionar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* FAQ List */}
      <div className="space-y-4">
        {filteredFAQs.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <h3 className="text-lg font-medium mb-1">Nenhuma FAQ encontrada</h3>
            <p className="text-sm">
              {searchTerm
                ? "Nenhuma FAQ corresponde à sua pesquisa."
                : "Comece adicionando perguntas frequentes."}
            </p>
          </div>
        ) : (
          filteredFAQs.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{item.question}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editFAQ(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteFAQ(item.id)}
                      className="text-red-500 hover:text-red-600"
                      disabled={deleteFAQMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  {item.answer}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{item.category}</Badge>
                    {(Array.isArray(item.tags) ? item.tags : []).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    Atualizado: {new Date(item.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar FAQ</DialogTitle>
            <DialogDescription>
              Modifique a pergunta e resposta.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-question">Pergunta *</Label>
              <Textarea
                id="edit-question"
                placeholder="Digite a pergunta..."
                value={editingFAQ?.question || ''}
                onChange={(e) =>
                  setEditingFAQ({ ...editingFAQ, question: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-answer">Resposta *</Label>
              <Textarea
                id="edit-answer"
                placeholder="Digite a resposta..."
                value={editingFAQ?.answer || ''}
                onChange={(e) =>
                  setEditingFAQ({ ...editingFAQ, answer: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Categoria</Label>
              <Input
                id="edit-category"
                placeholder="ex: Agendamento, Valores..."
                value={editingFAQ?.category || ''}
                onChange={(e) =>
                  setEditingFAQ({ ...editingFAQ, category: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-tags">Tags (separadas por vírgula)</Label>
              <Input
                id="edit-tags"
                placeholder="ex: agendamento, consulta, preço"
                value={editingFAQ?.tags || ''}
                onChange={(e) => setEditingFAQ({ ...editingFAQ, tags: e.target.value })}
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
              onClick={saveEditedFAQ}
              disabled={updateFAQMutation.isPending}
            >
              {updateFAQMutation.isPending ? "Salvando..." : "Atualizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FAQTab;
