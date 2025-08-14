
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FunnelStageData {
  stage: string;
  stageId: string;
  count: number;
  percentage: number;
}

interface DateRange {
  from: Date;
  to: Date;
}

interface KanbanStageLocal {
  id: string;
  title: string;
  ordering: number;
  settings?: {
    color?: string;
  };
}

interface UseKanbanStagesFunnelDataParams {
  stageIds: string[];
  dateRange: DateRange;
  allStages: KanbanStageLocal[];
  includeMovements?: boolean;
}

export function useKanbanStagesFunnelData({ stageIds, dateRange, allStages, includeMovements = false }: UseKanbanStagesFunnelDataParams) {
  const [data, setData] = useState<FunnelStageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [movements, setMovements] = useState<Record<string, number>>({});
  const [noShow, setNoShow] = useState<{ count: number; total: number; rate: number }>({ count: 0, total: 0, rate: 0 });

  const fetchFunnelData = useCallback(async () => {
    if (stageIds.length === 0 || allStages.length === 0) {
      console.log('⚠️ Nenhum estágio selecionado ou disponível para busca');
      setData([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Buscando dados do funil:', { 
        stageIds, 
        dateRange,
        allStagesCount: allStages.length,
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString()
      });

      // Initialize stage counts with zero
      const stageCounts: Record<string, { count: number, title: string, ordering: number }> = allStages
        .filter(stage => stageIds.includes(stage.id))
        .reduce((acc, stage) => {
          acc[stage.id] = { count: 0, title: stage.title, ordering: stage.ordering };
          return acc;
        }, {} as Record<string, { count: number, title: string, ordering: number }>);

      console.log('🎯 Estágios inicializados:', Object.keys(stageCounts));

      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Query contacts and count by stage - filtrar por user_id
      const { data: contacts, error: queryError } = await supabase
        .from('contacts')
        .select('id, kanban_stage_id, created_at')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .in('kanban_stage_id', stageIds);

      if (queryError) {
        console.error('❌ Erro na query:', queryError);
        throw queryError;
      }

      console.log('📊 Contatos encontrados:', contacts?.length || 0);

      // Count contacts by stage
      (contacts || []).forEach(contact => {
        const sid = (contact as any).kanban_stage_id as string | null;
        if (sid && stageCounts[sid]) stageCounts[sid].count++;
      });

      console.log('📈 Contagem final por estágio:', stageCounts);

      // Calculate total for percentages
      const totalCount = Object.values(stageCounts).reduce((sum, stage) => sum + stage.count, 0);
      console.log('🔢 Total de contatos:', totalCount);

      // Convert to funnel format and sort by ordering
      const funnelData: FunnelStageData[] = Object.entries(stageCounts)
        .map(([id, s]) => ({ id, ...s }))
        .sort((a, b) => a.ordering - b.ordering)
        .map(({ id, title, count, ordering }) => ({
          stage: title,
          stageId: id,
          count,
          percentage: totalCount > 0 ? (count / totalCount) * 100 : 0,
        }));

      console.log('🎯 Dados do funil finais (todos os estágios):', funnelData);
      setData(funnelData);

      // Optional: movements (entries) by stage using contact_stage_history (by changed_at)
      if (includeMovements) {
        const selectedStageNames = allStages
          .filter(s => stageIds.includes(s.id))
          .map(s => s.title);

        // Proteção de performance: se período > 60 dias, não buscar histórico
        const days = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 3600 * 24));
        if (selectedStageNames.length > 0 && days <= 60) {
          const { data: historyRows, error: histError } = await supabase
            .from('contact_stage_history')
            .select('new_stage')
            .gte('changed_at', dateRange.from.toISOString())
            .lte('changed_at', dateRange.to.toISOString())
            .in('new_stage', selectedStageNames)
            .limit(10000);

          if (histError) {
            console.warn('⚠️ Erro ao buscar histórico (movements), seguindo sem overlay:', histError.message);
            setMovements({});
          } else {
            const movementCounts: Record<string, number> = {};
            (historyRows || []).forEach(row => {
              const key = (row as any).new_stage as string;
              if (!key) return;
              movementCounts[key] = (movementCounts[key] || 0) + 1;
            });
            setMovements(movementCounts);
          }
        } else {
          setMovements({});
        }
      } else {
        setMovements({});
      }

      // Optional: No-Show rate on the same period (agenda_bookings)
      try {
        const startDay = dateRange.from.toISOString().slice(0,10);
        const endDay = dateRange.to.toISOString().slice(0,10);
        const { count: totalBookings } = await supabase
          .from('agenda_bookings')
          .select('id', { count: 'exact', head: true })
          .gte('booking_date', startDay)
          .lte('booking_date', endDay);
        const { count: noShowCount } = await supabase
          .from('agenda_bookings')
          .select('id', { count: 'exact', head: true })
          .gte('booking_date', startDay)
          .lte('booking_date', endDay)
          .eq('status', 'no_show');
        const total = totalBookings || 0;
        const ns = noShowCount || 0;
        setNoShow({ count: ns, total, rate: total > 0 ? (ns / total) * 100 : 0 });
      } catch (e) {
        console.warn('⚠️ Erro ao calcular No-Show:', (e as Error).message);
        setNoShow({ count: 0, total: 0, rate: 0 });
      }

    } catch (err) {
      console.error('❌ Erro ao buscar dados do funil:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao buscar dados';
      setError(errorMessage);
      
      // Create empty data for all stages on error
      const fallbackData: FunnelStageData[] = allStages
        .filter(stage => stageIds.includes(stage.id))
        .sort((a, b) => a.ordering - b.ordering)
        .map(stage => ({
          stage: stage.title,
          stageId: stage.id,
          count: 0,
          percentage: 0,
        }));
      
      console.log('🔄 Dados de fallback (estágios vazios):', fallbackData);
      setData(fallbackData);
    } finally {
      setLoading(false);
    }
  }, [stageIds, dateRange, allStages, includeMovements]);

  useEffect(() => {
    fetchFunnelData();
  }, [fetchFunnelData]);

  return {
    data,
    loading,
    error,
    refetch: fetchFunnelData,
    movements,
    noShow,
  };
}
