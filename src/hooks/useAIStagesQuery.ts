import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface AIStage {
  id: string;
  name: string;
  description: string | null;
  stage_order: number;
  actions: any | null;
  trigger_conditions: any | null;
  next_stage_id: string | null;
  personality_id: string | null;
  timeout_minutes: number | null;
  is_final_stage: boolean | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

interface AIStageInsert {
  name: string;
  description?: string;
  stage_order: number;
  actions?: any;
  trigger_conditions?: any;
  next_stage_id?: string;
  personality_id?: string;
  timeout_minutes?: number;
  is_final_stage?: boolean;
  is_active?: boolean;
}

interface AIStageUpdate {
  name?: string;
  description?: string;
  stage_order?: number;
  actions?: any;
  trigger_conditions?: any;
  next_stage_id?: string;
  personality_id?: string;
  timeout_minutes?: number;
  is_final_stage?: boolean;
  is_active?: boolean;
}

// Query keys
export const aiStagesKeys = {
  all: ['aiStages'] as const,
  lists: () => [...aiStagesKeys.all, 'list'] as const,
  details: () => [...aiStagesKeys.all, 'detail'] as const,
  detail: (id: string) => [...aiStagesKeys.details(), id] as const,
  active: () => [...aiStagesKeys.all, 'active'] as const,
};

// Fetch AI stages
const fetchAIStages = async (): Promise<AIStage[]> => {
  const { data, error } = await supabase
    .from('ai_stages')
    .select('*')
    .order('stage_order', { ascending: true });

  if (error) throw error;
  return data || [];
};

// Fetch active AI stages
const fetchActiveAIStages = async (): Promise<AIStage[]> => {
  const { data, error } = await supabase
    .from('ai_stages')
    .select('*')
    .eq('is_active', true)
    .order('stage_order', { ascending: true });

  if (error) throw error;
  return data || [];
};

// Create AI stage
const createAIStage = async (stage: AIStageInsert): Promise<AIStage> => {
  const { data, error } = await supabase
    .from('ai_stages')
    .insert(stage)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update AI stage
const updateAIStage = async ({ id, ...updates }: { id: string } & AIStageUpdate): Promise<AIStage> => {
  const { data, error } = await supabase
    .from('ai_stages')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete AI stage
const deleteAIStage = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('ai_stages')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Reorder AI stages
const reorderAIStages = async (stageUpdates: { id: string; stage_order: number }[]): Promise<void> => {
  for (const update of stageUpdates) {
    const { error } = await supabase
      .from('ai_stages')
      .update({ stage_order: update.stage_order })
      .eq('id', update.id);
    
    if (error) throw error;
  }
};

// Hooks
export const useAIStagesQuery = () => {
  return useQuery({
    queryKey: aiStagesKeys.lists(),
    queryFn: fetchAIStages,
  });
};

export const useActiveAIStagesQuery = () => {
  return useQuery({
    queryKey: aiStagesKeys.active(),
    queryFn: fetchActiveAIStages,
  });
};

export const useCreateAIStageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAIStage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiStagesKeys.all });
      toast({
        title: "Etapa criada",
        description: "Nova etapa de IA criada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar etapa",
        description: "Não foi possível criar a etapa de IA.",
        variant: "destructive",
      });
      console.error('Error creating AI stage:', error);
    },
  });
};

export const useUpdateAIStageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAIStage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiStagesKeys.all });
      toast({
        title: "Etapa atualizada",
        description: "Etapa de IA atualizada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar etapa",
        description: "Não foi possível atualizar a etapa de IA.",
        variant: "destructive",
      });
      console.error('Error updating AI stage:', error);
    },
  });
};

export const useDeleteAIStageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAIStage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiStagesKeys.all });
      toast({
        title: "Etapa excluída",
        description: "Etapa de IA excluída com sucesso!",
        variant: "destructive",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir etapa",
        description: "Não foi possível excluir a etapa de IA.",
        variant: "destructive",
      });
      console.error('Error deleting AI stage:', error);
    },
  });
};

export const useReorderAIStagesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reorderAIStages,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiStagesKeys.all });
      toast({
        title: "Etapas reordenadas",
        description: "Ordem das etapas atualizada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao reordenar etapas",
        description: "Não foi possível reordenar as etapas.",
        variant: "destructive",
      });
      console.error('Error reordering AI stages:', error);
    },
  });
};