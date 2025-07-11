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
      console.log('🔍 Buscando dados do funil normalizado:', { stages, dateRange });

      // Buscar contatos ativos com estágios normalizados
      // Priorizar kanban_stage que foi normalizado pelos triggers
      const { data: contacts, error: queryError } = await supabase
        .from('contacts')
        .select(`
          id,
          kanban_stage,
          created_at,
          deleted_at
        `)
        .is('deleted_at', null)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .order('created_at', { ascending: false });

      if (queryError) {
        console.error('❌ Erro na query normalizada:', queryError);
        throw queryError;
      }

      console.log('📊 Contatos encontrados no período:', contacts?.length || 0);

      // Normalizar estágios ausentes para "Novo Lead"
      const normalizedContacts = contacts?.map(contact => ({
        ...contact,
        kanban_stage: contact.kanban_stage || 'Novo Lead'
      })) || [];

      console.log('📋 Amostra dos contatos normalizados:', normalizedContacts.slice(0, 5));

      // Contar contatos por estágio
      const stageCounts: Record<string, number> = {};
      
      // Inicializar contadores com zero
      stages.forEach(stage => {
        stageCounts[stage] = 0;
      });

      // Contar os contatos por estágio normalizado
      normalizedContacts.forEach(contact => {
        const currentStage = contact.kanban_stage;
        
        if (currentStage && stages.includes(currentStage)) {
          stageCounts[currentStage]++;
        } else if (currentStage) {
          // Mapear automaticamente estágios não incluídos para "Novo Lead" se apropriado
          if (!stages.includes(currentStage) && stages.includes('Novo Lead')) {
            stageCounts['Novo Lead']++;
            console.log('🔄 Estágio mapeado para Novo Lead:', currentStage);
          } else {
            console.log('🚫 Estágio não incluído no filtro:', currentStage);
          }
        }
      });

      console.log('📈 Contagem final por estágio:', stageCounts);

      // Calcular total para percentuais
      const totalCount = Object.values(stageCounts).reduce((sum, count) => sum + count, 0);
      console.log('🔢 Total de contatos processados:', totalCount);

      // Converter para formato do funil
      const funnelData: FunnelStageData[] = stages.map(stage => ({
        stage,
        count: stageCounts[stage] || 0,
        percentage: totalCount > 0 ? ((stageCounts[stage] || 0) / totalCount) * 100 : 0,
      }));

      console.log('🎯 Dados do funil normalizados:', funnelData);
      setData(funnelData);
    } catch (err) {
      console.error('❌ Erro ao buscar dados do funil normalizado:', err);
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