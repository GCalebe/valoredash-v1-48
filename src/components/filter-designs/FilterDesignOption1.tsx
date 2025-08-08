import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Filter, 
  X, 
  Calendar as CalendarIcon, 
  Users, 
  Tag, 
  TrendingUp,
  Clock,
  Star,
  ChevronDown,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FilterState {
  search: string;
  status: string[];
  segment: string[];
  dateRange: { from?: Date; to?: Date };
  tags: string[];
  customFields: Record<string, any>;
}

export const FilterDesignOption1 = () => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: [],
    segment: [],
    dateRange: {},
    tags: [],
    customFields: {}
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const statusOptions = [
    { value: 'active', label: 'Ativo', color: 'bg-green-100 text-green-800' },
    { value: 'inactive', label: 'Inativo', color: 'bg-gray-100 text-gray-800' },
    { value: 'prospect', label: 'Prospect', color: 'bg-blue-100 text-blue-800' },
    { value: 'client', label: 'Cliente', color: 'bg-purple-100 text-purple-800' }
  ];

  const segmentOptions = [
    { value: 'small', label: 'Pequeno Porte', icon: '🏢' },
    { value: 'medium', label: 'Médio Porte', icon: '🏬' },
    { value: 'large', label: 'Grande Porte', icon: '🏭' },
    { value: 'enterprise', label: 'Enterprise', icon: '🌆' }
  ];

  const tagOptions = [
    'VIP', 'Novo Cliente', 'Recorrente', 'Premium', 'Básico', 'Corporativo'
  ];

  const clearAllFilters = () => {
    setFilters({
      search: '',
      status: [],
      segment: [],
      dateRange: {},
      tags: [],
      customFields: {}
    });
    setActiveFiltersCount(0);
  };

  const toggleStatus = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };

  const toggleSegment = (segment: string) => {
    setFilters(prev => ({
      ...prev,
      segment: prev.segment.includes(segment)
        ? prev.segment.filter(s => s !== segment)
        : [...prev.segment, segment]
    }));
  };

  const toggleTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header com busca principal */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar clientes por nome, email, telefone..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10 h-12 text-lg border-0 bg-gray-50 focus:bg-white transition-colors"
              />
            </div>
            <Button
              variant={isExpanded ? "default" : "outline"}
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-12 px-6 gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros Avançados
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
              <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filtros Expandidos */}
      {isExpanded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-300">
          {/* Card de Status */}
          <Card className="shadow-md hover:shadow-lg transition-shadow border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Status do Cliente</CardTitle>
                  <CardDescription>Filtre por situação atual</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {statusOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-3">
                  <Checkbox
                    id={`status-${option.value}`}
                    checked={filters.status.includes(option.value)}
                    onCheckedChange={() => toggleStatus(option.value)}
                  />
                  <Label
                    htmlFor={`status-${option.value}`}
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <Badge className={cn("text-xs", option.color)}>
                      {option.label}
                    </Badge>
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Card de Segmento */}
          <Card className="shadow-md hover:shadow-lg transition-shadow border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Segmento</CardTitle>
                  <CardDescription>Porte da empresa</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {segmentOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-3">
                  <Checkbox
                    id={`segment-${option.value}`}
                    checked={filters.segment.includes(option.value)}
                    onCheckedChange={() => toggleSegment(option.value)}
                  />
                  <Label
                    htmlFor={`segment-${option.value}`}
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <span className="text-lg">{option.icon}</span>
                    <span>{option.label}</span>
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Card de Data */}
          <Card className="shadow-md hover:shadow-lg transition-shadow border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Período</CardTitle>
                  <CardDescription>Último contato</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !filters.dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.from ? (
                        format(filters.dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        "Data inicial"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.from}
                      onSelect={(date) => setFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, from: date }
                      }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !filters.dateRange.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.to ? (
                        format(filters.dateRange.to, "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        "Data final"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.to}
                      onSelect={(date) => setFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, to: date }
                      }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* Card de Tags */}
          <Card className="shadow-md hover:shadow-lg transition-shadow border-0 bg-white/90 backdrop-blur-sm lg:col-span-2 xl:col-span-3">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Tag className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Tags e Categorias</CardTitle>
                  <CardDescription>Classificações especiais</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {tagOptions.map((tag) => (
                  <Badge
                    key={tag}
                    variant={filters.tags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer hover:scale-105 transition-transform px-3 py-1"
                    onClick={() => toggleTag(tag)}
                  >
                    {filters.tags.includes(tag) && <Star className="w-3 h-3 mr-1" />}
                    {tag}
                  </Badge>
                ))}
                <Button variant="outline" size="sm" className="gap-1">
                  <Plus className="w-3 h-3" />
                  Nova Tag
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros Ativos */}
      {(filters.status.length > 0 || filters.segment.length > 0 || filters.tags.length > 0 || filters.search) && (
        <Card className="shadow-md border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-600">Filtros ativos:</span>
                
                {filters.search && (
                  <Badge variant="secondary" className="gap-1">
                    Busca: "{filters.search}"
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, search: '' }))} />
                  </Badge>
                )}
                
                {filters.status.map(status => (
                  <Badge key={status} variant="secondary" className="gap-1">
                    {statusOptions.find(s => s.value === status)?.label}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => toggleStatus(status)} />
                  </Badge>
                ))}
                
                {filters.segment.map(segment => (
                  <Badge key={segment} variant="secondary" className="gap-1">
                    {segmentOptions.find(s => s.value === segment)?.label}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => toggleSegment(segment)} />
                  </Badge>
                ))}
                
                {filters.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => toggleTag(tag)} />
                  </Badge>
                ))}
              </div>
              
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-red-600 hover:text-red-700">
                <X className="w-4 h-4 mr-1" />
                Limpar Tudo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Demonstração de Resultados */}
      <Card className="shadow-md border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-4 h-4 text-green-600" />
            </div>
            Resultados da Busca
          </CardTitle>
          <CardDescription>
            Demonstração de como os filtros afetariam os resultados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Filtros aplicados com sucesso!</p>
            <p className="text-sm">Os resultados seriam exibidos aqui baseados nos filtros selecionados.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};