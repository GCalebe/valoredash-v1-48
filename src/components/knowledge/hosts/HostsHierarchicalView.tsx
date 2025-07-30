import React, { useMemo, useState, useEffect } from 'react';
import { Calendar, User, Edit, Trash2, Search, ChevronDown, ChevronRight, Clock, DollarSign, Users, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
} from '@/components/animate-ui/base/accordion';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Database } from '@/integrations/supabase/types';
import { Agenda } from '@/hooks/useAgendas';

type Host = Database['public']['Tables']['employees']['Row'];

interface HostsHierarchicalViewProps {
  hosts: Host[];
  agendas: Agenda[];
  searchTerm: string;
  onEdit: (host: Host) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

const HostsHierarchicalView: React.FC<HostsHierarchicalViewProps> = ({
  hosts,
  agendas,
  searchTerm,
  onEdit,
  onDelete,
  isDeleting = false,
}) => {
  // Estado para controlar quais categorias estão expandidas
  const [expandedAgendas, setExpandedAgendas] = useState<string[]>([]);

  // Agrupar hosts por agenda
  const hostsByAgenda = useMemo(() => {
    // Criar um mapa de agendas para hosts
    const agendaMap: Record<string, Host[]> = {};
    
    // Inicializar o mapa com todas as agendas (mesmo as que não têm hosts)
    agendas.forEach(agenda => {
      agendaMap[agenda.id] = [];
    });
    
    // Adicionar hosts às suas agendas correspondentes
    // Como não temos a relação direta no estado atual, vamos simular com base no nome do host
    // Em uma implementação real, você usaria a tabela employee_agendas
    hosts.forEach(host => {
      // Filtrar hosts com base no termo de busca
      if (
        searchTerm &&
        !host.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !host.role.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !host.description?.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return;
      }
      
      // Distribuir o host para todas as agendas (simulação)
      // Em uma implementação real, você verificaria a tabela employee_agendas
      agendas.forEach(agenda => {
        agendaMap[agenda.id].push(host);
      });
    });
    
    return agendaMap;
  }, [hosts, agendas, searchTerm]);

  // Auto-expandir agendas que contêm resultados de busca
  useEffect(() => {
    if (searchTerm) {
      const agendasWithResults = Object.entries(hostsByAgenda)
        .filter(([_, hosts]) => hosts.length > 0)
        .map(([agendaId]) => agendaId);
      
      setExpandedAgendas(agendasWithResults);
    } else {
      // Se não houver termo de busca, colapsar todas as agendas
      setExpandedAgendas([]);
    }
  }, [searchTerm, hostsByAgenda]);

  // Função para alternar a expansão de uma agenda
  const toggleAgenda = (agendaId: string) => {
    setExpandedAgendas(prev =>
      prev.includes(agendaId)
        ? prev.filter(id => id !== agendaId)
        : [...prev, agendaId]
    );
  };

  // Função para obter o nome da agenda
  const getAgendaName = (agendaId: string) => {
    const agenda = agendas.find(a => a.id === agendaId);
    return agenda?.name || 'Agenda sem nome';
  };

  // Função para obter a duração da agenda
  const getAgendaDuration = (agendaId: string) => {
    const agenda = agendas.find(a => a.id === agendaId);
    return agenda?.duration_minutes || 0;
  };

  // Função para obter o preço da agenda
  const getAgendaPrice = (agendaId: string) => {
    const agenda = agendas.find(a => a.id === agendaId);
    return agenda?.price || 0;
  };

  // Função para formatar o preço
  const formatPrice = (agendaId: string) => {
    const price = getAgendaPrice(agendaId);
    return price ? `R$ ${price.toFixed(2)}` : 'Gratuito';
  };

  // Função para obter a categoria da agenda
  const getAgendaCategory = (agendaId: string) => {
    const agenda = agendas.find(a => a.id === agendaId);
    return agenda?.category || 'sem-categoria';
  };

  return (
    <div className="space-y-4">
      {Object.keys(hostsByAgenda).length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Nenhuma agenda encontrada</h3>
          <p className="text-sm text-muted-foreground">Adicione agendas para visualizar os anfitriões associados.</p>
        </div>
      ) : (
        <Accordion
          type="multiple"
          value={expandedAgendas}
          onValueChange={setExpandedAgendas}
          className="space-y-4"
        >
          {Object.entries(hostsByAgenda).map(([agendaId, agendaHosts]) => {
            // Pular agendas sem hosts ou que não correspondem à busca
            if (agendaHosts.length === 0) return null;
            
            const agendaName = getAgendaName(agendaId);
            const agendaCategory = getAgendaCategory(agendaId);
            const agendaDuration = getAgendaDuration(agendaId);
            
            return (
              <AccordionItem
                key={agendaId}
                value={agendaId}
                className="border rounded-lg overflow-hidden"
              >
                <AccordionTrigger
                  className="px-4 py-2 hover:bg-muted/50 transition-all"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleAgenda(agendaId);
                  }}
                >
                  <div className="flex items-center gap-3 text-left">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="text-base font-medium">{agendaName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {agendaCategory.charAt(0).toUpperCase() + agendaCategory.slice(1)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {agendaHosts.length} anfitrião(ões)
                        </span>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionPanel className="px-4 py-2">
                  <div className="grid gap-4 mt-2">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Duração: {agendaDuration} min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>Preço: {formatPrice(agendaId)}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mt-2">
                      {agendaHosts.map((host) => (
                        <Card key={host.id} className="overflow-hidden hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <User className="h-6 w-6 text-primary" />
                                <div>
                                  <h4 className="text-base font-medium">{host.name}</h4>
                                  <Badge variant="secondary" className="text-xs mt-1">{host.role}</Badge>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm" onClick={() => onEdit(host)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => onDelete(host.id)}
                                  disabled={isDeleting}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            {host.description && (
                              <p className="text-sm text-muted-foreground mt-2">{host.description}</p>
                            )}
                            {host.available_days && (
                              <div className="mt-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">Dias disponíveis:</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {host.available_days.map((day) => (
                                    <Badge key={day} variant="outline" className="text-xs">
                                      {day}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </AccordionPanel>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
};

export default HostsHierarchicalView;