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

        // 1) Regras avançadas (segunda coluna) – processar diretamente o objeto de regras
        if (filters?.advancedFilter && filters?.hasAdvancedRules && Array.isArray(filters.advancedFilter.rules)) {
          // Base: todos os contatos do usuário (para interseção progressiva)
          let baseContactsQuery = supabase.from('contacts').select('id').eq('user_id', userId);

          // Primeiro, aplicar filtros "normais" diretamente na tabela contacts
          // Regras com field não-custom (não começa com custom:)
          const normalRules = (filters.advancedFilter.rules as any[]).filter(r => typeof r.field === 'string' && !String(r.field).startsWith('custom:'));
          for (const rule of normalRules) {
            const field = String(rule.field);
            const rawVal = rule.value;
            const values: string[] = Array.isArray(rawVal) ? rawVal : (rawVal != null && String(rawVal).trim() !== '' ? [String(rawVal)] : []);
            if (values.length === 0) continue;
            if (field === 'tags' || field === 'responsible_hosts') {
              baseContactsQuery = (baseContactsQuery as any).overlaps(field, values);
            } else if (rule.operator === 'in' && values.length > 1) {
              baseContactsQuery = (baseContactsQuery as any).in(field, values);
            } else {
              baseContactsQuery = baseContactsQuery.eq(field, values[0]);
            }
          }

          // Executar base para obter ids iniciais
          const { data: baseRows, error: baseErr } = await baseContactsQuery.limit(10000);
          if (baseErr) {
            console.warn('contacts base filter error', baseErr.message);
          }
          let currentIds = (baseRows || []).map((r: any) => r.id);

          // Agora, aplicar regras de campos personalizados via client_custom_values (interseção)
          const customRules = (filters.advancedFilter.rules as any[]).filter(r => typeof r.field === 'string' && String(r.field).startsWith('custom:'));
          for (const rule of customRules) {
            const fieldId = String(rule.field).replace('custom:', '');
            const rawVal = rule.value;
            const values: string[] = Array.isArray(rawVal) ? rawVal : (rawVal != null && String(rawVal).trim() !== '' ? [String(rawVal)] : []);
            if (values.length === 0) continue;

            // Criar subconsulta; igualdade em jsonb requer valor JSON
            let sub = supabase.from('client_custom_values').select('client_id').eq('field_id', fieldId);
            // Suporte apenas a equals e in-equivalente
            if (values.length === 1) {
              sub = (sub as any).eq('field_value', JSON.stringify(values[0]));
            } else {
              // IN para jsonb precisa de OR; fazemos N consultas sequenciais e unimos resultados
              let unionIds: Set<string> = new Set();
              for (const v of values) {
                const { data: rows } = await supabase
                  .from('client_custom_values')
                  .select('client_id')
                  .eq('field_id', fieldId)
                  .eq('field_value', JSON.stringify(v))
                  .limit(10000);
                (rows || []).forEach((r: any) => unionIds.add(r.client_id));
              }
              const idList = Array.from(unionIds);
              currentIds = currentIds.length > 0 ? currentIds.filter(id => unionIds.has(id)) : idList;
              continue;
            }
            const { data: subRows } = await sub.limit(10000);
            const idList = (subRows || []).map((r: any) => r.client_id);
            currentIds = currentIds.length > 0 ? currentIds.filter(id => idList.includes(id)) : idList;
          }

          contactIds = currentIds;
        } else {
          // 2) Filtros simples (tags, kanban, etc.)
          let contactsQuery = supabase
            .from('contacts')
            .select('id')
            .eq('user_id', userId);

          if (Array.isArray(filters?.selectedTags) && filters.selectedTags.length > 0) {
            contactsQuery = (contactsQuery as any).overlaps('tags', filters.selectedTags);
          }
          if (filters?.segmentFilter && filters.segmentFilter !== 'all') {
            contactsQuery = contactsQuery.eq('kanban_stage_id', filters.segmentFilter);
          }

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


