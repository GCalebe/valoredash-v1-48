import React, { useMemo, useState } from "react";
import { categoryDetails } from "../tabs/AgendaTab";
import { LocalAgenda } from "./types";
import { Agenda } from "@/hooks/useAgendas";
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
  Calendar,
  Clock,
  Edit,
  Trash2,
  MoreVertical,
  Users,
  Repeat,
  DollarSign,
  UserCheck
} from "lucide-react";

interface AgendaHierarchicalViewProps {
  agendas: LocalAgenda[];
  onEdit: (agenda: LocalAgenda) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
  searchTerm?: string;
  supabaseAgendas?: Agenda[];
}

// Mapeamento de categorias para labels amigáveis e ícones
const categoryConfig = {
  consulta: { 
    label: "Consultas", 
    icon: Calendar, 
    color: "bg-blue-100 text-blue-800",
    description: "Agendamentos individuais para consultas"
  },
  evento: { 
    label: "Eventos", 
    icon: Users, 
    color: "bg-green-100 text-green-800",
    description: "Eventos com múltiplos participantes"
  },
  classes: { 
    label: "Classes", 
    icon: Clock, 
    color: "bg-purple-100 text-purple-800",
    description: "Aulas e sessões em grupo"
  },
  recorrente: { 
    label: "Recorrentes", 
    icon: Repeat, 
    color: "bg-orange-100 text-orange-800",
    description: "Agendamentos com recorrência"
  },
};

const AgendaHierarchicalView: React.FC<AgendaHierarchicalViewProps> = ({
  agendas,
  onEdit,
  onDelete,
  isDeleting,
  searchTerm = "",
  supabaseAgendas = []
}) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Agrupar agendas por categoria
  const groupedAgendas = useMemo(() => {
    const groups = new Map<string, LocalAgenda[]>();
    
    agendas.forEach(agenda => {
      const category = agenda.category || 'outros';
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(agenda);
    });

    // Ordenar agendas dentro de cada categoria por nome
    groups.forEach(agendaList => {
      agendaList.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    });

    return groups;
  }, [agendas]);

  // Filtrar categorias que contêm agendas correspondentes à busca
  const filteredGroups = useMemo(() => {
    if (!searchTerm) return groupedAgendas;

    const filtered = new Map<string, LocalAgenda[]>();
    const searchLower = searchTerm.toLowerCase();

    groupedAgendas.forEach((agendaList, category) => {
      const matchingAgendas = agendaList.filter(agenda =>
        agenda.title?.toLowerCase().includes(searchLower) ||
        agenda.description?.toLowerCase().includes(searchLower) ||
        agenda.category?.toLowerCase().includes(searchLower)
      );
      
      if (matchingAgendas.length > 0) {
        filtered.set(category, matchingAgendas);
      }
    });

    return filtered;
  }, [groupedAgendas, searchTerm]);

  // Auto-expandir categorias que contêm resultados de busca
  React.useEffect(() => {
    if (searchTerm) {
      const categoriesToExpand = Array.from(filteredGroups.keys());
      setExpandedCategories(categoriesToExpand);
    }
  }, [searchTerm, filteredGroups]);

  const formatPrice = (agendaId: string) => {
    const supabaseAgenda = supabaseAgendas.find(sa => sa.id === agendaId);
    if (!supabaseAgenda?.price) return "Gratuito";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(supabaseAgenda.price);
  };

  const getMaxParticipants = (agendaId: string) => {
    const supabaseAgenda = supabaseAgendas.find(sa => sa.id === agendaId);
    return supabaseAgenda?.max_participants || 1;
  };

  const getCategoryConfig = (category: string) => {
    return categoryConfig[category as keyof typeof categoryConfig] || {
      label: category.charAt(0).toUpperCase() + category.slice(1),
      icon: Calendar,
      color: "bg-gray-100 text-gray-800",
      description: "Outras categorias"
    };
  };

  const handleAccordionChange = (value: string[]) => {
    setExpandedCategories(value);
  };

  if (filteredGroups.size === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhuma agenda encontrada.</p>
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
          .map(([category, categoryAgendas]) => {
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
                      {categoryAgendas.length} agenda{categoryAgendas.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionPanel className="px-0 pb-0">
                  <div className="space-y-2 p-4 pt-0">
                    {categoryAgendas.map((agenda) => (
                      <div
                        key={agenda.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-base truncate">{agenda.title}</h4>
                            <div className="flex gap-1">
                              {agenda.category && (
                                <Badge variant="outline" className="text-xs">
                                  {categoryDetails[agenda.category as keyof typeof categoryDetails]?.title || agenda.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {agenda.description}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>Duração: {agenda.duration} min</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span>Preço: {formatPrice(agenda.id)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-4 w-4 text-muted-foreground" />
                              <span>Intervalo: {agenda.breakTime} min</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>Máx: {getMaxParticipants(agenda.id)} pessoa{getMaxParticipants(agenda.id) !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(agenda)}
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
                                onClick={() => onDelete(agenda.id)}
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

export default AgendaHierarchicalView;