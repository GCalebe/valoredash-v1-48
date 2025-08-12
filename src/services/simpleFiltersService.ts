import { supabase } from '@/integrations/supabase/client';
import { fixedClientProperties } from '@/components/clients/filters/filterConstants';

type Rule = {
  id: string;
  field: string; // e.g., 'name', 'client_name', 'tags', 'responsible_hosts', or 'custom:<id>'
  operator: string; // 'in' | 'equals' | 'contains' | 'contains_any' | 'gt' | 'gte' | 'lt' | 'lte' | etc.
  value: any;
};

export class SimpleFiltersService {
  // Aplica regras de forma sequencial (AND) à query de contacts
  static async applyRules(query: any, rules: Rule[]) {
    if (!Array.isArray(rules) || rules.length === 0) return query;

    const { normalRules, customRules } = SimpleFiltersService.partitionRules(rules);
    let q = SimpleFiltersService.applyNormalRules(query, normalRules);
    q = await SimpleFiltersService.applyCustomRules(q, customRules);
    return q;
  }

  private static partitionRules(rules: Rule[]) {
    const normalRules: Rule[] = [];
    const customRules: Rule[] = [];
    for (const r of rules) {
      if (!r || typeof r !== 'object' || typeof r.field !== 'string') continue;
      if (r.field.startsWith('custom:')) customRules.push(r);
      else normalRules.push(r);
    }
    return { normalRules, customRules };
  }

  private static applyNormalRules(query: any, rules: Rule[]) {
    let q = query;
    for (const r of rules) {
      const property = fixedClientProperties.find((p: any) => p.id === r.field) as any;
      const dbField: string = (property && property.dbField) || r.field;
      const value = r.value;
      if (r.operator === 'equals') q = q.eq(dbField, value);
      else if (r.operator === 'in') {
        const vals = Array.isArray(value) ? value : [value];
        if (vals.length > 0) q = q.in(dbField, vals);
      } else if (r.operator === 'contains_any') {
        const vals = Array.isArray(value) ? value : [value];
        if (vals.length > 0) q = q.overlaps(dbField, vals);
      } else if (r.operator === 'contains') q = q.ilike(dbField, `%${value}%`);
      else if (r.operator === 'not_equals' || r.operator === 'notEquals') q = q.neq(dbField, value);
      else if (r.operator === 'starts_with' || r.operator === 'startsWith') q = q.ilike(dbField, `${value}%`);
      else if (r.operator === 'ends_with' || r.operator === 'endsWith') q = q.ilike(dbField, `%${value}`);
      else if (r.operator === 'gt' || r.operator === 'greater_than') q = q.gt(dbField, value);
      else if (r.operator === 'gte' || r.operator === 'greater_equal') q = q.gte(dbField, value);
      else if (r.operator === 'lt' || r.operator === 'less_than') q = q.lt(dbField, value);
      else if (r.operator === 'lte' || r.operator === 'less_equal') q = q.lte(dbField, value);
      else if (r.operator === 'is_empty') q = q.is(dbField, null);
      else if (r.operator === 'is_not_empty') q = q.not(dbField, 'is', null);
    }
    return q;
  }

  private static async applyCustomRules(query: any, rules: Rule[]) {
    let q = query;
    for (const r of rules) {
      const fieldId = r.field.replace('custom:', '');
      let sub = supabase.from('client_custom_values').select('client_id');
      if (r.operator === 'equals') sub = sub.eq('field_id', fieldId).eq('field_value', r.value);
      else if (r.operator === 'contains') sub = sub.eq('field_id', fieldId).ilike('field_value', `%${r.value}%`);
      else if (r.operator === 'not_equals' || r.operator === 'notEquals') sub = sub.eq('field_id', fieldId).neq('field_value', r.value);
      else sub = sub.eq('field_id', fieldId).ilike('field_value', `%${r.value}%`);

      const { data: ids } = await sub;
      const idList = (ids || []).map((row: any) => row.client_id);
      q = idList.length > 0 ? q.in('id', idList) : q.in('id', ['___no_match___']);
    }
    return q;
  }
}


