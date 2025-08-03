import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StageHistoryEntry {
  id: string;
  old_stage: string | null;
  new_stage: string;
  changed_at: string;
  changed_by: string | null;
  metadata: any;
}

interface StageHistoryWithContact {
  contact_id: string;
  contact_name: string;
  old_stage: string | null;
  new_stage: string;
  changed_at: string;
  metadata: any;
}

export const useContactStageHistory = (contactId: string | null) => {
  return useQuery({
    queryKey: ['contact-stage-history', contactId],
    queryFn: async (): Promise<StageHistoryEntry[]> => {
      if (!contactId) return [];
      
      const { data, error } = await supabase.rpc('get_contact_stage_history', {
        contact_uuid: contactId
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!contactId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useStageHistoryByPeriod = (
  startDate?: string,
  endDate?: string,
  enabled = true
) => {
  return useQuery({
    queryKey: ['stage-history-period', startDate, endDate],
    queryFn: async (): Promise<StageHistoryWithContact[]> => {
      const { data, error } = await supabase.rpc('get_stage_history_by_period', {
        start_date: startDate || null,
        end_date: endDate || null
      });

      if (error) throw error;
      return data || [];
    },
    enabled: enabled && (!!startDate || !!endDate),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};