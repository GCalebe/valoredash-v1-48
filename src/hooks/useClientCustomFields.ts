import { useState, useEffect } from "react";
import { CustomFieldWithValue } from "@/types/customFields";
import { useCustomFields } from "./useCustomFields";

export const useClientCustomFields = (contactId?: string) => {
  const [customFieldsWithValues, setCustomFieldsWithValues] = useState<
    CustomFieldWithValue[]
  >([]);
  const [loadingCustomFields, setLoadingCustomFields] = useState(false);
  const { getCustomFieldsWithValues, saveClientCustomValues } =
    useCustomFields();

  const loadCustomFieldsForContact = async (id: string) => {
    try {
      setLoadingCustomFields(true);
      const fieldsWithValues = await getCustomFieldsWithValues(id);
      setCustomFieldsWithValues(fieldsWithValues);
    } catch (error) {
      console.error("Erro ao carregar campos personalizados:", error);
    } finally {
      setLoadingCustomFields(false);
    }
  };

  const saveCustomFields = async (
    id: string,
    values: { fieldId: string; value: any }[],
  ) => {
    try {
      await saveClientCustomValues(id, values);
      await loadCustomFieldsForContact(id);
      return true;
    } catch (error) {
      console.error("Erro ao salvar campos personalizados:", error);
      return false;
    }
  };

  useEffect(() => {
    if (contactId) {
      loadCustomFieldsForContact(contactId);
    }
  }, [contactId]);

  return {
    customFieldsWithValues,
    loadingCustomFields,
    loadCustomFieldsForContact,
    saveCustomFields,
  };
};
