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
      client_stats: {
        Row: {
          avg_response_time: number | null
          client_id: string
          conversion_rate: number | null
          created_at: string | null
          id: string
          last_interaction: string | null
          satisfaction_score: number | null
          total_interactions: number | null
          total_revenue: number | null
          updated_at: string | null
        }
        Insert: {
          avg_response_time?: number | null
          client_id: string
          conversion_rate?: number | null
          created_at?: string | null
          id?: string
          last_interaction?: string | null
          satisfaction_score?: number | null
          total_interactions?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_response_time?: number | null
          client_id?: string
          conversion_rate?: number | null
          created_at?: string | null
          id?: string
          last_interaction?: string | null
          satisfaction_score?: number | null
          total_interactions?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_stats_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_stats_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "dados_cliente"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_stats_client_id_fkey"
            columns: ["client_id"]
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
          client_sector: string | null
          client_size: string | null
          client_type: string | null
          cpf_cnpj: string | null
          created_at: string | null
          custom_fields: Json | null
          email: string | null
          id: string
          kanban_stage: string | null
          last_contact: string | null
          last_message: string | null
          last_message_time: string | null
          name: string
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
        Insert: {
          address?: string | null
          asaas_customer_id?: string | null
          budget?: number | null
          client_name?: string | null
          client_sector?: string | null
          client_size?: string | null
          client_type?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          email?: string | null
          id?: string
          kanban_stage?: string | null
          last_contact?: string | null
          last_message?: string | null
          last_message_time?: string | null
          name: string
          notes?: string | null
          payment_method?: string | null
          phone?: string | null
          responsible_user?: string | null
          sales?: number | null
          session_id?: string | null
          status?: string | null
          tags?: string[] | null
          unread_count?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          asaas_customer_id?: string | null
          budget?: number | null
          client_name?: string | null
          client_sector?: string | null
          client_size?: string | null
          client_type?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          email?: string | null
          id?: string
          kanban_stage?: string | null
          last_contact?: string | null
          last_message?: string | null
          last_message_time?: string | null
          name?: string
          notes?: string | null
          payment_method?: string | null
          phone?: string | null
          responsible_user?: string | null
          sales?: number | null
          session_id?: string | null
          status?: string | null
          tags?: string[] | null
          unread_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      conversation_metrics: {
        Row: {
          avg_response_time: number | null
          contact_id: string
          conversation_duration: number | null
          created_at: string | null
          id: string
          message_count: number | null
          satisfaction_rating: number | null
          session_id: string | null
          updated_at: string | null
        }
        Insert: {
          avg_response_time?: number | null
          contact_id: string
          conversation_duration?: number | null
          created_at?: string | null
          id?: string
          message_count?: number | null
          satisfaction_rating?: number | null
          session_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avg_response_time?: number | null
          contact_id?: string
          conversation_duration?: number | null
          created_at?: string | null
          id?: string
          message_count?: number | null
          satisfaction_rating?: number | null
          session_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_metrics_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_metrics_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "dados_cliente"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_metrics_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "v_clients_complete"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_fields: {
        Row: {
          created_at: string | null
          default_value: string | null
          field_name: string
          field_type: string
          id: string
          is_required: boolean | null
          options: Json | null
          table_name: string
          updated_at: string | null
          validation_rules: Json | null
        }
        Insert: {
          created_at?: string | null
          default_value?: string | null
          field_name: string
          field_type: string
          id?: string
          is_required?: boolean | null
          options?: Json | null
          table_name: string
          updated_at?: string | null
          validation_rules?: Json | null
        }
        Update: {
          created_at?: string | null
          default_value?: string | null
          field_name?: string
          field_type?: string
          id?: string
          is_required?: boolean | null
          options?: Json | null
          table_name?: string
          updated_at?: string | null
          validation_rules?: Json | null
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
      faq: {
        Row: {
          answer: string
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          keywords: string[] | null
          question: string
          updated_at: string | null
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          question: string
          updated_at?: string | null
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          question?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      funnel_data: {
        Row: {
          conversion_rate: number | null
          created_at: string | null
          date: string
          id: string
          stage: string
          updated_at: string | null
          visitors: number | null
        }
        Insert: {
          conversion_rate?: number | null
          created_at?: string | null
          date: string
          id?: string
          stage: string
          updated_at?: string | null
          visitors?: number | null
        }
        Update: {
          conversion_rate?: number | null
          created_at?: string | null
          date?: string
          id?: string
          stage?: string
          updated_at?: string | null
          visitors?: number | null
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
      kanban_stages: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          order_position: number
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          order_position: number
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          order_position?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_from_user: boolean | null
          metadata: Json | null
          session_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_from_user?: boolean | null
          metadata?: Json | null
          session_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_from_user?: boolean | null
          metadata?: Json | null
          session_id?: string
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
      pricing: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          features: string[] | null
          id: string
          is_popular: boolean | null
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          is_popular?: boolean | null
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          is_popular?: boolean | null
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      schedule: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          id: string
          time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          time?: string
          title?: string
          updated_at?: string | null
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
      utm_metrics: {
        Row: {
          campaign: string | null
          clicks: number | null
          content: string | null
          conversions: number | null
          created_at: string | null
          date: string
          id: string
          medium: string | null
          source: string | null
          term: string | null
          updated_at: string | null
          visitors: number | null
        }
        Insert: {
          campaign?: string | null
          clicks?: number | null
          content?: string | null
          conversions?: number | null
          created_at?: string | null
          date: string
          id?: string
          medium?: string | null
          source?: string | null
          term?: string | null
          updated_at?: string | null
          visitors?: number | null
        }
        Update: {
          campaign?: string | null
          clicks?: number | null
          content?: string | null
          conversions?: number | null
          created_at?: string | null
          date?: string
          id?: string
          medium?: string | null
          source?: string | null
          term?: string | null
          updated_at?: string | null
          visitors?: number | null
        }
        Relationships: []
      }
      websites: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      dados_cliente: {
        Row: {
          address: string | null
          asaas_customer_id: string | null
          budget: number | null
          client_name: string | null
          client_sector: string | null
          client_size: string | null
          client_type: string | null
          cpf_cnpj: string | null
          created_at: string | null
          custom_fields: Json | null
          email: string | null
          id: string | null
          kanban_stage: string | null
          last_contact: string | null
          last_message: string | null
          last_message_time: string | null
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
        Relationships: []
      }
      v_clients_complete: {
        Row: {
          address: string | null
          asaas_customer_id: string | null
          budget: number | null
          client_name: string | null
          client_sector: string | null
          client_size: string | null
          client_type: string | null
          cpf_cnpj: string | null
          created_at: string | null
          custom_fields: Json | null
          email: string | null
          id: string | null
          kanban_stage: string | null
          last_contact: string | null
          last_message: string | null
          last_message_time: string | null
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
        Relationships: []
      }
    }
    Functions: {
      reorder_ai_stages: {
        Args: {
          personality_uuid: string
          stage_ids: string[]
        }
        Returns: undefined
      }
      update_updated_at_column: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[keyof Database]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
        PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
        PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
    ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never
