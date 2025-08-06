import { useState, useCallback, useRef } from "react";
import { CustomFieldWithValue } from "@/types/customFields";
import { useCustomFields } from "./useCustomFields";
import { useInvalidateCustomFieldsCache } from "./useInvalidateCustomFieldsCache";
import { toast } from "@/hooks/use-toast";

export const useOptimizedCustomFields = () => {
  const [customFieldsWithValues, setCustomFieldsWithValues] = useState<
    CustomFieldWithValue[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Cache para evitar requests duplicados e armazenar dados
  const loadingRef = useRef<Map<string, Promise<CustomFieldWithValue[]>>>(new Map());
  const dataCache = useRef<Map<string, CustomFieldWithValue[]>>(new Map());
  
  const { getCustomFieldsWithValues, saveClientCustomValues } = useCustomFields();
  
  const clearCache = useCallback(() => {
    loadingRef.current.clear();
    dataCache.current.clear();
    setCustomFieldsWithValues([]);
    setError(null);
  }, []);
  
  // Auto-invalidar cache quando houver mudanças no banco
  useInvalidateCustomFieldsCache(clearCache);

  const loadCustomFieldsForContact = useCallback(async (contactId: string) => {
    if (!contactId) {
      setCustomFieldsWithValues([]);
      return;
    }

    // Verificar cache primeiro
    if (dataCache.current.has(contactId)) {
      const cachedData = dataCache.current.get(contactId)!;
      setCustomFieldsWithValues(cachedData);
      return cachedData;
    }

    // Verificar se já está carregando para evitar requests duplicados
    if (loadingRef.current.has(contactId)) {
      try {
        const result = await loadingRef.current.get(contactId)!;
        setCustomFieldsWithValues(result);
        return result;
      } catch (err) {
        // Limpar cache se houve erro
        loadingRef.current.delete(contactId);
        throw err;
      }
    }

    setIsLoading(true);
    setError(null);

    const loadPromise = (async () => {
      try {
        const fieldsWithValues = await getCustomFieldsWithValues(contactId);
        
        // Validar dados recebidos
        const validatedFields = fieldsWithValues.filter(field => 
          field && field.id && field.field_name
        );
        
        // Armazenar no cache
        dataCache.current.set(contactId, validatedFields);
        setCustomFieldsWithValues(validatedFields);
        return validatedFields;
      } catch (error) {
        console.error("Erro ao carregar campos personalizados:", error);
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        setError(`Falha ao carregar campos personalizados: ${errorMessage}`);
        
        toast({
          title: "Erro ao carregar campos",
          description: "Não foi possível carregar os campos personalizados. Tente novamente.",
        });
        
        throw error;
      } finally {
        setIsLoading(false);
        // Limpar cache após completar
        loadingRef.current.delete(contactId);
      }
    })();

    // Adicionar ao cache
    loadingRef.current.set(contactId, loadPromise);
    
    return loadPromise;
  }, [getCustomFieldsWithValues]);

  const saveCustomFields = useCallback(async (
    contactId: string,
    values: { fieldId: string; value: string | number | boolean | null }[],
  ) => {
    if (!contactId || !values?.length) {
      return false;
    }

    try {
      setIsLoading(true);
      
      // Validar dados antes de salvar
      const validatedValues = values.filter(item => 
        item?.fieldId && item.fieldId.trim() !== ""
      );

      if (validatedValues.length === 0) {
        throw new Error("Nenhum valor válido para salvar");
      }

      await saveClientCustomValues(contactId, validatedValues);
      
      // Invalidar cache e recarregar dados após salvar com sucesso
      dataCache.current.delete(contactId);
      await loadCustomFieldsForContact(contactId);
      
      return true;
    } catch (error) {
      console.error("Erro ao salvar campos personalizados:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      
      toast({
        title: "Erro ao salvar",
        description: `Não foi possível salvar os campos: ${errorMessage}`,
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [saveClientCustomValues, loadCustomFieldsForContact]);


  const preloadCustomFields = useCallback(async (contactId: string) => {
    if (!contactId || dataCache.current.has(contactId) || loadingRef.current.has(contactId)) {
      return;
    }

    try {
      const fieldsWithValues = await getCustomFieldsWithValues(contactId);
      const validatedFields = fieldsWithValues.filter(field => 
        field && field.id && field.field_name
      );
      dataCache.current.set(contactId, validatedFields);
    } catch (error) {
      console.error("Erro no pré-carregamento de campos personalizados:", error);
    }
  }, [getCustomFieldsWithValues]);

  const retry = useCallback((contactId: string) => {
    clearCache();
    return loadCustomFieldsForContact(contactId);
  }, [clearCache, loadCustomFieldsForContact]);

  return {
    customFieldsWithValues,
    isLoading,
    error,
    loadCustomFieldsForContact,
    saveCustomFields,
    clearCache,
    retry,
    preloadCustomFields,
  };
};