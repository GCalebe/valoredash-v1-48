// =====================================================
// COMPONENTE DE EXEMPLO - USO DE DADOS REAIS DO SUPABASE
// Demonstra como substituir dados mockados por dados reais
// =====================================================

import React, { useState } from 'react';
import { useContactsQuery } from '../../hooks/useContactsQuery';
import { useFunnelDataQuery } from '../../hooks/useFunnelDataQuery';
import { useUTMMetricsQuery } from '../../hooks/useUTMMetricsQuery';
import type { DateRangeFilter, ContactFilters } from '../../types/supabase';

// =====================================================
// COMPONENTE PRINCIPAL DE EXEMPLO
// =====================================================

const SupabaseDataExample: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRangeFilter>({
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  });

  const [contactFilters, setContactFilters] = useState<ContactFilters>({
    status: undefined,
    kanbanStage: undefined
  });

  // Hook para contatos
  const { 
    data: contacts = [], 
    isLoading: contactsLoading, 
    error: contactsError,
    refetch: refetchContacts
  } = useContactsQuery();

  // Hook para dados do funil
  const {
    data: funnelData = [],
    isLoading: funnelLoading,
    error: funnelError,
    refetch: refetchFunnel
  } = useFunnelDataQuery();

  // Hook para métricas UTM
  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics
  } = useUTMMetricsQuery();

  // Estados derivados
  const loading = contactsLoading || funnelLoading || metricsLoading;
  const error = contactsError || funnelError || metricsError;
  const paginatedContacts = contacts.slice(0, 10); // Simulação de paginação
  const page = 1;
  const totalCount = contacts.length;
  const totalPages = Math.ceil(totalCount / 10);
  const nextPage = () => {}; // Implementar se necessário
  const prevPage = () => {}; // Implementar se necessário
  const realTimeMetrics = metrics; // Usar as mesmas métricas

  const handleDateRangeChange = (newDateRange: DateRangeFilter) => {
    setDateRange(newDateRange);
    // Refetch all data
    refetchContacts();
    refetchFunnel();
    refetchMetrics();
  };

  const handleContactFilterChange = (newFilters: ContactFilters) => {
    setContactFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do Supabase...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Erro!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
          <button 
            onClick={() => {
              refetchContacts();
              refetchFunnel();
              refetchMetrics();
            }}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Exemplo de Dados Reais do Supabase
      </h1>

      {/* Filtros de Data */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Filtros de Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Inicial
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateRangeChange({
                ...dateRange,
                startDate: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Final
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange({
                ...dateRange,
                endDate: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Métricas do Dashboard */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Métricas do Dashboard</h2>
        {metrics ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-600">Total de Clientes</h3>
              <p className="text-2xl font-bold text-blue-900">{metrics.total_clients || 0}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-600">Total de Chats</h3>
              <p className="text-2xl font-bold text-green-900">{metrics.total_chats || 0}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-purple-600">Taxa de Conversão</h3>
              <p className="text-2xl font-bold text-purple-900">{metrics.conversion_rate || 0}%</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-600">Valor Negociado</h3>
              <p className="text-2xl font-bold text-yellow-900">
                R$ {(metrics.negotiated_value || 0).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Nenhuma métrica disponível</p>
        )}
      </div>

      {/* Dados do Funil de Conversão */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Funil de Conversão</h2>
        {funnelData.length > 0 ? (
          <div className="space-y-3">
            {funnelData.map((item, index) => (
              <div key={item.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color || '#3B82F6' }}
                  ></div>
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{item.value}</div>
                  <div className="text-sm text-gray-500">{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Nenhum dado de funil disponível</p>
        )}
      </div>

      {/* Lista de Contatos */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Contatos Recentes</h2>
        
        {/* Filtros de Contatos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={contactFilters.status || ''}
              onChange={(e) => handleContactFilterChange({
                ...contactFilters,
                status: e.target.value as 'Active' | 'Inactive' | undefined
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="Active">Ativo</option>
              <option value="Inactive">Inativo</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estágio Kanban
            </label>
            <select
              value={contactFilters.kanbanStage || ''}
              onChange={(e) => handleContactFilterChange({
                ...contactFilters,
                kanbanStage: e.target.value || undefined
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="Nova consulta">Nova consulta</option>
              <option value="Qualificado">Qualificado</option>
              <option value="Chamada agendada">Chamada agendada</option>
              <option value="Preparando proposta">Preparando proposta</option>
              <option value="Proposta enviada">Proposta enviada</option>
              <option value="Negociação">Negociação</option>
              <option value="Fatura paga – ganho">Fatura paga – ganho</option>
            </select>
          </div>
        </div>

        {contactsLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : contactsError ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Erro ao carregar contatos: {contactsError}
          </div>
        ) : paginatedContacts.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estágio
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedContacts.map((contact) => (
                    <tr key={contact.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {contact.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {contact.email || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {contact.client_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          contact.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {contact.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {contact.kanban_stage || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-700">
                Mostrando {((page - 1) * 10) + 1} a {Math.min(page * 10, totalCount)} de {totalCount} contatos
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={prevPage}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                >
                  Anterior
                </button>
                <span className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded">
                  {page} de {totalPages}
                </span>
                <button
                  onClick={nextPage}
                  disabled={page === totalPages}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                >
                  Próximo
                </button>
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-center py-4">Nenhum contato encontrado</p>
        )}
      </div>

      {/* Métricas em Tempo Real */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          Métricas em Tempo Real
          {metricsLoading && (
            <span className="ml-2 inline-flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </span>
          )}
        </h2>
        {realTimeMetrics ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-indigo-600">Novos Clientes (Mês)</h3>
              <p className="text-2xl font-bold text-indigo-900">{realTimeMetrics.new_clients_this_month || 0}</p>
            </div>
            <div className="bg-pink-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-pink-600">Taxa de Resposta</h3>
              <p className="text-2xl font-bold text-pink-900">{realTimeMetrics.response_rate || 0}%</p>
            </div>
            <div className="bg-teal-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-teal-600">Total de Campanhas</h3>
              <p className="text-2xl font-bold text-teal-900">{realTimeMetrics.total_campaigns || 0}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Carregando métricas em tempo real...</p>
        )}
      </div>

      {/* Botão para Recarregar Dados */}
      <div className="mt-6 text-center">
        <button
          onClick={() => {
            refetchContacts();
            refetchFunnel();
            refetchMetrics();
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          Recarregar Dados
        </button>
      </div>
    </div>
  );
};

export default SupabaseDataExample;

// =====================================================
// COMPONENTE PARA TESTAR CONEXÃO
// =====================================================

export const SupabaseConnectionTest: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const testConnection = async () => {
    setTesting(true);
    setResult(null);

    try {
      const { testSupabaseConnection, checkTablesExist } = await import('../../lib/supabase-migration');
      
      const connectionResult = await testSupabaseConnection();
      const tablesExist = await checkTablesExist();

      if (connectionResult.success && tablesExist) {
        setResult('✅ Conexão com Supabase estabelecida e tabelas existem!');
      } else if (connectionResult.success && !tablesExist) {
        setResult('⚠️ Conexão estabelecida, mas as tabelas não foram criadas. Execute o script SQL primeiro.');
      } else {
        setResult(`❌ Erro na conexão: ${connectionResult.error?.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      setResult(`❌ Erro ao testar conexão: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Teste de Conexão Supabase</h2>
      <button
        onClick={testConnection}
        disabled={testing}
        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {testing ? 'Testando...' : 'Testar Conexão'}
      </button>
      {result && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="text-sm">{result}</p>
        </div>
      )}
    </div>
  );
};