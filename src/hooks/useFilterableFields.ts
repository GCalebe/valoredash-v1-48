// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fixedClientProperties } from "@/components/clients/filters/filterConstants";

export interface FilterProperty {
  id: string;
  name: string;
  type: "text" | "select" | "date";
  options?: string[];
  dbField?: string;
  isCustom?: boolean;
  customFieldId?: string;
  category?: "basic" | "commercial" | "personalized" | "documents";
}

/**
 * Retorna a lista de campos filtráveis combinando campos fixos do contato
 * e campos personalizados do usuário (custom_fields).
 */
export function useFilterableFields() {
  const [customFields, setCustomFields] = useState<FilterProperty[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchCustom() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("custom_fields")
          .select("id, field_name, field_type, field_options")
          .is("deleted_at", null)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Erro ao carregar custom_fields:", error);
          return;
        }

        const mapped: FilterProperty[] = (data || []).map((f: any) => ({
          id: `custom:${f.id}`,
          name: f.field_name,
          type: f.field_type === "single_select" || f.field_type === "multi_select" ? "select" : "text",
          options: Array.isArray(f.field_options) ? f.field_options : undefined,
          isCustom: true,
          customFieldId: f.id,
          category: (f.category || "basic") as any,
        }));

        if (isMounted) setCustomFields(mapped);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchCustom();
    return () => {
      isMounted = false;
    };
  }, []);

  const allFields: FilterProperty[] = useMemo(() => {
    // Atribuir categorias-padrão aos campos fixos
    const fixedWithCategories: FilterProperty[] = (fixedClientProperties as any).map((f: any) => ({
      ...f,
      category: (f.category || "basic") as any,
    }));
    return [...fixedWithCategories, ...customFields];
  }, [customFields]);

  return { fields: allFields, loading };
}


