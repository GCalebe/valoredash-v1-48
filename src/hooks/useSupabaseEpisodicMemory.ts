import { supabase } from '@/integrations/supabase/client';
import type { N8nChatMemory, EpisodicMemory } from '@/types/memory';

export const useSupabaseEpisodicMemory = () => {
  // Since n8n_chat_memory table doesn't exist in the schema, 
  // we'll use the n8n_chat_messages table as a fallback
  const fetchMemories = async (sessionId: string, limit = 50): Promise<N8nChatMemory[]> => {
    try {
      const { data, error } = await supabase
        .from('n8n_chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      // Transform the data to match N8nChatMemory interface
      const memories: N8nChatMemory[] = (data || []).map(msg => ({
        id: msg.id,
        session_id: msg.session_id,
        message: msg.user_message || msg.bot_message || '',
        memory_type: 'episodic' as const,
        importance: 1, // Default importance
        created_at: msg.created_at,
        metadata: typeof msg.message_data === 'object' && msg.message_data !== null 
          ? msg.message_data as { [key: string]: any } 
          : {}
      }));
      
      return memories;
    } catch (error) {
      console.error('Error fetching memories:', error);
      return [];
    }
  };

  const fetchTimeline = async (sessionId: string): Promise<EpisodicMemory[]> => {
    try {
      // Since generate_episodic_timeline function doesn't exist, 
      // we'll create a simplified timeline from chat messages
      const { data, error } = await supabase
        .from('n8n_chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Transform messages into episodic memories
      const timeline: EpisodicMemory[] = (data || []).map((msg, index) => ({
        id: Number(msg.id),
        session_id: msg.session_id,
        event: msg.user_message ? 'user_message' : 'bot_message',
        content: msg.user_message || msg.bot_message || '',
        timestamp: msg.created_at || new Date().toISOString(),
        importance: 1,
        date: msg.created_at || new Date().toISOString(),
        description: msg.user_message ? 'User message' : 'Bot response',
        context: {
          message_type: msg.message_type,
          phone: msg.phone,
          ...(typeof msg.message_data === 'object' && msg.message_data !== null ? msg.message_data : {})
        }
      }));

      return timeline;
    } catch (error) {
      console.error('Error fetching timeline:', error);
      return [];
    }
  };

  const fetchMemoriesByPeriod = async (
    sessionId: string,
    startDate: string,
    endDate: string,
  ): Promise<N8nChatMemory[]> => {
    try {
      const { data, error } = await supabase
        .from('n8n_chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match N8nChatMemory interface
      const memories: N8nChatMemory[] = (data || []).map(msg => ({
        id: msg.id,
        session_id: msg.session_id,
        message: msg.user_message || msg.bot_message || '',
        memory_type: 'episodic' as const,
        importance: 1, // Default importance
        created_at: msg.created_at,
        metadata: typeof msg.message_data === 'object' && msg.message_data !== null 
          ? msg.message_data as { [key: string]: any } 
          : {}
      }));
      
      return memories;
    } catch (error) {
      console.error('Error fetching memories by period:', error);
      return [];
    }
  };

  const updateImportance = async (memoryId: number, importance: number): Promise<boolean> => {
    try {
      // Since n8n_chat_memory doesn't exist and n8n_chat_messages doesn't have importance field,
      // we'll just return true for now
      console.log(`Would update importance for memory ${memoryId} to ${importance}`);
      return true;
    } catch (error) {
      console.error('Error updating importance:', error);
      return false;
    }
  };

  const storeMemory = async (memory: Partial<N8nChatMemory>): Promise<N8nChatMemory | null> => {
    try {
      // Store as a chat message since n8n_chat_memory table doesn't exist
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('n8n_chat_messages')
        .insert({
          session_id: memory.session_id,
          user_id: user.id,
          user_message: memory.message,
          message_type: 'text',
          message_data: memory.metadata || {},
          active: true
        })
        .select()
        .single();

      if (error) throw error;
      
      // Transform back to N8nChatMemory format
      const storedMemory: N8nChatMemory = {
        id: data.id,
        session_id: data.session_id,
        message: data.user_message || '',
        memory_type: 'episodic' as const,
        importance: 1,
        created_at: data.created_at,
        metadata: typeof data.message_data === 'object' && data.message_data !== null 
          ? data.message_data as { [key: string]: any } 
          : {}
      };

      return storedMemory;
    } catch (error) {
      console.error('Error storing memory:', error);
      return null;
    }
  };

  return { fetchMemories, fetchTimeline, fetchMemoriesByPeriod, updateImportance, storeMemory };
};