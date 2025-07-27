import React, { useMemo, useState } from "react";
import { Product } from "@/types/product";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
} from "@/components/animate-ui/base/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Package,
  DollarSign,
  Edit,
  Trash2,
  MoreVertical,
  TrendingUp,
  Award,
  Tag,
  Zap,
  Users,
  BookOpen,
  BarChart3,
  Scale,
  Palette,
  ClipboardList
} from "lucide-react";

interface ProductHierarchicalViewProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
  searchTerm?: string;
}

// Mapeamento de categorias para labels amigáveis e ícones
const categoryConfig = {
  vendas: { label: "Vendas e Conversão", icon: TrendingUp, color: "bg-green-100 text-green-800" },
  marketing: { label: "Marketing Digital", icon: Zap, color: "bg-blue-100 text-blue-800" },
  suporte: { label: "Suporte Técnico", icon: Users, color: "bg-purple-100 text-purple-800" },
  financeiro: { label: "Financeiro", icon: DollarSign, color: "bg-yellow-100 text-yellow-800" },
  rh: { label: "Recursos Humanos", icon: Users, color: "bg-pink-100 text-pink-800" },
  educacao: { label: "Educação", icon: BookOpen, color: "bg-indigo-100 text-indigo-800" },
  analytics: { label: "Analytics e Dados", icon: BarChart3, color: "bg-cyan-100 text-cyan-800" },
  juridico: { label: "Jurídico", icon: Scale, color: "bg-red-100 text-red-800" },
  design: { label: "Design e Criação", icon: Palette, color: "bg-orange-100 text-orange-800" },
  gestao: { label: "Gestão de Projetos", icon: ClipboardList, color: "bg-gray-100 text-gray-800" },
};

const ProductHierarchicalView: React.FC<ProductHierarchicalViewProps> = ({
  products,
  onEdit,
  onDelete,
  isDeleting,
  searchTerm = ""
}) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Agrupar produtos por categoria
  const groupedProducts = useMemo(() => {
    const groups = new Map<string, Product[]>();
    
    products.forEach(product => {
      const category = product.category || 'outros';
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(product);
    });

    // Ordenar produtos dentro de cada categoria por nome
    groups.forEach(productList => {
      productList.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    });

    return groups;
  }, [products]);

  // Filtrar categorias que contêm produtos correspondentes à busca
  const filteredGroups = useMemo(() => {
    if (!searchTerm) return groupedProducts;

    const filtered = new Map<string, Product[]>();
    const searchLower = searchTerm.toLowerCase();

    groupedProducts.forEach((productList, category) => {
      const matchingProducts = productList.filter(product =>
        product.name?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower)
      );
      
      if (matchingProducts.length > 0) {
        filtered.set(category, matchingProducts);
      }
    });

    return filtered;
  }, [groupedProducts, searchTerm]);

  // Auto-expandir categorias que contêm resultados de busca
  React.useEffect(() => {
    if (searchTerm) {
      const categoriesToExpand = Array.from(filteredGroups.keys());
      setExpandedCategories(categoriesToExpand);
    }
  }, [searchTerm, filteredGroups]);

  const formatPrice = (price?: number) => {
    if (!price) return "R$ 0,00";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getCategoryConfig = (category: string) => {
    return categoryConfig[category as keyof typeof categoryConfig] || {
      label: category.charAt(0).toUpperCase() + category.slice(1),
      icon: Package,
      color: "bg-gray-100 text-gray-800"
    };
  };

  const handleAccordionChange = (value: string[]) => {
    setExpandedCategories(value);
  };

  if (filteredGroups.size === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhum produto encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Accordion 
        type="multiple" 
        value={expandedCategories}
        onValueChange={handleAccordionChange}
        className="w-full space-y-2"
      >
        {Array.from(filteredGroups.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([category, categoryProducts]) => {
            const config = getCategoryConfig(category);
            const IconComponent = config.icon;
            
            return (
              <AccordionItem 
                key={category} 
                value={category}
                className="border border-border rounded-lg overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                  <div className="flex items-center gap-3 flex-1">
                    <IconComponent className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold text-left">{config.label}</span>
                    <Badge variant="secondary" className={`ml-auto ${config.color}`}>
                      {categoryProducts.length} produto{categoryProducts.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionPanel className="px-0 pb-0">
                  <div className="space-y-2 p-4 pt-0">
                    {categoryProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate">{product.name}</h4>
                            <div className="flex gap-1">
                              {product.popular && (
                                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                                  <Award className="h-3 w-3 mr-1" />
                                  Popular
                                </Badge>
                              )}
                              {product.new && (
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                  <Tag className="h-3 w-3 mr-1" />
                                  Novo
                                </Badge>
                              )}
                              {product.has_promotion && (
                                <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
                                  Promoção
                                </Badge>
                              )}
                              {product.has_combo && (
                                <Badge variant="outline" className="text-xs">
                                  Combo
                                </Badge>
                              )}
                            </div>
                          </div>
                          {product.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
                              {product.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-primary">
                              {formatPrice(product.price)}
                            </span>
                            {product.benefits && product.benefits.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {product.benefits.length} benefício{product.benefits.length !== 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(product)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onDelete(product.id)}
                              disabled={isDeleting}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                </AccordionPanel>
              </AccordionItem>
            );
          })}
      </Accordion>
    </div>
  );
};

export default ProductHierarchicalView;