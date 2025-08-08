// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { Search, Settings, Sun, Moon, CheckSquare, Square, Trash2, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import ProspectsSearchForm from './prospectar/components/ProspectsSearchForm';
import ProspectsFilters from './prospectar/components/ProspectsFilters';
import ProspectCard from './prospectar/components/ProspectCard';
import ProspectsStatsCard from './prospectar/components/ProspectsStatsCard';
import ExportSection from './prospectar/components/ExportSection';
import ConfigModal from './prospectar/components/ConfigModal';
import { Prospect, APIConfig } from './prospectar/types';
import { DEFAULT_RESULTS_LIMIT } from './prospectar/constants';

// tipos movidos para ./prospectar/types

const Prospectar: React.FC = () => {
  useAuth();
  const themeSettings = useThemeSettings();
  
  // State management
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [filteredProspects, setFilteredProspects] = useState<Prospect[]>([]);
  const [selectedProspects, setSelectedProspects] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // paginação futura
  // const [currentPage] = useState(1);
  const [resultsLimit, setResultsLimit] = useState(DEFAULT_RESULTS_LIMIT);
  // paginação futura
  // const [hasMoreResults] = useState(false);
  
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
    const whatsappCount = filteredProspects.filter(p => p?.hasWhatsApp).length;
    const noWhatsappCount = filteredProspects.filter(p => !p?.hasWhatsApp).length;
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
        p.name?.toLowerCase().includes(search) ||
        p.endereco?.toLowerCase().includes(search) ||
        p.category?.toLowerCase().includes(search) ||
        p.types?.toLowerCase().includes(search)
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
                <ProspectsSearchForm
                  searchTerm={searchTerm}
                  onChangeSearchTerm={setSearchTerm}
                  onKeyPress={handleKeyPress}
                  resultsLimit={resultsLimit}
                  onChangeResultsLimit={setResultsLimit}
                  isLoading={isLoading}
                  isConfigured={!!isConfigured}
                  onSearch={searchProspects}
                />

                {/* Filters */}
                <ProspectsFilters
                  whatsappFilter={whatsappFilter}
                  onChangeWhatsapp={setWhatsappFilter}
                  ratingFilter={ratingFilter}
                  onChangeRating={setRatingFilter}
                  searchFilter={searchFilter}
                  onChangeSearchFilter={setSearchFilter}
                  onClear={clearFilters}
                />

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
                      <ProspectCard
                        key={prospect.id}
                        prospect={prospect as any}
                        selected={selectedProspects.has(prospect.id)}
                        onToggle={toggleProspectSelection}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistics */}
            <ProspectsStatsCard stats={stats as any} />

            {/* Export Section */}
            <ExportSection
              selectedCount={selectedProspects.size}
              totalCount={prospects.length}
              onExportSelected={exportToExcel}
              onExportAll={exportAll}
              onExportDisparador={exportDisparadorPro}
            />
          </div>
        </div>
      </div>

      <ConfigModal
        open={showConfigModal}
        serpApiKey={apiConfig.serpApiKey}
        whatsappBaseUrl={apiConfig.whatsappBaseUrl}
        whatsappInstance={apiConfig.whatsappInstance}
        whatsappApiKey={apiConfig.whatsappApiKey}
        onChange={(patch) => setApiConfig(prev => ({ ...prev, ...patch }))}
        onSave={saveConfig}
        onClose={() => setShowConfigModal(false)}
      />
    </div>
  );
};

export default Prospectar;