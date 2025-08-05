import React, { useMemo, useState } from "react";
import { AIPersonalityTemplate } from "@/data/aiPersonalityTemplates";
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
  Bot,
  Edit,
  Trash2,
  MoreVertical,
  Users,
  Briefcase,
  Heart,
  Zap,
  Shield,
  BookOpen,
  Headphones,
  TrendingUp,
  Eye,
  Star,
  Building
} from "lucide-react";

interface PersonalityHierarchicalViewProps {
  templates: AIPersonalityTemplate[];
  onEdit?: (template: AIPersonalityTemplate) => void;
  onDelete?: (id: string) => void;
  onPreview?: (template: AIPersonalityTemplate) => void;
  isDeleting?: boolean;
  searchTerm?: string;
}

// Mapeamento de categorias para labels amigáveis e ícones
const categoryConfig = {
  atendimento: { 
    label: "Atendimento ao Cliente", 
    icon: Headphones, 
    color: "bg-blue-100 text-blue-800",
    description: "Personalidades focadas em suporte e atendimento"
  },
  vendas: { 
    label: "Vendas e Conversão", 
    icon: TrendingUp, 
    color: "bg-green-100 text-green-800",
    description: "Personalidades otimizadas para vendas e conversões"
  },
  consultoria: { 
    label: "Consultoria Especializada", 
    icon: Briefcase, 
    color: "bg-purple-100 text-purple-800",
    description: "Personalidades para consultoria e aconselhamento"
  },
  educacao: { 
    label: "Educação e Treinamento", 
    icon: BookOpen, 
    color: "bg-indigo-100 text-indigo-800",
    description: "Personalidades educativas e instrutivas"
  },
  saude: { 
    label: "Saúde e Bem-estar", 
    icon: Heart, 
    color: "bg-red-100 text-red-800",
    description: "Personalidades para área da saúde"
  },
  tecnologia: { 
    label: "Tecnologia e Inovação", 
    icon: Zap, 
    color: "bg-yellow-100 text-yellow-800",
    description: "Personalidades técnicas e inovadoras"
  },
  juridico: { 
    label: "Jurídico e Compliance", 
    icon: Shield, 
    color: "bg-gray-100 text-gray-800",
    description: "Personalidades para área jurídica"
  },
  corporativo: { 
    label: "Corporativo e Empresarial", 
    icon: Building, 
    color: "bg-orange-100 text-orange-800",
    description: "Personalidades para ambiente corporativo"
  },
};

const PersonalityHierarchicalView: React.FC<PersonalityHierarchicalViewProps> = ({
  templates,
  onEdit,
  onDelete,
  onPreview,
  isDeleting,
  searchTerm = ""
}) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Agrupar templates por categoria
  const groupedTemplates = useMemo(() => {
    const groups = new Map<string, AIPersonalityTemplate[]>();
    
    templates.forEach(template => {
      const category = template.category || 'geral';
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(template);
    });

    // Ordenar templates dentro de cada categoria por nome
    groups.forEach(templateList => {
      templateList.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    });

    return groups;
  }, [templates]);

  // Filtrar categorias que contêm templates correspondentes à busca
  const filteredGroups = useMemo(() => {
    if (!searchTerm) return groupedTemplates;

    const filtered = new Map<string, AIPersonalityTemplate[]>();
    const searchLower = searchTerm.toLowerCase();

    groupedTemplates.forEach((templateList, category) => {
      const matchingTemplates = templateList.filter(template =>
        template.name?.toLowerCase().includes(searchLower) ||
        template.description?.toLowerCase().includes(searchLower) ||
        template.category?.toLowerCase().includes(searchLower) ||
        template.industry?.toLowerCase().includes(searchLower)
      );
      
      if (matchingTemplates.length > 0) {
        filtered.set(category, matchingTemplates);
      }
    });

    return filtered;
  }, [groupedTemplates, searchTerm]);

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
      icon: Bot,
      color: "bg-gray-100 text-gray-800",
      description: "Outras categorias"
    };
  };

  const handleAccordionChange = (value: string[]) => {
    setExpandedCategories(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800';
      case 'inativo':
        return 'bg-red-100 text-red-800';
      case 'rascunho':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const truncateText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (filteredGroups.size === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhuma personalidade encontrada.</p>
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
          .map(([category, categoryTemplates]) => {
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
                      {categoryTemplates.length} template{categoryTemplates.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionPanel className="px-0 pb-0">
                  <div className="space-y-2 p-4 pt-0">
                    {categoryTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="text-2xl">{template.icon}</div>
                            <div className="flex-1">
                              <h4 className="font-medium text-base">{template.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className={getStatusColor((template as any).status)}>
                                  {(template as any).status}
                                </Badge>
                                {template.industry && (
                                  <Badge variant="secondary" className="text-xs">
                                    {template.industry}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                            {truncateText(template.description)}
                          </p>
                          
                          <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              <span>Eficácia: {(template.metrics as any)?.effectiveness || 0}%</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>Satisfação: {(template.metrics as any)?.satisfaction || 0}%</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              <span>Conversão: {(template.metrics as any)?.conversionRate || 0}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {onPreview && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onPreview(template)}
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              Visualizar
                            </Button>
                          )}
                          
                          {(onEdit || onDelete) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {onEdit && (
                                  <DropdownMenuItem onClick={() => onEdit(template)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                )}
                                {onDelete && (
                                  <DropdownMenuItem
                                    onClick={() => onDelete(template.id)}
                                    className="text-destructive focus:text-destructive"
                                    disabled={isDeleting}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Excluir
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
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

export default PersonalityHierarchicalView;