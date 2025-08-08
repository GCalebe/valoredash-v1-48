import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from '@/components/animate-ui/base/accordion';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Filter, 
  X, 
  Users, 
  Tag, 
  TrendingUp,
  Clock,
  Star,
  Bookmark,
  Save,
  Trash2,
  Settings,
  Eye,
  EyeOff,
  RotateCcw,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

// Importar hooks reais do Supabase
import { useUnifiedClientFilters } from '@/hooks/useUnifiedClientFilters';
import { useKanbanStagesSupabase } from '@/hooks/useKanbanStagesSupabase';
import { useFilterableFields } from '@/hooks/useFilterableFields';
import { useFilteredContacts } from '@/hooks/useFilteredContacts';

interface FilterCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  filters: FilterItem[];
}

interface FilterItem {
  id: string;
  label: string;
  type: 'checkbox' | 'select' | 'range' | 'date' | 'text';
  value?: any;
  options?: string[];
  active: boolean;
}

interface SavedFilter {
  id: string;
  name: string;
  description: string;
  filters: Record<string, any>;
  createdAt: Date;
  favorite: boolean;
}

export const FilterDesignOption2 = () => {
  // Hooks reais do Supabase
  const unifiedFilters = useUnifiedClientFilters();
  const { stages: kanbanStages, loading: kanbanLoading } = useKanbanStagesSupabase();
  const { responsibleHosts, availableTags, loading: fieldsLoading } = useFilterableFields();
  const { contacts, isLoading: contactsLoading } = useFilteredContacts();

  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Usar os filtros unificados
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    segmentFilter,
    setSegmentFilter,
    lastContactFilter,
    setLastContactFilter,
    hasActiveFilters,
    clearFilters
  } = unifiedFilters;

  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([
    {
      id: '1',
      name: 'Clientes VIP Ativos',
      description: 'Clientes premium com status ativo',
      filters: { status: ['active'], tags: ['VIP'] },
      createdAt: new Date(),
      favorite: true
    },
    {
      id: '2',
      name: 'Prospects Recentes',
      description: 'Novos prospects dos últimos 30 dias',
      filters: { status: ['prospect'], dateRange: 'last30days' },
      createdAt: new Date(),
      favorite: false
    }
  ]);

  // Criar categorias dinamicamente baseadas nos dados reais
  const categories = useMemo<FilterCategory[]>(() => [
    {
      id: 'pipeline',
      title: 'Pipeline',
      icon: <Filter className="w-4 h-4" />,
      filters: kanbanStages.map(stage => ({
        id: `pipeline-${stage.id}`,
        label: stage.title,
        type: 'checkbox' as const,
        active: statusFilter === stage.id
      }))
    },
    {
      id: 'hosts',
      title: 'Anfitriões',
      icon: <Users className="w-4 h-4" />,
      filters: responsibleHosts.map(host => ({
        id: `host-${host}`,
        label: host,
        type: 'checkbox' as const,
        active: segmentFilter === host
      }))
    },
    {
      id: 'engagement',
      title: 'Período do Último Contato',
      icon: <Clock className="w-4 h-4" />,
      filters: [
        { id: 'contato-hoje', label: 'Hoje', type: 'checkbox' as const, active: lastContactFilter === 'today' },
        { id: 'contato-ontem', label: 'Ontem', type: 'checkbox' as const, active: lastContactFilter === 'yesterday' },
        { id: 'contato-semana', label: 'Últimos 7 dias', type: 'checkbox' as const, active: lastContactFilter === 'week' },
        { id: 'contato-mes', label: 'Últimos 30 dias', type: 'checkbox' as const, active: lastContactFilter === 'month' },
        { id: 'contato-trimestre', label: 'Últimos 90 dias', type: 'checkbox' as const, active: lastContactFilter === 'quarter' },
        { id: 'contato-semestre', label: 'Últimos 6 meses', type: 'checkbox' as const, active: lastContactFilter === 'semester' },
        { id: 'contato-ano', label: 'Último ano', type: 'checkbox' as const, active: lastContactFilter === 'year' },
        { id: 'sem-contato', label: 'Sem contato', type: 'checkbox' as const, active: lastContactFilter === 'never' }
      ]
    },
    {
      id: 'tags',
      title: 'Tags',
      icon: <Tag className="w-4 h-4" />,
      filters: availableTags.map(tag => ({
        id: `tag-${tag}`,
        label: tag,
        type: 'checkbox' as const,
        active: false // TODO: implementar lógica de tags ativas
      }))
    }
  ], [kanbanStages, responsibleHosts, availableTags, statusFilter, segmentFilter, lastContactFilter]);

  // Função para lidar com mudanças nos filtros
  const handleFilterChange = (filterId: string, active: boolean) => {
    if (filterId.startsWith('pipeline-')) {
      const stageId = filterId.replace('pipeline-', '');
      setStatusFilter(active ? stageId : 'all');
    } else if (filterId.startsWith('host-')) {
      const hostName = filterId.replace('host-', '');
      setSegmentFilter(active ? hostName : 'all');
    } else if (filterId.startsWith('contato-')) {
      const periodMap: Record<string, string> = {
        'contato-hoje': 'today',
        'contato-ontem': 'yesterday',
        'contato-semana': 'week',
        'contato-mes': 'month',
        'contato-trimestre': 'quarter',
        'contato-semestre': 'semester',
        'contato-ano': 'year',
        'sem-contato': 'never'
      };
      const period = periodMap[filterId];
      setLastContactFilter(active ? period : 'all');
    }
    // TODO: Implementar lógica para tags quando necessário
  };

  // Usar os contatos filtrados do hook
  const filteredData = contacts || [];

  const clearAllFilters = () => {
    clearFilters();
  };

  const clearSearchTerm = () => {
    setSearchTerm('');
  };

  const getActiveFilters = () => {
    const activeFilters: string[] = [];
    
    // Adicionar filtros ativos baseados nos hooks do Supabase
    if (statusFilter && statusFilter !== 'all') {
      const stage = kanbanStages.find(s => s.id === statusFilter);
      if (stage) activeFilters.push(`Pipeline: ${stage.title}`);
    }
    
    if (segmentFilter && segmentFilter !== 'all') {
      activeFilters.push(`Anfitrião: ${segmentFilter}`);
    }
    
    if (lastContactFilter && lastContactFilter !== 'all') {
      const periodLabels: Record<string, string> = {
        'today': 'Hoje',
        'yesterday': 'Ontem',
        'week': 'Últimos 7 dias',
        'month': 'Últimos 30 dias',
        'quarter': 'Últimos 90 dias',
        'semester': 'Últimos 6 meses',
        'year': 'Último ano',
        'never': 'Sem contato'
      };
      const label = periodLabels[lastContactFilter] || lastContactFilter;
      activeFilters.push(`Último Contato: ${label}`);
    }
    
    return activeFilters;
  };

  const currentActiveFilters = getActiveFilters();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Painel Lateral */}
      <div className={cn(
        "bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col",
        isPanelOpen ? "w-80" : "w-0 overflow-hidden"
      )}>
        {/* Cabeçalho do Painel */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filtros</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPanelOpen(false)}
              className="p-1 h-8 w-8"
            >
              <PanelLeftClose className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Busca */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar contatos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearchTerm}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 h-7 w-7"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>

          {/* Filtros Ativos */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Filtros Ativos ({currentActiveFilters.length + (searchTerm ? 1 : 0)})
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs p-1 h-6"
                disabled={!hasActiveFilters && !searchTerm}
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Limpar
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {searchTerm && (
                <Badge variant="secondary" className="text-xs">
                  Busca: {searchTerm}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearchTerm}
                    className="ml-1 p-0 h-4 w-4"
                  >
                    <X className="w-2 h-2" />
                  </Button>
                </Badge>
              )}
              {currentActiveFilters.map((filter, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {filter}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de Filtros */}
        <ScrollArea className="flex-1 p-4">
          <Accordion type="multiple" className="space-y-2">
            {categories.map((category) => (
              <AccordionItem key={category.id} value={category.id}>
                <AccordionTrigger className="flex items-center gap-2 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    {category.icon}
                    <span className="font-medium">{category.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionPanel className="px-3 pb-3">
                  <div className="space-y-2">
                    {category.filters.map((filter) => {
                      const isActive = filter.active;
                      
                      return (
                        <div key={filter.id} className="flex items-center space-x-2">
                          {filter.type === 'checkbox' && (
                            <>
                              <Checkbox
                                id={filter.id}
                                checked={isActive}
                                onCheckedChange={(checked) => 
                                  handleFilterChange(filter.id, checked as boolean)
                                }
                              />
                              <Label htmlFor={filter.id} className="text-sm">
                                {filter.label}
                              </Label>
                            </>
                          )}
                          {filter.type === 'select' && (
                            <div className="w-full">
                              <Label className="text-sm">{filter.label}</Label>
                              <Select>
                                <SelectTrigger className="w-full mt-1">
                                  <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {filter.options?.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>

        {/* Rodapé do Painel */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <Button className="w-full" size="sm">
            <Save className="w-4 h-4 mr-2" />
            Salvar Filtros
          </Button>
          <Button variant="outline" className="w-full" size="sm" onClick={clearAllFilters}>
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Filtros
          </Button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col">
        {/* Cabeçalho */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!isPanelOpen && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPanelOpen(true)}
                  className="p-2"
                >
                  <PanelLeftOpen className="w-4 h-4" />
                </Button>
              )}
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Contatos ({filteredData.length})
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredData.length} contatos encontrados
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
              <Button size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Visualizar
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de Contatos */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {filteredData.length > 0 ? (
              <div className="grid gap-4">
                {filteredData.map((contact) => (
                  <Card key={contact.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {contact.name || 'Nome não informado'}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {contact.status || 'Status não definido'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div>
                            <span className="font-medium">Email:</span> {contact.email || 'Não informado'}
                          </div>
                          <div>
                            <span className="font-medium">Telefone:</span> {contact.phone || 'Não informado'}
                          </div>
                          <div>
                            <span className="font-medium">Criado em:</span> {contact.created_at ? new Date(contact.created_at).toLocaleDateString() : 'Não informado'}
                          </div>
                          <div>
                            <span className="font-medium">Atualizado em:</span> {contact.updated_at ? new Date(contact.updated_at).toLocaleDateString() : 'Não informado'}
                          </div>
                        </div>
                        {contact.tags && contact.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {contact.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Nenhum contato encontrado
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Tente ajustar seus filtros ou termo de busca
                </p>
                <div className="flex items-center justify-center gap-2">
                  {searchTerm && (
                    <Button variant="outline" size="sm" onClick={clearSearchTerm}>
                      <X className="w-4 h-4 mr-2" />
                      Limpar Busca
                    </Button>
                  )}
                  {hasActiveFilters && (
                    <Button variant="outline" size="sm" onClick={clearAllFilters}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Limpar Filtros
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};