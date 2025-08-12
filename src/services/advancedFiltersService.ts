import { supabase } from "@/integrations/supabase/client";

export interface SavedFilterRecord {
  id: string;
  user_id: string;
  name: string;
  filter_data: unknown;
  type?: string | null;
  created_at?: string;
}

export class AdvancedFiltersService {
  static async saveFilter(
    name: string,
    filter: unknown,
    userId: string,
    type?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supa: any = supabase as any;
      const { error } = await supa
        .from("saved_filters" as any)
        .insert({ name, filter_data: filter, user_id: userId, type: type || null });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || "unknown" };
    }
  }

  static async loadSavedFilters(
    userId: string,
    type?: string
  ): Promise<{ data: SavedFilterRecord[]; error?: string }> {
    try {
      const supa: any = supabase as any;
      let query = supa
        .from("saved_filters" as any)
        .select("id, user_id, name, filter_data, type, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (type) query = query.eq("type", type);
      const { data, error } = await query;
      if (error) return { data: [], error: error.message };
      return { data: (data as SavedFilterRecord[]) || [] };
    } catch (e: any) {
      return { data: [], error: e?.message || "unknown" };
    }
  }

  static async deleteSavedFilter(
    id: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supa: any = supabase as any;
      const { error } = await supa
        .from("saved_filters" as any)
        .delete()
        .eq("id", id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || "unknown" };
    }
  }
}


