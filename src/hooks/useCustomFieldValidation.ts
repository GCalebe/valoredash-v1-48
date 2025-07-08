import { useState, useEffect } from "react";
import { ValidationRule, AuditLogEntry } from "@/types/customFields";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useCustomFieldValidation() {
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchValidationRules = async (fieldId?: string) => {
    try {
      setLoading(true);

      let query = supabase
        .from("custom_field_validation_rules")
        .select("*")
        .order("created_at", { ascending: true });

      if (fieldId) {
        query = query.eq("field_id", fieldId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching validation rules:", error);
        toast({
          title: "Erro ao carregar regras",
          description: "Não foi possível carregar as regras de validação.",
          variant: "destructive",
        });
        return [];
      }

      const transformedRules: ValidationRule[] = (data || []).map((rule) => ({
        id: rule.id,
        field_id: rule.field_id,
        rule_type: rule.rule_type as ValidationRule["rule_type"],
        rule_value: rule.rule_value,
        error_message: rule.error_message,
        created_at: rule.created_at,
        updated_at: rule.updated_at,
      }));

      setValidationRules(transformedRules);
      return transformedRules;
    } catch (error) {
      console.error("Error fetching validation rules:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const logCustomFieldChange = async (
    clientId: string,
    fieldId: string,
    oldValue: any,
    newValue: any,
    changeType: "create" | "update" | "delete",
    changedBy?: string,
  ) => {
    try {
      const { error } = await supabase.from("custom_field_audit_log").insert({
        client_id: clientId,
        field_id: fieldId,
        old_value: oldValue,
        new_value: newValue,
        change_type: changeType,
        changed_by: changedBy || "system",
      });

      if (error) {
        console.error("Error logging field change:", error);
      } else {
        console.log(
          `Logged ${changeType} for field ${fieldId} on client ${clientId}`,
        );
      }
    } catch (error) {
      console.error("Error logging field change:", error);
    }
  };

  const fetchAuditLog = async (
    clientId?: string,
    fieldId?: string,
  ): Promise<AuditLogEntry[]> => {
    try {
      let query = supabase
        .from("custom_field_audit_log")
        .select("*")
        .order("created_at", { ascending: false });

      if (clientId) {
        query = query.eq("client_id", clientId);
      }

      if (fieldId) {
        query = query.eq("field_id", fieldId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching audit log:", error);
        return [];
      }

      return (data || []).map((entry) => ({
        id: entry.id,
        client_id: entry.client_id,
        field_id: entry.field_id,
        old_value: entry.old_value,
        new_value: entry.new_value,
        changed_by: entry.changed_by,
        change_type: entry.change_type as AuditLogEntry["change_type"],
        created_at: entry.created_at,
      }));
    } catch (error) {
      console.error("Error fetching audit log:", error);
      return [];
    }
  };

  useEffect(() => {
    fetchValidationRules();
  }, []);

  return {
    validationRules,
    loading,
    fetchValidationRules,
    logCustomFieldChange,
    fetchAuditLog,
  };
}
