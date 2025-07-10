import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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
  { title: "Entraram", color: "#6b7280" },
  { title: "Conversaram", color: "#3b82f6" },
  { title: "Agendaram", color: "#eab308" },
  { title: "Compareceram", color: "#22c55e" },
  { title: "Negociaram", color: "#a855f7" },
  { title: "Postergaram", color: "#f97316" },
  { title: "Converteram", color: "#10b981" },
];

export function useKanbanStagesSupabase() {
  const { user } = useAuth();
  const [stages, setStages] = useState<KanbanStage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStages = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    console.log("Fetching kanban stages from Supabase for user:", user.id);
    
    try {
      const { data, error } = await supabase
        .from('kanban_stages')
        .select('*')
        .eq('user_id', user.id)
        .order('ordering', { ascending: true });

      if (error) {
        console.error("Error fetching stages:", error);
        toast({
          title: "Erro ao carregar estágios",
          description: "Não foi possível carregar os estágios do Kanban.",
          variant: "destructive",
        });
        return;
      }

      if (data && data.length > 0) {
        const mappedStages = data.map(stage => ({
          id: stage.id,
          title: stage.title,
          ordering: stage.ordering,
          settings: stage.settings as { color?: string } || {},
        }));
        console.log("Loaded stages from Supabase:", mappedStages.length);
        setStages(mappedStages);
      } else {
        // Create default stages if none exist
        console.log("No stages found, creating default stages");
        await createDefaultStages();
      }
    } catch (error) {
      console.error("Error in fetchStages:", error);
      toast({
        title: "Erro ao carregar estágios",
        description: "Erro inesperado ao carregar os estágios.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const createDefaultStages = async () => {
    if (!user?.id) return;

    try {
      const stagesToInsert = DEFAULT_STAGES.map((stage, index) => ({
        user_id: user.id,
        title: stage.title,
        ordering: index,
        settings: { color: stage.color },
      }));

      const { data, error } = await supabase
        .from('kanban_stages')
        .insert(stagesToInsert)
        .select();

      if (error) {
        console.error("Error creating default stages:", error);
        return;
      }

      if (data) {
        const mappedStages = data.map(stage => ({
          id: stage.id,
          title: stage.title,
          ordering: stage.ordering,
          settings: stage.settings as { color?: string } || {},
        }));
        setStages(mappedStages);
        console.log("Created default stages:", mappedStages.length);
      }
    } catch (error) {
      console.error("Error creating default stages:", error);
    }
  };

  const updateStage = async (stageId: string, title: string, color: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('kanban_stages')
        .update({
          title,
          settings: { color },
          updated_at: new Date().toISOString(),
        })
        .eq('id', stageId)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error updating stage:", error);
        toast({
          title: "Erro ao atualizar estágio",
          description: "Não foi possível atualizar o estágio.",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setStages(prev => prev.map(stage => 
        stage.id === stageId 
          ? { ...stage, title, settings: { color } }
          : stage
      ));

      toast({
        title: "Estágio atualizado",
        description: "O estágio foi atualizado com sucesso.",
      });

      console.log("Stage updated successfully:", { stageId, title, color });
    } catch (error) {
      console.error("Error updating stage:", error);
      toast({
        title: "Erro ao atualizar estágio",
        description: "Erro inesperado ao atualizar o estágio.",
        variant: "destructive",
      });
    }
  };

  const addStage = async (title: string) => {
    if (!user?.id) return;
    
    // Prevent duplicates by title
    if (stages.some((s) => s.title.toLowerCase() === title.toLowerCase())) {
      toast({
        title: "Estágio já existe",
        description: "Já existe um estágio com esse nome.",
        variant: "destructive",
      });
      return;
    }
      
    console.log("Adding new stage:", title);
    
    try {
      const { data, error } = await supabase
        .from('kanban_stages')
        .insert({
          user_id: user.id,
          title,
          ordering: stages.length,
          settings: { color: "#6b7280" }, // Default gray color
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding stage:", error);
        toast({
          title: "Erro ao adicionar estágio",
          description: "Não foi possível adicionar o estágio.",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        const newStage = {
          id: data.id,
          title: data.title,
          ordering: data.ordering,
          settings: data.settings as { color?: string } || {},
        };
        setStages(prev => [...prev, newStage]);
        console.log("Stage added successfully:", newStage);
      }
    } catch (error) {
      console.error("Error adding stage:", error);
      toast({
        title: "Erro ao adicionar estágio",
        description: "Erro inesperado ao adicionar o estágio.",
        variant: "destructive",
      });
    }
  };

  const removeStage = async (id: string) => {
    if (!user?.id) return;
    
    console.log("Removing stage:", id);
    
    try {
      const { error } = await supabase
        .from('kanban_stages')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error removing stage:", error);
        toast({
          title: "Erro ao remover estágio",
          description: "Não foi possível remover o estágio.",
          variant: "destructive",
        });
        return;
      }

      setStages(prev => prev.filter(s => s.id !== id));
      console.log("Stage removed successfully:", id);
    } catch (error) {
      console.error("Error removing stage:", error);
      toast({
        title: "Erro ao remover estágio",
        description: "Erro inesperado ao remover o estágio.",
        variant: "destructive",
      });
    }
  };

  const reorderStages = async (newStages: KanbanStage[]) => {
    if (!user?.id) return;
    
    console.log("Reordering stages");
    
    try {
      // Update ordering for all stages
      const updates = newStages.map((stage, index) => ({
        id: stage.id,
        ordering: index,
      }));

      for (const update of updates) {
        await supabase
          .from('kanban_stages')
          .update({ ordering: update.ordering })
          .eq('id', update.id)
          .eq('user_id', user.id);
      }

      setStages(newStages);
      console.log("Stages reordered successfully");
    } catch (error) {
      console.error("Error reordering stages:", error);
      toast({
        title: "Erro ao reordenar estágios",
        description: "Não foi possível reordenar os estágios.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    console.log("useKanbanStagesSupabase: Initial fetch");
    fetchStages();
  }, [fetchStages]);

  return {
    stages,
    loading,
    fetchStages,
    addStage,
    removeStage,
    reorderStages,
    updateStage,
  };
}