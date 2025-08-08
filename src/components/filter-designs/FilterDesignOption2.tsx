import React, { useState } from 'react';
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

interface FilterCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
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
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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

  const [categories, setCategories] = useState([
    {
      id: 'basic',
      name: 'Filtros Básicos',
      icon: <Filter className="w-4 h-4" />,
      filters: [
        { id: 'status-active', label: 'Ativo', type: 'checkbox', active: false },
        { id: 'status-inactive', label: 'Inativo', type: 'checkbox', active: false },
        { id: 'status-prospect', label: 'Prospect', type: 'checkbox', active: false },
        { id: 'status-client', label: 'Cliente', type: 'checkbox', active: false }
      ]
    },
    {
      id: 'segment',
      title: 'Segmentação',
      icon: <Users className="w-4 h-4" />,
      filters: [
        { id: 'size-small', label: 'Pequeno Porte', type: 'checkbox', active: false },
        { id: 'size-medium', label: 'Médio Porte', type: 'checkbox', active: false },
        { id: 'size-large', label: 'Grande Porte', type: 'checkbox', active: false },
        { id: 'size-enterprise', label: 'Enterprise', type: 'checkbox', active: false }
      ]
    },
    {
      id: 'engagement',
      title: 'Engajamento',
      icon: <TrendingUp className="w-4 h-4" />,
      filters: [
        { id: 'last-contact', label: 'Último Contato', type: 'select', options: ['Hoje', 'Esta semana', 'Este mês', 'Mais de 30 dias'], active: false },
        { id: 'interaction-level', label: 'Nível de Interação', type: 'select', options: ['Alto', 'Médio', 'Baixo'], active: false }
      ]
    },
    {
      id: 'tags',
      title: 'Tags e Categorias',
      icon: <Tag className="w-4 h-4" />,
      filters: [
        { id: 'tag-vip', label: 'VIP', type: 'checkbox', active: false },
        { id: 'tag-premium', label: 'Premium', type: 'checkbox', active: false },
        { id: 'tag-corporate', label: 'Corporativo', type: 'checkbox', active: false },
        { id: 'tag-new', label: 'Novo Cliente', type: 'checkbox', active: false }
      ]
    },
    {
      id: 'temporal',
      title: 'Filtros Temporais',
      icon: <Clock className="w-4 h-4" />,
      filters: [
        { id: 'created-date', label: 'Data de Criação', type: 'date', active: false },
        { id: 'updated-date', label: 'Última Atualização', type: 'date', active: false }
      ]
    }
  ]);



  const toggleFilter = (categoryId: string, filterId: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? {
            ...cat,
            filters: cat.filters.map(filter => 
              filter.id === filterId ? { ...filter, active: !filter.active } : filter
            )
          }
        : cat
    ));
  };

  const getActiveFiltersCount = () => {
    return categories.reduce((total, category) => 
      total + category.filters.filter(filter => filter.active).length, 0
    );
  };

  const clearAllFilters = () => {
    setCategories(prev => prev.map(cat => ({
      ...cat,
      filters: cat.filters.map(filter => ({ ...filter, active: false }))
    })));
  };

  const toggleSavedFilterFavorite = (filterId: string) => {
    setSavedFilters(prev => prev.map(filter => 
      filter.id === filterId ? { ...filter, favorite: !filter.favorite } : filter
    ));
  };

  const deleteSavedFilter = (filterId: string) => {
    setSavedFilters(prev => prev.filter(filter => filter.id !== filterId));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Painel Lateral */}
      <div className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col",
        isPanelOpen ? "w-80" : "w-12"
      )}>
        {/* Header do Painel */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {isPanelOpen && (
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Filter className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Filtros Avançados</h2>
                <p className="text-xs text-gray-500">
                  {getActiveFiltersCount()} filtros ativos
                </p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className="p-2"
          >
            {isPanelOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </Button>
        </div>

        {isPanelOpen && (
          <>
            {/* Busca Rápida */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar filtros..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9 text-sm"
                />
              </div>
            </div>

            {/* Filtros Salvos */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Bookmark className="w-4 h-4" />
                  Filtros Salvos
                </h3>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Save className="w-3 h-3" />
                </Button>
              </div>
              <div className="space-y-2">
                {savedFilters.map((filter) => (
                  <div key={filter.id} className="group flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => toggleSavedFilterFavorite(filter.id)}
                        >
                          <Star className={cn(
                            "w-3 h-3",
                            filter.favorite ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
                          )} />
                        </Button>
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {filter.name}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{filter.description}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        onClick={() => deleteSavedFilter(filter.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Categorias de Filtros */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                <Accordion>
                  {categories.map((category) => (
                    <AccordionItem key={category.id} value={category.id}>
                      <AccordionTrigger className="w-full justify-between p-2 h-auto hover:bg-gray-50">
                        <div className="flex items-center gap-2">
                          {category.icon}
                          <span className="text-sm font-medium">{category.title}</span>
                          <Badge variant="secondary" className="text-xs">
                            {category.filters.filter(f => f.active).length}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionPanel className="space-y-2 mt-2 ml-6">
                      {category.filters.map((filter) => (
                        <div key={filter.id} className="flex items-center space-x-2">
                          {filter.type === 'checkbox' && (
                            <>
                              <Checkbox
                                id={filter.id}
                                checked={filter.active}
                                onCheckedChange={() => toggleFilter(category.id, filter.id)}
                              />
                              <Label
                                htmlFor={filter.id}
                                className="text-sm cursor-pointer flex-1"
                              >
                                {filter.label}
                              </Label>
                            </>
                          )}
                          {filter.type === 'select' && (
                            <div className="w-full">
                              <Label className="text-xs text-gray-500 mb-1 block">
                                {filter.label}
                              </Label>
                              <Select>
                                <SelectTrigger className="h-8 text-sm">
                                  <SelectValue placeholder="Selecionar..." />
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
                      ))}
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </ScrollArea>

            {/* Ações do Painel */}
            <div className="p-4 border-t border-gray-200 space-y-2">
              <div className="flex gap-2">
                <Button size="sm" className="flex-1">
                  Aplicar Filtros
                </Button>
                <Button variant="outline" size="sm" onClick={clearAllFilters}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="w-full gap-2">
                <Save className="w-4 h-4" />
                Salvar Filtro Atual
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Área Principal */}
      <div className="flex-1 flex flex-col">
        {/* Header Principal */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
              <p className="text-gray-600">Gerencie seus clientes com filtros avançados</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Busca Principal */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar clientes..."
                  className="pl-10 w-80"
                />
              </div>
              <Button>
                Novo Cliente
              </Button>
            </div>
          </div>

          {/* Filtros Ativos */}
          {getActiveFiltersCount() > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-blue-900">
                    {getActiveFiltersCount()} filtros ativos:
                  </span>
                  {categories.map(category => 
                    category.filters
                      .filter(filter => filter.active)
                      .map(filter => (
                        <Badge key={filter.id} variant="secondary" className="gap-1">
                          {filter.label}
                          <X 
                            className="w-3 h-3 cursor-pointer" 
                            onClick={() => toggleFilter(category.id, filter.id)}
                          />
                        </Badge>
                      ))
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-blue-700">
                  Limpar Tudo
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 p-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Lista de Clientes
              </CardTitle>
              <CardDescription>
                Resultados baseados nos filtros selecionados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Filter className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-2">Filtros Aplicados</h3>
                <p className="text-sm max-w-md mx-auto">
                  Use o painel lateral para aplicar filtros e refinar sua busca. 
                  Os resultados aparecerão aqui em tempo real.
                </p>
                {getActiveFiltersCount() > 0 && (
                  <div className="mt-4">
                    <Badge variant="outline" className="text-blue-600">
                      {getActiveFiltersCount()} filtros ativos
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};