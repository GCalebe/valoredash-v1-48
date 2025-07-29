import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Edit, Trash2, HelpCircle, FolderOpen, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  updated_at: string;
}

interface FAQTreeViewProps {
  faqs: FAQItem[];
  onEdit: (item: FAQItem) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  expandedCategories: Set<string>;
  onToggleCategory: (categoryName: string) => void;
}

interface CategoryNode {
  name: string;
  faqs: FAQItem[];
  isExpanded: boolean;
}

const FAQTreeView: React.FC<FAQTreeViewProps> = ({
  faqs,
  onEdit,
  onDelete,
  isDeleting,
  expandedCategories,
  onToggleCategory,
}) => {

  // Organizar FAQs por categoria
  const categorizedFAQs = useMemo(() => {
    const categories: { [key: string]: CategoryNode } = {};
    
    faqs.forEach((faq) => {
      const categoryName = faq.category || "Sem Categoria";
      
      if (!categories[categoryName]) {
        categories[categoryName] = {
          name: categoryName,
          faqs: [],
          isExpanded: expandedCategories.has(categoryName),
        };
      }
      
      categories[categoryName].faqs.push(faq);
    });
    
    // Ordenar categorias alfabeticamente
    return Object.values(categories).sort((a, b) => a.name.localeCompare(b.name));
  }, [faqs, expandedCategories]);

  const toggleCategory = (categoryName: string) => {
    onToggleCategory(categoryName);
  };

  if (faqs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <HelpCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-1">Nenhuma FAQ encontrada</h3>
        <p className="text-sm">
          Comece adicionando perguntas frequentes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Árvore de categorias */}
      <div className="space-y-3">
        {categorizedFAQs.map((category) => {
          const isExpanded = expandedCategories.has(category.name);
          
          return (
            <div key={category.name} className="border rounded-lg overflow-hidden">
              {/* Cabeçalho da categoria */}
              <div
                className={cn(
                  "flex items-center justify-between p-4 cursor-pointer transition-all duration-200",
                  "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
                  "hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30",
                  "border-b border-blue-200 dark:border-blue-700"
                )}
                onClick={() => toggleCategory(category.name)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <>
                        <ChevronDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </>
                    ) : (
                      <>
                        <ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <Folder className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </>
                    )}
                  </div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                    {category.name}
                  </h3>
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                    {category.faqs.length} {category.faqs.length === 1 ? 'item' : 'itens'}
                  </Badge>
                </div>
              </div>

              {/* Lista de FAQs da categoria */}
              {isExpanded && (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {category.faqs.map((faq, index) => (
                    <div
                      key={faq.id}
                      className={cn(
                        "p-4 transition-all duration-200 border-l-4 border-transparent",
                        "hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-l-blue-300 dark:hover:border-l-blue-600",
                        index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/50 dark:bg-gray-850"
                      )}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 leading-tight">
                            {faq.question}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3">
                            {faq.answer}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {(Array.isArray(faq.tags) ? faq.tags : []).map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">
                              Atualizado: {new Date(faq.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        {/* Ações */}
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(faq);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(faq.id);
                            }}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FAQTreeView;