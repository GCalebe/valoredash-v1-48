import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useConversationMetricsQuery } from '../../hooks/useConversationMetricsQuery';
import { useFunnelDataQuery } from '../../hooks/useFunnelDataQuery';
import { useContactsQuery } from '../../hooks/useContactsQuery';
import { useClientStatsQuery, useDashboardMetricsQuery } from '../../hooks/useClientStatsQuery';
import { useAIProductsQuery } from '../../hooks/useAIProductsQuery';

export const SupabaseDashboardExample: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredData, setFilteredData] = useState<any>(null);

  const { metrics = [] } = useConversationMetricsQuery();
  const { data: funnelData = [] } = useFunnelDataQuery();
  const { data: contacts = [] } = useContactsQuery();
  const { stats } = useClientStatsQuery();
  const { data: dashboardMetrics } = useDashboardMetricsQuery();
  const { data: products = [] } = useAIProductsQuery();

  const handleDateFilter = async () => {
    if (!startDate || !endDate) {
      alert('Por favor, selecione as datas de início e fim');
      return;
    }

    // Filter funnel data by date range (client-side filtering)
    const filteredFunnel = funnelData.filter(item => {
      const itemDate = new Date(item.created_at || item.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return itemDate >= start && itemDate <= end;
    });
    
    setFilteredData({
      funnel: filteredFunnel,
      dashboard: dashboardMetrics
    });
  };

  const loadContactsByStage = (stage: string) => {
    const stageContacts = contacts.filter(contact => contact.kanban_stage === stage);
    console.log(`Contatos no estágio ${stage}:`, stageContacts);
  };

  useEffect(() => {
    // Dashboard metrics are automatically loaded through React Query
    if (dashboardMetrics) {
      console.log('Métricas do Dashboard:', dashboardMetrics);
    }
  }, [dashboardMetrics]);

  const isLoading = false; // Simplified for now since hooks don't expose loading states consistently

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Carregando dados do Supabase...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Supabase - Exemplo de Integração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{contacts.length}</div>
                <div className="text-sm text-muted-foreground">Total de Contatos</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{funnelData.length}</div>
                <div className="text-sm text-muted-foreground">Dados do Funil</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{metrics.length}</div>
                <div className="text-sm text-muted-foreground">Métricas</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{products.length}</div>
                <div className="text-sm text-muted-foreground">Produtos IA</div>
              </CardContent>
            </Card>
          </div>

          {/* Filtro por Data */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filtro por Período</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <Label htmlFor="startDate">Data Início</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Data Fim</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <Button onClick={handleDateFilter}>
                  Filtrar Dados
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Ações de Teste */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Ações de Teste</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => loadContactsByStage('Qualificado')}
                >
                  Contatos Qualificados
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => loadContactsByStage('Proposta enviada')}
                >
                  Propostas Enviadas
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => loadContactsByStage('Nova consulta')}
                >
                  Novas Consultas
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Dados Filtrados */}
          {filteredData && (
            <Card>
              <CardHeader>
                <CardTitle>Dados Filtrados</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                  {JSON.stringify(filteredData, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Lista de Produtos */}
          {products.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Produtos IA Disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <Card key={product.id}>
                      <CardContent className="p-4">
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                        <p className="text-sm mt-2">{product.description}</p>
                        {product.price && (
                          <p className="text-lg font-bold mt-2">R$ {product.price}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};