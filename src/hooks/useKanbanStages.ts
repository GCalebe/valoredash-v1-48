import { useCallback, useEffect, useState } from "react";
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

  // Store stages in localStorage to persist between page refreshes
  const saveStageToLocalStorage = (stages: KanbanStage[]) => {
    try {
      const userId = user?.id || 'anonymous';
      localStorage.setItem(`kanban_stages_${userId}`, JSON.stringify(stages));
    } catch (error) {
      console.error("Error saving stages to localStorage:", error);
    }
  };

  // Load stages from localStorage
  const loadStagesFromLocalStorage = (): KanbanStage[] | null => {
    try {
      const userId = user?.id || 'anonymous';
      const storedStages = localStorage.getItem(`kanban_stages_${userId}`);
      if (storedStages) {
        return JSON.parse(storedStages);
      }
    } catch (error) {
      console.error("Error loading stages from localStorage:", error);
    }
    return null;
  };

  // Load user stages or fallback to DEFAULT_STAGES
  const fetchStages = useCallback(async () => {
    setLoading(true);
    console.log("Fetching kanban stages, user:", user?.id);
    
    // First try to load from localStorage
    const storedStages = loadStagesFromLocalStorage();
    if (storedStages && storedStages.length > 0) {
      console.log("Loaded stages from localStorage:", storedStages.length);
      setStages(storedStages);
      setLoading(false);
      return;
    }
    
    // If no stored stages, use default stages
    console.log("No stored stages, using default stages");
    const defaultStages = DEFAULT_STAGES.map((stage, idx) => ({
      id: String(idx),
      title: stage,
      ordering: idx,
    }));
    
    setStages(defaultStages);
    saveStageToLocalStorage(defaultStages);
    setLoading(false);
  }, [user]);

  const addStage = async (title: string) => {
    // Prevent duplicates by title
    if (stages.some((s) => s.title.toLowerCase() === title.toLowerCase()))
      return;
      
    console.log("Adding new stage:", title);
    const newStage = {
      id: `stage-${Date.now()}`,
      title,
      ordering: stages.length,
    };
    
    const updatedStages = [...stages, newStage];
    setStages(updatedStages);
    saveStageToLocalStorage(updatedStages);
  };

  const removeStage = async (id: string) => {
    console.log("Removing stage:", id);
    const updatedStages = stages.filter((s) => s.id !== id);
    setStages(updatedStages);
    saveStageToLocalStorage(updatedStages);
  };

  const reorderStages = async (newStages: KanbanStage[]) => {
    console.log("Reordering stages");
    setStages(newStages);
    saveStageToLocalStorage(newStages);
  };

  useEffect(() => {
    console.log("useKanbanStages: Initial fetch");
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