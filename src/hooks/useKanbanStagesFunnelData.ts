
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

interface UseKanbanStagesFunnelDataParams {
  stageIds: string[];
  dateRange: DateRange;
}

export function useKanbanStagesFunnelData({ stageIds, dateRange }: UseKanbanStagesFunnelDataParams) {
  const [data, setData] = useState<FunnelStageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFunnelData = useCallback(async () => {
    if (stageIds.length === 0) {
      console.log('⚠️ Nenhum estágio selecionado para busca');
      setData([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Buscando dados do funil com JOIN correto:', { 
        stageIds, 
        dateRange,
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString()
      });

      // Query otimizada com JOIN entre contacts e kanban_stages
      const { data: contacts, error: queryError } = await supabase
        .from('contacts')
        .select(`
          id,
          kanban_stage_id,
          created_at,
          kanban_stages!inner (
            id,
            title,
            ordering
          )
        `)
        .is('deleted_at', null)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .in('kanban_stage_id', stageIds)
        .order('created_at', { ascending: false });

      if (queryError) {
        console.error('❌ Erro na query com JOIN:', queryError);
        throw queryError;
      }

      console.log('📊 Contatos encontrados com JOIN:', contacts?.length || 0);
      console.log('📋 Amostra dos dados:', contacts?.slice(0, 3));

      // Processar dados para contagem por estágio
      const stageCounts: Record<string, { count: number, title: string, ordering: number }> = {};

      // Inicializar contadores para os estágios selecionados
      stageIds.forEach(stageId => {
        stageCounts[stageId] = { count: 0, title: 'Desconhecido', ordering: 999 };
      });

      // Contar contatos por estágio
      contacts?.forEach(contact => {
        const stageId = contact.kanban_stage_id;
        const stageInfo = contact.kanban_stages;
        
        if (stageId && stageInfo && stageCounts[stageId] !== undefined) {
          stageCounts[stageId].count++;
          stageCounts[stageId].title = stageInfo.title;
          stageCounts[stageId].ordering = stageInfo.ordering || 999;
        }
      });

      console.log('📈 Contagem por estágio (JOIN):', stageCounts);

      // Calcular total para percentuais
      const totalCount = Object.values(stageCounts).reduce((sum, stage) => sum + stage.count, 0);
      console.log('🔢 Total de contatos processados:', totalCount);

      // Converter para formato do funil e ordenar por ordering
      const funnelData: FunnelStageData[] = Object.entries(stageCounts)
        .map(([stageId, stageData]) => ({
          stage: stageData.title,
          stageId: stageId,
          count: stageData.count,
          percentage: totalCount > 0 ? (stageData.count / totalCount) * 100 : 0,
          ordering: stageData.ordering,
        }))
        .sort((a, b) => a.ordering - b.ordering)
        .map(({ ordering, ...rest }) => rest); // Remove ordering do resultado final

      console.log('🎯 Dados do funil finais (ordenados):', funnelData);
      setData(funnelData);

    } catch (err) {
      console.error('❌ Erro ao buscar dados do funil:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao buscar dados';
      setError(errorMessage);
      
      // Fallback: buscar dados sem JOIN para debug
      console.log('🔄 Tentando busca alternativa sem JOIN...');
      try {
        const { data: fallbackContacts, error: fallbackError } = await supabase
          .from('contacts')
          .select('id, kanban_stage_id, created_at')
          .is('deleted_at', null)
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString())
          .in('kanban_stage_id', stageIds);

        if (!fallbackError && fallbackContacts) {
          console.log('📊 Dados de fallback encontrados:', fallbackContacts.length);
          
          // Buscar informações dos estágios separadamente
          const { data: stagesInfo, error: stagesError } = await supabase
            .from('kanban_stages')
            .select('id, title, ordering')
            .in('id', stageIds);

          if (!stagesError && stagesInfo) {
            // Mapear e contar
            const stageCounts: Record<string, { count: number, title: string, ordering: number }> = {};
            
            stagesInfo.forEach(stage => {
              stageCounts[stage.id] = { 
                count: 0, 
                title: stage.title, 
                ordering: stage.ordering || 999 
              };
            });

            fallbackContacts.forEach(contact => {
              if (contact.kanban_stage_id && stageCounts[contact.kanban_stage_id]) {
                stageCounts[contact.kanban_stage_id].count++;
              }
            });

            const totalCount = Object.values(stageCounts).reduce((sum, stage) => sum + stage.count, 0);
            
            const fallbackFunnelData: FunnelStageData[] = Object.entries(stageCounts)
              .map(([stageId, stageData]) => ({
                stage: stageData.title,
                stageId: stageId,
                count: stageData.count,
                percentage: totalCount > 0 ? (stageData.count / totalCount) * 100 : 0,
                ordering: stageData.ordering,
              }))
              .sort((a, b) => a.ordering - b.ordering)
              .map(({ ordering, ...rest }) => rest);

            console.log('✅ Dados de fallback processados:', fallbackFunnelData);
            setData(fallbackFunnelData);
            setError(null); // Limpar erro se fallback funcionou
          }
        }
      } catch (fallbackErr) {
        console.error('❌ Erro no fallback também:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  }, [stageIds, dateRange]);

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
