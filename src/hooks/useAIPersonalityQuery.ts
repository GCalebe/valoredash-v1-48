import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AIPersonalitySettings {
  id: string;
  name: string;
  description: string | null;
  personality_type: string;
  tone: string | null;
  language: string | null;
  temperature: number | null;
  max_tokens: number | null;
  system_prompt: string | null;
  greeting_message: string | null;
  response_style: string | null;
  custom_instructions: string | null;
  fallback_responses: any;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

interface AIPersonalityInsert {
  name: string;
  description?: string;
  personality_type: string;
  tone?: string;
  language?: string;
  temperature?: number;
  max_tokens?: number;
  system_prompt?: string;
  greeting_message?: string;
  response_style?: string;
  custom_instructions?: string;
  fallback_responses?: any;
  is_active?: boolean;
}

interface AIPersonalityUpdate {
  name?: string;
  description?: string;
  personality_type?: string;
  tone?: string;
  language?: string;
  temperature?: number;
  max_tokens?: number;
  system_prompt?: string;
  greeting_message?: string;
  response_style?: string;
  custom_instructions?: string;
  fallback_responses?: any;
  is_active?: boolean;
}

// Query keys
export const aiPersonalityKeys = {
  all: ['aiPersonality'] as const,
  lists: () => [...aiPersonalityKeys.all, 'list'] as const,
  details: () => [...aiPersonalityKeys.all, 'detail'] as const,
  detail: (id: string) => [...aiPersonalityKeys.details(), id] as const,
  active: () => [...aiPersonalityKeys.all, 'active'] as const,
};

// Fetch AI personality settings
const fetchAIPersonalitySettings = async (): Promise<AIPersonalitySettings[]> => {
  const { data, error } = await supabase
    .from('ai_personality_settings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Fetch active AI personality settings
const fetchActiveAIPersonalitySettings = async (): Promise<AIPersonalitySettings | null> => {
  const { data, error } = await supabase
    .from('ai_personality_settings')
    .select('*')
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
  return data;
};

// Create AI personality settings
const createAIPersonalitySettings = async (settings: AIPersonalityInsert): Promise<AIPersonalitySettings> => {
  // Get the current user from the auth session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // First, deactivate all existing settings if this one is active
  if (settings.is_active) {
    await supabase
      .from('ai_personality_settings')
      .update({ is_active: false })
      .eq('user_id', user.id);
  }

  const { data, error } = await supabase
    .from('ai_personality_settings')
    .insert({ ...settings, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update AI personality settings
const updateAIPersonalitySettings = async ({ id, ...updates }: { id: string } & AIPersonalityUpdate): Promise<AIPersonalitySettings> => {
  // If setting this as active, deactivate all others first
  if (updates.is_active) {
    await supabase
      .from('ai_personality_settings')
      .update({ is_active: false })
      .neq('id', id);
  }

  const { data, error } = await supabase
    .from('ai_personality_settings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete AI personality settings
const deleteAIPersonalitySettings = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('ai_personality_settings')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Hooks
export const useAIPersonalitySettingsQuery = () => {
  return useQuery({
    queryKey: aiPersonalityKeys.lists(),
    queryFn: fetchAIPersonalitySettings,
  });
};

export const useActiveAIPersonalitySettingsQuery = () => {
  return useQuery({
    queryKey: aiPersonalityKeys.active(),
    queryFn: fetchActiveAIPersonalitySettings,
  });
};

export const useCreateAIPersonalitySettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAIPersonalitySettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiPersonalityKeys.all });
      toast({
        title: "Configuração criada",
        description: "Nova configuração de personalidade criada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar configuração",
        description: "Não foi possível criar a configuração de personalidade.",
        variant: "destructive",
      });
      console.error('Error creating AI personality settings:', error);
    },
  });
};

export const useUpdateAIPersonalitySettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAIPersonalitySettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiPersonalityKeys.all });
      toast({
        title: "Configuração atualizada",
        description: "Configuração de personalidade atualizada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar configuração",
        description: "Não foi possível atualizar a configuração de personalidade.",
        variant: "destructive",
      });
      console.error('Error updating AI personality settings:', error);
    },
  });
};

export const useDeleteAIPersonalitySettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAIPersonalitySettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiPersonalityKeys.all });
      toast({
        title: "Configuração excluída",
        description: "Configuração de personalidade excluída com sucesso!",
        variant: "destructive",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir configuração",
        description: "Não foi possível excluir a configuração de personalidade.",
        variant: "destructive",
      });
      console.error('Error deleting AI personality settings:', error);
    },
  });
};

// Alias exports for backward compatibility
export const useAIPersonalityQuery = useAIPersonalitySettingsQuery;
export const useCreateAIPersonalityMutation = useCreateAIPersonalitySettingsMutation;
export const useUpdateAIPersonalityMutation = useUpdateAIPersonalitySettingsMutation;
export const useDeleteAIPersonalityMutation = useDeleteAIPersonalitySettingsMutation;