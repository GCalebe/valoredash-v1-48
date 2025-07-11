import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FunnelStageData {
  stage: string;
  count: number;
  percentage: number;
}

interface DateRange {
  from: Date;
  to: Date;
}

interface UseKanbanStagesFunnelDataParams {
  stages: string[];
  dateRange: DateRange;
}

export function useKanbanStagesFunnelData({ stages, dateRange }: UseKanbanStagesFunnelDataParams) {
  const [data, setData] = useState<FunnelStageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFunnelData = async () => {
    if (stages.length === 0) {
      setData([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Query para contar as mudanças de estágio no período
      const { data: stageHistory, error: queryError } = await supabase
        .from('contact_stage_history')
        .select('new_stage')
        .gte('changed_at', dateRange.from.toISOString())
        .lte('changed_at', dateRange.to.toISOString())
        .in('new_stage', stages);

      if (queryError) {
        throw queryError;
      }

      // Contar ocorrências por estágio
      const stageCounts: Record<string, number> = {};
      
      // Inicializar contadores com zero para todos os estágios selecionados
      stages.forEach(stage => {
        stageCounts[stage] = 0;
      });

      // Contar as ocorrências
      stageHistory?.forEach(record => {
        if (record.new_stage && stages.includes(record.new_stage)) {
          stageCounts[record.new_stage]++;
        }
      });

      // Calcular total para percentuais
      const totalCount = Object.values(stageCounts).reduce((sum, count) => sum + count, 0);

      // Converter para formato do funil
      const funnelData: FunnelStageData[] = stages
        .map(stage => ({
          stage,
          count: stageCounts[stage] || 0,
          percentage: totalCount > 0 ? ((stageCounts[stage] || 0) / totalCount) * 100 : 0,
        }))
        .filter(item => item.count > 0); // Só mostrar estágios com dados

      setData(funnelData);
    } catch (err) {
      console.error('Erro ao buscar dados do funil:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunnelData();
  }, [stages, dateRange.from, dateRange.to]);

  return {
    data,
    loading,
    error,
    refetch: fetchFunnelData,
  };
}