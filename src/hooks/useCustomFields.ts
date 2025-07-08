import { useState, useEffect } from "react";
import {
  CustomField,
  ClientCustomValue,
  CustomFieldWithValue,
} from "@/types/customFields";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useCustomFields() {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCustomFields = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("custom_fields")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching custom fields:", error);
        toast({
          title: "Erro ao carregar campos",
          description: "Não foi possível carregar os campos personalizados.",
          variant: "destructive",
        });
        return;
      }

      // Transform the data to match our CustomField interface
      const transformedFields: CustomField[] = data.map((field) => ({
        id: field.id,
        field_name: field.field_name,
        field_type: field.field_type as
          | "text"
          | "single_select"
          | "multi_select",
        field_options: field.field_options
          ? JSON.parse(JSON.stringify(field.field_options))
          : null,
        is_required: field.is_required,
        created_at: field.created_at,
        updated_at: field.updated_at,
      }));

      setCustomFields(transformedFields);
    } catch (error) {
      console.error("Error fetching custom fields:", error);
      toast({
        title: "Erro ao carregar campos",
        description: "Não foi possível carregar os campos personalizados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomFields();
  }, []);

  const addCustomField = async (
    field: Omit<CustomField, "id" | "created_at" | "updated_at">,
  ) => {
    try {
      const { data, error } = await supabase
        .from("custom_fields")
        .insert({
          field_name: field.field_name,
          field_type: field.field_type,
          field_options: field.field_options,
          is_required: field.is_required,
          category: "basic", // Default category, can be modified later
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating field:", error);
        toast({
          title: "Erro ao criar campo",
          description: "Não foi possível criar o campo personalizado.",
          variant: "destructive",
        });
        return;
      }

      const newField: CustomField = {
        id: data.id,
        field_name: data.field_name,
        field_type: data.field_type as
          | "text"
          | "single_select"
          | "multi_select",
        field_options: data.field_options
          ? JSON.parse(JSON.stringify(data.field_options))
          : null,
        is_required: data.is_required,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      setCustomFields((prev) => [...prev, newField]);

      toast({
        title: "Campo adicionado",
        description: `Campo "${field.field_name}" foi criado com sucesso.`,
      });
    } catch (error) {
      console.error("Error creating field:", error);
      toast({
        title: "Erro ao criar campo",
        description: "Não foi possível criar o campo personalizado.",
        variant: "destructive",
      });
    }
  };

  const createCustomField = async (
    field: Omit<CustomField, "id" | "created_at" | "updated_at">,
  ) => {
    return addCustomField(field);
  };

  const updateCustomField = async (id: string, field: Partial<CustomField>) => {
    try {
      const { error } = await supabase
        .from("custom_fields")
        .update({
          field_name: field.field_name,
          field_type: field.field_type,
          field_options: field.field_options,
          is_required: field.is_required,
        })
        .eq("id", id);

      if (error) {
        console.error("Error updating field:", error);
        toast({
          title: "Erro ao atualizar campo",
          description: "Não foi possível atualizar o campo personalizado.",
          variant: "destructive",
        });
        return;
      }

      setCustomFields((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, ...field, updated_at: new Date().toISOString() }
            : f,
        ),
      );

      toast({
        title: "Campo atualizado",
        description: "Campo personalizado foi atualizado com sucesso.",
      });
    } catch (error) {
      console.error("Error updating field:", error);
      toast({
        title: "Erro ao atualizar campo",
        description: "Não foi possível atualizar o campo personalizado.",
        variant: "destructive",
      });
    }
  };

  const deleteCustomField = async (id: string) => {
    try {
      const { error } = await supabase
        .from("custom_fields")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting field:", error);
        toast({
          title: "Erro ao remover campo",
          description: "Não foi possível remover o campo personalizado.",
          variant: "destructive",
        });
        return;
      }

      setCustomFields((prev) => prev.filter((f) => f.id !== id));

      toast({
        title: "Campo removido",
        description: "Campo personalizado foi removido com sucesso.",
      });
    } catch (error) {
      console.error("Error deleting field:", error);
      toast({
        title: "Erro ao remover campo",
        description: "Não foi possível remover o campo personalizado.",
        variant: "destructive",
      });
    }
  };

  const fetchClientCustomValues = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from("client_custom_values")
        .select("*")
        .eq("client_id", clientId);

      if (error) {
        console.error("Error fetching client custom values:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching client custom values:", error);
      return [];
    }
  };

  const getCustomFieldsWithValues = async (
    clientId: string,
  ): Promise<CustomFieldWithValue[]> => {
    try {
      const [fields, values] = await Promise.all([
        customFields.length > 0
          ? Promise.resolve(customFields)
          : fetchCustomFields().then(() => customFields),
        fetchClientCustomValues(clientId),
      ]);

      const valuesMap = new Map();
      values.forEach((value) => {
        valuesMap.set(value.field_id, value.field_value);
      });

      return fields.map((field) => ({
        ...field,
        value: valuesMap.get(field.id) || null,
      }));
    } catch (error) {
      console.error("Error getting custom fields with values:", error);
      return [];
    }
  };

  const saveClientCustomValues = async (
    clientId: string,
    values: { fieldId: string; value: any }[],
  ) => {
    try {
      const upsertPromises = values.map(({ fieldId, value }) =>
        supabase.from("client_custom_values").upsert(
          {
            client_id: clientId,
            field_id: fieldId,
            field_value: value,
          },
          {
            onConflict: "client_id,field_id",
          },
        ),
      );

      const results = await Promise.all(upsertPromises);

      // Check for any errors
      const errors = results.filter((result) => result.error);
      if (errors.length > 0) {
        console.error("Error saving some custom values:", errors);
        toast({
          title: "Erro parcial ao salvar",
          description: "Alguns campos personalizados não puderam ser salvos.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Valores salvos",
        description: "Campos personalizados foram salvos com sucesso.",
      });
    } catch (error) {
      console.error("Error saving custom values:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os campos personalizados.",
        variant: "destructive",
      });
    }
  };

  return {
    customFields,
    loading,
    fetchCustomFields,
    addCustomField,
    createCustomField,
    updateCustomField,
    deleteCustomField,
    fetchClientCustomValues,
    getCustomFieldsWithValues,
    saveClientCustomValues,
  };
}
