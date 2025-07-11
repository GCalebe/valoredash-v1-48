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

      // Buscar TODOS os contatos ativos com seus estágios atuais
      // O filtro de data será aplicado apenas para contatos criados no período
      const { data: allContacts, error: queryError } = await supabase
        .from('contacts')
        .select(`
          id,
          kanban_stage, 
          created_at,
          kanban_stage_id,
          kanban_stages(title)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (queryError) {
        console.error('❌ Erro na query:', queryError);
        throw queryError;
      }

      console.log('📊 Total de contatos encontrados:', allContacts?.length || 0);

      // Filtrar contatos criados no período especificado
      const contactsInPeriod = allContacts?.filter(contact => {
        const createdAt = new Date(contact.created_at);
        return createdAt >= dateRange.from && createdAt <= dateRange.to;
      }) || [];

      console.log('📅 Contatos criados no período:', contactsInPeriod.length);
      console.log('📋 Amostra dos dados:', contactsInPeriod.slice(0, 5));

      // Contar contatos por estágio atual (apenas os criados no período)
      const stageCounts: Record<string, number> = {};
      
      // Inicializar contadores com zero para todos os estágios selecionados
      stages.forEach(stage => {
        stageCounts[stage] = 0;
      });

      // Contar os contatos por estágio atual
      contactsInPeriod.forEach(contact => {
        // Priorizar kanban_stages.title (dados normalizados)
        let currentStage = contact.kanban_stages?.title || contact.kanban_stage;
        
        if (currentStage && stages.includes(currentStage)) {
          stageCounts[currentStage]++;
        } else if (currentStage) {
          console.log('🚫 Estágio não incluído no filtro:', currentStage);
        }
      });

      console.log('📈 Contagem por estágio:', stageCounts);

      // Calcular total para percentuais
      const totalCount = Object.values(stageCounts).reduce((sum, count) => sum + count, 0);
      console.log('🔢 Total de contatos no período:', totalCount);

      // Converter para formato do funil ordenado pela sequência dos estágios
      const funnelData: FunnelStageData[] = stages.map(stage => ({
        stage,
        count: stageCounts[stage] || 0,
        percentage: totalCount > 0 ? ((stageCounts[stage] || 0) / totalCount) * 100 : 0,
      }));

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