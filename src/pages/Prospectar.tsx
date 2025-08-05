// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import {
  Search,
  Download,
  Settings,
  Sun,
  Moon,
  MapPin,
  BarChart3,
  FileSpreadsheet,
  Send,
  CheckSquare,
  Square,
  Trash2,
  Filter,
  X,
  Crosshair,
  Layers,
  Rocket,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

interface Prospect {
  id: string;
  name: string;
  endereco: string;
  telefone?: string;
  email?: string;
  rating?: number;
  reviews?: number;
  website?: string;
  category?: string;
  types?: string;
  hasWhatsApp: boolean;
  latitude?: number;
  longitude?: number;
  verified?: boolean;
}

interface APIConfig {
  serpApiKey: string;
  whatsappBaseUrl: string;
  whatsappInstance: string;
  whatsappApiKey: string;
}

const Prospectar: React.FC = () => {
  const { user } = useAuth();
  const themeSettings = useThemeSettings();
  
  // State management
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [filteredProspects, setFilteredProspects] = useState<Prospect[]>([]);
  const [selectedProspects, setSelectedProspects] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsLimit, setResultsLimit] = useState('20');
  const [hasMoreResults, setHasMoreResults] = useState(false);
  
  // Filters
  const [whatsappFilter, setWhatsappFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  
  // API Configuration
  const [apiConfig, setApiConfig] = useState<APIConfig>({
    serpApiKey: '',
    whatsappBaseUrl: '',
    whatsappInstance: '',
    whatsappApiKey: ''
  });
  const [showConfigModal, setShowConfigModal] = useState(false);
  
  // Statistics
  const [stats, setStats] = useState({
    whatsappCount: 0,
    noWhatsappCount: 0,
    avgRating: 0,
    verifiedCount: 0
  });

  // Load configuration from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('prospectar_config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setApiConfig(config);
      } catch (error) {
        console.error('Erro ao carregar configuração:', error);
      }
    }
  }, []);

  // Update statistics when prospects change
  useEffect(() => {
    updateStatistics();
  }, [filteredProspects]);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [prospects, whatsappFilter, ratingFilter, searchFilter]);

  const updateStatistics = () => {
    const whatsappCount = filteredProspects.filter(p => p.hasWhatsApp).length;
    const noWhatsappCount = filteredProspects.filter(p => !p.hasWhatsApp).length;
    const avgRating = filteredProspects.length > 0 
      ? filteredProspects.reduce((sum, p) => sum + (p.rating || 0), 0) / filteredProspects.length 
      : 0;
    const verifiedCount = filteredProspects.filter(p => p.verified).length;

    setStats({
      whatsappCount,
      noWhatsappCount,
      avgRating: Math.round(avgRating * 10) / 10,
      verifiedCount
    });
  };

  const applyFilters = () => {
    let filtered = [...prospects];

    // Search filter
    if (searchFilter.trim()) {
      const search = searchFilter.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.endereco.toLowerCase().includes(search) ||
        (p.category && p.category.toLowerCase().includes(search)) ||
        (p.types && p.types.toLowerCase().includes(search))
      );
    }

    // WhatsApp filter
    if (whatsappFilter === 'true') {
      filtered = filtered.filter(p => p.hasWhatsApp);
    } else if (whatsappFilter === 'false') {
      filtered = filtered.filter(p => !p.hasWhatsApp);
    }
    // If whatsappFilter === 'all' or empty, show all

    // Rating filter
    if (ratingFilter && ratingFilter !== 'all') {
      const minRating = parseFloat(ratingFilter);
      filtered = filtered.filter(p => (p.rating || 0) >= minRating);
    }

    setFilteredProspects(filtered);
  };

  const searchProspects = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Erro",
        description: "Digite um termo de busca",
        variant: "destructive"
      });
      return;
    }

    if (!apiConfig.serpApiKey || !apiConfig.whatsappBaseUrl || !apiConfig.whatsappInstance || !apiConfig.whatsappApiKey) {
      toast({
        title: "Configuração necessária",
        description: "Configure as APIs primeiro!",
        variant: "destructive"
      });
      setShowConfigModal(true);
      return;
    }

    setIsLoading(true);
    try {
      // Simulated search - In real implementation, this would call the SerpAPI
      const mockProspects: Prospect[] = Array.from({ length: parseInt(resultsLimit) }, (_, i) => ({
        id: `prospect-${i + 1}`,
        name: `Empresa ${i + 1} - ${searchTerm}`,
        endereco: `Rua Exemplo ${i + 1}, Bairro, Cidade - Estado`,
        telefone: `(11) 9${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        email: `contato${i + 1}@empresa.com`,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        reviews: Math.floor(Math.random() * 100) + 1,
        website: `https://empresa${i + 1}.com.br`,
        category: 'Serviços',
        types: 'Empresa',
        hasWhatsApp: Math.random() > 0.3,
        verified: Math.random() > 0.5
      }));

      setProspects(mockProspects);
      setCurrentPage(1);
      setHasMoreResults(true);
      
      toast({
        title: "Busca concluída",
        description: `${mockProspects.length} prospects encontrados`
      });
    } catch (error) {
      console.error('Erro na busca:', error);
      toast({
        title: "Erro na busca",
        description: "Ocorreu um erro ao buscar prospects",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleProspectSelection = (prospectId: string) => {
    const newSelection = new Set(selectedProspects);
    if (newSelection.has(prospectId)) {
      newSelection.delete(prospectId);
    } else {
      newSelection.add(prospectId);
    }
    setSelectedProspects(newSelection);
  };

  const selectAll = () => {
    const newSelection = new Set(selectedProspects);
    filteredProspects.forEach(p => newSelection.add(p.id));
    setSelectedProspects(newSelection);
  };

  const clearSelection = () => {
    const newSelection = new Set(selectedProspects);
    filteredProspects.forEach(p => newSelection.delete(p.id));
    setSelectedProspects(newSelection);
  };

  const clearAllSelections = () => {
    setSelectedProspects(new Set());
  };

  const clearFilters = () => {
    setWhatsappFilter('all');
    setRatingFilter('all');
    setSearchFilter('');
  };

  const exportToExcel = () => {
    const selectedData = prospects.filter(p => selectedProspects.has(p.id));
    if (selectedData.length === 0) {
      toast({
        title: "Nenhum prospect selecionado",
        description: "Selecione pelo menos um prospect para exportar",
        variant: "destructive"
      });
      return;
    }

    // Simulate Excel export
    toast({
      title: "Exportação iniciada",
      description: `Exportando ${selectedData.length} prospects para Excel`
    });
  };

  const exportAll = () => {
    if (prospects.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Faça uma busca primeiro",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Exportação iniciada",
      description: `Exportando ${prospects.length} prospects para Excel`
    });
  };

  const exportDisparadorPro = () => {
    const selectedData = prospects.filter(p => selectedProspects.has(p.id));
    if (selectedData.length === 0) {
      toast({
        title: "Nenhum prospect selecionado",
        description: "Selecione pelo menos um prospect para exportar",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Exportação para Disparador PRO",
      description: `Exportando ${selectedData.length} prospects no formato simplificado`
    });
  };

  const saveConfig = () => {
    localStorage.setItem('prospectar_config', JSON.stringify(apiConfig));
    setShowConfigModal(false);
    toast({
      title: "Configuração salva",
      description: "APIs configuradas com sucesso!"
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchProspects();
    }
  };

  const isConfigured = apiConfig.serpApiKey && apiConfig.whatsappBaseUrl && apiConfig.whatsappInstance && apiConfig.whatsappApiKey;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-2">
                <Search className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Prospecta PRO
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={themeSettings.toggleTheme}>
                {themeSettings.settings.darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowConfigModal(true)}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="text-center mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg">
          <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-3">
            <Search className="h-8 w-8" />
            Encontre Seus Prospects
          </h2>
          <p className="text-muted-foreground text-lg">Busque empresas, valide WhatsApp e exporte dados em Excel</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Search Section */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Buscar Prospects
                  </CardTitle>
                  <Badge variant="secondary">
                    {filteredProspects.length} empresas encontradas
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search Form */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Ex: Petshop em Salvador, Dentista em São Paulo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-3">
                    <Select value={resultsLimit} onValueChange={setResultsLimit}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="20">20 resultados</SelectItem>
                        <SelectItem value="40">40 resultados</SelectItem>
                        <SelectItem value="60">60 resultados</SelectItem>
                        <SelectItem value="100">100 resultados</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-3">
                    <Button 
                      onClick={searchProspects} 
                      disabled={isLoading || !isConfigured}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      ) : (
                        <Search className="mr-2 h-4 w-4" />
                      )}
                      {isLoading ? 'Buscando...' : isConfigured ? 'Buscar' : 'Configure APIs'}
                    </Button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  <Select value={whatsappFilter} onValueChange={setWhatsappFilter}>
                    <SelectTrigger className="w-auto">
                      <SelectValue placeholder="WhatsApp" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="true">Apenas com WhatsApp</SelectItem>
                      <SelectItem value="false">Sem WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger className="w-auto">
                      <SelectValue placeholder="Avaliação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as avaliações</SelectItem>
                      <SelectItem value="4">4+ estrelas</SelectItem>
                      <SelectItem value="3">3+ estrelas</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Filtrar por nome..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-auto min-w-[200px]"
                  />
                  
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <X className="mr-1 h-4 w-4" />
                    Limpar
                  </Button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={selectAll}>
                      <CheckSquare className="mr-1 h-4 w-4" />
                      Selecionar Página
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearSelection}>
                      <Square className="mr-1 h-4 w-4" />
                      Limpar Página
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearAllSelections}>
                      <Trash2 className="mr-1 h-4 w-4" />
                      Limpar Tudo
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <strong>{selectedProspects.size}</strong> selecionados
                  </div>
                </div>

                {/* Prospects List */}
                <div className="space-y-3">
                  {filteredProspects.length === 0 ? (
                    <div className="text-center py-12">
                      {prospects.length === 0 ? (
                        <div>
                          <Rocket className="h-16 w-16 mx-auto text-primary mb-4" />
                          <h3 className="text-xl font-semibold text-primary mb-3">Bem-vindo ao Prospecta PRO!</h3>
                          <p className="text-muted-foreground mb-4">
                            Encontre leads qualificados de forma automatizada.<br />
                            Busque empresas, valide WhatsApp e exporte dados em Excel.
                          </p>
                          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg inline-block">
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                              <Settings className="h-4 w-4" />
                              <strong>Primeiro passo:</strong> Configure suas APIs clicando no ícone da engrenagem
                            </div>
                          </div>
                          <div className="mt-4">
                            <Button onClick={() => setShowConfigModal(true)}>
                              <Settings className="mr-2 h-4 w-4" />
                              Configurar APIs
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <Search className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                          <h4 className="text-lg font-medium text-muted-foreground">Nenhum resultado encontrado</h4>
                          <p className="text-muted-foreground">Tente ajustar os filtros ou termos de busca</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    filteredProspects.map((prospect) => (
                      <Card 
                        key={prospect.id} 
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedProspects.has(prospect.id) ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20' : ''
                        }`}
                        onClick={() => toggleProspectSelection(prospect.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">{prospect.name}</h4>
                                {prospect.hasWhatsApp && (
                                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                    WhatsApp
                                  </Badge>
                                )}
                                {prospect.verified && (
                                  <Badge variant="secondary">Verificado</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">
                                <MapPin className="inline h-3 w-3 mr-1" />
                                {prospect.endereco}
                              </p>
                              {prospect.telefone && (
                                <p className="text-sm text-muted-foreground mb-1">
                                  📞 {prospect.telefone}
                                </p>
                              )}
                              {prospect.email && (
                                <p className="text-sm text-muted-foreground mb-1">
                                  ✉️ {prospect.email}
                                </p>
                              )}
                              <div className="flex items-center gap-4 mt-2">
                                {prospect.rating && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-yellow-500">⭐</span>
                                    <span className="text-sm font-medium">{prospect.rating}</span>
                                    {prospect.reviews && (
                                      <span className="text-xs text-muted-foreground">({prospect.reviews} avaliações)</span>
                                    )}
                                  </div>
                                )}
                                {prospect.website && (
                                  <a 
                                    href={prospect.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    🌐 Website
                                  </a>
                                )}
                              </div>
                            </div>
                            <div className="ml-4">
                              {selectedProspects.has(prospect.id) ? (
                                <CheckSquare className="h-5 w-5 text-blue-600" />
                              ) : (
                                <Square className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Estatísticas da Página
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.whatsappCount}</div>
                    <div className="text-xs text-muted-foreground">Com WhatsApp</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{stats.noWhatsappCount}</div>
                    <div className="text-xs text-muted-foreground">Sem WhatsApp</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{stats.avgRating}</div>
                    <div className="text-xs text-muted-foreground">Rating Médio</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.verifiedCount}</div>
                    <div className="text-xs text-muted-foreground">Verificados</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">
                  <FileSpreadsheet className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  Exportar Dados
                </CardTitle>
                <p className="text-sm text-muted-foreground text-center">
                  Gere um arquivo Excel com os prospects selecionados
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={exportToExcel}
                  disabled={selectedProspects.size === 0}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar {selectedProspects.size} Selecionados
                </Button>
                
                <Button 
                  onClick={exportAll}
                  disabled={prospects.length === 0}
                  variant="outline"
                  className="w-full"
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Exportar Todos ({prospects.length})
                </Button>
                
                <Button 
                  onClick={exportDisparadorPro}
                  disabled={selectedProspects.size === 0}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Disparador PRO ({selectedProspects.size})
                </Button>
                
                <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded">
                  <div className="flex items-start gap-1 mb-2">
                    <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Dados inclusos:</strong> Nome, Endereço, Telefone, E-mail, Rating, Reviews, Website, Status WhatsApp
                    </div>
                  </div>
                  <div className="flex items-start gap-1 text-yellow-600">
                    <Send className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Disparador PRO:</strong> Formato simplificado (Nome, Telefone, E-mail)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Configurar APIs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">SerpAPI Key</label>
                <Input
                  type="password"
                  placeholder="Sua chave da SerpAPI"
                  value={apiConfig.serpApiKey}
                  onChange={(e) => setApiConfig(prev => ({ ...prev, serpApiKey: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">WhatsApp Base URL</label>
                <Input
                  placeholder="https://api.whatsapp.com"
                  value={apiConfig.whatsappBaseUrl}
                  onChange={(e) => setApiConfig(prev => ({ ...prev, whatsappBaseUrl: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">WhatsApp Instance</label>
                <Input
                  placeholder="Nome da instância"
                  value={apiConfig.whatsappInstance}
                  onChange={(e) => setApiConfig(prev => ({ ...prev, whatsappInstance: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">WhatsApp API Key</label>
                <Input
                  type="password"
                  placeholder="Sua chave da API WhatsApp"
                  value={apiConfig.whatsappApiKey}
                  onChange={(e) => setApiConfig(prev => ({ ...prev, whatsappApiKey: e.target.value }))}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={saveConfig} className="flex-1">
                  Salvar
                </Button>
                <Button variant="outline" onClick={() => setShowConfigModal(false)} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Prospectar;