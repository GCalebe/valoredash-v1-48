import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, cacheConfig } from '@/lib/queryClient';

interface ClientStats {
  total: number;
  newThisMonth: number;
  converted: number;
  pending: number;
  byStage: Record<string, number>;
  bySource: Record<string, number>;
  averageValue: number;
  conversionRate: number;
}

interface ClientStatsFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  stage?: string;
  source?: string;
}

/**
 * Hook otimizado para estatísticas de clientes
 * Utiliza cache inteligente e queries paralelas
 */
export const useClientStatsQueryOptimized = (filters?: ClientStatsFilters) => {
  return useQuery({
    queryKey: queryKeys.clientStats.byDateRange(
      filters?.dateRange?.start || 'all',
      filters?.dateRange?.end || 'all'
    ),
    queryFn: async (): Promise<ClientStats> => {
      let query = supabase.from('contacts').select(`
        id,
        kanban_stage_id,
        created_at,
        sales,
        budget
      `);

      // Aplicar filtros se fornecidos
      if (filters?.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.start)
          .lte('created_at', filters.dateRange.end);
      }

      if (filters?.stage) {
        query = query.eq('kanban_stage_id', filters.stage);
      }

      // Skip source filter since lead_source doesn't exist in contacts table

      const { data: contacts, error } = await query.limit(5000);

      if (error) {
        throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
      }

      const contactList = contacts || [];

      // Calcular estatísticas de forma otimizada
      const stats: ClientStats = {
        total: contactList.length,
        newThisMonth: 0,
        converted: 0,
        pending: 0,
        byStage: {},
        bySource: {},
        averageValue: 0,
        conversionRate: 0,
      };

      // Data de referência para "este mês"
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      let totalValue = 0;
      const totalWithProbability = 0;
      const sumProbability = 0;

      // Processar contatos em uma única passagem
      contactList.forEach(contact => {
        // Novos este mês
        if (contact.created_at && new Date(contact.created_at) >= thisMonth) {
          stats.newThisMonth++;
        }

        // Por estágio
        const stage = contact.kanban_stage_id || 'unknown';
        stats.byStage[stage] = (stats.byStage[stage] || 0) + 1;

        // Skip source tracking since lead_source doesn't exist
        stats.bySource['unknown'] = stats.bySource['unknown'] || 0;

        // Use sales or budget as value fallback
        const value = contact.sales || contact.budget || 0;
        if (value > 0) {
          totalValue += value;
        }

        // Skip conversion probability since field doesn't exist

        // Contadores específicos
        if (stage === 'fechado' || stage === 'convertido') {
          stats.converted++;
        } else if (stage === 'lead' || stage === 'contato-inicial' || stage === 'em-negociacao') {
          stats.pending++;
        }
      });

      // Cálculos finais
      stats.averageValue = contactList.length > 0 ? totalValue / contactList.length : 0;
      stats.conversionRate = 0; // Set to 0 since conversion_probability doesn't exist

      return stats;
    },
    ...cacheConfig.dynamic,
    staleTime: 3 * 60 * 1000, // 3 minutos para stats
    enabled: true,
  });
};

/**
 * Hook para estatísticas em tempo real (cache mais curto)
 */
export const useClientStatsRealtime = () => {
  return useQuery({
    queryKey: queryKeys.clientStats.latest,
    queryFn: async (): Promise<Partial<ClientStats>> => {
      // Query mais leve para dados em tempo real
      const { data, error } = await supabase
        .from('contacts')
        .select('id, kanban_stage_id, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        throw new Error(`Erro ao buscar stats em tempo real: ${error.message}`);
      }

      const contacts = data || [];
      const today = new Date().toISOString().split('T')[0];
      
      return {
        total: contacts.length,
        newThisMonth: contacts.filter(c => 
          c.created_at && c.created_at.startsWith(today)
        ).length,
        byStage: contacts.reduce((acc, contact) => {
          const stage = contact.kanban_stage_id || 'unknown';
          acc[stage] = (acc[stage] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };
    },
    ...cacheConfig.realtime,
    refetchInterval: 30 * 1000, // 30 segundos
  });
};

/**
 * Utilitários para invalidação e prefetch
 */
export const useClientStatsUtils = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clientStats.all });
    },
    
    prefetchByDateRange: (start: string, end: string) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.clientStats.byDateRange(start, end),
        staleTime: cacheConfig.dynamic.staleTime,
      });
    },
    
    setOptimisticData: (data: ClientStats) => {
      queryClient.setQueryData(queryKeys.clientStats.latest, data);
    },
  };
};