export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_personality_settings: {
        Row: {
          created_at: string | null
          created_by: string | null
          custom_instructions: string | null
          description: string | null
          fallback_responses: Json | null
          greeting_message: string | null
          id: string
          is_active: boolean | null
          language: string | null
          max_tokens: number | null
          name: string
          personality_type: string
          response_style: string | null
          system_prompt: string | null
          temperature: number | null
          tone: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          custom_instructions?: string | null
          description?: string | null
          fallback_responses?: Json | null
          greeting_message?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          max_tokens?: number | null
          name: string
          personality_type: string
          response_style?: string | null
          system_prompt?: string | null
          temperature?: number | null
          tone?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          custom_instructions?: string | null
          description?: string | null
          fallback_responses?: Json | null
          greeting_message?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          max_tokens?: number | null
          name?: string
          personality_type?: string
          response_style?: string | null
          system_prompt?: string | null
          temperature?: number | null
          tone?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      ai_products: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          features: string[] | null
          icon: string | null
          id: string
          image: string | null
          name: string
          new: boolean | null
          popular: boolean | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          icon?: string | null
          id: string
          image?: string | null
          name: string
          new?: boolean | null
          popular?: boolean | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          icon?: string | null
          id?: string
          image?: string | null
          name?: string
          new?: boolean | null
          popular?: boolean | null
        }
        Relationships: []
      }
      ai_stages: {
        Row: {
          actions: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_final_stage: boolean | null
          name: string
          next_stage_id: string | null
          personality_id: string | null
          stage_order: number
          timeout_minutes: number | null
          trigger_conditions: Json | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          actions?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_final_stage?: boolean | null
          name: string
          next_stage_id?: string | null
          personality_id?: string | null
          stage_order: number
          timeout_minutes?: number | null
          trigger_conditions?: Json | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          actions?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_final_stage?: boolean | null
          name?: string
          next_stage_id?: string | null
          personality_id?: string | null
          stage_order?: number
          timeout_minutes?: number | null
          trigger_conditions?: Json | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_stages_next_stage_id_fkey"
            columns: ["next_stage_id"]
            isOneToOne: false
            referencedRelation: "ai_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_stages_personality_id_fkey"
            columns: ["personality_id"]
            isOneToOne: false
            referencedRelation: "ai_personality_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_type: string | null
          assigned_user: string | null
          calendar_event_id: string | null
          contact_id: string
          created_at: string | null
          duration_minutes: number | null
          id: string
          next_steps: string | null
          notes: string | null
          outcome: string | null
          preparation_notes: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_date: string
          appointment_type?: string | null
          assigned_user?: string | null
          calendar_event_id?: string | null
          contact_id: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          next_steps?: string | null
          notes?: string | null
          outcome?: string | null
          preparation_notes?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_type?: string | null
          assigned_user?: string | null
          calendar_event_id?: string | null
          contact_id?: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          next_steps?: string | null
          notes?: string | null
          outcome?: string | null
          preparation_notes?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_calendar_event_id_fkey"
            columns: ["calendar_event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "dados_cliente"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "v_clients_complete"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          operation: string
          record_id: string
          table_name: string
          user_agent: string | null
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          operation: string
          record_id: string
          table_name: string
          user_agent?: string | null
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          operation?: string
          record_id?: string
          table_name?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      calendar_attendees: {
        Row: {
          attendee_id: string | null
          attendee_type: string
          created_at: string | null
          email: string | null
          event_id: string
          id: string
          is_organizer: boolean | null
          name: string | null
          status: string | null
        }
        Insert: {
          attendee_id?: string | null
          attendee_type: string
          created_at?: string | null
          email?: string | null
          event_id: string
          id?: string
          is_organizer?: boolean | null
          name?: string | null
          status?: string | null
        }
        Update: {
          attendee_id?: string | null
          attendee_type?: string
          created_at?: string | null
          email?: string | null
          event_id?: string
          id?: string
          is_organizer?: boolean | null
          name?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          all_day: boolean | null
          contact_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_time: string
          event_type: string | null
          id: string
          location: string | null
          metadata: Json | null
          priority: string | null
          recurrence_rule: string | null
          start_time: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          all_day?: boolean | null
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time: string
          event_type?: string | null
          id?: string
          location?: string | null
          metadata?: Json | null
          priority?: string | null
          recurrence_rule?: string | null
          start_time: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          all_day?: boolean | null
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time?: string
          event_type?: string | null
          id?: string
          location?: string | null
          metadata?: Json | null
          priority?: string | null
          recurrence_rule?: string | null
          start_time?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "dados_cliente"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "v_clients_complete"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_data: {
        Row: {
          campaign_id: string | null
          clicks: number | null
          conversion_rate: number | null
          conversions: number | null
          cost: number | null
          cpc: number | null
          created_at: string | null
          ctr: number | null
          date: string
          id: string
          impressions: number | null
          revenue: number | null
          roas: number | null
          updated_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          clicks?: number | null
          conversion_rate?: number | null
          conversions?: number | null
          cost?: number | null
          cpc?: number | null
          created_at?: string | null
          ctr?: number | null
          date: string
          id?: string
          impressions?: number | null
          revenue?: number | null
          roas?: number | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          clicks?: number | null
          conversion_rate?: number | null
          conversions?: number | null
          cost?: number | null
          cpc?: number | null
          created_at?: string | null
          ctr?: number | null
          date?: string
          id?: string
          impressions?: number | null
          revenue?: number | null
          roas?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_data_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_recipients: {
        Row: {
          bounce_reason: string | null
          campaign_id: string
          clicked_at: string | null
          contact_id: string
          converted_at: string | null
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          opened_at: string | null
          sent_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          bounce_reason?: string | null
          campaign_id: string
          clicked_at?: string | null
          contact_id: string
          converted_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          bounce_reason?: string | null
          campaign_id?: string
          clicked_at?: string | null
          contact_id?: string
          converted_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_recipients_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_recipients_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "dados_cliente"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_recipients_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "v_clients_complete"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          budget: number | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          description: string | null
          end_date: string | null
          goals: Json | null
          id: string
          name: string
          settings: Json | null
          start_date: string | null
          status: string | null
          target_audience: Json | null
          type: string
          updated_at: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          budget?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          end_date?: string | null
          goals?: Json | null
          id?: string
          name: string
          settings?: Json | null
          start_date?: string | null
          status?: string | null
          target_audience?: Json | null
          type: string
          updated_at?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          budget?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          end_date?: string | null
          goals?: Json | null
          id?: string
          name?: string
          settings?: Json | null
          start_date?: string | null
          status?: string | null
          target_audience?: Json | null
          type?: string
          updated_at?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      client_custom_values: {
        Row: {
          client_id: string
          created_at: string
          field_id: string
          field_value: Json
          id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          field_id: string
          field_value: Json
          id?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          field_id?: string
          field_value?: Json
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_custom_values_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_custom_values_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "dados_cliente"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_custom_values_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_clients_complete"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_custom_values_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "custom_fields"
            referencedColumns: ["id"]
          },
        ]
      }
      client_stats: {
        Row: {
          created_at: string | null
          id: string
          new_clients_this_month: number | null
          total_chats: number | null
          total_clients: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          new_clients_this_month?: number | null
          total_chats?: number | null
          total_clients?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          new_clients_this_month?: number | null
          total_chats?: number | null
          total_clients?: number | null
        }
        Relationships: []
      }
      contact_stage_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          contact_id: string
          id: string
          metadata: Json | null
          new_stage: string
          old_stage: string | null
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          contact_id: string
          id?: string
          metadata?: Json | null
          new_stage: string
          old_stage?: string | null
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          contact_id?: string
          id?: string
          metadata?: Json | null
          new_stage?: string
          old_stage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_stage_history_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_stage_history_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "dados_cliente"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_stage_history_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "v_clients_complete"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          address: string | null
          asaas_customer_id: string | null
          budget: number | null
          client_name: string | null
          client_objective: string | null
          client_sector: string | null
          client_size: string | null
          client_type: string | null
          consultation_stage: string | null
          contract_date: string | null
          contract_number: string | null
          cpf_cnpj: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          id: string
          kanban_stage: string | null
          kanban_stage_id: string | null
          last_contact: string | null
          last_message: string | null
          last_message_time: string | null
          loss_reason: string | null
          name: string
          notes: string | null
          payment: string | null
          payment_method: string | null
          phone: string | null
          responsible_user: string | null
          sales: number | null
          session_id: string | null
          status: string | null
          tags: string[] | null
          unread_count: number | null
          updated_at: string | null
          uploaded_files: string[] | null
        }
        Insert: {
          address?: string | null
          asaas_customer_id?: string | null
          budget?: number | null
          client_name?: string | null
          client_objective?: string | null
          client_sector?: string | null
          client_size?: string | null
          client_type?: string | null
          consultation_stage?: string | null
          contract_date?: string | null
          contract_number?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          kanban_stage?: string | null
          kanban_stage_id?: string | null
          last_contact?: string | null
          last_message?: string | null
          last_message_time?: string | null
          loss_reason?: string | null
          name: string
          notes?: string | null
          payment?: string | null
          payment_method?: string | null
          phone?: string | null
          responsible_user?: string | null
          sales?: number | null
          session_id?: string | null
          status?: string | null
          tags?: string[] | null
          unread_count?: number | null
          updated_at?: string | null
          uploaded_files?: string[] | null
        }
        Update: {
          address?: string | null
          asaas_customer_id?: string | null
          budget?: number | null
          client_name?: string | null
          client_objective?: string | null
          client_sector?: string | null
          client_size?: string | null
          client_type?: string | null
          consultation_stage?: string | null
          contract_date?: string | null
          contract_number?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          kanban_stage?: string | null
          kanban_stage_id?: string | null
          last_contact?: string | null
          last_message?: string | null
          last_message_time?: string | null
          loss_reason?: string | null
          name?: string
          notes?: string | null
          payment?: string | null
          payment_method?: string | null
          phone?: string | null
          responsible_user?: string | null
          sales?: number | null
          session_id?: string | null
          status?: string | null
          tags?: string[] | null
          unread_count?: number | null
          updated_at?: string | null
          uploaded_files?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_kanban_stage_fk"
            columns: ["kanban_stage_id"]
            isOneToOne: false
            referencedRelation: "kanban_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_responsible_user_fk"
            columns: ["responsible_user"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_session_fk"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["session_id"]
          },
        ]
      }
      conversation_daily_data: {
        Row: {
          avg_resolution_time: unknown | null
          avg_response_time: unknown | null
          created_at: string | null
          date: string
          id: string
          new_conversations: number | null
          resolved_conversations: number | null
          satisfaction_score: number | null
          total_conversations: number | null
          updated_at: string | null
        }
        Insert: {
          avg_resolution_time?: unknown | null
          avg_response_time?: unknown | null
          created_at?: string | null
          date: string
          id?: string
          new_conversations?: number | null
          resolved_conversations?: number | null
          satisfaction_score?: number | null
          total_conversations?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_resolution_time?: unknown | null
          avg_response_time?: unknown | null
          created_at?: string | null
          date?: string
          id?: string
          new_conversations?: number | null
          resolved_conversations?: number | null
          satisfaction_score?: number | null
          total_conversations?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      conversation_metrics: {
        Row: {
          average_negotiated_value: number | null
          avg_closing_time: number | null
          avg_response_start_time: number | null
          avg_response_time: number | null
          conversion_rate: number | null
          created_at: string | null
          id: string
          is_stale: boolean | null
          negotiated_value: number | null
          previous_period_value: number | null
          response_rate: number | null
          secondary_response_rate: number | null
          total_conversations: number | null
          total_negotiating_value: number | null
          total_respondidas: number | null
          total_secondary_responses: number | null
        }
        Insert: {
          average_negotiated_value?: number | null
          avg_closing_time?: number | null
          avg_response_start_time?: number | null
          avg_response_time?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          id?: string
          is_stale?: boolean | null
          negotiated_value?: number | null
          previous_period_value?: number | null
          response_rate?: number | null
          secondary_response_rate?: number | null
          total_conversations?: number | null
          total_negotiating_value?: number | null
          total_respondidas?: number | null
          total_secondary_responses?: number | null
        }
        Update: {
          average_negotiated_value?: number | null
          avg_closing_time?: number | null
          avg_response_start_time?: number | null
          avg_response_time?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          id?: string
          is_stale?: boolean | null
          negotiated_value?: number | null
          previous_period_value?: number | null
          response_rate?: number | null
          secondary_response_rate?: number | null
          total_conversations?: number | null
          total_negotiating_value?: number | null
          total_respondidas?: number | null
          total_secondary_responses?: number | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          address: string | null
          avatar: string | null
          client_name: string | null
          client_size: string | null
          client_type: string | null
          created_at: string | null
          email: string | null
          id: string
          last_message: string | null
          name: string
          phone: string | null
          session_id: string
          time: string | null
          unread: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar?: string | null
          client_name?: string | null
          client_size?: string | null
          client_type?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_message?: string | null
          name: string
          phone?: string | null
          session_id: string
          time?: string | null
          unread?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar?: string | null
          client_name?: string | null
          client_size?: string | null
          client_type?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_message?: string | null
          name?: string
          phone?: string | null
          session_id?: string
          time?: string | null
          unread?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      conversion_by_time: {
        Row: {
          conversion_rate: number | null
          converted_leads: number | null
          created_at: string | null
          id: string
          period_value: string
          revenue_generated: number | null
          time_period: string
          total_leads: number | null
          updated_at: string | null
        }
        Insert: {
          conversion_rate?: number | null
          converted_leads?: number | null
          created_at?: string | null
          id?: string
          period_value: string
          revenue_generated?: number | null
          time_period: string
          total_leads?: number | null
          updated_at?: string | null
        }
        Update: {
          conversion_rate?: number | null
          converted_leads?: number | null
          created_at?: string | null
          id?: string
          period_value?: string
          revenue_generated?: number | null
          time_period?: string
          total_leads?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      coupon_redemptions: {
        Row: {
          coupon_id: string
          discount_amount: number
          id: string
          invoice_id: string | null
          redeemed_at: string | null
          user_id: string
        }
        Insert: {
          coupon_id: string
          discount_amount: number
          id?: string
          invoice_id?: string | null
          redeemed_at?: string | null
          user_id: string
        }
        Update: {
          coupon_id?: string
          discount_amount?: number
          id?: string
          invoice_id?: string | null
          redeemed_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "discount_coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_redemptions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_field_audit_log: {
        Row: {
          change_type: string
          changed_by: string | null
          client_id: string
          created_at: string
          field_id: string
          id: string
          new_value: Json | null
          old_value: Json | null
        }
        Insert: {
          change_type: string
          changed_by?: string | null
          client_id: string
          created_at?: string
          field_id: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
        }
        Update: {
          change_type?: string
          changed_by?: string | null
          client_id?: string
          created_at?: string
          field_id?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_field_audit_log_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "custom_fields"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_field_validation_rules: {
        Row: {
          created_at: string
          error_message: string
          field_id: string
          id: string
          rule_type: string
          rule_value: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_message: string
          field_id: string
          id?: string
          rule_type: string
          rule_value?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string
          field_id?: string
          id?: string
          rule_type?: string
          rule_value?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_field_validation_rules_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "custom_fields"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_fields: {
        Row: {
          category: string
          created_at: string
          deleted_at: string | null
          field_name: string
          field_options: Json | null
          field_type: string
          id: string
          is_required: boolean
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          deleted_at?: string | null
          field_name: string
          field_options?: Json | null
          field_type: string
          id?: string
          is_required?: boolean
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          deleted_at?: string | null
          field_name?: string
          field_options?: Json | null
          field_type?: string
          id?: string
          is_required?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      discount_coupons: {
        Row: {
          applicable_plans: string[] | null
          code: string
          created_at: string | null
          currency: string | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_discount: number | null
          min_amount: number | null
          name: string
          updated_at: string | null
          usage_count: number | null
          usage_limit: number | null
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          applicable_plans?: string[] | null
          code: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_amount?: number | null
          name: string
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          applicable_plans?: string[] | null
          code?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_amount?: number | null
          name?: string
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
          titulo: string | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
          titulo?: string | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
          titulo?: string | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          html_content: string | null
          id: string
          is_active: boolean | null
          name: string
          subject: string
          template_type: string | null
          text_content: string | null
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          html_content?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          template_type?: string | null
          text_content?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          html_content?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          template_type?: string | null
          text_content?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      faq_items: {
        Row: {
          answer: string
          category: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          question: string
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          answer: string
          category?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          question: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          question?: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      funnel_data: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string | null
          percentage: number | null
          value: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          percentage?: number | null
          value?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          percentage?: number | null
          value?: number | null
        }
        Relationships: []
      }
      imagens_drive: {
        Row: {
          created_at: string | null
          drive_id: string
          id: number
          nome: string
        }
        Insert: {
          created_at?: string | null
          drive_id: string
          id?: number
          nome: string
        }
        Update: {
          created_at?: string | null
          drive_id?: string
          id?: number
          nome?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          invoice_id: string
          plan_id: string | null
          quantity: number | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          invoice_id: string
          plan_id?: string | null
          quantity?: number | null
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string
          plan_id?: string | null
          quantity?: number | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "pricing_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string | null
          currency: string | null
          discount_amount: number | null
          due_date: string
          id: string
          invoice_number: string
          notes: string | null
          paid_at: string | null
          payment_method_id: string | null
          status: string | null
          subscription_id: string | null
          subtotal: number
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          discount_amount?: number | null
          due_date: string
          id?: string
          invoice_number: string
          notes?: string | null
          paid_at?: string | null
          payment_method_id?: string | null
          status?: string | null
          subscription_id?: string | null
          subtotal?: number
          tax_amount?: number | null
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          discount_amount?: number | null
          due_date?: string
          id?: string
          invoice_number?: string
          notes?: string | null
          paid_at?: string | null
          payment_method_id?: string | null
          status?: string | null
          subscription_id?: string | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_stages: {
        Row: {
          created_at: string
          id: string
          ordering: number
          settings: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ordering?: number
          settings?: Json | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ordering?: number
          settings?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      leads_by_source: {
        Row: {
          conversion_rate: number | null
          converted_leads: number | null
          cost_per_lead: number | null
          created_at: string | null
          id: string
          revenue_generated: number | null
          roi: number | null
          source: string
          total_leads: number | null
          updated_at: string | null
        }
        Insert: {
          conversion_rate?: number | null
          converted_leads?: number | null
          cost_per_lead?: number | null
          created_at?: string | null
          id?: string
          revenue_generated?: number | null
          roi?: number | null
          source: string
          total_leads?: number | null
          updated_at?: string | null
        }
        Update: {
          conversion_rate?: number | null
          converted_leads?: number | null
          cost_per_lead?: number | null
          created_at?: string | null
          id?: string
          revenue_generated?: number | null
          roi?: number | null
          source?: string
          total_leads?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      leads_over_time: {
        Row: {
          conversions_count: number | null
          created_at: string | null
          date: string
          id: string
          leads_count: number | null
          revenue: number | null
          source: string
          updated_at: string | null
        }
        Insert: {
          conversions_count?: number | null
          created_at?: string | null
          date: string
          id?: string
          leads_count?: number | null
          revenue?: number | null
          source: string
          updated_at?: string | null
        }
        Update: {
          conversions_count?: number | null
          created_at?: string | null
          date?: string
          id?: string
          leads_count?: number | null
          revenue?: number | null
          source?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      monthly_growth: {
        Row: {
          active_users: number | null
          arr: number | null
          churned_users: number | null
          closed_deals: number | null
          conversion_rate: number | null
          created_at: string | null
          deal_value: number | null
          id: string
          month_year: string
          mrr: number | null
          new_deals: number | null
          new_users: number | null
          revenue: number | null
          updated_at: string | null
        }
        Insert: {
          active_users?: number | null
          arr?: number | null
          churned_users?: number | null
          closed_deals?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          deal_value?: number | null
          id?: string
          month_year: string
          mrr?: number | null
          new_deals?: number | null
          new_users?: number | null
          revenue?: number | null
          updated_at?: string | null
        }
        Update: {
          active_users?: number | null
          arr?: number | null
          churned_users?: number | null
          closed_deals?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          deal_value?: number | null
          id?: string
          month_year?: string
          mrr?: number | null
          new_deals?: number | null
          new_users?: number | null
          revenue?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      n8n_chat_histories_old: {
        Row: {
          data: string | null
          hora: string | null
          id: number
          message: Json | null
          session_id: string
        }
        Insert: {
          data?: string | null
          hora?: string | null
          id?: number
          message?: Json | null
          session_id: string
        }
        Update: {
          data?: string | null
          hora?: string | null
          id?: number
          message?: Json | null
          session_id?: string
        }
        Relationships: []
      }
      n8n_chat_history_old: {
        Row: {
          created_at: string | null
          data: string | null
          hora: string | null
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          created_at?: string | null
          data?: string | null
          hora?: string | null
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          created_at?: string | null
          data?: string | null
          hora?: string | null
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      n8n_chat_memory: {
        Row: {
          context: Json | null
          created_at: string | null
          data: string | null
          entities: Json | null
          expiration_date: string | null
          hora: string | null
          id: number
          importance: number | null
          memory_level: string | null
          memory_type: string | null
          message: Json
          metadata: Json | null
          relationships: Json | null
          session_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          data?: string | null
          entities?: Json | null
          expiration_date?: string | null
          hora?: string | null
          id?: number
          importance?: number | null
          memory_level?: string | null
          memory_type?: string | null
          message: Json
          metadata?: Json | null
          relationships?: Json | null
          session_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          data?: string | null
          entities?: Json | null
          expiration_date?: string | null
          hora?: string | null
          id?: number
          importance?: number | null
          memory_level?: string | null
          memory_type?: string | null
          message?: Json
          metadata?: Json | null
          relationships?: Json | null
          session_id?: string
        }
        Relationships: []
      }
      payment_history: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          failure_reason: string | null
          id: string
          invoice_id: string
          payment_method_id: string | null
          processed_at: string | null
          provider_response: Json | null
          provider_transaction_id: string | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          failure_reason?: string | null
          id?: string
          invoice_id: string
          payment_method_id?: string | null
          processed_at?: string | null
          provider_response?: Json | null
          provider_transaction_id?: string | null
          status: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          failure_reason?: string | null
          id?: string
          invoice_id?: string
          payment_method_id?: string | null
          processed_at?: string | null
          provider_response?: Json | null
          provider_transaction_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_history_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          card_brand: string | null
          created_at: string | null
          expiry_month: number | null
          expiry_year: number | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          last_four_digits: string | null
          provider: string | null
          provider_payment_method_id: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          card_brand?: string | null
          created_at?: string | null
          expiry_month?: number | null
          expiry_year?: number | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          last_four_digits?: string | null
          provider?: string | null
          provider_payment_method_id?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          card_brand?: string | null
          created_at?: string | null
          expiry_month?: number | null
          expiry_year?: number | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          last_four_digits?: string | null
          provider?: string | null
          provider_payment_method_id?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pricing_plans: {
        Row: {
          billing_cycle: string
          created_at: string | null
          currency: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          limits: Json | null
          name: string
          price: number
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          billing_cycle: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          limits?: Json | null
          name: string
          price: number
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          billing_cycle?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          limits?: Json | null
          name?: string
          price?: number
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      product_combo_items: {
        Row: {
          combo_id: string
          product_id: string
        }
        Insert: {
          combo_id: string
          product_id: string
        }
        Update: {
          combo_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_combo_items_combo_id_fkey"
            columns: ["combo_id"]
            isOneToOne: false
            referencedRelation: "product_combos"
            referencedColumns: ["id"]
          },
        ]
      }
      product_combos: {
        Row: {
          created_at: string | null
          description: string | null
          discount_percentage: number | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          benefits: string[] | null
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          differentials: string[] | null
          features: string[] | null
          has_combo: boolean | null
          has_promotion: boolean | null
          has_upgrade: boolean | null
          icon: string | null
          id: string
          image: string | null
          name: string
          new: boolean | null
          objections: string[] | null
          popular: boolean | null
          price: number | null
          success_cases: string[] | null
          updated_at: string | null
        }
        Insert: {
          benefits?: string[] | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          differentials?: string[] | null
          features?: string[] | null
          has_combo?: boolean | null
          has_promotion?: boolean | null
          has_upgrade?: boolean | null
          icon?: string | null
          id?: string
          image?: string | null
          name: string
          new?: boolean | null
          objections?: string[] | null
          popular?: boolean | null
          price?: number | null
          success_cases?: string[] | null
          updated_at?: string | null
        }
        Update: {
          benefits?: string[] | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          differentials?: string[] | null
          features?: string[] | null
          has_combo?: boolean | null
          has_promotion?: boolean | null
          has_upgrade?: boolean | null
          icon?: string | null
          id?: string
          image?: string | null
          name?: string
          new?: boolean | null
          objections?: string[] | null
          popular?: boolean | null
          price?: number | null
          success_cases?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          department: string | null
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          last_login_at: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          last_login_at?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      stage_name_mapping: {
        Row: {
          created_at: string | null
          id: string
          new_name: string
          old_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          new_name: string
          old_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          new_name?: string
          old_name?: string
        }
        Relationships: []
      }
      tokens: {
        Row: {
          CachedTokens: string | null
          CompletionTokens: string | null
          CostUSD: number | null
          id: number
          Input: string | null
          Output: string | null
          PromptTokens: string | null
          Timestamp: string
          Workflow: string | null
        }
        Insert: {
          CachedTokens?: string | null
          CompletionTokens?: string | null
          CostUSD?: number | null
          id?: number
          Input?: string | null
          Output?: string | null
          PromptTokens?: string | null
          Timestamp?: string
          Workflow?: string | null
        }
        Update: {
          CachedTokens?: string | null
          CompletionTokens?: string | null
          CostUSD?: number | null
          id?: number
          Input?: string | null
          Output?: string | null
          PromptTokens?: string | null
          Timestamp?: string
          Workflow?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          auto_renew: boolean | null
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          end_date: string | null
          id: string
          last_payment_date: string | null
          next_billing_date: string | null
          payment_method_id: string | null
          plan_id: string
          start_date: string
          status: string | null
          trial_end_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_renew?: boolean | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          last_payment_date?: string | null
          next_billing_date?: string | null
          payment_method_id?: string | null
          plan_id: string
          start_date?: string
          status?: string | null
          trial_end_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_renew?: boolean | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          last_payment_date?: string | null
          next_billing_date?: string | null
          payment_method_id?: string | null
          plan_id?: string
          start_date?: string
          status?: string | null
          trial_end_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_subscriptions_payment_method"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "pricing_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_usage_metrics: {
        Row: {
          created_at: string | null
          id: string
          month_year: string
          total_conversations: number | null
          total_expenses: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          month_year: string
          total_conversations?: number | null
          total_expenses?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          month_year?: string
          total_conversations?: number | null
          total_expenses?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      utm_metrics: {
        Row: {
          conversion_rate: number | null
          created_at: string | null
          id: string
          is_stale: boolean | null
          total_campaigns: number | null
          total_leads: number | null
        }
        Insert: {
          conversion_rate?: number | null
          created_at?: string | null
          id?: string
          is_stale?: boolean | null
          total_campaigns?: number | null
          total_leads?: number | null
        }
        Update: {
          conversion_rate?: number | null
          created_at?: string | null
          id?: string
          is_stale?: boolean | null
          total_campaigns?: number | null
          total_leads?: number | null
        }
        Relationships: []
      }
      utm_tracking: {
        Row: {
          created_at: string | null
          device_type: string | null
          fbclid: string | null
          first_seen_at: string | null
          first_utm_campaign: string | null
          first_utm_content: string | null
          first_utm_created_at: string | null
          first_utm_medium: string | null
          first_utm_source: string | null
          first_utm_term: string | null
          gclid: string | null
          gclientid: string | null
          geo_location: Json | null
          id: string
          ip_address: unknown | null
          landing_page: string | null
          last_utm_campaign: string | null
          last_utm_content: string | null
          last_utm_created_at: string | null
          last_utm_medium: string | null
          last_utm_source: string | null
          last_utm_term: string | null
          lead_id: string | null
          referrer: string | null
          updated_at: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_conversion: boolean | null
          utm_conversion_at: string | null
          utm_conversion_stage: string | null
          utm_conversion_time: unknown | null
          utm_conversion_value: number | null
          utm_first_touch: string | null
          utm_id: string | null
          utm_last_touch: string | null
          utm_medium: string | null
          utm_referrer: string | null
          utm_session_id: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          created_at?: string | null
          device_type?: string | null
          fbclid?: string | null
          first_seen_at?: string | null
          first_utm_campaign?: string | null
          first_utm_content?: string | null
          first_utm_created_at?: string | null
          first_utm_medium?: string | null
          first_utm_source?: string | null
          first_utm_term?: string | null
          gclid?: string | null
          gclientid?: string | null
          geo_location?: Json | null
          id?: string
          ip_address?: unknown | null
          landing_page?: string | null
          last_utm_campaign?: string | null
          last_utm_content?: string | null
          last_utm_created_at?: string | null
          last_utm_medium?: string | null
          last_utm_source?: string | null
          last_utm_term?: string | null
          lead_id?: string | null
          referrer?: string | null
          updated_at?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_conversion?: boolean | null
          utm_conversion_at?: string | null
          utm_conversion_stage?: string | null
          utm_conversion_time?: unknown | null
          utm_conversion_value?: number | null
          utm_first_touch?: string | null
          utm_id?: string | null
          utm_last_touch?: string | null
          utm_medium?: string | null
          utm_referrer?: string | null
          utm_session_id?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          created_at?: string | null
          device_type?: string | null
          fbclid?: string | null
          first_seen_at?: string | null
          first_utm_campaign?: string | null
          first_utm_content?: string | null
          first_utm_created_at?: string | null
          first_utm_medium?: string | null
          first_utm_source?: string | null
          first_utm_term?: string | null
          gclid?: string | null
          gclientid?: string | null
          geo_location?: Json | null
          id?: string
          ip_address?: unknown | null
          landing_page?: string | null
          last_utm_campaign?: string | null
          last_utm_content?: string | null
          last_utm_created_at?: string | null
          last_utm_medium?: string | null
          last_utm_source?: string | null
          last_utm_term?: string | null
          lead_id?: string | null
          referrer?: string | null
          updated_at?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_conversion?: boolean | null
          utm_conversion_at?: string | null
          utm_conversion_stage?: string | null
          utm_conversion_time?: unknown | null
          utm_conversion_value?: number | null
          utm_first_touch?: string | null
          utm_id?: string | null
          utm_last_touch?: string | null
          utm_medium?: string | null
          utm_referrer?: string | null
          utm_session_id?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "utm_tracking_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "utm_tracking_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "dados_cliente"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "utm_tracking_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "v_clients_complete"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      conversation_metrics_view: {
        Row: {
          avg_unread_messages: number | null
          month: string | null
          total_conversations: number | null
        }
        Relationships: []
      }
      conversion_funnel_view: {
        Row: {
          color: string | null
          created_at: string | null
          name: string | null
          percentage: number | null
          value: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          name?: string | null
          percentage?: number | null
          value?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          name?: string | null
          percentage?: number | null
          value?: number | null
        }
        Relationships: []
      }
      dados_cliente: {
        Row: {
          address: string | null
          asaas_customer_id: string | null
          budget: number | null
          client_name: string | null
          client_objective: string | null
          client_sector: string | null
          client_size: string | null
          client_type: string | null
          consultation_stage: string | null
          cpf_cnpj: string | null
          created_at: string | null
          custom_fields_jsonb: Json | null
          deleted_at: string | null
          email: string | null
          id: string | null
          kanban_stage: string | null
          kanban_stage_id: string | null
          last_contact: string | null
          last_message: string | null
          last_message_time: string | null
          message_count: number | null
          name: string | null
          notes: string | null
          payment_method: string | null
          phone: string | null
          responsible_user: string | null
          sales: number | null
          session_id: string | null
          status: string | null
          tags: string[] | null
          unread_count: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_kanban_stage_fk"
            columns: ["kanban_stage_id"]
            isOneToOne: false
            referencedRelation: "kanban_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_responsible_user_fk"
            columns: ["responsible_user"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_session_fk"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["session_id"]
          },
        ]
      }
      dashboard_metrics: {
        Row: {
          conversion_rate: number | null
          negotiated_value: number | null
          new_clients_this_month: number | null
          response_rate: number | null
          total_campaigns: number | null
          total_chats: number | null
          total_clients: number | null
          total_conversations: number | null
          total_leads: number | null
        }
        Relationships: []
      }
      latest_chat_messages: {
        Row: {
          id: number | null
          message: Json | null
          message_time: string | null
          session_id: string | null
        }
        Relationships: []
      }
      n8n_chat_histories: {
        Row: {
          created_at: string | null
          data: string | null
          hora: string | null
          id: number | null
          message: Json | null
          session_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: string | null
          hora?: string | null
          id?: number | null
          message?: Json | null
          session_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: string | null
          hora?: string | null
          id?: number | null
          message?: Json | null
          session_id?: string | null
        }
        Relationships: []
      }
      n8n_chat_history: {
        Row: {
          created_at: string | null
          data: string | null
          hora: string | null
          id: number | null
          message: Json | null
          session_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: string | null
          hora?: string | null
          id?: number | null
          message?: Json | null
          session_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: string | null
          hora?: string | null
          id?: number | null
          message?: Json | null
          session_id?: string | null
        }
        Relationships: []
      }
      v_clients_complete: {
        Row: {
          address: string | null
          asaas_customer_id: string | null
          budget: number | null
          client_name: string | null
          client_objective: string | null
          client_sector: string | null
          client_size: string | null
          client_type: string | null
          consultation_stage: string | null
          cpf_cnpj: string | null
          created_at: string | null
          custom_fields_jsonb: Json | null
          deleted_at: string | null
          email: string | null
          id: string | null
          kanban_stage: string | null
          kanban_stage_id: string | null
          last_contact: string | null
          last_message: string | null
          last_message_time: string | null
          message_count: number | null
          name: string | null
          notes: string | null
          payment_method: string | null
          phone: string | null
          responsible_user: string | null
          sales: number | null
          session_id: string | null
          status: string | null
          tags: string[] | null
          unread_count: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_kanban_stage_fk"
            columns: ["kanban_stage_id"]
            isOneToOne: false
            referencedRelation: "kanban_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_responsible_user_fk"
            columns: ["responsible_user"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_session_fk"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["session_id"]
          },
        ]
      }
    }
    Functions: {
      calculate_daily_conversation_stats: {
        Args: { target_date?: string }
        Returns: undefined
      }
      export_schema_summary: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      f_contact_custom_fields: {
        Args: { _client_id: string }
        Returns: Json
      }
      get_contact_stage_history: {
        Args: { contact_uuid: string }
        Returns: {
          id: string
          old_stage: string
          new_stage: string
          changed_at: string
          changed_by: string
          metadata: Json
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_dashboard_metrics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_funnel_by_date_range: {
        Args: { start_date?: string; end_date?: string }
        Returns: {
          name: string
          value: number
          percentage: number
          color: string
        }[]
      }
      get_metrics_by_date_range: {
        Args: { start_date?: string; end_date?: string }
        Returns: {
          total_conversations: number
          response_rate: number
          conversion_rate: number
          negotiated_value: number
        }[]
      }
      get_stage_history_by_period: {
        Args: { start_date?: string; end_date?: string }
        Returns: {
          contact_id: string
          contact_name: string
          old_stage: string
          new_stage: string
          changed_at: string
          metadata: Json
        }[]
      }
      get_utm_metrics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      match_documents: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      normalize_stage_name: {
        Args: { input_stage: string }
        Returns: string
      }
      reorder_ai_stages: {
        Args: { personality_uuid: string; stage_ids: string[] }
        Returns: undefined
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      soft_delete_record: {
        Args: { table_name: string; record_id: string }
        Returns: boolean
      }
      update_user_usage_metrics: {
        Args: {
          _user_id: string
          _conversations_increment?: number
          _expenses_increment?: number
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
