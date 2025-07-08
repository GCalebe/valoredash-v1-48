import { useState, useEffect, useCallback } from "react";
import { DynamicCategory } from "@/components/clients/DynamicCategoryManager";
import { supabase } from "@/integrations/supabase/client";
import { useCustomFieldValidation } from "./useCustomFieldValidation";
import { validateCustomField } from "@/utils/customFieldValidation";
import { toast } from "@/hooks/use-toast";

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

  const fetchDynamicFields = useCallback(async (clientId: string) => {
    try {
      setLoading(true);

      // Fetch custom field definitions
      const { data: customFields, error: fieldsError } = await supabase
        .from("custom_fields")
        .select("*")
        .order("created_at", { ascending: true });

      if (fieldsError) {
        console.error("Error fetching custom fields:", fieldsError);
        return;
      }

      // Fetch client values for these fields
      const { data: clientValues, error: valuesError } = await supabase
        .from("client_custom_values")
        .select("*")
        .eq("client_id", clientId);

      if (valuesError) {
        console.error("Error fetching client values:", valuesError);
      }

      // Create a map of field values for quick lookup
      const valuesMap = new Map();
      if (clientValues) {
        clientValues.forEach((value) => {
          valuesMap.set(value.field_id, value.field_value);
        });
      }

      // Transform the data into the expected format
      const categorizedFields = {
        basic: [] as DynamicCategory[],
        commercial: [] as DynamicCategory[],
        personalized: [] as DynamicCategory[],
        documents: [] as DynamicCategory[],
      };

      if (customFields) {
        customFields.forEach((field) => {
          // Use the category from the database, defaulting to 'basic' if not set
          const category = (field.category ||
            "basic") as keyof typeof categorizedFields;
          const fieldValue = valuesMap.get(field.id);

          const dynamicField: DynamicCategory = {
            id: field.id,
            name: field.field_name,
            type: field.field_type as "text" | "single_select" | "multi_select",
            options: field.field_options
              ? (field.field_options as string[])
              : undefined,
            value:
              fieldValue || (field.field_type === "multi_select" ? [] : ""),
          };

          // Ensure the category exists in our categorized fields
          if (categorizedFields[category]) {
            categorizedFields[category].push(dynamicField);
          } else {
            // If category doesn't exist, default to 'basic'
            categorizedFields.basic.push(dynamicField);
          }
        });
      }

      setDynamicFields(categorizedFields);
    } catch (error) {
      console.error("Error fetching dynamic fields:", error);
      // Reset to empty state on error
      setDynamicFields({
        basic: [],
        commercial: [],
        personalized: [],
        documents: [],
      });
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

  const updateField = useCallback(
    async (fieldId: string, newValue: any) => {
      if (!clientId) return;

      // Get current value for audit logging
      const currentField = Object.values(dynamicFields)
        .flat()
        .find((field) => field.id === fieldId);
      const oldValue = currentField?.value;

      // Validate the field
      const validationError = validateCustomField(
        fieldId,
        newValue,
        validationRules,
      );

      if (validationError) {
        setValidationErrors((prev) => ({
          ...prev,
          [fieldId]: validationError.message,
        }));
        toast({
          title: "Erro de validação",
          description: validationError.message,
          variant: "destructive",
        });
        return;
      } else {
        // Clear validation error if field is now valid
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldId];
          return newErrors;
        });
      }

      // Optimistically update the UI
      setDynamicFields((prev) => {
        const updated = { ...prev };

        // Find and update the field in the appropriate category
        Object.keys(updated).forEach((category) => {
          const categoryFields = updated[category as keyof typeof updated];
          const fieldIndex = categoryFields.findIndex(
            (field) => field.id === fieldId,
          );
          if (fieldIndex !== -1) {
            categoryFields[fieldIndex] = {
              ...categoryFields[fieldIndex],
              value: newValue,
            };
          }
        });

        return updated;
      });

      try {
        // Save the value to the database
        const { error } = await supabase.from("client_custom_values").upsert(
          {
            client_id: clientId,
            field_id: fieldId,
            field_value: newValue,
          },
          {
            onConflict: "client_id,field_id",
          },
        );

        if (error) {
          console.error("Error saving field value:", error);
          toast({
            title: "Erro ao salvar",
            description: "Não foi possível salvar o valor do campo.",
            variant: "destructive",
          });
          // Optionally revert the optimistic update here
        } else {
          // Log the change for audit purposes
          await logCustomFieldChange(
            clientId,
            fieldId,
            oldValue,
            newValue,
            oldValue === undefined ? "create" : "update",
          );

          console.log(
            `Field ${fieldId} updated successfully with value:`,
            newValue,
          );
        }
      } catch (error) {
        console.error("Error updating field:", error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar o valor do campo.",
          variant: "destructive",
        });
      }
    },
    [clientId, dynamicFields, validationRules, logCustomFieldChange],
  );

  return {
    dynamicFields,
    loading,
    validationErrors,
    refetch: () => clientId && fetchDynamicFields(clientId),
    updateField,
  };
}
