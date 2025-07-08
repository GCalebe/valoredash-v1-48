import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface KanbanStage {
  id: string;
  title: string;
  ordering: number;
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

export function useKanbanStages() {
  const { user } = useAuth();
  const [stages, setStages] = useState<KanbanStage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load user stages or fallback to DEFAULT_STAGES
  const fetchStages = useCallback(async () => {
    setLoading(true);
    if (!user) {
      setStages(
        DEFAULT_STAGES.map((stage, idx) => ({
          id: String(idx),
          title: stage,
          ordering: idx,
        })),
      );
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("kanban_stages")
      .select("*")
      .eq("user_id", user.id)
      .order("ordering", { ascending: true });

    if (error) {
      // fallback to default and log error
      console.error("Erro ao buscar etapas do Kanban:", error);
      setStages(
        DEFAULT_STAGES.map((stage, idx) => ({
          id: String(idx),
          title: stage,
          ordering: idx,
        })),
      );
    } else if (data && data.length > 0) {
      setStages(
        data.map((row: any) => ({
          id: row.id,
          title: row.title,
          ordering: row.ordering,
        })),
      );
    } else {
      // If user has no custom stages yet, use default and hydrate to supabase
      setStages(
        DEFAULT_STAGES.map((stage, idx) => ({
          id: String(idx),
          title: stage,
          ordering: idx,
        })),
      );
      // First time: insert
      await supabase.from("kanban_stages").insert(
        DEFAULT_STAGES.map((stage, idx) => ({
          user_id: user.id,
          title: stage,
          ordering: idx,
        })),
      );
      // Then reload
      fetchStages();
      return;
    }
    setLoading(false);
  }, [user]);

  const addStage = async (title: string) => {
    if (!user) return;
    // Prevent duplicates by title
    if (stages.some((s) => s.title.toLowerCase() === title.toLowerCase()))
      return;
    const { data, error } = await supabase
      .from("kanban_stages")
      .insert({
        user_id: user.id,
        title,
        ordering: stages.length,
      })
      .select()
      .single();
    if (!error && data) {
      setStages((prev) => [
        ...prev,
        {
          id: data.id,
          title: data.title,
          ordering: data.ordering,
        },
      ]);
    }
  };

  const removeStage = async (id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("kanban_stages")
      .delete()
      .eq("user_id", user.id)
      .eq("id", id);

    if (!error) {
      setStages((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const reorderStages = async (newStages: KanbanStage[]) => {
    if (!user) return;
    setStages(newStages);
    // Update orderings in Supabase
    const updates = newStages.map((s, idx) => ({
      id: s.id,
      ordering: idx,
    }));
    // Use upsert to update each one by its PK
    for (const upd of updates) {
      await supabase
        .from("kanban_stages")
        .update({ ordering: upd.ordering })
        .eq("id", upd.id);
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
    removeStage,
    reorderStages,
  };
}
