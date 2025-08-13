// @ts-nocheck
import { supabase } from "@/integrations/supabase/client";
import { AdvancedFiltersService } from "@/services/advancedFiltersService";

interface FetchParams {
  userId: string;
  filters: any; // UnifiedConversationFilters
  limit?: number;
  offset?: number;
}

export class ConversationFiltersService {
  static async fetchConversationsWithFilters({ userId, filters, limit = 500, offset = 0 }: FetchParams) {
    try {
      let baseQuery = supabase
        .from('conversations')
        .select(`
          *,
          contact:contacts(
            id,
            name,
            email,
            phone,
            client_name,
            client_type,
            client_size,
            status,
            tags,
            budget,
            sales,
            responsible_hosts,
            kanban_stage_id,
            consultation_stage,
            last_contact
          )
        `)
        .eq('user_id', userId)
        .order('last_message_time', { ascending: false })
        .range(offset, offset + limit - 1);

      // Derivar IDs de contatos quando filtros de cliente forem usados
      const mustFilterContacts = Boolean(
        (Array.isArray(filters?.selectedTags) && filters.selectedTags.length > 0) ||
        (filters?.segmentFilter && filters.segmentFilter !== 'all') ||
        (filters?.advancedFilter && filters?.hasAdvancedRules) ||
        (Array.isArray(filters?.customFieldFilters) && filters.customFieldFilters.length > 0)
      );

      if (mustFilterContacts) {
        let contactIds: string[] = [];

        // 1) Advanced rules via serviço já utilizado em clientes
        if (filters?.advancedFilter && filters?.hasAdvancedRules) {
          const { data: clients, error: advErr } = await AdvancedFiltersService.applyAdvancedFilters({
            userId,
            filterGroup: filters.advancedFilter,
            limit: 10000,
            offset: 0,
          } as any);
          if (advErr) {
            console.warn('AdvancedFiltersService error:', advErr);
          }
          contactIds = (clients || []).map((c: any) => c.id);
        } else {
          // 2) Filtros simples (tags, kanban, etc.)
          let contactsQuery = supabase
            .from('contacts')
            .select('id')
            .eq('user_id', userId);

          if (Array.isArray(filters?.selectedTags) && filters.selectedTags.length > 0) {
            // qualquer tag bate: overlaps
            contactsQuery = (contactsQuery as any).overlaps('tags', filters.selectedTags);
          }
          if (filters?.segmentFilter && filters.segmentFilter !== 'all') {
            contactsQuery = contactsQuery.eq('kanban_stage_id', filters.segmentFilter);
          }
          // Campos personalizados: fora do escopo simples; preferir advanced

          const { data: contactRows } = await contactsQuery.limit(10000);
          contactIds = (contactRows || []).map((r: any) => r.id);
        }

        if (contactIds.length > 0) {
          baseQuery = baseQuery.in('contact_id', contactIds);
        } else {
          // força vazio
          baseQuery = baseQuery.in('contact_id', ['___no_match___']);
        }
      }

      const { data, error } = await baseQuery;
      if (error) return { data: [], error: error.message };
      return { data, error: undefined };
    } catch (e: any) {
      return { data: [], error: e?.message || 'unknown_error' };
    }
  }
}


