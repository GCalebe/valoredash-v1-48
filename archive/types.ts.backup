export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      audit_log: {
        Row: {
          changed_at: string;
          changed_by: string | null;
          id: string;
          ip_address: unknown | null;
          new_values: Json | null;
          old_values: Json | null;
          operation: string;
          record_id: string;
          table_name: string;
          user_agent: string | null;
        };
        Insert: {
          changed_at?: string;
          changed_by?: string | null;
          id?: string;
          ip_address?: unknown | null;
          new_values?: Json | null;
          old_values?: Json | null;
          operation: string;
          record_id: string;
          table_name: string;
          user_agent?: string | null;
        };
        Update: {
          changed_at?: string;
          changed_by?: string | null;
          id?: string;
          ip_address?: unknown | null;
          new_values?: Json | null;
          old_values?: Json | null;
          operation?: string;
          record_id?: string;
          table_name?: string;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      chat_messages_backup: {
        Row: {
          active: boolean | null;
          bot_message: string | null;
          conversation_id: string | null;
          created_at: string | null;
          data: string | null;
          id: number;
          message_type: string | null;
          phone: string | null;
          user_message: string | null;
        };
        Insert: {
          active?: boolean | null;
          bot_message?: string | null;
          conversation_id?: string | null;
          created_at?: string | null;
          data?: string | null;
          id?: number;
          message_type?: string | null;
          phone?: string | null;
          user_message?: string | null;
        };
        Update: {
          active?: boolean | null;
          bot_message?: string | null;
          conversation_id?: string | null;
          created_at?: string | null;
          data?: string | null;
          id?: number;
          message_type?: string | null;
          phone?: string | null;
          user_message?: string | null;
        };
        Relationships: [];
      };
      chats_backup: {
        Row: {
          app: string | null;
          conversation_id: string | null;
          created_at: string | null;
          id: number;
          phone: string | null;
          updated_at: string | null;
        };
        Insert: {
          app?: string | null;
          conversation_id?: string | null;
          created_at?: string | null;
          id?: number;
          phone?: string | null;
          updated_at?: string | null;
        };
        Update: {
          app?: string | null;
          conversation_id?: string | null;
          created_at?: string | null;
          id?: number;
          phone?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      client_custom_values: {
        Row: {
          client_id: string;
          created_at: string;
          field_id: string;
          field_value: Json;
          id: string;
          updated_at: string;
        };
        Insert: {
          client_id: string;
          created_at?: string;
          field_id: string;
          field_value: Json;
          id?: string;
          updated_at?: string;
        };
        Update: {
          client_id?: string;
          created_at?: string;
          field_id?: string;
          field_value?: Json;
          id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "client_custom_values_field_id_fkey";
            columns: ["field_id"];
            isOneToOne: false;
            referencedRelation: "custom_fields";
            referencedColumns: ["id"];
          },
        ];
      };
      contacts: {
        Row: {
          address: string | null;
          asaas_customer_id: string | null;
          budget: number | null;
          client_name: string | null;
          client_objective: string | null;
          client_sector: string | null;
          client_size: string | null;
          client_type: string | null;
          consultation_stage: string | null;
          contract_date: string | null;
          contract_number: string | null;
          cpf_cnpj: string | null;
          created_at: string | null;
          deleted_at: string | null;
          email: string | null;
          id: string;
          kanban_stage: string | null;
          last_contact: string | null;
          last_message: string | null;
          last_message_time: string | null;
          loss_reason: string | null;
          name: string;
          notes: string | null;
          payment: string | null;
          payment_method: string | null;
          phone: string | null;
          responsible_user: string | null;
          sales: number | null;
          session_id: string | null;
          status: string | null;
          tags: string[] | null;
          unread_count: number | null;
          updated_at: string | null;
          uploaded_files: string[] | null;
        };
        Insert: {
          address?: string | null;
          asaas_customer_id?: string | null;
          budget?: number | null;
          client_name?: string | null;
          client_objective?: string | null;
          client_sector?: string | null;
          client_size?: string | null;
          client_type?: string | null;
          consultation_stage?: string | null;
          contract_date?: string | null;
          contract_number?: string | null;
          cpf_cnpj?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          email?: string | null;
          id?: string;
          kanban_stage?: string | null;
          last_contact?: string | null;
          last_message?: string | null;
          last_message_time?: string | null;
          loss_reason?: string | null;
          name: string;
          notes?: string | null;
          payment?: string | null;
          payment_method?: string | null;
          phone?: string | null;
          responsible_user?: string | null;
          sales?: number | null;
          session_id?: string | null;
          status?: string | null;
          tags?: string[] | null;
          unread_count?: number | null;
          updated_at?: string | null;
          uploaded_files?: string[] | null;
        };
        Update: {
          address?: string | null;
          asaas_customer_id?: string | null;
          budget?: number | null;
          client_name?: string | null;
          client_objective?: string | null;
          client_sector?: string | null;
          client_size?: string | null;
          client_type?: string | null;
          consultation_stage?: string | null;
          contract_date?: string | null;
          contract_number?: string | null;
          cpf_cnpj?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          email?: string | null;
          id?: string;
          kanban_stage?: string | null;
          last_contact?: string | null;
          last_message?: string | null;
          last_message_time?: string | null;
          loss_reason?: string | null;
          name?: string;
          notes?: string | null;
          payment?: string | null;
          payment_method?: string | null;
          phone?: string | null;
          responsible_user?: string | null;
          sales?: number | null;
          session_id?: string | null;
          status?: string | null;
          tags?: string[] | null;
          unread_count?: number | null;
          updated_at?: string | null;
          uploaded_files?: string[] | null;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          address: string | null;
          avatar: string | null;
          client_name: string | null;
          client_size: string | null;
          client_type: string | null;
          created_at: string | null;
          email: string | null;
          id: string;
          last_message: string | null;
          name: string;
          phone: string | null;
          session_id: string;
          time: string | null;
          unread: number | null;
          updated_at: string | null;
        };
        Insert: {
          address?: string | null;
          avatar?: string | null;
          client_name?: string | null;
          client_size?: string | null;
          client_type?: string | null;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          last_message?: string | null;
          name: string;
          phone?: string | null;
          session_id: string;
          time?: string | null;
          unread?: number | null;
          updated_at?: string | null;
        };
        Update: {
          address?: string | null;
          avatar?: string | null;
          client_name?: string | null;
          client_size?: string | null;
          client_type?: string | null;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          last_message?: string | null;
          name?: string;
          phone?: string | null;
          session_id?: string;
          time?: string | null;
          unread?: number | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      custom_field_audit_log: {
        Row: {
          change_type: string;
          changed_by: string | null;
          client_id: string;
          created_at: string;
          field_id: string;
          id: string;
          new_value: Json | null;
          old_value: Json | null;
        };
        Insert: {
          change_type: string;
          changed_by?: string | null;
          client_id: string;
          created_at?: string;
          field_id: string;
          id?: string;
          new_value?: Json | null;
          old_value?: Json | null;
        };
        Update: {
          change_type?: string;
          changed_by?: string | null;
          client_id?: string;
          created_at?: string;
          field_id?: string;
          id?: string;
          new_value?: Json | null;
          old_value?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "custom_field_audit_log_field_id_fkey";
            columns: ["field_id"];
            isOneToOne: false;
            referencedRelation: "custom_fields";
            referencedColumns: ["id"];
          },
        ];
      };
      custom_field_validation_rules: {
        Row: {
          created_at: string;
          error_message: string;
          field_id: string;
          id: string;
          rule_type: string;
          rule_value: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          error_message: string;
          field_id: string;
          id?: string;
          rule_type: string;
          rule_value?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          error_message?: string;
          field_id?: string;
          id?: string;
          rule_type?: string;
          rule_value?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "custom_field_validation_rules_field_id_fkey";
            columns: ["field_id"];
            isOneToOne: false;
            referencedRelation: "custom_fields";
            referencedColumns: ["id"];
          },
        ];
      };
      custom_fields: {
        Row: {
          category: string;
          created_at: string;
          deleted_at: string | null;
          field_name: string;
          field_options: Json | null;
          field_type: string;
          id: string;
          is_required: boolean;
          updated_at: string;
        };
        Insert: {
          category?: string;
          created_at?: string;
          deleted_at?: string | null;
          field_name: string;
          field_options?: Json | null;
          field_type: string;
          id?: string;
          is_required?: boolean;
          updated_at?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          deleted_at?: string | null;
          field_name?: string;
          field_options?: Json | null;
          field_type?: string;
          id?: string;
          is_required?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      dados_cliente_backup: {
        Row: {
          asaas_customer_id: string | null;
          client_name: string | null;
          client_size: string | null;
          client_type: string | null;
          cpf_cnpj: string | null;
          created_at: string;
          email: string | null;
          id: number;
          kanban_stage: string | null;
          nome: string | null;
          nome_pet: string | null;
          payments: Json | null;
          porte_pet: string | null;
          raca_pet: string | null;
          sessionid: string | null;
          telefone: string | null;
        };
        Insert: {
          asaas_customer_id?: string | null;
          client_name?: string | null;
          client_size?: string | null;
          client_type?: string | null;
          cpf_cnpj?: string | null;
          created_at?: string;
          email?: string | null;
          id?: number;
          kanban_stage?: string | null;
          nome?: string | null;
          nome_pet?: string | null;
          payments?: Json | null;
          porte_pet?: string | null;
          raca_pet?: string | null;
          sessionid?: string | null;
          telefone?: string | null;
        };
        Update: {
          asaas_customer_id?: string | null;
          client_name?: string | null;
          client_size?: string | null;
          client_type?: string | null;
          cpf_cnpj?: string | null;
          created_at?: string;
          email?: string | null;
          id?: number;
          kanban_stage?: string | null;
          nome?: string | null;
          nome_pet?: string | null;
          payments?: Json | null;
          porte_pet?: string | null;
          raca_pet?: string | null;
          sessionid?: string | null;
          telefone?: string | null;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          content: string | null;
          embedding: string | null;
          id: number;
          metadata: Json | null;
          titulo: string | null;
        };
        Insert: {
          content?: string | null;
          embedding?: string | null;
          id?: number;
          metadata?: Json | null;
          titulo?: string | null;
        };
        Update: {
          content?: string | null;
          embedding?: string | null;
          id?: number;
          metadata?: Json | null;
          titulo?: string | null;
        };
        Relationships: [];
      };
      imagens_drive: {
        Row: {
          created_at: string | null;
          drive_id: string;
          id: number;
          nome: string;
        };
        Insert: {
          created_at?: string | null;
          drive_id: string;
          id?: number;
          nome: string;
        };
        Update: {
          created_at?: string | null;
          drive_id?: string;
          id?: number;
          nome?: string;
        };
        Relationships: [];
      };
      kanban_stages: {
        Row: {
          created_at: string;
          id: string;
          ordering: number;
          settings: Json | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          ordering?: number;
          settings?: Json | null;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          ordering?: number;
          settings?: Json | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      n8n_chat_memory: {
        Row: {
          id: number;
          session_id: string;
          message: Json;
          data: string | null;
          hora: string | null;
          created_at: string;
          memory_type: string | null;
          memory_level: string | null;
          expiration_date: string | null;
          importance: number | null;
          entities: Json | null;
          relationships: Json | null;
          context: Json | null;
          metadata: Json | null;
        };
        Insert: {
          id?: number;
          session_id: string;
          message: Json;
          data?: string | null;
          hora?: string | null;
          created_at?: string;
          memory_type?: string | null;
          memory_level?: string | null;
          expiration_date?: string | null;
          importance?: number | null;
          entities?: Json | null;
          relationships?: Json | null;
          context?: Json | null;
          metadata?: Json | null;
        };
        Update: {
          id?: number;
          session_id?: string;
          message?: Json;
          data?: string | null;
          hora?: string | null;
          created_at?: string;
          memory_type?: string | null;
          memory_level?: string | null;
          expiration_date?: string | null;
          importance?: number | null;
          entities?: Json | null;
          relationships?: Json | null;
          context?: Json | null;
          metadata?: Json | null;
        };
        Relationships: [];
      };
      n8n_chat_histories: {
        Row: {
          data: string | null;
          hora: string | null;
          id: number;
          message: Json | null;
          session_id: string;
        };
        Insert: {
          data?: string | null;
          hora?: string | null;
          id?: number;
          message?: Json | null;
          session_id: string;
        };
        Update: {
          data?: string | null;
          hora?: string | null;
          id?: number;
          message?: Json | null;
          session_id?: string;
        };
        Relationships: [];
      };
      n8n_chat_history: {
        Row: {
          created_at: string | null;
          data: string | null;
          hora: string | null;
          id: number;
          message: Json;
          session_id: string;
        };
        Insert: {
          created_at?: string | null;
          data?: string | null;
          hora?: string | null;
          id?: number;
          message: Json;
          session_id: string;
        };
        Update: {
          created_at?: string | null;
          data?: string | null;
          hora?: string | null;
          id?: number;
          message?: Json;
          session_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string | null;
          email: string | null;
          full_name: string | null;
          id: string;
          role: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          id: string;
          role?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          role?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      tokens: {
        Row: {
          CachedTokens: string | null;
          CompletionTokens: string | null;
          CostUSD: number | null;
          id: number;
          Input: string | null;
          Output: string | null;
          PromptTokens: string | null;
          Timestamp: string;
          Workflow: string | null;
        };
        Insert: {
          CachedTokens?: string | null;
          CompletionTokens?: string | null;
          CostUSD?: number | null;
          id?: number;
          Input?: string | null;
          Output?: string | null;
          PromptTokens?: string | null;
          Timestamp?: string;
          Workflow?: string | null;
        };
        Update: {
          CachedTokens?: string | null;
          CompletionTokens?: string | null;
          CostUSD?: number | null;
          id?: number;
          Input?: string | null;
          Output?: string | null;
          PromptTokens?: string | null;
          Timestamp?: string;
          Workflow?: string | null;
        };
        Relationships: [];
      };
      utm_tracking: {
        Row: {
          device_type: string | null;
          fbclid: string | null;
          first_utm_campaign: string | null;
          first_utm_content: string | null;
          first_utm_created_at: string | null;
          first_utm_medium: string | null;
          first_utm_source: string | null;
          first_utm_term: string | null;
          gclid: string | null;
          gclientid: string | null;
          geo_location: Json | null;
          id: string;
          inserted_at: string | null;
          ip_address: unknown | null;
          landing_page: string | null;
          last_utm_campaign: string | null;
          last_utm_content: string | null;
          last_utm_created_at: string | null;
          last_utm_medium: string | null;
          last_utm_source: string | null;
          last_utm_term: string | null;
          lead_id: string | null;
          referrer: string | null;
          updated_at: string | null;
          user_agent: string | null;
          utm_campaign: string | null;
          utm_content: string | null;
          utm_conversion: boolean | null;
          utm_conversion_at: string | null;
          utm_conversion_stage: string | null;
          utm_conversion_time: unknown | null;
          utm_conversion_value: number | null;
          utm_created_at: string | null;
          utm_first_touch: string | null;
          utm_id: string | null;
          utm_last_touch: string | null;
          utm_medium: string | null;
          utm_referrer: string | null;
          utm_session_id: string | null;
          utm_source: string | null;
          utm_term: string | null;
        };
        Insert: {
          device_type?: string | null;
          fbclid?: string | null;
          first_utm_campaign?: string | null;
          first_utm_content?: string | null;
          first_utm_created_at?: string | null;
          first_utm_medium?: string | null;
          first_utm_source?: string | null;
          first_utm_term?: string | null;
          gclid?: string | null;
          gclientid?: string | null;
          geo_location?: Json | null;
          id?: string;
          inserted_at?: string | null;
          ip_address?: unknown | null;
          landing_page?: string | null;
          last_utm_campaign?: string | null;
          last_utm_content?: string | null;
          last_utm_created_at?: string | null;
          last_utm_medium?: string | null;
          last_utm_source?: string | null;
          last_utm_term?: string | null;
          lead_id?: string | null;
          referrer?: string | null;
          updated_at?: string | null;
          user_agent?: string | null;
          utm_campaign?: string | null;
          utm_content?: string | null;
          utm_conversion?: boolean | null;
          utm_conversion_at?: string | null;
          utm_conversion_stage?: string | null;
          utm_conversion_time?: unknown | null;
          utm_conversion_value?: number | null;
          utm_created_at?: string | null;
          utm_first_touch?: string | null;
          utm_id?: string | null;
          utm_last_touch?: string | null;
          utm_medium?: string | null;
          utm_referrer?: string | null;
          utm_session_id?: string | null;
          utm_source?: string | null;
          utm_term?: string | null;
        };
        Update: {
          device_type?: string | null;
          fbclid?: string | null;
          first_utm_campaign?: string | null;
          first_utm_content?: string | null;
          first_utm_created_at?: string | null;
          first_utm_medium?: string | null;
          first_utm_source?: string | null;
          first_utm_term?: string | null;
          gclid?: string | null;
          gclientid?: string | null;
          geo_location?: Json | null;
          id?: string;
          inserted_at?: string | null;
          ip_address?: unknown | null;
          landing_page?: string | null;
          last_utm_campaign?: string | null;
          last_utm_content?: string | null;
          last_utm_created_at?: string | null;
          last_utm_medium?: string | null;
          last_utm_source?: string | null;
          last_utm_term?: string | null;
          lead_id?: string | null;
          referrer?: string | null;
          updated_at?: string | null;
          user_agent?: string | null;
          utm_campaign?: string | null;
          utm_content?: string | null;
          utm_conversion?: boolean | null;
          utm_conversion_at?: string | null;
          utm_conversion_stage?: string | null;
          utm_conversion_time?: unknown | null;
          utm_conversion_value?: number | null;
          utm_created_at?: string | null;
          utm_first_touch?: string | null;
          utm_id?: string | null;
          utm_last_touch?: string | null;
          utm_medium?: string | null;
          utm_referrer?: string | null;
          utm_session_id?: string | null;
          utm_source?: string | null;
          utm_term?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "utm_tracking_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "utm_tracking_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "v_clients_complete";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      dados_cliente: {
        Row: {
          asaas_customer_id: string | null;
          client_name: string | null;
          client_size: string | null;
          client_type: string | null;
          cpf_cnpj: string | null;
          created_at: string | null;
          email: string | null;
          id: number | null;
          kanban_stage: string | null;
          nome: string | null;
          nome_pet: string | null;
          payments: Json | null;
          porte_pet: string | null;
          raca_pet: string | null;
          sessionid: string | null;
          telefone: string | null;
        };
        Relationships: [];
      };
      latest_chat_messages: {
        Row: {
          id: number | null;
          message: Json | null;
          message_time: string | null;
          session_id: string | null;
        };
        Relationships: [];
      };
      v_clients_complete: {
        Row: {
          address: string | null;
          asaas_customer_id: string | null;
          budget: number | null;
          client_name: string | null;
          client_objective: string | null;
          client_sector: string | null;
          client_size: string | null;
          client_type: string | null;
          consultation_stage: string | null;
          contract_date: string | null;
          contract_number: string | null;
          cpf_cnpj: string | null;
          created_at: string | null;
          custom_fields: Json | null;
          deleted_at: string | null;
          email: string | null;
          id: string | null;
          kanban_stage: string | null;
          last_contact: string | null;
          last_message: string | null;
          last_message_time: string | null;
          loss_reason: string | null;
          name: string | null;
          notes: string | null;
          payment: string | null;
          payment_method: string | null;
          phone: string | null;
          responsible_user: string | null;
          sales: number | null;
          session_id: string | null;
          status: string | null;
          tags: string[] | null;
          unread_count: number | null;
          uploaded_files: string[] | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      get_dashboard_metrics: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      get_utm_metrics: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      match_documents: {
        Args: { query_embedding: string; match_count?: number; filter?: Json };
        Returns: {
          id: number;
          content: string;
          metadata: Json;
          similarity: number;
        }[];
      };
      soft_delete_record: {
        Args: { table_name: string; record_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
