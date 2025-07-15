// =====================================================
// TIPOS TYPESCRIPT PARA SUPABASE DATABASE
// Gerados automaticamente baseados no schema SQL
// =====================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      contacts: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          address: string | null;
          client_name: string | null;
          client_size: string | null;
          client_type: string | null;
          cpf_cnpj: string | null;
          asaas_customer_id: string | null;
          status: string;
          notes: string | null;
          last_contact: string | null;
          kanban_stage: string | null;
          last_message: string | null;
          last_message_time: string | null;
          unread_count: number | null;
          session_id: string | null;
          tags: string[] | null;
          responsible_user: string | null;
          sales: number | null;
          client_sector: string | null;
          budget: number | null;
          payment_method: string | null;
          client_objective: string | null;
          loss_reason: string | null;
          contract_number: string | null;
          contract_date: string | null;
          payment: string | null;
          uploaded_files: string[] | null;
          consultation_stage: string | null;
          custom_values: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          client_name?: string | null;
          client_size?: string | null;
          client_type?: string | null;
          cpf_cnpj?: string | null;
          asaas_customer_id?: string | null;
          status?: string;
          notes?: string | null;
          last_contact?: string | null;
          kanban_stage?: string | null;
          last_message?: string | null;
          last_message_time?: string | null;
          unread_count?: number | null;
          session_id?: string | null;
          tags?: string[] | null;
          responsible_user?: string | null;
          sales?: number | null;
          client_sector?: string | null;
          budget?: number | null;
          payment_method?: string | null;
          client_objective?: string | null;
          loss_reason?: string | null;
          contract_number?: string | null;
          contract_date?: string | null;
          payment?: string | null;
          uploaded_files?: string[] | null;
          consultation_stage?: string | null;
          custom_values?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          client_name?: string | null;
          client_size?: string | null;
          client_type?: string | null;
          cpf_cnpj?: string | null;
          asaas_customer_id?: string | null;
          status?: string;
          notes?: string | null;
          last_contact?: string | null;
          kanban_stage?: string | null;
          last_message?: string | null;
          last_message_time?: string | null;
          unread_count?: number | null;
          session_id?: string | null;
          tags?: string[] | null;
          responsible_user?: string | null;
          sales?: number | null;
          client_sector?: string | null;
          budget?: number | null;
          payment_method?: string | null;
          client_objective?: string | null;
          loss_reason?: string | null;
          contract_number?: string | null;
          contract_date?: string | null;
          payment?: string | null;
          uploaded_files?: string[] | null;
          consultation_stage?: string | null;
          custom_values?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      client_stats: {
        Row: {
          id: string;
          total_clients: number | null;
          total_chats: number | null;
          new_clients_this_month: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          total_clients?: number | null;
          total_chats?: number | null;
          new_clients_this_month?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          total_clients?: number | null;
          total_chats?: number | null;
          new_clients_this_month?: number | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      conversation_metrics: {
        Row: {
          id: string;
          total_conversations: number | null;
          response_rate: number | null;
          total_respondidas: number | null;
          avg_response_time: number | null;
          conversion_rate: number | null;
          avg_closing_time: number | null;
          avg_response_start_time: number | null;
          secondary_response_rate: number | null;
          total_secondary_responses: number | null;
          negotiated_value: number | null;
          average_negotiated_value: number | null;
          total_negotiating_value: number | null;
          previous_period_value: number | null;
          is_stale: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          total_conversations?: number | null;
          response_rate?: number | null;
          total_respondidas?: number | null;
          avg_response_time?: number | null;
          conversion_rate?: number | null;
          avg_closing_time?: number | null;
          avg_response_start_time?: number | null;
          secondary_response_rate?: number | null;
          total_secondary_responses?: number | null;
          negotiated_value?: number | null;
          average_negotiated_value?: number | null;
          total_negotiating_value?: number | null;
          previous_period_value?: number | null;
          is_stale?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          total_conversations?: number | null;
          response_rate?: number | null;
          total_respondidas?: number | null;
          avg_response_time?: number | null;
          conversion_rate?: number | null;
          avg_closing_time?: number | null;
          avg_response_start_time?: number | null;
          secondary_response_rate?: number | null;
          total_secondary_responses?: number | null;
          negotiated_value?: number | null;
          average_negotiated_value?: number | null;
          total_negotiating_value?: number | null;
          previous_period_value?: number | null;
          is_stale?: boolean | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      funnel_data: {
        Row: {
          id: string;
          name: string | null;
          value: number | null;
          percentage: number | null;
          color: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name?: string | null;
          value?: number | null;
          percentage?: number | null;
          color?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          value?: number | null;
          percentage?: number | null;
          color?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      ai_products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon: string | null;
          image: string | null;
          features: string[] | null;
          category: string | null;
          popular: boolean | null;
          new: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          image?: string | null;
          features?: string[] | null;
          category?: string | null;
          popular?: boolean | null;
          new?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          icon?: string | null;
          image?: string | null;
          features?: string[] | null;
          category?: string | null;
          popular?: boolean | null;
          new?: boolean | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      utm_metrics: {
        Row: {
          id: string;
          total_campaigns: number | null;
          total_leads: number | null;
          conversion_rate: number | null;
          is_stale: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          total_campaigns?: number | null;
          total_leads?: number | null;
          conversion_rate?: number | null;
          is_stale?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          total_campaigns?: number | null;
          total_leads?: number | null;
          conversion_rate?: number | null;
          is_stale?: boolean | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      utm_tracking: {
        Row: {
          id: string;
          lead_id: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          utm_term: string | null;
          utm_content: string | null;
          utm_conversion: boolean | null;
          utm_conversion_value: number | null;
          utm_conversion_stage: string | null;
          landing_page: string | null;
          device_type: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          lead_id?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          utm_term?: string | null;
          utm_content?: string | null;
          utm_conversion?: boolean | null;
          utm_conversion_value?: number | null;
          utm_conversion_stage?: string | null;
          landing_page?: string | null;
          device_type?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          lead_id?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          utm_term?: string | null;
          utm_content?: string | null;
          utm_conversion?: boolean | null;
          utm_conversion_value?: number | null;
          utm_conversion_stage?: string | null;
          landing_page?: string | null;
          device_type?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      dashboard_metrics: {
        Row: {
          total_clients: number | null;
          total_chats: number | null;
          new_clients_this_month: number | null;
          total_conversations: number | null;
          response_rate: number | null;
          conversion_rate: number | null;
          negotiated_value: number | null;
          total_campaigns: number | null;
          total_leads: number | null;
        };
        Relationships: [];
      };
      conversion_funnel_view: {
        Row: {
          name: string | null;
          value: number | null;
          percentage: number | null;
          color: string | null;
          created_at: string | null;
        };
        Relationships: [];
      };
      leads_analysis: {
        Row: {
          month: string | null;
          clients: number | null;
          leads: number | null;
          source_name: string | null;
          source_value: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      get_metrics_by_date_range: {
        Args: {
          start_date?: string;
          end_date?: string;
        };
        Returns: {
          total_conversations: number;
          response_rate: number;
          conversion_rate: number;
          negotiated_value: number;
        }[];
      };
      get_funnel_by_date_range: {
        Args: {
          start_date?: string;
          end_date?: string;
        };
        Returns: {
          name: string;
          value: number;
          percentage: number;
          color: string;
        }[];
      };
    };
    Enums: {};
    CompositeTypes: {};
  };
}
