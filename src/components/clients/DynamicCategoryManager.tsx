import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export interface DynamicCategory {
  id: string;
  name: string;
  type: "text" | "single_select" | "multi_select";
  options?: string[];
  value?: any;
}

interface DynamicCategoryManagerProps {
  tabName: string;
  categories: DynamicCategory[];
  onCategoriesChange: (categories: DynamicCategory[]) => void;
}

const DynamicCategoryManager = ({
  tabName,
  categories,
  onCategoriesChange,
}: DynamicCategoryManagerProps) => {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    type: "text" as "text" | "single_select" | "multi_select",
    options: [] as string[],
  });
  const [newOption, setNewOption] = useState("");

  console.log(`DynamicCategoryManager for ${tabName}:`, {
    categories,
    isAddingCategory,
  });

  const addCategory = () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, digite um nome para a categoria.",
        variant: "destructive",
      });
      return;
    }

    const category: DynamicCategory = {
      id: `${Date.now()}-${Math.random()}`,
      name: newCategory.name,
      type: newCategory.type,
      options: newCategory.type !== "text" ? newCategory.options : undefined,
      value: newCategory.type === "multi_select" ? [] : "",
    };

    onCategoriesChange([...categories, category]);
    setNewCategory({ name: "", type: "text", options: [] });
    setNewOption("");
    setIsAddingCategory(false);

    toast({
      title: "Categoria adicionada",
      description: `Categoria "${category.name}" foi adicionada à aba ${tabName}.`,
    });
  };

  const removeCategory = (categoryId: string) => {
    onCategoriesChange(categories.filter((cat) => cat.id !== categoryId));
    toast({
      title: "Categoria removida",
      description: "Categoria foi removida com sucesso.",
    });
  };

  const addOption = () => {
    if (newOption.trim() && !newCategory.options.includes(newOption.trim())) {
      setNewCategory({
        ...newCategory,
        options: [...newCategory.options, newOption.trim()],
      });
      setNewOption("");
    }
  };

  const removeOption = (option: string) => {
    setNewCategory({
      ...newCategory,
      options: newCategory.options.filter((opt) => opt !== option),
    });
  };

  const updateCategoryValue = (categoryId: string, value: any) => {
    onCategoriesChange(
      categories.map((cat) =>
        cat.id === categoryId ? { ...cat, value } : cat,
      ),
    );
  };

  const renderCategoryInput = (category: DynamicCategory) => {
    switch (category.type) {
      case "text":
        return (
          <Input
            value={category.value || ""}
            onChange={(e) => updateCategoryValue(category.id, e.target.value)}
            placeholder={`Digite ${category.name.toLowerCase()}`}
          />
        );

      case "single_select":
        return (
          <Select
            value={category.value || "none"}
            onValueChange={(val) =>
              updateCategoryValue(category.id, val === "none" ? null : val)
            }
          >
            <SelectTrigger>
              <SelectValue
                placeholder={`Selecione ${category.name.toLowerCase()}`}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              {category.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "multi_select":
        const selectedValues = Array.isArray(category.value)
          ? category.value
          : [];
        return (
          <div className="space-y-2 max-h-24 overflow-y-auto">
            {category.options?.map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateCategoryValue(category.id, [
                        ...selectedValues,
                        option,
                      ]);
                    } else {
                      updateCategoryValue(
                        category.id,
                        selectedValues.filter((v: string) => v !== option),
                      );
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 max-h-96 flex flex-col">
      {/* Header with add button */}
      <div className="flex items-center justify-between flex-shrink-0">
        <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          Categorias Personalizadas
        </h4>
        {!isAddingCategory && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAddingCategory(true)}
            className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
          >
            <Plus className="h-3 w-3 mr-1" />
            Nova Categoria
          </Button>
        )}
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {/* Add new category form */}
        {isAddingCategory && (
          <Card className="border-green-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Nova Categoria</CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAddingCategory(false);
                    setNewCategory({ name: "", type: "text", options: [] });
                    setNewOption("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="category-name" className="text-xs">
                  Nome da Categoria
                </Label>
                <Input
                  id="category-name"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  placeholder="Ex: Tipo de Empresa"
                  className="text-sm"
                />
              </div>

              <div>
                <Label htmlFor="category-type" className="text-xs">
                  Tipo de Campo
                </Label>
                <Select
                  value={newCategory.type}
                  onValueChange={(
                    value: "text" | "single_select" | "multi_select",
                  ) =>
                    setNewCategory({ ...newCategory, type: value, options: [] })
                  }
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texto</SelectItem>
                    <SelectItem value="single_select">Seleção Única</SelectItem>
                    <SelectItem value="multi_select">
                      Seleção Múltipla
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(newCategory.type === "single_select" ||
                newCategory.type === "multi_select") && (
                <div>
                  <Label className="text-xs">Opções</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      placeholder="Nova opção"
                      onKeyPress={(e) => e.key === "Enter" && addOption()}
                      className="text-sm"
                    />
                    <Button
                      onClick={addOption}
                      type="button"
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                    {newCategory.options.map((option) => (
                      <Badge
                        key={option}
                        variant="secondary"
                        className="text-xs flex items-center gap-1"
                      >
                        {option}
                        <button
                          onClick={() => removeOption(option)}
                          className="ml-1"
                        >
                          <X className="h-2 w-2" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={addCategory} size="sm" className="text-xs">
                  Adicionar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingCategory(false)}
                  className="text-xs"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Existing categories */}
        {categories.map((category) => (
          <Card key={category.id} className="border-gray-200">
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">
                      {category.name}
                    </Label>
                    <Badge variant="outline" className="text-xs">
                      {category.type === "text"
                        ? "Texto"
                        : category.type === "single_select"
                          ? "Seleção Única"
                          : "Seleção Múltipla"}
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCategory(category.id)}
                    className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                {renderCategoryInput(category)}
              </div>
            </CardContent>
          </Card>
        ))}

        {categories.length === 0 && !isAddingCategory && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Nenhuma categoria personalizada criada.</p>
            <p className="text-xs mt-1">
              Clique em "Nova Categoria" para começar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicCategoryManager;
