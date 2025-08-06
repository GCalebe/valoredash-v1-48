import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useInvalidateCustomFieldsCache = (clearCache: () => void) => {
  useEffect(() => {
    // Listener para mudanças na tabela custom_fields
    const customFieldsChannel = supabase
      .channel('custom-fields-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'custom_fields'
        },
        () => {
          // Invalidar todo o cache quando campos são criados/modificados/removidos
          clearCache();
        }
      )
      .subscribe();

    // Listener para mudanças na tabela client_custom_values
    const valuesChannel = supabase
      .channel('custom-values-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'client_custom_values'
        },
        (payload) => {
          // Para mudanças em valores, só invalidar o cache específico seria ideal,
          // mas para simplicidade, invalidamos tudo
          clearCache();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(customFieldsChannel);
      supabase.removeChannel(valuesChannel);
    };
  }, [clearCache]);
};