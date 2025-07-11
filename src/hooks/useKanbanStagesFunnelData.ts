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
      console.log('🔍 Buscando dados do funil com parâmetros:', { stages, dateRange });

      // Buscar contatos criados no período especificado com informações dos estágios
      const { data: contacts, error: queryError } = await supabase
        .from('contacts')
        .select(`
          kanban_stage, 
          created_at,
          kanban_stage_id,
          kanban_stages(title)
        `)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (queryError) {
        console.error('❌ Erro na query:', queryError);
        throw queryError;
      }

      console.log('📊 Contatos encontrados:', contacts?.length || 0);
      console.log('📋 Amostra dos dados:', contacts?.slice(0, 5));

      // Também buscar contatos que usam o campo kanban_stage diretamente
      const { data: contactsWithTextStage, error: textStageError } = await supabase
        .from('contacts')
        .select('kanban_stage, created_at')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .is('deleted_at', null)
        .not('kanban_stage', 'is', null)
        .order('created_at', { ascending: false });

      if (textStageError) {
        console.error('❌ Erro na query de estágios de texto:', textStageError);
      }

      console.log('📝 Contatos com estágio de texto:', contactsWithTextStage?.length || 0);

      // Contar contatos por estágio atual
      const stageCounts: Record<string, number> = {};
      
      // Inicializar contadores com zero para todos os estágios selecionados
      stages.forEach(stage => {
        stageCounts[stage] = 0;
      });

      // Contar os contatos por estágio atual (usando kanban_stages.title)
      contacts?.forEach(contact => {
        const stage = contact.kanban_stages?.title;
        if (stage && stages.includes(stage)) {
          stageCounts[stage]++;
        } else if (stage) {
          console.log('🚫 Estágio da tabela não incluído no filtro:', stage);
        }
      });

      // Contar os contatos por estágio atual (usando kanban_stage diretamente)
      contactsWithTextStage?.forEach(contact => {
        const stage = contact.kanban_stage;
        if (stage && stages.includes(stage)) {
          stageCounts[stage]++;
        } else if (stage) {
          console.log('🚫 Estágio de texto não incluído no filtro:', stage);
        }
      });

      console.log('📈 Contagem por estágio:', stageCounts);

      // Calcular total para percentuais
      const totalCount = Object.values(stageCounts).reduce((sum, count) => sum + count, 0);
      console.log('🔢 Total de contatos:', totalCount);

      // Converter para formato do funil
      const funnelData: FunnelStageData[] = stages
        .map(stage => ({
          stage,
          count: stageCounts[stage] || 0,
          percentage: totalCount > 0 ? ((stageCounts[stage] || 0) / totalCount) * 100 : 0,
        }))
        // Não filtrar estágios com 0 para mostrar o funil completo
        .filter(item => stages.includes(item.stage));

      console.log('🎯 Dados do funil processados:', funnelData);
      setData(funnelData);
    } catch (err) {
      console.error('❌ Erro ao buscar dados do funil:', err);
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