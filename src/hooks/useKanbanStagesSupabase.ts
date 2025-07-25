
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface KanbanStage {
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

// Helper function to safely parse settings from database Json
const parseStageSettings = (settings: unknown): { color?: string } => {
  if (!settings) return { color: '#6b7280' };
  
  // If settings is already an object with color property
  if (typeof settings === 'object' && settings !== null && !Array.isArray(settings)) {
    return {
      color: typeof settings.color === 'string' ? settings.color : '#6b7280'
    };
  }
  
  // Default fallback
  return { color: '#6b7280' };
};

export function useKanbanStagesSupabase() {
  const { user } = useAuth();
  const [stages, setStages] = useState<KanbanStage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStages = useCallback(async () => {
    if (!user?.id) {
      console.log("No user ID available for fetching stages");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching kanban stages for user:", user.id);

      const { data, error } = await supabase
        .from('kanban_stages')
        .select('*')
        .eq('user_id', user.id)
        .order('ordering', { ascending: true });

      if (error) {
        console.error("Error fetching stages:", error);
        throw error;
      }

      console.log("Fetched stages from Supabase:", data);

      if (!data || data.length === 0) {
        console.log("No stages found, creating default stages");
        await createDefaultStages();
        return;
      }

      const transformedStages: KanbanStage[] = data.map(stage => ({
        id: stage.id,
        title: stage.title,
        ordering: stage.ordering,
        settings: parseStageSettings(stage.settings)
      }));

      setStages(transformedStages);
    } catch (error) {
      console.error("Failed to fetch kanban stages:", error);
      toast({
        title: "Erro ao carregar estágios",
        description: "Não foi possível carregar os estágios do kanban.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [createDefaultStages]);

  const createDefaultStages = async () => {
    if (!user?.id) return;

    try {
      console.log("Creating default stages for user:", user.id);
      
      const defaultStagesData = DEFAULT_STAGES.map((title, index) => ({
        title,
        ordering: index,
        user_id: user.id,
        settings: { color: '#6b7280' }
      }));

      const { data, error } = await supabase
        .from('kanban_stages')
        .insert(defaultStagesData)
        .select();

      if (error) {
        console.error("Error creating default stages:", error);
        throw error;
      }

      console.log("Created default stages:", data);

      const transformedStages: KanbanStage[] = data.map(stage => ({
        id: stage.id,
        title: stage.title,
        ordering: stage.ordering,
        settings: parseStageSettings(stage.settings)
      }));

      setStages(transformedStages);

      toast({
        title: "Estágios criados",
        description: "Estágios padrão do kanban foram criados com sucesso.",
      });
    } catch (error) {
      console.error("Failed to create default stages:", error);
      toast({
        title: "Erro ao criar estágios",
        description: "Não foi possível criar os estágios padrão.",
        variant: "destructive",
      });
    }
  };

  const addStage = async (title: string) => {
    if (!user?.id) return;

    try {
      console.log("Adding new stage:", title);
      
      const newStageData = {
        title,
        ordering: stages.length,
        user_id: user.id,
        settings: { color: '#6b7280' }
      };

      const { data, error } = await supabase
        .from('kanban_stages')
        .insert([newStageData])
        .select()
        .single();

      if (error) throw error;

      const newStage: KanbanStage = {
        id: data.id,
        title: data.title,
        ordering: data.ordering,
        settings: parseStageSettings(data.settings)
      };

      setStages(prev => [...prev, newStage]);

      toast({
        title: "Estágio adicionado",
        description: `O estágio "${title}" foi adicionado com sucesso.`,
      });
    } catch (error) {
      console.error("Failed to add stage:", error);
      toast({
        title: "Erro ao adicionar estágio",
        description: "Não foi possível adicionar o novo estágio.",
        variant: "destructive",
      });
    }
  };

  const updateStage = async (stageId: string, title: string, color: string) => {
    try {
      console.log("Updating stage:", stageId, title, color);

      const { error } = await supabase
        .from('kanban_stages')
        .update({
          title,
          settings: { color }
        })
        .eq('id', stageId);

      if (error) throw error;

      setStages(prev => prev.map(stage => 
        stage.id === stageId 
          ? { ...stage, title, settings: { ...stage.settings, color } }
          : stage
      ));

      toast({
        title: "Estágio atualizado",
        description: `O estágio foi atualizado com sucesso.`,
      });
    } catch (error) {
      console.error("Failed to update stage:", error);
      toast({
        title: "Erro ao atualizar estágio",
        description: "Não foi possível atualizar o estágio.",
        variant: "destructive",
      });
    }
  };

  const removeStage = async (stageId: string) => {
    try {
      console.log("Removing stage:", stageId);

      const { error } = await supabase
        .from('kanban_stages')
        .delete()
        .eq('id', stageId);

      if (error) throw error;

      setStages(prev => prev.filter(stage => stage.id !== stageId));

      toast({
        title: "Estágio removido",
        description: "O estágio foi removido com sucesso.",
      });
    } catch (error) {
      console.error("Failed to remove stage:", error);
      toast({
        title: "Erro ao remover estágio",
        description: "Não foi possível remover o estágio.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchStages();
  }, [fetchStages]);

  return {
    stages,
    loading,
    fetchStages,
    addStage,
    updateStage,
    removeStage,
  };
}
