
import { useState, useEffect, useCallback } from "react";
import { useKanbanStagesSupabase } from "./useKanbanStagesSupabase";

export interface KanbanStageLocal {
  id: string;
  title: string;
  ordering: number;
  settings?: {
    color?: string;
  };
}

const DEFAULT_STAGES = [
  "Entraram",
  "Conversaram", 
  "Agendaram",
  "Compareceram",
  "Negociaram",
  "Postergaram",
  "Converteram",
];

export function useKanbanStagesLocal() {
  const { stages: supabaseStages, loading: supabaseLoading } = useKanbanStagesSupabase();
  const [stages, setStages] = useState<KanbanStageLocal[]>([]);
  const [loading, setLoading] = useState(true);

  const initializeStages = useCallback(() => {
    console.log('🏗️ Inicializando estágios locais');
    
    if (supabaseStages.length > 0) {
      // Use Supabase stages if available
      console.log('📊 Usando estágios do Supabase:', supabaseStages.length);
      const mappedStages = supabaseStages.map(stage => ({
        id: stage.id,
        title: stage.title,
        ordering: stage.ordering,
        settings: stage.settings
      }));
      setStages(mappedStages);
    } else {
      // Fallback to default stages
      console.log('⚡ Usando estágios padrão como fallback');
      const defaultStages = DEFAULT_STAGES.map((title, index) => ({
        id: `default-${index}`,
        title,
        ordering: index,
        settings: { color: '#6b7280' }
      }));
      setStages(defaultStages);
    }
    
    setLoading(false);
  }, [supabaseStages]);

  useEffect(() => {
    if (!supabaseLoading) {
      initializeStages();
    }
  }, [supabaseLoading, initializeStages]);

  // Create a stage name mapping for quick lookups
  const stageNameMap = stages.reduce((acc, stage) => {
    acc[stage.id] = stage.title;
    return acc;
  }, {} as Record<string, string>);

  return {
    stages,
    loading,
    stageNameMap,
    refetch: initializeStages,
  };
}
