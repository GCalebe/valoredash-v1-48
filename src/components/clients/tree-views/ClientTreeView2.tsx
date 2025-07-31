import React, { useMemo, useState } from 'react';
import { Contact } from '@/types/client';
import { ChevronDown, ChevronRight, TrendingUp, DollarSign, User, Calendar, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ClientTreeView2Props {
  contacts: Contact[];
  onContactClick?: (contact: Contact) => void;
  onEditClick?: (contact: Contact) => void;
}

/**
 * IDEIA 2: Árvore de Funil de Vendas por Estágio de Consulta → Valor do Lead
 * Organiza os clientes em uma estrutura de funil de vendas:
 * - Nível 1: Estágio de Consulta (Nova consulta, Qualificado, etc.)
 * - Nível 2: Faixas de Valor do Lead (Alto, Médio, Baixo)
 * - Nível 3: Clientes individuais com métricas de conversão
 */
const ClientTreeView2: React.FC<ClientTreeView2Props> = ({
  contacts,
  onContactClick,
  onEditClick,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Define a ordem dos estágios do funil
  const stageOrder = [
    'Nova consulta',
    'Qualificado',
    'Chamada agendada',
    'Preparando proposta',
    'Proposta enviada',
    'Acompanhamento',
    'Negociação',
    'Fatura enviada',
    'Fatura paga – ganho',
    'Projeto cancelado – perdido'
  ];

  // Organiza os dados em estrutura hierárquica
  const treeData = useMemo(() => {
    const tree: Record<string, Record<string, Contact[]>> = {};
    
    contacts.forEach(contact => {
      const stage = contact.consultationStage || 'Não Definido';
      const leadValue = contact.lead_value || 0;
      
      // Categoriza por valor do lead
      let valueCategory = 'Baixo (< R$ 5.000)';
      if (leadValue >= 20000) {
        valueCategory = 'Alto (≥ R$ 20.000)';
      } else if (leadValue >= 5000) {
        valueCategory = 'Médio (R$ 5.000 - R$ 19.999)';
      }
      
      if (!tree[stage]) tree[stage] = {};
      if (!tree[stage][valueCategory]) tree[stage][valueCategory] = [];
      
      tree[stage][valueCategory].push(contact);
    });
    
    return tree;
  }, [contacts]);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getStageColor = (stage: string) => {
    const stageIndex = stageOrder.indexOf(stage);
    if (stageIndex === -1) return 'bg-gray-100 text-gray-800';
    
    const colors = [
      'bg-blue-100 text-blue-800',     // Nova consulta
      'bg-indigo-100 text-indigo-800', // Qualificado
      'bg-purple-100 text-purple-800', // Chamada agendada
      'bg-pink-100 text-pink-800',     // Preparando proposta
      'bg-orange-100 text-orange-800', // Proposta enviada
      'bg-yellow-100 text-yellow-800', // Acompanhamento
      'bg-amber-100 text-amber-800',   // Negociação
      'bg-lime-100 text-lime-800',     // Fatura enviada
      'bg-green-100 text-green-800',   // Fatura paga – ganho
      'bg-red-100 text-red-800'        // Projeto cancelado – perdido
    ];
    
    return colors[stageIndex] || 'bg-gray-100 text-gray-800';
  };

  const getValueColor = (category: string) => {
    if (category.includes('Alto')) return 'bg-green-100 text-green-800';
    if (category.includes('Médio')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getStageProgress = (stage: string) => {
    const stageIndex = stageOrder.indexOf(stage);
    if (stageIndex === -1) return 0;
    return ((stageIndex + 1) / stageOrder.length) * 100;
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

  // Ordena os estágios conforme a ordem do funil
  const sortedStages = Object.keys(treeData).sort((a, b) => {
    const indexA = stageOrder.indexOf(a);
    const indexB = stageOrder.indexOf(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Funil de Vendas - Estágio → Valor do Lead
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedStages.map((stage) => {
            const valueGroups = treeData[stage];
            const stageId = `stage-${stage}`;
            const isStageExpanded = expandedNodes.has(stageId);
            const stageContacts = Object.values(valueGroups).flat();
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
                        <DollarSign className="h-3 w-3" />
                        <span>{formatCurrency(totalValue)}</span>
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
                    {Object.entries(valueGroups)
                      .sort(([a], [b]) => {
                        // Ordena por valor: Alto, Médio, Baixo
                        const order = ['Alto', 'Médio', 'Baixo'];
                        const indexA = order.findIndex(o => a.includes(o));
                        const indexB = order.findIndex(o => b.includes(o));
                        return indexA - indexB;
                      })
                      .map(([valueCategory, contactList]) => {
                        const valueId = `value-${stage}-${valueCategory}`;
                        const isValueExpanded = expandedNodes.has(valueId);
                        const categoryTotal = calculateTotalValue(contactList);

                        return (
                          <div key={valueCategory} className="mb-3 last:mb-0">
                            <div
                              className="flex items-center gap-2 p-3 bg-white rounded cursor-pointer hover:shadow-sm transition-shadow"
                              onClick={() => toggleNode(valueId)}
                            >
                              {isValueExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              <DollarSign className="h-4 w-4" />
                              <Badge className={getValueColor(valueCategory)}>
                                {valueCategory}
                              </Badge>
                              <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
                                <span>{contactList.length} cliente{contactList.length !== 1 ? 's' : ''}</span>
                                <span>•</span>
                                <span className="font-medium">{formatCurrency(categoryTotal)}</span>
                              </div>
                            </div>

                            {isValueExpanded && (
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