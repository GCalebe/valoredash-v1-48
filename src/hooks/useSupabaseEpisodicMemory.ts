import { supabase } from '@/integrations/supabase/client';
import type { N8nChatMemory, EpisodicMemory } from '@/types/memory';

export const useSupabaseEpisodicMemory = () => {
  const fetchMemories = async (sessionId: string, limit = 50): Promise<N8nChatMemory[]> => {
    const { data, error } = await supabase
      .from('n8n_chat_memory')
      .select('*')
      .eq('session_id', sessionId)
      .eq('memory_type', 'episodic')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as N8nChatMemory[];
  };

  const fetchTimeline = async (sessionId: string): Promise<EpisodicMemory[]> => {
    const { data, error } = await supabase.rpc('generate_episodic_timeline', {
      p_session_id: sessionId,
    });

    if (error) throw error;
    return (data || []) as EpisodicMemory[];
  };

  const fetchMemoriesByPeriod = async (
    sessionId: string,
    startDate: string,
    endDate: string,
  ): Promise<N8nChatMemory[]> => {
    const { data, error } = await supabase
      .from('n8n_chat_memory')
      .select('*')
      .eq('session_id', sessionId)
      .eq('memory_type', 'episodic')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as N8nChatMemory[];
  };

  const updateImportance = async (memoryId: number, importance: number): Promise<boolean> => {
    const { error } = await supabase
      .from('n8n_chat_memory')
      .update({ importance })
      .eq('id', memoryId);

    if (error) throw error;
    return true;
  };

  const storeMemory = async (memory: Partial<N8nChatMemory>): Promise<N8nChatMemory | null> => {
    const { data, error } = await supabase
      .from('n8n_chat_memory')
      .insert(memory)
      .select()
      .single();

    if (error) throw error;
    return data as N8nChatMemory;
  };

  return { fetchMemories, fetchTimeline, fetchMemoriesByPeriod, updateImportance, storeMemory };
};


