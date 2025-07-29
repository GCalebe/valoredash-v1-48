import React, { useState } from "react";
import { Plus, FolderPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface CategoryManagerProps {
  categories: string[];
  onCategoryCreate: (categoryName: string) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onCategoryCreate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const { toast } = useToast();

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, digite um nome para a categoria.",
        variant: "destructive",
      });
      return;
    }

    if (categories.includes(newCategoryName.trim())) {
      toast({
        title: "Categoria já existe",
        description: "Esta categoria já foi criada.",
        variant: "destructive",
      });
      return;
    }

    onCategoryCreate(newCategoryName.trim());
    setNewCategoryName("");
    setIsOpen(false);
    
    toast({
      title: "Categoria criada",
      description: `A categoria "${newCategoryName.trim()}" foi criada. Agora você pode criar FAQs nesta categoria.`,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreateCategory();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FolderPlus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Nova Categoria</DialogTitle>
          <DialogDescription>
            Crie uma nova categoria para organizar suas FAQs.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="categoryName">Nome da Categoria</Label>
            <Input
              id="categoryName"
              placeholder="Ex: Suporte Técnico, Vendas, etc."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyPress={handleKeyPress}
              autoFocus
            />
          </div>
          
          {categories.length > 0 && (
            <div className="space-y-2">
              <Label>Categorias Existentes</Label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {categories.map((category) => (
                  <Badge key={category} variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => {
              setIsOpen(false);
              setNewCategoryName("");
            }}
          >
            Cancelar
          </Button>
          <Button onClick={handleCreateCategory}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Categoria
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryManager;