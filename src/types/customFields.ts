export interface CustomField {
  id: string;
  field_name: string;
  field_type: "text" | "single_select" | "multi_select";
  field_options?: string[] | null;
  is_required: boolean;
  created_at: string;
  updated_at: string;
  visibility_settings?: {
    visible_in_client_info?: boolean;
    visible_in_tabs?: {
      basic?: boolean;
      commercial?: boolean;
      utm?: boolean;
      docs?: boolean;
    };
  };
}

export interface ClientCustomValue {
  id: string;
  client_id: string;
  field_id: string;
  field_value: unknown;
  created_at: string;
  updated_at: string;
}

export interface CustomFieldWithValue extends CustomField {
  value?: unknown;
  validationRules?: ValidationRule[];
}

export interface ValidationRule {
  id: string;
  field_id: string;
  rule_type:
    | "required"
    | "min_length"
    | "max_length"
    | "pattern"
    | "min_value"
    | "max_value";
  rule_value?: string;
  error_message: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLogEntry {
  id: string;
  client_id: string;
  field_id: string;
  old_value?: unknown;
  new_value?: unknown;
  changed_by?: string;
  change_type: "create" | "update" | "delete";
  created_at: string;
}
