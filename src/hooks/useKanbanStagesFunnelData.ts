
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
}

export function useKanbanStagesFunnelData({ stageIds, dateRange, allStages }: UseKanbanStagesFunnelDataParams) {
  const [data, setData] = useState<FunnelStageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // Initialize all stages with zero count using the provided stage list
      const stageCounts: Record<string, { count: number, title: string, ordering: number }> = {};
      
      allStages.forEach(stage => {
        if (stageIds.includes(stage.id)) {
          stageCounts[stage.id] = {
            count: 0,
            title: stage.title,
            ordering: stage.ordering
          };
        }
      });

      console.log('🎯 Estágios inicializados:', Object.keys(stageCounts));

      // Query contacts and count by stage
      const { data: contacts, error: queryError } = await supabase
        .from('contacts')
        .select('id, kanban_stage_id, created_at')
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
      contacts?.forEach(contact => {
        const stageId = contact.kanban_stage_id;
        if (stageId && stageCounts[stageId] !== undefined) {
          stageCounts[stageId].count++;
        }
      });

      console.log('📈 Contagem final por estágio:', stageCounts);

      // Calculate total for percentages
      const totalCount = Object.values(stageCounts).reduce((sum, stage) => sum + stage.count, 0);
      console.log('🔢 Total de contatos:', totalCount);

      // Convert to funnel format and sort by ordering
      const funnelData: FunnelStageData[] = Object.entries(stageCounts)
        .map(([stageId, stageData]) => ({
          stage: stageData.title,
          stageId: stageId,
          count: stageData.count,
          percentage: totalCount > 0 ? (stageData.count / totalCount) * 100 : 0,
          ordering: stageData.ordering,
        }))
        .sort((a, b) => a.ordering - b.ordering)
        .map(({ ordering, ...rest }) => rest); // Remove ordering from final result

      console.log('🎯 Dados do funil finais (todos os estágios):', funnelData);
      setData(funnelData);

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
  }, [stageIds, dateRange, allStages]);

  useEffect(() => {
    fetchFunnelData();
  }, [fetchFunnelData]);

  return {
    data,
    loading,
    error,
    refetch: fetchFunnelData,
  };
}
