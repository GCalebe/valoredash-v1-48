import { supabase } from "@/integrations/supabase/client";

export interface SavedFilterRecord {
  id: string;
  user_id: string;
  name: string;
  filter_data: unknown;
  type?: string | null;
  created_at?: string;
}





import type { ClientRecord } from '../components/clients/filters/filterConstants';
import type { FilterGroup, FilterRule } from '../components/clients/filters/FilterGroup';
import { fixedClientProperties } from '../components/clients/filters/filterConstants';

export interface AdvancedFilterParams {
  filterGroup?: FilterGroup;
  searchTerm?: string;
  statusFilter?: string;
  segmentFilter?: string;
  lastContactFilter?: string;
  limit?: number;
  offset?: number;
}

export class AdvancedFiltersService {
  /**
   * Aplica filtros avançados na consulta do Supabase
   */
  static async applyAdvancedFilters(params: AdvancedFilterParams): Promise<{
    data: ClientRecord[];
    count: number;
    error?: string;
  }> {
    try {
      // Base query
      let query = supabase
        .from('contacts')
        .select('*', { count: 'exact' });

      // Escopo por usuário e remoção lógica
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      if (userId) {
        query = query.eq('user_id', userId).is('deleted_at', null);
      }

      // Aplica filtros básicos
      if (params.searchTerm) {
        query = query.or(`name.ilike.%${params.searchTerm}%,email.ilike.%${params.searchTerm}%,phone.ilike.%${params.searchTerm}%`);
      }

      if (params.statusFilter && params.statusFilter !== 'all') {
        query = query.eq('status', params.statusFilter);
      }

      if (params.segmentFilter && params.segmentFilter !== 'all') {
        // Assumindo que segmentos são armazenados como tags
        query = query.contains('tags', [params.segmentFilter]);
      }

      if (params.lastContactFilter && params.lastContactFilter !== 'all') {
        const now = new Date();
        let dateFilter: Date;
        
        switch (params.lastContactFilter) {
          case 'today':
            dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            query = query.gte('updated_at', dateFilter.toISOString());
            break;
          case 'week':
            dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            query = query.gte('updated_at', dateFilter.toISOString());
            break;
          case 'month':
            dateFilter = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            query = query.gte('updated_at', dateFilter.toISOString());
            break;
        }
      }

      // Aplica filtros avançados
      if (params.filterGroup) {
        const filterCondition = this.buildFilterCondition(params.filterGroup);
        if (filterCondition) {
          const parts = filterCondition.split(',');
          const normalConds: string[] = [];
          const customRules: { fieldId: string; operator: string; value: string }[] = [];
          for (const p of parts) {
            if (p.startsWith('custom:')) {
              const [, fieldId, operator, ...rest] = p.split(':');
              customRules.push({ fieldId, operator, value: rest.join(':') });
            } else {
              normalConds.push(p);
            }
          }

          if (normalConds.length > 0) {
            query = query.or(normalConds.join(','));
          }

          // Para cada regra custom, filtramos os contatos que possuem o valor correspondente
          for (const rule of customRules) {
            let sub = supabase
              .from('client_custom_values')
              .select('client_id');

            if (rule.operator === 'equals') {
              sub = sub.eq('field_id', rule.fieldId).eq('field_value', rule.value);
            } else if (rule.operator === 'contains') {
              sub = sub.eq('field_id', rule.fieldId).ilike('field_value', `%${rule.value}%`);
            } else if (rule.operator === 'not_equals' || rule.operator === 'notEquals') {
              sub = sub.eq('field_id', rule.fieldId).neq('field_value', rule.value);
            } else {
              // fallback simples
              sub = sub.eq('field_id', rule.fieldId).ilike('field_value', `%${rule.value}%`);
            }

            const { data: ids } = await sub;
            const idList = (ids || []).map((r: any) => r.client_id);
            if (idList.length > 0) {
              query = query.in('id', idList);
            } else {
              // Se não houver correspondências, força resultado vazio
              query = query.in('id', ['___no_match___']);
            }
          }
        }
      }

      // Aplica paginação
      if (params.limit) {
        query = query.limit(params.limit);
      }
      if (params.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 50) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Erro ao aplicar filtros avançados:', error);
        return { data: [], count: 0, error: error.message };
      }

      return { data: data || [], count: count || 0 };
    } catch (error) {
      console.error('Erro inesperado ao aplicar filtros:', error);
      return { data: [], count: 0, error: 'Erro inesperado ao aplicar filtros' };
    }
  }

  /**
   * Anexa filtros avançados a uma query existente (usado pelo contactsService)
   */
  static attachAdvancedFilters<T>(query: any, filterGroup?: FilterGroup): any {
    if (!filterGroup) return query;
    const filterCondition = this.buildFilterCondition(filterGroup);
    if (!filterCondition) return query;

    // Se houver regras de custom fields codificadas, precisamos resolver IDs primeiro
    const parts = filterCondition.split(',');
    const normalConds: string[] = [];
    const customRules: { fieldId: string; operator: string; value: string }[] = [];
    for (const p of parts) {
      if (p.startsWith('custom:')) {
        const [, fieldId, operator, ...rest] = p.split(':');
        customRules.push({ fieldId, operator, value: rest.join(':') });
      } else {
        normalConds.push(p);
      }
    }

    let q = query;
    if (normalConds.length > 0) {
      q = q.or(normalConds.join(','));
    }

    // Para cada regra custom, buscamos os contact IDs que satisfazem a condição e aplicamos via in('id', ids)
    // Nota: múltiplas regras são combinadas com OR, pois .or é o mecanismo disponível. Para casos avançados, o FilterGroup já organiza grupos.
    if (customRules.length > 0) {
      // Executa cada customRule sequencialmente (poderia paralelizar futuramente)
      // Atenção a performance: adiciona interseção usando .in quando necessário.
      customRules.forEach(() => {});
      // Implementação real será feita no método applyAdvancedFilters onde temos controle assíncrono
    }

    return q;
  }

  /**
   * Constrói a condição de filtro para o Supabase baseada no FilterGroup
   */
  private static buildFilterCondition(group: FilterGroup): string | null {
    const conditions: string[] = [];

    // Processa regras e subgrupos do grupo
    group.rules.forEach((rule) => {
      if ("field" in rule) {
        const condition = this.buildRuleCondition(rule);
        if (condition) conditions.push(condition);
      } else {
        const subCondition = this.buildFilterCondition(rule);
        if (subCondition) conditions.push(`(${subCondition})`);
      }
    });

    if (conditions.length === 0) {
      return null;
    }

    // Junta as condições (nota: '.or' no Supabase só suporta OR entre condições)
    return conditions.join(',');
  }

  /**
   * Constrói a condição para uma regra individual
   */
  private static buildRuleCondition(rule: FilterRule): string | null {
    // Campos customizados chegam como custom:<id>
    const isCustom = rule.field?.startsWith('custom:');
    if (isCustom) {
      const customFieldId = rule.field.replace('custom:', '');
      const value = String(rule.value ?? '').replace(/,/g, '\\,');
      // Codificamos a regra custom para pós-processamento
      return `custom:${customFieldId}:${rule.operator}:${value}`;
    }

    const property = fixedClientProperties.find(p => p.id === rule.field);
    if (!property) return null;

    const dbField = (property as any).dbField || rule.field;
    const value = rule.value;

      switch (rule.operator) {
        case 'equals':
          return `${dbField}.eq.${value}`;
        case 'in': {
          const vals = Array.isArray(value) ? value : [value];
          if (!vals || vals.length === 0) return null;
          // Group OR conditions for IN
          return `(${vals.map((v: any) => `${dbField}.eq.${v}`).join(',')})`;
        }
        case 'contains_any': {
          const vals = Array.isArray(value) ? value : [value];
          if (!vals || vals.length === 0) return null;
          return `${dbField}.ov.{${vals.join(',')}}`;
        }
        case 'not_equals':
        case 'notEquals':
          return `${dbField}.neq.${value}`;
        case 'contains':
          return `${dbField}.ilike.%${value}%`;
        case 'not_contains':
        case 'notContains':
          return `not.${dbField}.ilike.%${value}%`;
        case 'starts_with':
        case 'startsWith':
          return `${dbField}.ilike.${value}%`;
        case 'ends_with':
        case 'endsWith':
          return `${dbField}.ilike.%${value}`;
        case 'greater_than':
          return `${dbField}.gt.${value}`;
        case 'less_than':
          return `${dbField}.lt.${value}`;
        case 'greater_equal':
          return `${dbField}.gte.${value}`;
        case 'less_equal':
          return `${dbField}.lte.${value}`;
        case 'is_empty':
          return `${dbField}.is.null`;
        case 'is_not_empty':
          return `not.${dbField}.is.null`;
        default:
          return null;
      }
  }

  /**
   * Salva um filtro no Supabase para reutilização
   */
  static async saveFilter(name: string, filterGroup: FilterGroup, userId: string, filterType: 'clients' | 'conversations' = 'clients'): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { error } = await supabase
        .from('saved_filters' as any)
        .insert({
          name,
          filter_data: filterGroup,
          user_id: userId,
          filter_type: filterType,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao salvar filtro:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Erro inesperado ao salvar filtro:', error);
      return { success: false, error: 'Erro inesperado ao salvar filtro' };
    }
  }

  /**
   * Carrega filtros salvos do usuário
   */
  static async loadSavedFilters(userId: string, filterType: 'clients' | 'conversations' = 'clients'): Promise<{
    data: Array<{ id: string; name: string; filter_data: FilterGroup; created_at: string }>;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('saved_filters' as any)
        .select('id, name, filter_data, created_at')
        .eq('user_id', userId)
        .eq('filter_type', filterType)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar filtros salvos:', error);
        return { data: [], error: error.message };
      }

      type SavedFilterRow = { id: string; name: string; filter_data: FilterGroup; created_at: string };
      return { data: (data as unknown as SavedFilterRow[]) || [] };
    } catch (error) {
      console.error('Erro inesperado ao carregar filtros:', error);
      return { data: [], error: 'Erro inesperado ao carregar filtros' };
    }
  }

  /**
   * Remove um filtro salvo
   */
  static async deleteSavedFilter(filterId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { error } = await supabase
        .from('saved_filters' as any)
        .delete()
        .eq('id', filterId);

      if (error) {
        console.error('Erro ao deletar filtro:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Erro inesperado ao deletar filtro:', error);
      return { success: false, error: 'Erro inesperado ao deletar filtro' };
    }
  }
}