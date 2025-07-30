import React, { useMemo, useState } from "react";
import { FAQ } from "@/hooks/useFAQs";
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
  HelpCircle,
  Edit,
  Trash2,
  MoreVertical,
  MessageSquare,
  Tag,
  Users,
  Settings,
  ShoppingCart,
  CreditCard,
  Headphones,
  BookOpen,
  Shield
} from "lucide-react";

interface FAQHierarchicalViewProps {
  faqs: FAQ[];
  onEdit: (faq: FAQ) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
  searchTerm?: string;
}

// Mapeamento de categorias para labels amigáveis e ícones
const categoryConfig = {
  geral: { 
    label: "Perguntas Gerais", 
    icon: HelpCircle, 
    color: "bg-blue-100 text-blue-800",
    description: "Dúvidas comuns e informações básicas"
  },
  produto: { 
    label: "Produtos e Serviços", 
    icon: ShoppingCart, 
    color: "bg-green-100 text-green-800",
    description: "Informações sobre produtos e serviços oferecidos"
  },
  pagamento: { 
    label: "Pagamentos", 
    icon: CreditCard, 
    color: "bg-yellow-100 text-yellow-800",
    description: "Formas de pagamento, cobrança e faturamento"
  },
  suporte: { 
    label: "Suporte Técnico", 
    icon: Headphones, 
    color: "bg-purple-100 text-purple-800",
    description: "Ajuda técnica e resolução de problemas"
  },
  conta: { 
    label: "Conta e Perfil", 
    icon: Users, 
    color: "bg-indigo-100 text-indigo-800",
    description: "Gerenciamento de conta e configurações de perfil"
  },
  politicas: { 
    label: "Políticas", 
    icon: Shield, 
    color: "bg-red-100 text-red-800",
    description: "Termos de uso, privacidade e políticas"
  },
  tutorial: { 
    label: "Tutoriais", 
    icon: BookOpen, 
    color: "bg-orange-100 text-orange-800",
    description: "Guias e instruções passo a passo"
  },
};

const FAQHierarchicalView: React.FC<FAQHierarchicalViewProps> = ({
  faqs,
  onEdit,
  onDelete,
  isDeleting,
  searchTerm = ""
}) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Agrupar FAQs por categoria
  const groupedFAQs = useMemo(() => {
    const groups = new Map<string, FAQ[]>();
    
    faqs.forEach(faq => {
      const category = faq.category || 'geral';
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(faq);
    });

    // Ordenar FAQs dentro de cada categoria por pergunta
    groups.forEach(faqList => {
      faqList.sort((a, b) => (a.question || '').localeCompare(b.question || ''));
    });

    return groups;
  }, [faqs]);

  // Filtrar categorias que contêm FAQs correspondentes à busca
  const filteredGroups = useMemo(() => {
    if (!searchTerm) return groupedFAQs;

    const filtered = new Map<string, FAQ[]>();
    const searchLower = searchTerm.toLowerCase();

    groupedFAQs.forEach((faqList, category) => {
      const matchingFAQs = faqList.filter(faq =>
        faq.question?.toLowerCase().includes(searchLower) ||
        faq.answer?.toLowerCase().includes(searchLower) ||
        faq.category?.toLowerCase().includes(searchLower)
      );
      
      if (matchingFAQs.length > 0) {
        filtered.set(category, matchingFAQs);
      }
    });

    return filtered;
  }, [groupedFAQs, searchTerm]);

  // Auto-expandir categorias que contêm resultados de busca
  React.useEffect(() => {
    if (searchTerm) {
      const categoriesToExpand = Array.from(filteredGroups.keys());
      setExpandedCategories(categoriesToExpand);
    }
  }, [searchTerm, filteredGroups]);

  const getCategoryConfig = (category: string) => {
    return categoryConfig[category as keyof typeof categoryConfig] || {
      label: category.charAt(0).toUpperCase() + category.slice(1),
      icon: HelpCircle,
      color: "bg-gray-100 text-gray-800",
      description: "Outras categorias"
    };
  };

  const handleAccordionChange = (value: string[]) => {
    setExpandedCategories(value);
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (filteredGroups.size === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhuma FAQ encontrada.</p>
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
          .map(([category, categoryFAQs]) => {
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
                    <div className="flex-1 text-left">
                      <span className="font-semibold">{config.label}</span>
                      <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
                    </div>
                    <Badge variant="secondary" className={`ml-auto ${config.color}`}>
                      {categoryFAQs.length} FAQ{categoryFAQs.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionPanel className="px-0 pb-0">
                  <div className="space-y-2 p-4 pt-0">
                    {categoryFAQs.map((faq) => (
                      <div
                        key={faq.id}
                        className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="font-medium text-base leading-tight mb-2">{faq.question}</h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {truncateText(faq.answer || '', 150)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              <span>Categoria: {config.label}</span>
                            </div>
                            {faq.created_at && (
                              <div className="flex items-center gap-1">
                                <span>Criado: {new Date(faq.created_at).toLocaleDateString('pt-BR')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(faq)}
                            className="gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Editar
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => onDelete(faq.id)}
                                className="text-destructive focus:text-destructive"
                                disabled={isDeleting}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
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

export default FAQHierarchicalView;