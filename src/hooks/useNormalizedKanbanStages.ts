import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface NormalizedStage {
  id: string;
  title: string;
  ordering: number;
  count: number;
}

export function useNormalizedKanbanStages() {
  const [stages, setStages] = useState<NormalizedStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNormalizedStages = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar estágios Kanban do usuário
      const { data: kanbanStages, error: stagesError } = await supabase
        .from('kanban_stages')
        .select('*')
        .order('ordering', { ascending: true });

      if (stagesError) {
        throw stagesError;
      }

      // Contar contatos por estágio normalizado
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('kanban_stage')
        .is('deleted_at', null);

      if (contactsError) {
        throw contactsError;
      }

      // Normalizar contatos sem estágio
      const normalizedContacts = contacts?.map(contact => ({
        ...contact,
        kanban_stage: contact.kanban_stage || 'Novo Lead'
      })) || [];

      // Contar por estágio
      const stageCounts: Record<string, number> = {};
      normalizedContacts.forEach(contact => {
        const stage = contact.kanban_stage;
        stageCounts[stage] = (stageCounts[stage] || 0) + 1;
      });

      // Combinar dados dos estágios com contagens
      const normalizedStages: NormalizedStage[] = kanbanStages?.map(stage => ({
        id: stage.id,
        title: stage.title,
        ordering: stage.ordering,
        count: stageCounts[stage.title] || 0
      })) || [];

      console.log('📊 Estágios normalizados:', normalizedStages);
      console.log('📈 Contagens por estágio:', stageCounts);

      setStages(normalizedStages);
    } catch (err) {
      console.error('❌ Erro ao buscar estágios normalizados:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar estágios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNormalizedStages();
  }, []);

  return {
    stages,
    loading,
    error,
    refetch: fetchNormalizedStages,
  };
}