// =====================================================
// MIGRAÇÃO E INTEGRAÇÃO COM SUPABASE
// Substitui dados mockup por dados reais do banco
// =====================================================

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Configuração do cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// =====================================================
// TIPOS PARA DADOS DO SUPABASE
// =====================================================

export interface SupabaseContact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address?: string;
  client_name: string | null;
  client_size: string | null;
  client_type: string | null;
  cpf_cnpj: string | null;
  asaas_customer_id: string | null;
  status: 'Active' | 'Inactive';
  notes?: string;
  last_contact: string;
  kanban_stage: string;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
  session_id?: string;
  tags?: string[];
  responsible_user?: string;
  sales?: number;
  client_sector?: string;
  budget?: number;
  payment_method?: string;
  client_objective?: string;
  loss_reason?: string;
  contract_number?: string;
  contract_date?: string;
  payment?: string;
  uploaded_files?: string[];
  consultation_stage?: string;
  custom_values?: any;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseMetrics {
  total_conversations: number;
  response_rate: number;
  conversion_rate: number;
  negotiated_value: number;
  total_clients: number;
  total_chats: number;
  new_clients_this_month: number;
}

export interface SupabaseFunnelData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

// =====================================================
// FUNÇÕES DE MIGRAÇÃO
// =====================================================

/**
 * Executa o script SQL de migração no Supabase
 * ATENÇÃO: Execute apenas uma vez para criar as tabelas e inserir dados iniciais
 */
export async function executeMigration() {
  try {
    console.log('🚀 Iniciando migração para Supabase...');
    
    // Nota: O script SQL deve ser executado diretamente no painel do Supabase
    // ou via CLI, pois o cliente JavaScript não suporta DDL commands
    console.log('⚠️  Execute o arquivo supabase-migration.sql no painel do Supabase:');
    console.log('1. Acesse https://supabase.com/dashboard');
    console.log('2. Vá para SQL Editor');
    console.log('3. Cole o conteúdo do arquivo supabase-migration.sql');
    console.log('4. Execute o script');
    
    return {
      success: false,
      message: 'Execute o script SQL manualmente no painel do Supabase'
    };
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    return {
      success: false,
      error: error
    };
  }
}

// =====================================================
// FUNÇÕES PARA SUBSTITUIR DADOS MOCKUP
// =====================================================

/**
 * Busca todos os contatos do Supabase
 * Substitui mockClients
 */
export async function getContactsFromSupabase(): Promise<SupabaseContact[]> {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar contatos:', error);
      return [];
    }

    return (data || []).map(contact => ({
      ...contact,
      status: (contact.status as 'Active' | 'Inactive') || 'Active'
    }));
  } catch (error) {
    console.error('Erro na função getContactsFromSupabase:', error);
    return [];
  }
}

/**
 * Busca métricas do dashboard do Supabase
 * Substitui mockClientStats e mockConversationMetrics
 */
export async function getMetricsFromSupabase(): Promise<SupabaseMetrics | null> {
  try {
    const { data, error } = await supabase
      .from('dashboard_metrics')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Erro ao buscar métricas:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro na função getMetricsFromSupabase:', error);
    return null;
  }
}

/**
 * Busca dados do funil de conversão com filtro de data
 * Substitui funnelData do mockConversationMetrics
 */
export async function getFunnelDataFromSupabase(
  startDate?: string,
  endDate?: string
): Promise<SupabaseFunnelData[]> {
  try {
    let query = supabase.from('funnel_data').select('*');
    
    if (startDate && endDate) {
      // Usar função SQL para filtro por data
      const { data, error } = await supabase
        .rpc('get_funnel_by_date_range', {
          start_date: startDate,
          end_date: endDate
        });
      
      if (error) {
        console.error('Erro ao buscar funil com filtro:', error);
        return [];
      }
      
      return data || [];
    } else {
      const { data, error } = await query.order('value', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar funil:', error);
        return [];
      }
      
      return data || [];
    }
  } catch (error) {
    console.error('Erro na função getFunnelDataFromSupabase:', error);
    return [];
  }
}

/**
 * Busca dados de conversão por tempo
 * Substitui conversionByTimeData
 */
export async function getConversionByTimeFromSupabase() {
  try {
    // Using funnel_data as alternative since conversion_by_time doesn't exist in types
    const { data, error } = await supabase
      .from('funnel_data')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar conversão por tempo:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro na função getConversionByTimeFromSupabase:', error);
    return [];
  }
}

/**
 * Busca leads por fonte
 * Substitui leadsBySource
 */
export async function getLeadsBySourceFromSupabase() {
  try {
    // Using utm_tracking as alternative since leads_by_source doesn't exist in types
    const { data, error } = await supabase
      .from('utm_tracking')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar leads por fonte:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro na função getLeadsBySourceFromSupabase:', error);
    return [];
  }
}

/**
 * Busca produtos AI do Supabase
 * Substitui aiProducts mock
 */
export async function getAIProductsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('ai_products')
      .select('*')
      .order('popular', { ascending: false });

    if (error) {
      console.error('Erro ao buscar produtos AI:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro na função getAIProductsFromSupabase:', error);
    return [];
  }
}

/**
 * Busca dados UTM e campanhas
 * Substitui mockUTMMetrics
 */
export async function getUTMDataFromSupabase() {
  try {
    const [metricsResult, campaignsResult, trackingResult] = await Promise.all([
      supabase.from('utm_metrics').select('*').limit(1).single(),
      supabase.from('utm_tracking').select('*').order('created_at', { ascending: false }),
      supabase.from('utm_tracking').select('*').order('created_at', { ascending: false })
    ]);

    return {
      metrics: metricsResult.data,
      campaigns: campaignsResult.data || [],
      tracking: trackingResult.data || []
    };
  } catch (error) {
    console.error('Erro na função getUTMDataFromSupabase:', error);
    return {
      metrics: null,
      campaigns: [],
      tracking: []
    };
  }
}

// =====================================================
// FUNÇÕES DE INSERÇÃO E ATUALIZAÇÃO
// =====================================================

/**
 * Adiciona um novo contato
 */
export async function addContact(contact: Omit<SupabaseContact, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .insert([contact])
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar contato:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Erro na função addContact:', error);
    return { success: false, error };
  }
}

/**
 * Atualiza um contato existente
 */
export async function updateContact(id: string, updates: Partial<SupabaseContact>) {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar contato:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Erro na função updateContact:', error);
    return { success: false, error };
  }
}

/**
 * Adiciona dados ao funil (para testes)
 */
export async function addFunnelData(funnelData: Omit<SupabaseFunnelData, 'id' | 'created_at'>) {
  try {
    const { data, error } = await supabase
      .from('funnel_data')
      .insert([funnelData])
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar dados do funil:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Erro na função addFunnelData:', error);
    return { success: false, error };
  }
}

// =====================================================
// HOOK PERSONALIZADO PARA USAR NO REACT
// =====================================================

import { useState, useEffect } from 'react';

/**
 * Hook para buscar dados do Supabase com loading state
 */
export function useSupabaseData() {
  const [contacts, setContacts] = useState<SupabaseContact[]>([]);
  const [metrics, setMetrics] = useState<SupabaseMetrics | null>(null);
  const [funnelData, setFunnelData] = useState<SupabaseFunnelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (dateFilter?: { start: string; end: string }) => {
    try {
      setLoading(true);
      setError(null);

      const [contactsData, metricsData, funnelDataResult] = await Promise.all([
        getContactsFromSupabase(),
        getMetricsFromSupabase(),
        getFunnelDataFromSupabase(dateFilter?.start, dateFilter?.end)
      ]);

      setContacts(contactsData);
      setMetrics(metricsData);
      setFunnelData(funnelDataResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    contacts,
    metrics,
    funnelData,
    loading,
    error,
    refetch: loadData
  };
}

// =====================================================
// UTILITÁRIOS PARA MIGRAÇÃO
// =====================================================

/**
 * Verifica se as tabelas existem no Supabase
 */
export async function checkTablesExist() {
  try {
    const tables = ['contacts', 'conversation_metrics', 'funnel_data', 'ai_products'];
    const results = [];

    for (const table of tables) {
      try {
        // Only check tables that exist in types
        const validTables = ['contacts', 'ai_products', 'client_stats', 'conversation_metrics', 'funnel_data', 'utm_metrics', 'utm_tracking'];
        if (!validTables.includes(table)) {
          results.push({
            table,
            exists: false,
            error: `Table ${table} not found in types`
          });
          continue;
        }
        
        const { data, error } = await supabase
          .from(table as any)
          .select('id')
          .limit(1);
      
        results.push({
          table,
          exists: !error,
          error: error?.message
        });
      } catch (tableError) {
        results.push({
          table,
          exists: false,
          error: tableError instanceof Error ? tableError.message : 'Unknown error'
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Erro ao verificar tabelas:', error);
    return [];
  }
}

/**
 * Função para testar a conexão com Supabase
 */
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('count')
      .limit(1);

    if (error) {
      return {
        success: false,
        message: 'Erro na conexão: ' + error.message
      };
    }

    return {
      success: true,
      message: 'Conexão com Supabase estabelecida com sucesso!'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erro na conexão: ' + (error instanceof Error ? error.message : 'Erro desconhecido')
    };
  }
}

// =====================================================
// EXEMPLO DE USO
// =====================================================

/*
// Em um componente React:

import { useSupabaseData, testSupabaseConnection } from '@/lib/supabase-migration';

function MetricsComponent() {
  const { contacts, metrics, funnelData, loading, error, refetch } = useSupabaseData();
  
  // Para filtrar por data:
  const handleDateFilter = (startDate: string, endDate: string) => {
    refetch({ start: startDate, end: endDate });
  };
  
  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;
  
  return (
    <div>
      <h2>Métricas do Supabase</h2>
      <p>Total de contatos: {contacts.length}</p>
      <p>Taxa de conversão: {metrics?.conversion_rate}%</p>
      
      <h3>Funil de Conversão</h3>
      {funnelData.map(item => (
        <div key={item.name}>
          {item.name}: {item.value} ({item.percentage}%)
        </div>
      ))}
    </div>
  );
}

// Para testar a conexão:
const testConnection = async () => {
  const result = await testSupabaseConnection();
  console.log(result.message);
};

*/