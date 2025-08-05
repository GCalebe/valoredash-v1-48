import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  useFAQQuery,
  useCreateFAQMutation,
  useUpdateFAQMutation,
  useDeleteFAQMutation,
} from "@/hooks/useFAQQuery";

export interface FAQFormData {
  id?: string;
  question: string;
  answer: string;
  category: string;
  tags: string;
  associated_agendas?: string[];
}

const useFAQManagement = () => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQFormData | null>(null);
  const [newFAQ, setNewFAQ] = useState<FAQFormData>({
    question: "",
    answer: "",
    category: "Geral",
    tags: "",
    associated_agendas: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: faqs = [], isLoading, error } = useFAQQuery();
  const createFAQMutation = useCreateFAQMutation();
  const updateFAQMutation = useUpdateFAQMutation();
  const deleteFAQMutation = useDeleteFAQMutation();

  const categories = useMemo(
    () => Array.from(new Set(faqs.map((f) => f.category))),
    [faqs]
  );

  const filteredFAQs = useMemo(() => {
    return faqs.filter((item) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        item.question.toLowerCase().includes(searchLower) ||
        item.answer.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower) ||
        (Array.isArray(item.tags) ? item.tags.some(tag => 
          tag.toLowerCase().includes(searchLower)
        ) : false);

      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [faqs, searchTerm, selectedCategory]);

  const addFAQ = async (userId: string | undefined) => {
    if (!newFAQ.question || !newFAQ.answer) {
      toast({
        title: "Campos obrigatórios",
        description: "Pergunta e resposta são obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    if (!userId) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não autenticado. Faça login novamente.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createFAQMutation.mutateAsync({
        question: newFAQ.question,
        answer: newFAQ.answer,
        category: newFAQ.category || "Geral",
        tags: newFAQ.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      });
      setNewFAQ({ question: "", answer: "", category: "Geral", tags: "", associated_agendas: [] });
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

  const editFAQ = (item: Record<string, unknown>) => { // Usando Record para compatibilidade com o que vem do banco
    setEditingFAQ({
      ...item,
      tags: Array.isArray(item.tags) ? item.tags.join(", ") : "",
      associated_agendas: item.associated_agendas || [],
    });
    setIsEditDialogOpen(true);
  };

  const saveEditedFAQ = async () => {
    if (!editingFAQ) return;

    try {
      await updateFAQMutation.mutateAsync({
        id: editingFAQ.id as string,
        question: editingFAQ.question,
        answer: editingFAQ.answer,
        category: editingFAQ.category,
        tags: editingFAQ.tags
          .split(",")
          .map((tag: string) => tag.trim())
          .filter(Boolean),
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

  return {
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    categories,
    filteredFAQs,
    newFAQ,
    setNewFAQ,
    editingFAQ,
    setEditingFAQ,
    addFAQ,
    editFAQ,
    saveEditedFAQ,
    deleteFAQ,
    exportFAQs,
    isLoading,
    error,
    createFAQMutation,
    updateFAQMutation,
    deleteFAQMutation,
  };
};

export default useFAQManagement;
