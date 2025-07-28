import { useState, useEffect, useCallback } from "react";
import { DynamicCategory } from "@/components/clients/DynamicCategoryManager";
import { supabase } from "@/integrations/supabase/client";
import { useCustomFieldValidation } from "./useCustomFieldValidation";
import { validateCustomField } from "@/utils/customFieldValidation";
import { toast } from "@/hooks/use-toast";
import { CustomField, ClientCustomValue } from "@/types/customFields";

export function useDynamicFields(clientId: string | null) {
  const [dynamicFields, setDynamicFields] = useState<{
    basic: DynamicCategory[];
    commercial: DynamicCategory[];
    personalized: DynamicCategory[];
    documents: DynamicCategory[];
  }>({
    basic: [],
    commercial: [],
    personalized: [],
    documents: [],
  });
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [fieldId: string]: string;
  }>({});

  const { validationRules, logCustomFieldChange } = useCustomFieldValidation();

  const fetchCustomFields = async () => {
    const { data, error } = await supabase
      .from("custom_fields")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Error fetching custom fields:", error);
      throw error;
    }
    return data || [];
  };

  const fetchClientValues = async (clientId: string) => {
    const { data, error } = await supabase
      .from("client_custom_values")
      .select("*")
      .eq("client_id", clientId);
    if (error) {
      console.error("Error fetching client values:", error);
      throw error;
    }
    return data || [];
  };

  const mapValuesToFields = (customFields: CustomField[], clientValues: ClientCustomValue[]) => {
    const valuesMap = new Map(clientValues.map(v => [v.field_id, v.field_value]));
    const categorizedFields = { basic: [], commercial: [], personalized: [], documents: [] };

    customFields.forEach((field) => {
      const category = (field.category || "basic") as keyof typeof categorizedFields;
      const dynamicField: DynamicCategory = {
        id: field.id,
        name: field.field_name,
        type: field.field_type,
        options: field.field_options || undefined,
        value: valuesMap.get(field.id) || (field.field_type === "multi_select" ? [] : ""),
      };
      if (categorizedFields[category]) {
        categorizedFields[category].push(dynamicField);
      } else {
        categorizedFields.basic.push(dynamicField);
      }
    });

    return categorizedFields;
  };

  const fetchDynamicFields = useCallback(async (clientId: string) => {
    setLoading(true);
    try {
      const customFields = await fetchCustomFields();
      const clientValues = await fetchClientValues(clientId);
      const categorizedFields = mapValuesToFields(customFields, clientValues);
      setDynamicFields(categorizedFields);
    } catch (error) {
      console.error("Error processing dynamic fields:", error);
      setDynamicFields({ basic: [], commercial: [], personalized: [], documents: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (clientId) {
      fetchDynamicFields(clientId);
    } else {
      setDynamicFields({
        basic: [],
        commercial: [],
        personalized: [],
        documents: [],
      });
    }
  }, [clientId, fetchDynamicFields]);

  const handleValidation = (fieldId: string, newValue: unknown) => {
    const validationError = validateCustomField(fieldId, newValue, validationRules);
    if (validationError) {
      setValidationErrors(prev => ({ ...prev, [fieldId]: validationError.message }));
      toast({ title: "Erro de validação", description: validationError.message, variant: "destructive" });
      return false;
    }
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldId];
      return newErrors;
    });
    return true;
  };

  const updateState = (fieldId: string, newValue: unknown, oldValue?: unknown) => {
    const valueToSet = oldValue !== undefined ? oldValue : newValue;
    const updateFn = (prevFields: typeof dynamicFields) => {
      const updated = { ...prevFields };
      for (const category in updated) {
        const categoryKey = category as keyof typeof updated;
        const fieldIndex = updated[categoryKey].findIndex(f => f.id === fieldId);
        if (fieldIndex !== -1) {
          updated[categoryKey][fieldIndex] = { ...updated[categoryKey][fieldIndex], value: valueToSet };
          break;
        }
      }
      return updated;
    };
    setDynamicFields(updateFn);
  };

  const saveToDatabase = async (clientId: string, fieldId: string, newValue: unknown) => {
    const { error } = await supabase.from("client_custom_values").upsert(
      { client_id: clientId, field_id: fieldId, field_value: newValue },
      { onConflict: "client_id,field_id" }
    );
    if (error) {
      console.error("Error saving field value:", error);
      toast({ title: "Erro ao salvar valor", description: error.message, variant: "destructive" });
      throw error;
    }
  };

  const updateField = useCallback(async (fieldId: string, newValue: unknown) => {
    if (!clientId) return;

    if (!handleValidation(fieldId, newValue)) return;

    const currentField = Object.values(dynamicFields).flat().find(f => f.id === fieldId);
    const oldValue = currentField?.value;

    updateState(fieldId, newValue);

    try {
      await saveToDatabase(clientId, fieldId, newValue);
      await logCustomFieldChange(
        clientId,
        fieldId,
        oldValue,
        newValue,
        oldValue === undefined ? "create" : "update",
      );
    } catch (error) {
      // Revert on error
      updateState(fieldId, newValue, oldValue);
    }
  }, [clientId, dynamicFields, validationRules, logCustomFieldChange]);

  return {
    dynamicFields,
    loading,
    validationErrors,
    refetch: () => clientId && fetchDynamicFields(clientId),
    updateField,
  };
}
