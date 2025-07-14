// =====================================================
// HOOK PERSONALIZADO PARA GERENCIAR DADOS DO SUPABASE
// Substitui os dados mockados por dados reais
// =====================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type {
  Contact,
  ContactInsert,
  ContactUpdate,
  ConversationMetrics,
  FunnelData,
  AIProduct,
  DashboardMetrics,
  DateRangeFilter,
  ContactFilters,
  MetricsFilters,
  SupabaseResponse,
  PaginatedResponse,
  UseSupabaseDataReturn
} from '../types/supabase';

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

// =====================================================
// FUNÇÕES PARA BUSCAR DADOS ESPECÍFICOS
// =====================================================

// Buscar todos os contatos
export const getContacts = async (filters?: ContactFilters): Promise<SupabaseResponse<Contact[]>> => {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    let query = supabase.from('contacts').select('*').eq('user_id', user.id);

    // Aplicar filtros se fornecidos
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.kanbanStage) {
      query = query.eq('kanban_stage_id', filters.kanbanStage);
    }
    if (filters?.responsibleUser) {
      query = query.eq('responsible_user', filters.responsibleUser);
    }
    if (filters?.clientSector) {
      query = query.eq('client_sector', filters.clientSector);
    }
    if (filters?.dateRange) {
      query = query
        .gte('created_at', filters.dateRange.startDate)
        .lte('created_at', filters.dateRange.endDate);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    // Transform data to match Contact interface
    const transformedData = data?.map(contact => ({
      ...contact,
      kanbanStage: contact.kanban_stage_id || 'Entraram',
      kanban_stage: contact.kanban_stage_id || 'Entraram',
      custom_values: {}
    })) as Contact[];

    return {
      data: transformedData,
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

// Buscar métricas do dashboard
export const getDashboardMetrics = async (): Promise<SupabaseResponse<DashboardMetrics>> => {
  try {
    const { data, error } = await supabase
      .from('dashboard_metrics')
      .select('*')
      .single();

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

// Buscar dados do funil de conversão
export const getFunnelData = async (dateRange?: DateRangeFilter): Promise<SupabaseResponse<FunnelData[]>> => {
  try {
    let query = supabase.from('funnel_data').select('*');

    if (dateRange) {
      query = query
        .gte('created_at', dateRange.startDate)
        .lte('created_at', dateRange.endDate);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

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

// Buscar dados do funil usando função SQL
export const getFunnelByDateRange = async (startDate?: string, endDate?: string): Promise<SupabaseResponse<FunnelData[]>> => {
  try {
    const { data, error } = await supabase.rpc('get_funnel_by_date_range', {
      start_date: startDate,
      end_date: endDate
    });

    // Add missing id and created_at properties
    const dataWithRequiredFields = data?.map(item => ({
      ...item,
      id: `funnel_${item.name}_${Date.now()}`, // Generate ID
      created_at: new Date().toISOString() // Add timestamp
    }));

    return {
      data: dataWithRequiredFields,
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

// Buscar métricas por período
export const getMetricsByDateRange = async (startDate?: string, endDate?: string): Promise<SupabaseResponse<ConversationMetrics[]>> => {
  try {
    const { data, error } = await supabase.rpc('get_metrics_by_date_range', {
      start_date: startDate,
      end_date: endDate
    });

    // Add missing properties to match ConversationMetrics type
    const dataWithRequiredFields = data?.map(item => ({
      ...item,
      id: `metrics_${Date.now()}`,
      total_respondidas: item.total_conversations || 0,
      avg_response_time: 0,
      avg_closing_time: 0,
      avg_response_start_time: 0,
      secondary_response_rate: 0,
      total_secondary_responses: 0,
      average_negotiated_value: item.negotiated_value || 0,
      total_negotiating_value: item.negotiated_value || 0,
      previous_period_value: 0,
      is_stale: false,
      created_at: new Date().toISOString()
    }));

    return {
      data: dataWithRequiredFields,
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
// FUNÇÕES PARA MANIPULAR DADOS (CRUD)
// =====================================================

// Adicionar novo contato
export const addContact = async (contact: ContactInsert): Promise<SupabaseResponse<Contact>> => {
  try {
    // Get the current user from the auth session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('contacts')
      .insert({ ...contact, user_id: user.id })
      .select()
      .single();

    // Transform data to match Contact interface
    const transformedData = data ? {
      ...data,
      kanbanStage: data.kanban_stage_id || 'Entraram',
      kanban_stage: data.kanban_stage_id || 'Entraram',
      custom_values: {}
    } as Contact : null;

    return {
      data: transformedData,
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

// Atualizar contato existente
export const updateContact = async (id: string, updates: ContactUpdate): Promise<SupabaseResponse<Contact>> => {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from('contacts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    // Transform data to match Contact interface
    const transformedData = data ? {
      ...data,
      kanbanStage: data.kanban_stage_id || 'Entraram',
      kanban_stage: data.kanban_stage_id || 'Entraram',
      custom_values: {}
    } as Contact : null;

    return {
      data: transformedData,
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

// Deletar contato
export const deleteContact = async (id: string): Promise<SupabaseResponse<boolean>> => {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

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

// Adicionar dados ao funil (para testes)
export const addFunnelData = async (funnelItem: Omit<FunnelData, 'id' | 'created_at'>): Promise<SupabaseResponse<FunnelData>> => {
  try {
    const { data, error } = await supabase
      .from('funnel_data')
      .insert(funnelItem)
      .select()
      .single();

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

// Hook para contatos com paginação
export const useContacts = (filters?: ContactFilters, pageSize: number = 20) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadContacts = useCallback(async (currentPage: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      let query = supabase.from('contacts').select('*', { count: 'exact' }).eq('user_id', user.id);

      // Aplicar filtros
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.kanbanStage) {
        query = query.eq('kanban_stage_id', filters.kanbanStage);
      }
      if (filters?.responsibleUser) {
        query = query.eq('responsible_user', filters.responsibleUser);
      }
      if (filters?.clientSector) {
        query = query.eq('client_sector', filters.clientSector);
      }
      if (filters?.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.startDate)
          .lte('created_at', filters.dateRange.endDate);
      }

      // Aplicar paginação
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query.order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        // Transform data to match Contact interface
        const transformedData = data?.map(contact => ({
          ...contact,
          kanbanStage: contact.kanban_stage_id || 'Entraram',
          kanban_stage: contact.kanban_stage_id || 'Entraram',
          custom_values: {}
        })) as Contact[] || [];
        setContacts(transformedData);
        setTotalCount(count || 0);
        setPage(currentPage);
      }
    } catch (err) {
      console.error('Erro ao carregar contatos:', err);
      setError('Erro ao carregar contatos');
    } finally {
      setLoading(false);
    }
  }, [filters, pageSize]);

  useEffect(() => {
    loadContacts(1);
  }, [loadContacts]);

  const nextPage = () => {
    const totalPages = Math.ceil(totalCount / pageSize);
    if (page < totalPages) {
      loadContacts(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      loadContacts(page - 1);
    }
  };

  const goToPage = (targetPage: number) => {
    const totalPages = Math.ceil(totalCount / pageSize);
    if (targetPage >= 1 && targetPage <= totalPages) {
      loadContacts(targetPage);
    }
  };

  return {
    contacts,
    loading,
    error,
    page,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    nextPage,
    prevPage,
    goToPage,
    refetch: () => loadContacts(page)
  };
};

// Hook para métricas em tempo real
export const useRealTimeMetrics = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Carregar dados iniciais
    const loadInitialData = async () => {
      const result = await getDashboardMetrics();
      if (result.success) {
        setMetrics(result.data);
      } else {
        setError(result.error?.message || 'Erro ao carregar métricas');
      }
      setLoading(false);
    };

    loadInitialData();

    // Configurar subscription para atualizações em tempo real
    const subscription = supabase
      .channel('dashboard_metrics_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'conversation_metrics' 
        }, 
        () => {
          // Recarregar métricas quando houver mudanças
          loadInitialData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { metrics, loading, error };
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
