import React, { useState } from "react";
import { Plus, Search, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useFAQManagement from "@/hooks/useFAQManagement";
import FAQForm from "@/components/knowledge/faq/FAQForm";
import FAQTreeView from "@/components/knowledge/faq/FAQTreeView";

const FAQTab = () => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  const {
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
  } = useFAQManagement();

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allCategories = categories;
    setExpandedCategories(new Set(allCategories));
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
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
          
          {/* Controles de expansão */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={expandAll}
              className="text-xs"
            >
              <ChevronDown className="h-3 w-3 mr-1" />
              Expandir Todas
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={collapseAll}
              className="text-xs"
            >
              <ChevronUp className="h-3 w-3 mr-1" />
              Recolher Todas
            </Button>
          </div>

        </div>

        <div className="flex items-center gap-2">
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
              <FAQForm
                faq={newFAQ}
                setFaq={setNewFAQ}
                onCancel={() => setIsAddDialogOpen(false)}
                onSubmit={addFAQ}
                isLoading={createFAQMutation.isPending}
                submitLabel="Adicionar"
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* FAQ Content */}
      <FAQTreeView
        faqs={filteredFAQs}
        onEdit={editFAQ}
        onDelete={deleteFAQ}
        isDeleting={deleteFAQMutation.isPending}
        expandedCategories={expandedCategories}
        onToggleCategory={toggleCategory}
      />

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar FAQ</DialogTitle>
            <DialogDescription>
              Modifique a pergunta e resposta.
            </DialogDescription>
          </DialogHeader>
          {editingFAQ && (
            <FAQForm
              faq={editingFAQ}
              setFaq={setEditingFAQ}
              onCancel={() => setIsEditDialogOpen(false)}
              onSubmit={saveEditedFAQ}
              isLoading={updateFAQMutation.isPending}
              submitLabel="Atualizar"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FAQTab;
