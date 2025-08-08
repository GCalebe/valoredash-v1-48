import React, { useState } from 'react';
import { X, Search, ChevronDown, User, Building, Phone, Mail, Tag, Package, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface SlidingFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FilterState {
  search: string;
  leadStatus: string[];
  leadProperties: {
    name: string;
    scheduledTime: string;
    tasks: string;
    phone: string;
    email: string;
    position: string;
  };
  conversations: string;
  contactProperties: {
    name: string;
    scheduledTime: string;
    tasks: string;
    phone: string;
    email: string;
    position: string;
  };
  companyProperties: string;
  products: string;
  tags: string[];
}

const SlidingFilterPanel: React.FC<SlidingFilterPanelProps> = ({ isOpen, onClose }) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    leadStatus: ['Leads ativos'],
    leadProperties: {
      name: '',
      scheduledTime: 'A qualquer hora',
      tasks: 'Todos os valores',
      phone: '',
      email: '',
      position: ''
    },
    conversations: '',
    contactProperties: {
      name: '',
      scheduledTime: 'A qualquer hora',
      tasks: 'Todos os valores',
      phone: '',
      email: '',
      position: ''
    },
    companyProperties: '',
    products: '',
    tags: []
  });

  const [expandedSections, setExpandedSections] = useState({
    leads: true,
    leadProperties: false,
    conversations: false,
    contactProperties: false,
    companyProperties: false,
    products: false,
    tags: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleLeadStatusChange = (status: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      leadStatus: checked 
        ? [...prev.leadStatus, status]
        : prev.leadStatus.filter(s => s !== status)
    }));
  };

  const handleTagChange = (tag: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      tags: checked 
        ? [...prev.tags, tag]
        : prev.tags.filter(t => t !== tag)
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      leadStatus: [],
      leadProperties: {
        name: '',
        scheduledTime: 'A qualquer hora',
        tasks: 'Todos os valores',
        phone: '',
        email: '',
        position: ''
      },
      conversations: '',
      contactProperties: {
        name: '',
        scheduledTime: 'A qualquer hora',
        tasks: 'Todos os valores',
        phone: '',
        email: '',
        position: ''
      },
      companyProperties: '',
      products: '',
      tags: []
    });
  };

  const applyFilters = () => {
    console.log('Aplicando filtros:', filters);
    onClose();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.leadStatus.length > 0) count++;
    if (filters.leadProperties.name) count++;
    if (filters.leadProperties.phone) count++;
    if (filters.leadProperties.email) count++;
    if (filters.leadProperties.position) count++;
    if (filters.tags.length > 0) count++;
    return count;
  };

  return (
    <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${
      isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
    }`}>
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={`absolute left-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-medium text-gray-900">Leads ativos</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Busca e filtro"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 h-[calc(100vh-200px)]">
          <div className="p-4 space-y-4">
            {/* Leads ativos */}
            <div>
              <button
                onClick={() => toggleSection('leads')}
                className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-2"
              >
                <span>Leads ativos</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${
                  expandedSections.leads ? 'rotate-180' : ''
                }`} />
              </button>
              {expandedSections.leads && (
                <div className="space-y-2 ml-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="meus-leads"
                      checked={filters.leadStatus.includes('Meus leads')}
                      onCheckedChange={(checked) => handleLeadStatusChange('Meus leads', checked as boolean)}
                    />
                    <label htmlFor="meus-leads" className="text-sm text-gray-700">Meus leads</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="leads-ganhos"
                      checked={filters.leadStatus.includes('Leads ganhos')}
                      onCheckedChange={(checked) => handleLeadStatusChange('Leads ganhos', checked as boolean)}
                    />
                    <label htmlFor="leads-ganhos" className="text-sm text-gray-700">Leads ganhos</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="leads-perdidos"
                      checked={filters.leadStatus.includes('Leads perdidos')}
                      onCheckedChange={(checked) => handleLeadStatusChange('Leads perdidos', checked as boolean)}
                    />
                    <label htmlFor="leads-perdidos" className="text-sm text-gray-700">Leads perdidos</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-orange-400 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-sm text-gray-700">Leads sem Tarefas</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-sm text-gray-700">Leads com Tarefas Atrasadas</span>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* PROPRIEDADES DE LEAD */}
            <div>
              <button
                onClick={() => toggleSection('leadProperties')}
                className="flex items-center justify-between w-full text-left font-medium text-gray-600 mb-2 uppercase text-xs tracking-wide"
              >
                <span>PROPRIEDADES DE LEAD</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${
                  expandedSections.leadProperties ? 'rotate-180' : ''
                }`} />
              </button>
              {expandedSections.leadProperties && (
                <div className="space-y-3 ml-4">
                  <div>
                    <Label className="text-xs text-gray-600 mb-1 block">Nome</Label>
                    <Input
                      value={filters.leadProperties.name}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        leadProperties: { ...prev.leadProperties, name: e.target.value }
                      }))}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 mb-1 block flex items-center gap-1">
                      <span>📅</span> A qualquer hora
                    </Label>
                    <Select
                      value={filters.leadProperties.scheduledTime}
                      onValueChange={(value) => setFilters(prev => ({
                        ...prev,
                        leadProperties: { ...prev.leadProperties, scheduledTime: value }
                      }))}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A qualquer hora">A qualquer hora</SelectItem>
                        <SelectItem value="Hoje">Hoje</SelectItem>
                        <SelectItem value="Esta semana">Esta semana</SelectItem>
                        <SelectItem value="Este mês">Este mês</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 mb-1 block">Tarefas: Todos os valores</Label>
                    <Select
                      value={filters.leadProperties.tasks}
                      onValueChange={(value) => setFilters(prev => ({
                        ...prev,
                        leadProperties: { ...prev.leadProperties, tasks: value }
                      }))}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Todos os valores">Todos os valores</SelectItem>
                        <SelectItem value="Com tarefas">Com tarefas</SelectItem>
                        <SelectItem value="Sem tarefas">Sem tarefas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 mb-1 block">Telefone</Label>
                    <Input
                      value={filters.leadProperties.phone}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        leadProperties: { ...prev.leadProperties, phone: e.target.value }
                      }))}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 mb-1 block flex items-center gap-1">
                      <Mail className="h-3 w-3" /> E-mail
                    </Label>
                    <Input
                      value={filters.leadProperties.email}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        leadProperties: { ...prev.leadProperties, email: e.target.value }
                      }))}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 mb-1 block">Posição</Label>
                    <Input
                      value={filters.leadProperties.position}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        leadProperties: { ...prev.leadProperties, position: e.target.value }
                      }))}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* CONVERSAS */}
            <div>
              <button
                onClick={() => toggleSection('conversations')}
                className="flex items-center justify-between w-full text-left font-medium text-gray-600 mb-2 uppercase text-xs tracking-wide"
              >
                <span>CONVERSAS</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${
                  expandedSections.conversations ? 'rotate-180' : ''
                }`} />
              </button>
            </div>

            <Separator />

            {/* PROPRIEDADES DE UM CONTATO VINCULADO */}
            <div>
              <button
                onClick={() => toggleSection('contactProperties')}
                className="flex items-center justify-between w-full text-left font-medium text-gray-600 mb-2 uppercase text-xs tracking-wide"
              >
                <span>PROPRIEDADES DE UM CONTATO VINCULADO</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${
                  expandedSections.contactProperties ? 'rotate-180' : ''
                }`} />
              </button>
            </div>

            <Separator />

            {/* PROPRIEDADES DE UMA EMPRESA VINCULADA */}
            <div>
              <button
                onClick={() => toggleSection('companyProperties')}
                className="flex items-center justify-between w-full text-left font-medium text-gray-600 mb-2 uppercase text-xs tracking-wide"
              >
                <span>PROPRIEDADES DE UMA EMPRESA VINCULADA</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${
                  expandedSections.companyProperties ? 'rotate-180' : ''
                }`} />
              </button>
            </div>

            <Separator />

            {/* PRODUTOS */}
            <div>
              <button
                onClick={() => toggleSection('products')}
                className="flex items-center justify-between w-full text-left font-medium text-gray-600 mb-2 uppercase text-xs tracking-wide"
              >
                <span>PRODUTOS</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${
                  expandedSections.products ? 'rotate-180' : ''
                }`} />
              </button>
            </div>

            <Separator />

            {/* TAGS */}
            <div>
              <button
                onClick={() => toggleSection('tags')}
                className="flex items-center justify-between w-full text-left font-medium text-gray-600 mb-2 uppercase text-xs tracking-wide"
              >
                <span>TAGS</span>
                <span className="text-blue-600 text-xs cursor-pointer hover:underline">Gerenciar</span>
              </button>
              {expandedSections.tags && (
                <div className="ml-4">
                  <div className="relative mb-2">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <Input
                      placeholder="Localizar tags"
                      className="h-7 text-xs pl-7 bg-gray-50"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Você não tem tags conectadas</p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <span>{getActiveFiltersCount()} filtros ativos</span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={clearAllFilters}
              className="text-red-600 hover:text-red-700 h-auto p-0 text-xs"
            >
              Limpar Tudo
            </Button>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 h-8 text-sm"
            >
              Cancelar
            </Button>
            <Button 
              onClick={applyFilters}
              className="flex-1 h-8 text-sm bg-blue-600 hover:bg-blue-700"
            >
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlidingFilterPanel;