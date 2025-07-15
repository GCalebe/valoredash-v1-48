import React from "react";
import { Plus, Edit, Trash2, Search, Download, Filter, HelpCircle } from "lucide-react";
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
import useFAQManagement from "@/hooks/useFAQManagement";
import FAQForm from "@/components/knowledge/faq/FAQForm";

const FAQTab = () => {
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
