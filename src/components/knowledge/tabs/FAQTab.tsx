import React, { useState, useMemo } from "react";
import { Plus, Search, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import FAQHeader from "@/components/knowledge/faq/FAQHeader";
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
import FAQHierarchicalView from "@/components/knowledge/faq/FAQHierarchicalView";

const FAQTab = () => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<"question" | "category" | "created_at">("question");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"grid" | "hierarchy">("grid");
  
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

  // Ordenar FAQs com base nos critérios de ordenação
  const sortedFAQs = useMemo(() => {
    if (!filteredFAQs) return [];
    
    return [...filteredFAQs].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "question":
          comparison = a.question.localeCompare(b.question);
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        case "created_at":
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [filteredFAQs, sortBy, sortOrder]);
  
  // Handler para mudança de ordenação
  const handleSortChange = (newSortBy: "question" | "category" | "created_at", newSortOrder: "asc" | "desc") => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };
  
  // Handlers para importação e exportação
  const handleImport = () => {
    // TODO: Implementar importação
    console.log("Importar FAQs");
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
      <FAQHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddFAQ={() => setIsAddDialogOpen(true)}
        onImport={handleImport}
        onExport={exportFAQs}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        totalFAQs={filteredFAQs?.length || 0}
        filteredFAQs={sortedFAQs?.length || 0}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
            onSubmit={() => addFAQ('current-user')}
            isLoading={createFAQMutation.isPending}
            submitLabel="Adicionar"
          />
        </DialogContent>
      </Dialog>

      {/* FAQ Content */}
      {viewMode === "hierarchy" ? (
        <FAQHierarchicalView
          faqs={sortedFAQs as any}
          onEdit={editFAQ as any}
          onDelete={deleteFAQ as any}
          isDeleting={deleteFAQMutation.isPending}
          searchTerm={searchTerm}
        />
      ) : (
        <FAQTreeView
          faqs={sortedFAQs as any}
          onEdit={editFAQ as any}
          onDelete={deleteFAQ as any}
          isDeleting={deleteFAQMutation.isPending}
          expandedCategories={expandedCategories}
          onToggleCategory={toggleCategory}
        />
      )}

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
