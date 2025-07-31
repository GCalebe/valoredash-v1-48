import React, { useMemo, useState } from 'react';
import { Contact } from '@/types/client';
import { ChevronDown, ChevronRight, Tag, Zap, User, ExternalLink, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ClientTreeView4Props {
  contacts: Contact[];
  onContactClick?: (contact: Contact) => void;
  onEditClick?: (contact: Contact) => void;
}

/**
 * IDEIA 4: Árvore de Segmentação por Tags → Origem do Lead → Probabilidade
 * Organiza os clientes em uma estrutura de marketing e segmentação:
 * - Nível 1: Tags/Categorias (baseado nas tags dos clientes)
 * - Nível 2: Origem do Lead (lead_source)
 * - Nível 3: Probabilidade de Conversão (faixas de %)
 * - Nível 4: Clientes individuais
 */
const ClientTreeView4: React.FC<ClientTreeView4Props> = ({
  contacts,
  onContactClick,
  onEditClick,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Organiza os dados em estrutura hierárquica
  const treeData = useMemo(() => {
    const tree: Record<string, Record<string, Record<string, Contact[]>>> = {};
    
    contacts.forEach(contact => {
      // Se não tem tags, cria uma categoria "Sem Tags"
      const tags = contact.tags && contact.tags.length > 0 ? contact.tags : ['Sem Tags'];
      
      tags.forEach(tag => {
        const leadSource = contact.lead_source || 'Origem Desconhecida';
        const probability = contact.conversion_probability || 0;
        
        // Categoriza por probabilidade de conversão
        let probabilityCategory = 'Baixa (0-30%)';
        if (probability >= 80) {
          probabilityCategory = 'Muito Alta (80-100%)';
        } else if (probability >= 60) {
          probabilityCategory = 'Alta (60-79%)';
        } else if (probability >= 40) {
          probabilityCategory = 'Média (40-59%)';
        } else if (probability > 0) {
          probabilityCategory = 'Baixa (1-39%)';
        } else {
          probabilityCategory = 'Não Avaliada (0%)';
        }
        
        if (!tree[tag]) tree[tag] = {};
        if (!tree[tag][leadSource]) tree[tag][leadSource] = {};
        if (!tree[tag][leadSource][probabilityCategory]) tree[tag][leadSource][probabilityCategory] = [];
        
        tree[tag][leadSource][probabilityCategory].push(contact);
      });
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

  const getTagColor = (tag: string) => {
    if (tag === 'Sem Tags') return 'bg-gray-100 text-gray-800';
    
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
      'bg-yellow-100 text-yellow-800',
      'bg-red-100 text-red-800',
      'bg-teal-100 text-teal-800',
      'bg-cyan-100 text-cyan-800'
    ];
    
    // Usa hash para consistência de cores
    const hash = tag.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  const getSourceIcon = (source: string) => {
    const sourceLower = source.toLowerCase();
    if (sourceLower.includes('google') || sourceLower.includes('search')) return '🔍';
    if (sourceLower.includes('facebook') || sourceLower.includes('fb')) return '📘';
    if (sourceLower.includes('instagram') || sourceLower.includes('ig')) return '📷';
    if (sourceLower.includes('linkedin')) return '💼';
    if (sourceLower.includes('whatsapp') || sourceLower.includes('wpp')) return '💬';
    if (sourceLower.includes('email') || sourceLower.includes('newsletter')) return '📧';
    if (sourceLower.includes('referral') || sourceLower.includes('indicação')) return '👥';
    if (sourceLower.includes('website') || sourceLower.includes('site')) return '🌐';
    if (sourceLower.includes('evento') || sourceLower.includes('event')) return '🎪';
    if (sourceLower.includes('telefone') || sourceLower.includes('phone')) return '📞';
    return '❓';
  };

  const getSourceColor = (source: string) => {
    const sourceLower = source.toLowerCase();
    if (sourceLower.includes('google')) return 'bg-red-100 text-red-800';
    if (sourceLower.includes('facebook')) return 'bg-blue-100 text-blue-800';
    if (sourceLower.includes('instagram')) return 'bg-pink-100 text-pink-800';
    if (sourceLower.includes('linkedin')) return 'bg-indigo-100 text-indigo-800';
    if (sourceLower.includes('whatsapp')) return 'bg-green-100 text-green-800';
    if (sourceLower.includes('email')) return 'bg-gray-100 text-gray-800';
    if (sourceLower.includes('referral')) return 'bg-purple-100 text-purple-800';
    if (sourceLower.includes('website')) return 'bg-cyan-100 text-cyan-800';
    return 'bg-orange-100 text-orange-800';
  };

  const getProbabilityColor = (category: string) => {
    if (category.includes('Muito Alta')) return 'bg-green-100 text-green-800';
    if (category.includes('Alta')) return 'bg-lime-100 text-lime-800';
    if (category.includes('Média')) return 'bg-yellow-100 text-yellow-800';
    if (category.includes('Baixa')) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  const calculateAverageConversion = (contacts: Contact[]) => {
    const validContacts = contacts.filter(c => c.conversion_probability && c.conversion_probability > 0);
    if (validContacts.length === 0) return 0;
    
    const sum = validContacts.reduce((acc, c) => acc + (c.conversion_probability || 0), 0);
    return Math.round(sum / validContacts.length);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Remove duplicatas de contatos (já que um contato pode ter múltiplas tags)
  const getUniqueContacts = (contacts: Contact[]) => {
    const seen = new Set();
    return contacts.filter(contact => {
      if (seen.has(contact.id)) return false;
      seen.add(contact.id);
      return true;
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Segmentação de Marketing - Tags
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(treeData)
            .sort(([a], [b]) => {
              // Prioriza tags reais sobre "Sem Tags"
              if (a === 'Sem Tags') return 1;
              if (b === 'Sem Tags') return -1;
              return a.localeCompare(b);
            })
            .map(([tag, sourceGroups]) => {
              const tagId = `tag-${tag}`;
              const isTagExpanded = expandedNodes.has(tagId);
              const tagContacts = getUniqueContacts(Object.values(sourceGroups).flatMap(s => Object.values(s).flat()));
              const avgConversion = calculateAverageConversion(tagContacts);

              return (
                <div key={tag} className="border rounded-lg overflow-hidden">
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleNode(tagId)}
                  >
                    {isTagExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <Tag className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getTagColor(tag)}>
                          {tag}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {tagContacts.length} cliente{tagContacts.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>Conversão média: {avgConversion}%</span>
                        </div>
                        <div>
                          {Object.keys(sourceGroups).length} origem{Object.keys(sourceGroups).length !== 1 ? 'ns' : ''}
                        </div>
                      </div>
                    </div>
                  </div>

                  {isTagExpanded && (
                    <div className="bg-gray-50 p-4">
                      {Object.entries(sourceGroups)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([source, probabilityGroups]) => {
                          const sourceId = `source-${tag}-${source}`;
                          const isSourceExpanded = expandedNodes.has(sourceId);
                          const sourceContacts = getUniqueContacts(Object.values(probabilityGroups).flat());
                          const sourceAvgConversion = calculateAverageConversion(sourceContacts);

                          return (
                            <div key={source} className="mb-3 last:mb-0">
                              <div
                                className="flex items-center gap-3 p-3 bg-white rounded cursor-pointer hover:shadow-sm transition-shadow"
                                onClick={() => toggleNode(sourceId)}
                              >
                                {isSourceExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                <span className="text-xl">{getSourceIcon(source)}</span>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <Badge className={getSourceColor(source)}>
                                      {source}
                                    </Badge>
                                    <span className="text-sm text-gray-600">
                                      {sourceContacts.length} cliente{sourceContacts.length !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    Conversão média: {sourceAvgConversion}% • 
                                    {Object.keys(probabilityGroups).length} faixa{Object.keys(probabilityGroups).length !== 1 ? 's' : ''}
                                  </div>
                                </div>
                                <ExternalLink className="h-4 w-4 text-gray-400" />
                              </div>

                              {isSourceExpanded && (
                                <div className="mt-2 ml-6 space-y-2">
                                  {Object.entries(probabilityGroups)
                                    .sort(([a], [b]) => {
                                      // Ordena por probabilidade: Muito Alta, Alta, Média, Baixa, Não Avaliada
                                      const order = ['Muito Alta', 'Alta', 'Média', 'Baixa', 'Não Avaliada'];
                                      const indexA = order.findIndex(o => a.includes(o));
                                      const indexB = order.findIndex(o => b.includes(o));
                                      return indexA - indexB;
                                    })
                                    .map(([probability, contactList]) => {
                                      const probabilityId = `probability-${tag}-${source}-${probability}`;
                                      const isProbabilityExpanded = expandedNodes.has(probabilityId);
                                      const uniqueContacts = getUniqueContacts(contactList);

                                      return (
                                        <div key={probability}>
                                          <div
                                            className="flex items-center gap-2 p-2 bg-white border rounded cursor-pointer hover:shadow-sm transition-shadow"
                                            onClick={() => toggleNode(probabilityId)}
                                          >
                                            {isProbabilityExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                            <Zap className="h-3 w-3" />
                                            <Badge className={getProbabilityColor(probability)} variant="outline">
                                              {probability}
                                            </Badge>
                                            <span className="text-sm text-gray-600 ml-auto">
                                              {uniqueContacts.length} cliente{uniqueContacts.length !== 1 ? 's' : ''}
                                            </span>
                                          </div>

                                          {isProbabilityExpanded && (
                                            <div className="mt-1 ml-4 space-y-1">
                                              {uniqueContacts
                                                .sort((a, b) => (b.conversion_probability || 0) - (a.conversion_probability || 0))
                                                .map(contact => (
                                                  <div
                                                    key={contact.id}
                                                    className="flex items-center justify-between p-2 bg-white border rounded hover:shadow-sm transition-shadow cursor-pointer"
                                                    onClick={() => onContactClick?.(contact)}
                                                  >
                                                    <div className="flex items-center gap-2">
                                                      <User className="h-3 w-3 text-gray-400" />
                                                      <div>
                                                        <div className="text-sm font-medium">{contact.name}</div>
                                                        <div className="text-xs text-gray-500 flex items-center gap-2">
                                                          {contact.company && (
                                                            <span>{contact.company}</span>
                                                          )}
                                                          {contact.created_at && (
                                                            <span className="flex items-center gap-1">
                                                              <Calendar className="h-3 w-3" />
                                                              {formatDate(contact.created_at)}
                                                            </span>
                                                          )}
                                                        </div>
                                                      </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                      {contact.conversion_probability && contact.conversion_probability > 0 && (
                                                        <Badge variant="outline" className="text-xs">
                                                          {contact.conversion_probability}%
                                                        </Badge>
                                                      )}
                                                      {contact.tags && contact.tags.length > 1 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                          +{contact.tags.length - 1} tag{contact.tags.length - 1 !== 1 ? 's' : ''}
                                                        </Badge>
                                                      )}
                                                      {onEditClick && (
                                                        <Button
                                                          size="sm"
                                                          variant="ghost"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            onEditClick(contact);
                                                          }}
                                                          className="h-6 w-6 p-0"
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
                  )}
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientTreeView4;