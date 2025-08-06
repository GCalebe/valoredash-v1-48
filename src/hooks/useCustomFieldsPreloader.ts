import { useEffect, useRef } from "react";
import { useOptimizedCustomFields } from "./useOptimizedCustomFields";
import { Contact } from "@/types/client";

export const useCustomFieldsPreloader = (contacts: Contact[]) => {
  const { preloadCustomFields } = useOptimizedCustomFields();
  const preloadedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const preloadBatch = async () => {
      const batchSize = 3; // Carregar 3 por vez para não sobrecarregar
      let count = 0;

      for (const contact of contacts) {
        if (count >= batchSize) break;
        
        if (contact.id && !preloadedIds.current.has(contact.id)) {
          preloadedIds.current.add(contact.id);
          await preloadCustomFields(contact.id);
          count++;
          
          // Pequeno delay entre preloads para não bloquear a UI
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
    };

    if (contacts.length > 0) {
      // Delay inicial para permitir que a UI carregue primeiro
      const timeoutId = setTimeout(preloadBatch, 200);
      return () => clearTimeout(timeoutId);
    }
  }, [contacts, preloadCustomFields]);

  return {
    preloadCustomFields: (contactId: string) => {
      if (!preloadedIds.current.has(contactId)) {
        preloadedIds.current.add(contactId);
        return preloadCustomFields(contactId);
      }
    }
  };
};