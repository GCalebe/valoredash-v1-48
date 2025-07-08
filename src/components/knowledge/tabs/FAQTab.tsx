import React, { useState } from "react";
import { Plus, Search, Download, Upload, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const FAQTab = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FAQItem | null>(null);
  const [faqItems, setFaqItems] = useState<FAQItem[]>([
    {
      id: 1,
      question: "Como funciona o sistema de agendamento?",
      answer:
        "Nosso sistema permite agendar consultas de forma automática através do chatbot. O cliente escolhe a data e horário disponível.",
      category: "Agendamento",
      tags: ["agendamento", "consulta"],
      createdAt: "2024-01-15",
      updatedAt: "2024-01-15",
    },
    {
      id: 2,
      question: "Quais são os valores dos serviços?",
      answer:
        "Os valores variam conforme o tipo de consulta. Consulta simples: R$ 80, Consulta especializada: R$ 120, Exames: valores variados.",
      category: "Valores",
      tags: ["preço", "consulta", "valores"],
      createdAt: "2024-01-10",
      updatedAt: "2024-01-10",
    },
  ]);

  const [newFAQ, setNewFAQ] = useState({
    question: "",
    answer: "",
    category: "",
    tags: "",
  });

  const filteredFAQs = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAddFAQ = () => {
    if (!newFAQ.question || !newFAQ.answer) {
      toast({
        title: "Campos obrigatórios",
        description: "Pergunta e resposta são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const faqItem: FAQItem = {
      id: Date.now(),
      question: newFAQ.question,
      answer: newFAQ.answer,
      category: newFAQ.category || "Geral",
      tags: newFAQ.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    setFaqItems([...faqItems, faqItem]);
    setNewFAQ({ question: "", answer: "", category: "", tags: "" });
    setIsAddDialogOpen(false);

    toast({
      title: "FAQ adicionado",
      description: "Item adicionado com sucesso!",
    });
  };

  const handleEditFAQ = (item: FAQItem) => {
    setEditingItem(item);
    setNewFAQ({
      question: item.question,
      answer: item.answer,
      category: item.category,
      tags: item.tags.join(", "),
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateFAQ = () => {
    if (!editingItem || !newFAQ.question || !newFAQ.answer) return;

    const updatedItem: FAQItem = {
      ...editingItem,
      question: newFAQ.question,
      answer: newFAQ.answer,
      category: newFAQ.category || "Geral",
      tags: newFAQ.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
      updatedAt: new Date().toISOString().split("T")[0],
    };

    setFaqItems(
      faqItems.map((item) => (item.id === editingItem.id ? updatedItem : item)),
    );

    setNewFAQ({ question: "", answer: "", category: "", tags: "" });
    setEditingItem(null);
    setIsEditDialogOpen(false);

    toast({
      title: "FAQ atualizado",
      description: "Item atualizado com sucesso!",
    });
  };

  const handleDeleteFAQ = (id: number) => {
    setFaqItems(faqItems.filter((item) => item.id !== id));
    toast({
      title: "FAQ excluído",
      description: "Item removido com sucesso!",
      variant: "destructive",
    });
  };

  const exportFAQs = () => {
    const dataStr = JSON.stringify(faqItems, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = "faqs.json";
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast({
      title: "FAQs exportados",
      description: "Arquivo JSON baixado com sucesso!",
    });
  };

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
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar FAQ..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
                <Button onClick={handleAddFAQ}>Adicionar</Button>
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
              {searchQuery
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
                      onClick={() => handleEditFAQ(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFAQ(item.id)}
                      className="text-red-500 hover:text-red-600"
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
                    {item.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    Atualizado: {item.updatedAt}
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
                value={newFAQ.question}
                onChange={(e) =>
                  setNewFAQ({ ...newFAQ, question: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-answer">Resposta *</Label>
              <Textarea
                id="edit-answer"
                placeholder="Digite a resposta..."
                value={newFAQ.answer}
                onChange={(e) =>
                  setNewFAQ({ ...newFAQ, answer: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Categoria</Label>
              <Input
                id="edit-category"
                placeholder="ex: Agendamento, Valores..."
                value={newFAQ.category}
                onChange={(e) =>
                  setNewFAQ({ ...newFAQ, category: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-tags">Tags (separadas por vírgula)</Label>
              <Input
                id="edit-tags"
                placeholder="ex: agendamento, consulta, preço"
                value={newFAQ.tags}
                onChange={(e) => setNewFAQ({ ...newFAQ, tags: e.target.value })}
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
            <Button onClick={handleUpdateFAQ}>Atualizar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FAQTab;
