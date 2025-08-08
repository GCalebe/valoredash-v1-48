import React, { useState, useRef, useEffect } from 'react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Filter, 
  X, 
  Plus,
  ChevronDown,
  Users, 
  Tag, 
  TrendingUp,
  Clock,
  Star,
  Zap,
  Save,
  Trash2,
  Settings,
  Eye,
  RotateCcw,
  Sparkles,
  Target,
  Layers,
  MoreHorizontal,
  Check,
  AlertCircle,
  Lightbulb
} from 'lucide-react';

interface SmartFilter {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  type: 'quick' | 'smart' | 'custom';
  active: boolean;
  count?: number;
  color: string;
  suggestion?: boolean;
}

interface FilterGroup {
  id: string;
  name: string;
  filters: SmartFilter[];
  priority: 'high' | 'medium' | 'low';
}

export const FilterDesignOption3 = () => {
  const [isFloatingBarVisible, setIsFloatingBarVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSmartMode, setIsSmartMode] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const floatingBarRef = useRef<HTMLDivElement>(null);

  const [smartFilters, setSmartFilters] = useState<SmartFilter[]>([
    {
      id: 'active-clients',
      label: 'Clientes Ativos',
      description: 'Clientes com status ativo e engajamento recente',
      icon: <Users className="w-4 h-4" />,
      type: 'quick',
      active: false,
      count: 142,
      color: 'bg-green-100 text-green-700 border-green-200'
    },
    {
      id: 'high-value',
      label: 'Alto Valor',
      description: 'Clientes com potencial de receita elevado',
      icon: <Star className="w-4 h-4" />,
      type: 'smart',
      active: false,
      count: 28,
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      suggestion: true
    },
    {
      id: 'needs-attention',
      label: 'Precisa Atenção',
      description: 'Clientes sem contato há mais de 30 dias',
      icon: <AlertCircle className="w-4 h-4" />,
      type: 'smart',
      active: false,
      count: 15,
      color: 'bg-red-100 text-red-700 border-red-200',
      suggestion: true
    },
    {
      id: 'prospects',
      label: 'Prospects Quentes',
      description: 'Leads com alta probabilidade de conversão',
      icon: <Target className="w-4 h-4" />,
      type: 'smart',
      active: false,
      count: 67,
      color: 'bg-orange-100 text-orange-700 border-orange-200'
    },
    {
      id: 'vip-segment',
      label: 'Segmento VIP',
      description: 'Clientes premium e corporativos',
      icon: <Sparkles className="w-4 h-4" />,
      type: 'quick',
      active: false,
      count: 23,
      color: 'bg-purple-100 text-purple-700 border-purple-200'
    },
    {
      id: 'recent-activity',
      label: 'Atividade Recente',
      description: 'Interações nos últimos 7 dias',
      icon: <TrendingUp className="w-4 h-4" />,
      type: 'quick',
      active: false,
      count: 89,
      color: 'bg-blue-100 text-blue-700 border-blue-200'
    }
  ]);

  const [filterGroups] = useState<FilterGroup[]>([
    {
      id: 'status',
      name: 'Status',
      priority: 'high',
      filters: [
        {
          id: 'status-active',
          label: 'Ativo',
          description: 'Clientes com status ativo',
          icon: <Check className="w-4 h-4" />,
          type: 'quick',
          active: false,
          count: 142,
          color: 'bg-green-100 text-green-700 border-green-200'
        },
        {
          id: 'status-inactive',
          label: 'Inativo',
          description: 'Clientes com status inativo',
          icon: <X className="w-4 h-4" />,
          type: 'quick',
          active: false,
          count: 23,
          color: 'bg-gray-100 text-gray-700 border-gray-200'
        }
      ]
    },
    {
      id: 'engagement',
      name: 'Engajamento',
      priority: 'medium',
      filters: [
        {
          id: 'high-engagement',
          label: 'Alto Engajamento',
          description: 'Múltiplas interações recentes',
          icon: <Zap className="w-4 h-4" />,
          type: 'smart',
          active: false,
          count: 45,
          color: 'bg-yellow-100 text-yellow-700 border-yellow-200'
        }
      ]
    }
  ]);

  const toggleFilter = (filterId: string) => {
    setSmartFilters(prev => prev.map(filter => 
      filter.id === filterId ? { ...filter, active: !filter.active } : filter
    ));
    
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const clearAllFilters = () => {
    setSmartFilters(prev => prev.map(filter => ({ ...filter, active: false })));
    setSelectedFilters([]);
  };

  const getActiveFiltersCount = () => {
    return smartFilters.filter(filter => filter.active).length;
  };

  const getSuggestedFilters = () => {
    return smartFilters.filter(filter => filter.suggestion && !filter.active);
  };

  const getSmartInsights = () => {
    const activeCount = getActiveFiltersCount();
    const totalResults = smartFilters
      .filter(f => f.active)
      .reduce((sum, f) => sum + (f.count || 0), 0);
    
    return {
      activeFilters: activeCount,
      estimatedResults: totalResults,
      suggestions: getSuggestedFilters().length
    };
  };

  const insights = getSmartInsights();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Barra Flutuante Inteligente */}
      <div 
        ref={floatingBarRef}
        className={cn(
          "fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-out",
          isFloatingBarVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        )}
      >
        <Card className="w-[90vw] max-w-6xl shadow-2xl border-0 bg-white/95 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {/* Logo/Ícone Inteligente */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  {isSmartMode && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  )}
                </div>
                <div className="hidden sm:block">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    Filtros Inteligentes
                    {isSmartMode && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                        IA Ativa
                      </Badge>
                    )}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {insights.activeFilters} ativos • ~{insights.estimatedResults} resultados
                  </p>
                </div>
              </div>

              {/* Busca Inteligente */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Busca inteligente... (ex: 'clientes VIP ativos')"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 h-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => setSearchQuery('')}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Filtros Rápidos */}
              <div className="flex items-center gap-2 flex-1">
                <ScrollArea className="w-full">
                  <div className="flex items-center gap-2 pb-2">
                    {smartFilters.slice(0, 4).map((filter) => (
                      <TooltipProvider key={filter.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={filter.active ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleFilter(filter.id)}
                              className={cn(
                                "h-8 gap-2 transition-all duration-200 hover:scale-105",
                                filter.active ? "shadow-md" : "hover:shadow-sm",
                                !filter.active && filter.color
                              )}
                            >
                              {filter.icon}
                              <span className="hidden sm:inline">{filter.label}</span>
                              {filter.count && (
                                <Badge variant="secondary" className="text-xs ml-1">
                                  {filter.count}
                                </Badge>
                              )}
                              {filter.suggestion && !filter.active && (
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-sm">{filter.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                    
                    {/* Mais Filtros */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-2">
                          <Plus className="w-4 h-4" />
                          <span className="hidden sm:inline">Mais</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-4" align="end">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">Todos os Filtros</h4>
                            <Badge variant="outline">
                              {smartFilters.length} disponíveis
                            </Badge>
                          </div>
                          
                          <ScrollArea className="h-64">
                            <div className="space-y-3">
                              {filterGroups.map((group) => (
                                <div key={group.id}>
                                  <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Layers className="w-3 h-3" />
                                    {group.name}
                                  </h5>
                                  <div className="space-y-2 ml-4">
                                    {group.filters.map((filter) => (
                                      <div key={filter.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <Checkbox
                                            id={filter.id}
                                            checked={filter.active}
                                            onCheckedChange={() => toggleFilter(filter.id)}
                                          />
                                          <Label htmlFor={filter.id} className="text-sm cursor-pointer">
                                            {filter.label}
                                          </Label>
                                        </div>
                                        <Badge variant="secondary" className="text-xs">
                                          {filter.count}
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                              
                              {smartFilters.slice(4).map((filter) => (
                                <div key={filter.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      id={filter.id}
                                      checked={filter.active}
                                      onCheckedChange={() => toggleFilter(filter.id)}
                                    />
                                    <div className="flex items-center gap-2">
                                      {filter.icon}
                                      <Label htmlFor={filter.id} className="text-sm cursor-pointer">
                                        {filter.label}
                                      </Label>
                                      {filter.suggestion && (
                                        <Badge variant="outline" className="text-xs bg-orange-50 text-orange-600">
                                          Sugerido
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <Badge variant="secondary" className="text-xs">
                                    {filter.count}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </ScrollArea>
              </div>

              {/* Controles */}
              <div className="flex items-center gap-2">
                {/* Modo Inteligente */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={isSmartMode}
                          onCheckedChange={setIsSmartMode}
                          className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-600"
                        />
                        <Zap className={cn(
                          "w-4 h-4 transition-colors",
                          isSmartMode ? "text-blue-600" : "text-gray-400"
                        )} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Modo Inteligente: Sugestões automáticas baseadas em IA</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Limpar Filtros */}
                {getActiveFiltersCount() > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-8 gap-2 text-gray-600 hover:text-red-600"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="hidden sm:inline">Limpar</span>
                  </Button>
                )}

                {/* Salvar */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">Salvar</span>
                </Button>

                {/* Configurações */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Sugestões Inteligentes */}
            {isSmartMode && getSuggestedFilters().length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-gray-700">Sugestões Inteligentes:</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {getSuggestedFilters().slice(0, 3).map((filter) => (
                    <Button
                      key={filter.id}
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFilter(filter.id)}
                      className="h-7 gap-2 text-xs bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                    >
                      {filter.icon}
                      {filter.label}
                      <Badge variant="secondary" className="text-xs">
                        {filter.count}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo Principal */}
      <div className="pt-32 px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard de Clientes</h1>
              <p className="text-gray-600">Análise inteligente com filtros adaptativos</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="gap-2">
                <Eye className="w-4 h-4" />
                Visualizar Dados
              </Button>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Cliente
              </Button>
            </div>
          </div>
        </div>

        {/* Insights e Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total de Clientes</p>
                  <p className="text-2xl font-bold">1,247</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Filtros Ativos</p>
                  <p className="text-2xl font-bold">{insights.activeFilters}</p>
                </div>
                <Filter className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Resultados</p>
                  <p className="text-2xl font-bold">{insights.estimatedResults}</p>
                </div>
                <Target className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Sugestões IA</p>
                  <p className="text-2xl font-bold">{insights.suggestions}</p>
                </div>
                <Sparkles className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Área de Resultados */}
        <Card className="min-h-[600px]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Resultados Filtrados
                </CardTitle>
                <CardDescription>
                  Dados atualizados em tempo real com base nos filtros inteligentes
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    <Zap className="w-3 h-3" />
                    {getActiveFiltersCount()} filtros ativos
                  </Badge>
                )}
                {isSmartMode && (
                  <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700">
                    <Sparkles className="w-3 h-3" />
                    IA Ativa
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-16">
              <div className="relative mb-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-blue-600" />
                </div>
                {isSmartMode && (
                  <div className="absolute top-0 right-1/2 transform translate-x-8 w-4 h-4 bg-green-400 rounded-full animate-pulse" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Filtros Inteligentes Ativos
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Use a barra flutuante acima para aplicar filtros inteligentes. 
                A IA sugere automaticamente os melhores filtros baseados no seu comportamento.
              </p>
              
              {getActiveFiltersCount() > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {smartFilters.filter(f => f.active).map((filter) => (
                      <Badge key={filter.id} variant="secondary" className="gap-2 p-2">
                        {filter.icon}
                        {filter.label}
                        <span className="text-xs">({filter.count})</span>
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    Aproximadamente {insights.estimatedResults} resultados encontrados
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    Nenhum filtro ativo. Experimente os filtros sugeridos:
                  </p>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {getSuggestedFilters().slice(0, 3).map((filter) => (
                      <Button
                        key={filter.id}
                        variant="outline"
                        size="sm"
                        onClick={() => toggleFilter(filter.id)}
                        className="gap-2 bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                      >
                        {filter.icon}
                        {filter.label}
                        <Badge variant="secondary" className="text-xs">
                          {filter.count}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};