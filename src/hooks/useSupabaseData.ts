// =====================================================
// HOOK PERSONALIZADO PARA GERENCIAR DADOS DO SUPABASE
// Substitui os dados mockados por dados reais
// =====================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type {
  Contact,
  AIProduct,
  DashboardMetrics,
  FunnelData,
  MetricsFilters,
  SupabaseResponse,
  UseSupabaseDataReturn
} from '../types/supabase';
import {
  getContacts,
  addContact,
  updateContact,
  deleteContact,
  useContacts
} from './useSupabaseContactsData';
import {
  getDashboardMetrics,
  getMetricsByDateRange,
  useRealTimeMetrics
} from './useSupabaseMetrics';
import {
  getFunnelData,
  getFunnelByDateRange,
  addFunnelData
} from './useSupabaseFunnelData';

// =====================================================
// HOOK PRINCIPAL PARA DADOS DO DASHBOARD
// =====================================================

export const useSupabaseData = (initialFilters?: MetricsFilters): UseSupabaseDataReturn => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (filters?: MetricsFilters) => {
    try {
      setLoading(true);
      setError(null);

      // Carregar dados em paralelo
      const [contactsResult, metricsResult, funnelResult] = await Promise.all([
        getContacts(),
        getDashboardMetrics(),
        getFunnelData(filters?.dateRange)
      ]);

      if (contactsResult.success) {
        setContacts(contactsResult.data || []);
      }

      if (metricsResult.success) {
        setMetrics(metricsResult.data);
      }

      if (funnelResult.success) {
        setFunnelData(funnelResult.data || []);
      }

      // Se algum erro ocorreu, mostrar o primeiro
      const errors = [contactsResult, metricsResult, funnelResult]
        .filter(result => !result.success)
        .map(result => result.error?.message || 'Erro desconhecido');
      
      if (errors.length > 0) {
        setError(errors[0]);
      }

    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados do Supabase');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(initialFilters);
  }, [loadData, initialFilters]);

  return {
    contacts,
    metrics,
    funnelData,
    loading,
    error,
    refetch: loadData
  };
};


// Buscar produtos de IA
export const getAIProducts = async (): Promise<SupabaseResponse<AIProduct[]>> => {
  try {
    const { data, error } = await supabase
      .from('ai_products')
      .select('*')
      .order('name');

    return {
      data,
      error,
      success: !error
    };
  } catch (err) {
    return {
      data: null,
      error: err,
      success: false
    };
  }
};


// =====================================================
// UTILITÁRIOS PARA TESTES E DESENVOLVIMENTO
// =====================================================

// Verificar se as tabelas existem
export const checkTablesExist = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('contacts').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
};

// Testar conexão com Supabase
export const testSupabaseConnection = async (): Promise<SupabaseResponse<boolean>> => {
  try {
    const { data, error } = await supabase.from('contacts').select('count').limit(1);
    return {
      data: !error,
      error,
      success: !error
    };
  } catch (err) {
    return {
      data: false,
      error: err,
      success: false
    };
  }
};

// Função para popular dados de teste
export const seedTestData = async (): Promise<SupabaseResponse<boolean>> => {
  try {
    // Get the current user from the auth session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Adicionar alguns contatos de teste
    const testContacts: ContactInsert[] = [
      {
        name: 'João Silva',
        email: 'joao@exemplo.com',
        phone: '(11) 99999-9999',
        client_name: 'Empresa ABC',
        status: 'Active',
        kanban_stage: 'Nova consulta'
      },
      {
        name: 'Maria Santos',
        email: 'maria@exemplo.com',
        phone: '(11) 88888-8888',
        client_name: 'Empresa XYZ',
        status: 'Active',
        kanban_stage: 'Qualificado'
      }
    ];

    // Add user_id to each contact
    const testContactsWithUserId = testContacts.map(contact => ({
      ...contact,
      user_id: user.id
    }));

    const { error } = await supabase.from('contacts').insert(testContactsWithUserId);

    return {
      data: !error,
      error,
      success: !error
    };
  } catch (err) {
    return {
      data: false,
      error: err,
      success: false
    };
  }
};

export {
  getContacts,
  addContact,
  updateContact,
  deleteContact,
  useContacts,
  getDashboardMetrics,
  getMetricsByDateRange,
  useRealTimeMetrics,
  getFunnelData,
  getFunnelByDateRange,
  addFunnelData
};
