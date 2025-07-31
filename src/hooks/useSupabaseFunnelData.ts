import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import type { Database } from '../integrations/supabase/types';

type FunnelData = Database['public']['Tables']['funnel_data']['Row'];

export const useSupabaseFunnelData = () => {
  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch raw funnel data optionally filtered by date range
  const getFunnelData = async (start?: string, end?: string) => {
    let query = supabase.from('funnel_data').select('*');
    if (start) query = query.gte('created_at', start);
    if (end) query = query.lte('created_at', end);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  };

  const fetchFunnelData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('funnel_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFunnelData(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados do funil');
    } finally {
      setLoading(false);
    }
  };

  const getFunnelByDateRange = async (startDate: string, endDate: string) => {
    try {
      // Usar dados das novas tabelas implementadas para construir o funil
      const [conversationsData, contactsData, metricsData] = await Promise.all([
        supabase
          .from('conversations')
          .select('id, status, created_at, user_id')
          .gte('created_at', startDate)
          .lte('created_at', endDate),
        supabase
          .from('contacts')
          .select('id, stage, value, created_at')
          .gte('created_at', startDate)
          .lte('created_at', endDate),
        supabase
          .from('conversation_daily_data')
          .select('*')
          .gte('date', startDate)
          .lte('date', endDate)
      ]);

      // Construir dados do funil baseado nas novas tabelas
      const conversations = conversationsData.data || [];
      const contacts = contactsData.data || [];
      const metrics = metricsData.data || [];

      // Calcular estágios do funil
      const funnelStages = [
        {
          name: 'Visitantes',
          value: contacts.length,
          percentage: 100,
          created_at: new Date().toISOString()
        },
        {
          name: 'Leads',
          value: contacts.filter(c => c.stage === 'lead').length,
          percentage: contacts.length > 0 ? (contacts.filter(c => c.stage === 'lead').length / contacts.length) * 100 : 0,
          created_at: new Date().toISOString()
        },
        {
          name: 'Conversas Ativas',
          value: conversations.filter(c => c.status === 'active').length,
          percentage: contacts.length > 0 ? (conversations.filter(c => c.status === 'active').length / contacts.length) * 100 : 0,
          created_at: new Date().toISOString()
        },
        {
          name: 'Clientes',
          value: contacts.filter(c => c.stage === 'client').length,
          percentage: contacts.length > 0 ? (contacts.filter(c => c.stage === 'client').length / contacts.length) * 100 : 0,
          created_at: new Date().toISOString()
        }
      ];

      return funnelStages;
    } catch (error) {
      console.error('Erro ao buscar dados do funil:', error);
      // Fallback para dados mockados se houver erro
        const fallback = await supabase
          .from('funnel_data')
          .select('*')
          .gte('created_at', startDate)
          .lte('created_at', endDate)
          .order('created_at', { ascending: false });
        
        if (fallback.error) throw fallback.error;
        return fallback.data || [];
      }
      
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar funil por período:', err);
      return [];
    }
  };

  const getFunnelSummary = async () => {
    try {
      // Try conversion_funnel_view first, fallback to funnel_data
      const { data, error } = await supabase
        .from('conversion_funnel_view')
        .select('*');

      if (error) {
        // Fallback to funnel_data table
        const fallback = await supabase
          .from('funnel_data')
          .select('*');
        
        if (fallback.error) throw fallback.error;
        return fallback.data || [];
      }
      
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar resumo do funil:', err);
      return [];
    }
  };

  const addFunnelData = async (item: Omit<FunnelData, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('funnel_data')
      .insert(item)
      .select()
      .single();
    if (error) throw error;
    return data as FunnelData;
  };

  useEffect(() => {
    fetchFunnelData();
  }, []);

  return {
    funnelData,
    loading,
    error,
    refetch: fetchFunnelData,
    getFunnelData,
    getFunnelByDateRange,
    getFunnelSummary,
    addFunnelData
  };
};

// Individual functions are already available through the hook
// Export them directly for backwards compatibility
const getFunnelDataCompat = async (start?: string, end?: string) => {
  let query = supabase.from('funnel_data').select('*');
  if (start) query = query.gte('created_at', start);
  if (end) query = query.lte('created_at', end);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

const getFunnelByDateRangeCompat = async (startDate: string, endDate: string) => {
  try {
    const { data, error } = await supabase
      .from('conversion_funnel_view')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (error) {
      const fallback = await supabase
        .from('funnel_data')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });
      
      if (fallback.error) throw fallback.error;
      return fallback.data || [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Erro ao buscar funil por período:', err);
    return [];
  }
};

const addFunnelDataCompat = async (item: Omit<FunnelData, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('funnel_data')
    .insert(item)
    .select()
    .single();
  if (error) throw error;
  return data as FunnelData;
};

export { getFunnelDataCompat as getFunnelData, getFunnelByDateRangeCompat as getFunnelByDateRange, addFunnelDataCompat as addFunnelData };