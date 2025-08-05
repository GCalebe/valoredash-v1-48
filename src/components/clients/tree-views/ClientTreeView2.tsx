import React, { useMemo, useState } from 'react';
import { Contact } from '@/types/client';
import { ChevronDown, ChevronRight, TrendingUp, CalendarCheck, User, Calendar, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useKanbanStagesSupabase } from '@/hooks/useKanbanStagesSupabase';

interface ClientTreeView2Props {
  contacts: Contact[];
  onContactClick?: (contact: Contact) => void;
  onEditClick?: (contact: Contact) => void;
}

/**
 * IDEIA 2: Árvore de Funil de Vendas por Estágio Kanban → Agenda
 * Organiza os clientes em uma estrutura de funil de vendas:
 * - Nível 1: Estágio Kanban (Entraram, Conversaram, etc.)
 * - Nível 2: Status de Agendamento (Com agendamento, Sem agendamento)
 * - Nível 3: Clientes individuais com métricas de conversão
 */
const ClientTreeView2: React.FC<ClientTreeView2Props> = ({
  contacts,
  onContactClick,
  onEditClick,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const { stages: kanbanStages } = useKanbanStagesSupabase();

  // Organiza os dados em estrutura hierárquica
  const treeData = useMemo(() => {
    const tree: Record<string, Record<string, Contact[]>> = {};
    
    contacts.forEach(contact => {
      // Find the stage name by matching kanban_stage_id with stages
      const kanbanStage = kanbanStages.find(stage => stage.id === contact.kanban_stage_id);
      const stageName = kanbanStage?.title || 'Não Definido';
      
      // Categoriza por status de agendamento
      // Verifica se o contato tem interações recentes (pode indicar agendamento)
      const hasRecentInteraction = contact.last_interaction && 
        new Date(contact.last_interaction) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // últimos 30 dias
      const scheduleCategory = hasRecentInteraction ? 'Com Agendamento' : 'Sem Agendamento';
      
      if (!tree[stageName]) tree[stageName] = {};
      if (!tree[stageName][scheduleCategory]) tree[stageName][scheduleCategory] = [];
      
      tree[stageName][scheduleCategory].push(contact);
    });
    
    return tree;
  }, [contacts, kanbanStages]);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getStageColor = (stageName: string) => {
    const kanbanStage = kanbanStages.find(stage => stage.title === stageName);
    if (kanbanStage?.settings?.color) {
      return `bg-[${kanbanStage.settings.color}] text-white`;
    }
    
    // Fallback colors based on stage name
    const colors: Record<string, string> = {
      'Entraram': 'bg-blue-100 text-blue-800',
      'Conversaram': 'bg-indigo-100 text-indigo-800',
      'Agendaram': 'bg-purple-100 text-purple-800',
      'Compareceram': 'bg-pink-100 text-pink-800',
      'Negociaram': 'bg-orange-100 text-orange-800',
      'Postergaram': 'bg-yellow-100 text-yellow-800',
      'Converteram': 'bg-green-100 text-green-800',
    };
    
    return colors[stageName] || 'bg-gray-100 text-gray-800';
  };

  const getScheduleColor = (category: string) => {
    if (category === 'Com Agendamento') return 'bg-green-100 text-green-800';
    return 'bg-orange-100 text-orange-800';
  };

  const getStageProgress = (stageName: string) => {
    const kanbanStage = kanbanStages.find(stage => stage.title === stageName);
    if (!kanbanStage) return 0;
    return ((kanbanStage.ordering + 1) / kanbanStages.length) * 100;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateTotalValue = (contacts: Contact[]) => {
    return contacts.reduce((sum, contact) => sum + (contact.lead_value || 0), 0);
  };

  // Ordena os estágios conforme a ordem do kanban
  const sortedStages = Object.keys(treeData).sort((a, b) => {
    const stageA = kanbanStages.find(stage => stage.title === a);
    const stageB = kanbanStages.find(stage => stage.title === b);
    
    if (!stageA && !stageB) return 0;
    if (!stageA) return 1;
    if (!stageB) return -1;
    
    return stageA.ordering - stageB.ordering;
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Funil de Vendas - Estágio Kanban → Agenda
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedStages.map((stage) => {
            const scheduleGroups = treeData[stage];
            const stageId = `stage-${stage}`;
            const isStageExpanded = expandedNodes.has(stageId);
            const stageContacts = Object.values(scheduleGroups).flat();
            const totalValue = calculateTotalValue(stageContacts);
            const progress = getStageProgress(stage);

            return (
              <div key={stage} className="border rounded-lg overflow-hidden">
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleNode(stageId)}
                >
                  {isStageExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <Target className="h-4 w-4" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{stage}</span>
                      <Badge className={getStageColor(stage)}>
                        {stageContacts.length} cliente{stageContacts.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <CalendarCheck className="h-3 w-3" />
                        <span>{scheduleGroups['Com Agendamento']?.length || 0} agendados</span>
                      </div>
                      <div className="flex-1 max-w-32">
                        <Progress value={progress} className="h-2" />
                        <span className="text-xs">{Math.round(progress)}% do funil</span>
                      </div>
                    </div>
                  </div>
                </div>

                {isStageExpanded && (
                  <div className="bg-gray-50 p-4">
                    {Object.entries(scheduleGroups)
                      .sort(([a], [b]) => {
                        // Ordena por agendamento: Com agendamento primeiro
                        const order = ['Com Agendamento', 'Sem Agendamento'];
                        return order.indexOf(a) - order.indexOf(b);
                      })
                      .map(([scheduleCategory, contactList]) => {
                        const scheduleId = `schedule-${stage}-${scheduleCategory}`;
                        const isScheduleExpanded = expandedNodes.has(scheduleId);
                        const categoryTotal = calculateTotalValue(contactList);

                        return (
                          <div key={scheduleCategory} className="mb-3 last:mb-0">
                            <div
                              className="flex items-center gap-2 p-3 bg-white rounded cursor-pointer hover:shadow-sm transition-shadow"
                              onClick={() => toggleNode(scheduleId)}
                            >
                              {isScheduleExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              <CalendarCheck className="h-4 w-4" />
                              <Badge className={getScheduleColor(scheduleCategory)}>
                                {scheduleCategory}
                              </Badge>
                              <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
                                <span>{contactList.length} cliente{contactList.length !== 1 ? 's' : ''}</span>
                                <span>•</span>
                                <span className="font-medium">{formatCurrency(categoryTotal)}</span>
                              </div>
                            </div>

                            {isScheduleExpanded && (
                              <div className="mt-2 space-y-2">
                                {contactList
                                  .sort((a, b) => (b.lead_value || 0) - (a.lead_value || 0))
                                  .map(contact => (
                                    <div
                                      key={contact.id}
                                      className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow cursor-pointer ml-6"
                                      onClick={() => onContactClick?.(contact)}
                                    >
                                      <div className="flex items-center gap-3">
                                        <User className="h-4 w-4 text-gray-400" />
                                        <div>
                                          <div className="font-medium">{contact.name}</div>
                                          <div className="text-sm text-gray-500 flex items-center gap-2">
                                            {contact.company && (
                                              <span>{contact.company}</span>
                                            )}
                                            {contact.conversion_probability && (
                                              <Badge variant="outline" className="text-xs">
                                                {contact.conversion_probability}% conversão
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <div className="text-right">
                                          <div className="font-medium text-green-600">
                                            {formatCurrency(contact.lead_value || 0)}
                                          </div>
                                          {contact.last_interaction && (
                                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                              <Calendar className="h-3 w-3" />
                                              {new Date(contact.last_interaction).toLocaleDateString('pt-BR')}
                                            </div>
                                          )}
                                        </div>
                                        {onEditClick && (
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onEditClick(contact);
                                            }}
                                            className="h-8 w-8 p-0"
                                          >
                                            ✏️
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientTreeView2;