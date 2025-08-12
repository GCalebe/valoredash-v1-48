// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fixedClientProperties } from "@/components/clients/filters/filterConstants";
import { useKanbanStagesLocal } from "@/hooks/useKanbanStagesLocal";

export interface FilterProperty {
  id: string;
  name: string;
  type: "text" | "select" | "date" | "number" | "multi_select" | "kanban_stage";
  options?: string[];
  dbField?: string;
  isCustom?: boolean;
  customFieldId?: string;
  category?: "basic" | "kanban" | "commercial" | "temporal" | "documents" | "personalized";
}

/**
 * Retorna a lista de campos filtráveis combinando campos fixos do contato
 * e campos personalizados do usuário (custom_fields).
 */
export function useFilterableFields() {
  const [customFields, setCustomFields] = useState<FilterProperty[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [responsibleHosts, setResponsibleHosts] = useState<string[]>([]);
  const [responsibleHostsMap, setResponsibleHostsMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { stages: kanbanStages, loading: kanbanLoading } = useKanbanStagesLocal();

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch custom fields
        const { data: customFieldsData, error: customFieldsError } = await supabase
          .from("custom_fields")
          .select("id, field_name, field_type, field_options")
          .is("deleted_at", null)
          .order("created_at", { ascending: true });

        if (customFieldsError) {
          console.error("Erro ao carregar custom_fields:", customFieldsError);
        } else {
          const mapped: FilterProperty[] = (customFieldsData || []).map((f: any) => ({
            id: `custom:${f.id}`,
            name: f.field_name,
            type: f.field_type === "single_select" || f.field_type === "multi_select" ? "select" : "text",
            options: Array.isArray(f.field_options) ? f.field_options : undefined,
            isCustom: true,
            customFieldId: f.id,
            category: (f.category || "basic") as any,
          }));
          
          if (isMounted) setCustomFields(mapped);
        }

        // Fetch available tags from contacts (escopo do usuário atual)
        const { data: currentAuth } = await supabase.auth.getUser();
        const currentUserId = currentAuth?.user?.id || null;
        let tagsQuery = supabase
          .from("contacts")
          .select("tags")
          .not("tags", "is", null);
        if (currentUserId) {
          tagsQuery = tagsQuery.eq('user_id', currentUserId);
        }
        const { data: tagsData, error: tagsError } = await tagsQuery;

        if (!tagsError && tagsData) {
          const allTags = new Set<string>();
          tagsData.forEach(contact => {
            if (Array.isArray(contact.tags)) {
              contact.tags.forEach(tag => allTags.add(tag));
            }
          });
          if (isMounted) setAvailableTags(Array.from(allTags).sort());
        }

        // Fetch responsible hosts from contacts with names from profiles (escopo do usuário)
        let hostsQuery = supabase
          .from("contacts")
          .select(`responsible_hosts`)
          .not("responsible_hosts", "is", null);
        if (currentUserId) {
          hostsQuery = hostsQuery.eq('user_id', currentUserId);
        }
        const { data: hostsData, error: hostsError } = await hostsQuery;

        if (!hostsError && hostsData) {
          // Collect all unique host IDs
          const allHostIds = new Set<string>();
          hostsData.forEach(contact => {
            if (Array.isArray(contact.responsible_hosts)) {
              contact.responsible_hosts.forEach(hostId => allHostIds.add(hostId));
            }
          });

          // Fetch names for these host IDs from profiles
          if (allHostIds.size > 0) {
            const { data: profilesData, error: profilesError } = await supabase
              .from("profiles")
              .select("id, full_name")
              .in("id", Array.from(allHostIds));

            if (!profilesError && profilesData) {
              const hostNames = profilesData
                .filter(profile => profile.full_name)
                .map(profile => profile.full_name)
                .sort();
              
              // Criar mapeamento nome -> id e id -> nome
              const nameToIdMap: Record<string, string> = {};
              const idToNameMap: Record<string, string> = {};
              profilesData.forEach(profile => {
                if (profile.full_name) {
                  nameToIdMap[profile.full_name] = profile.id;
                  idToNameMap[profile.id] = profile.full_name;
                }
              });
              
              if (isMounted) {
                setResponsibleHosts(hostNames);
                setResponsibleHostsMap({ ...nameToIdMap, ...idToNameMap });
              }
            } else {
              console.error('Erro ao carregar nomes dos anfitriões:', profilesError);
            }
          }
        }

      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const allFields: FilterProperty[] = useMemo(() => {
    // Processar campos fixos com dados dinâmicos
    const processedFields: FilterProperty[] = (fixedClientProperties as any).map((f: any) => {
      const field = {
        ...f,
        category: (f.category || "basic") as any,
      };

      // Adicionar opções dinâmicas para campos especiais
      if (f.id === "tags") {
        field.options = availableTags;
      } else if (f.id === "responsible_hosts") {
        field.options = responsibleHosts;
      } else if (f.id === "kanban_stage_id" && !kanbanLoading) {
        field.options = kanbanStages.map(stage => ({ value: stage.id, label: stage.title }));
      }

      return field;
    });

    return [...processedFields, ...customFields];
  }, [customFields, availableTags, responsibleHosts, kanbanStages, kanbanLoading]);

  return { 
    fields: allFields, 
    loading: loading || kanbanLoading,
    availableTags,
    responsibleHosts,
    responsibleHostsMap,
    kanbanStages 
  };
}


