// AI-related type definitions

export interface AIMessage {
  id: string;
  content: string;
  role?: 'assistant' | 'user';
  timestamp?: string;
  category?: string;
  name?: string;
  variables?: string[];
  context?: string;
  is_active?: boolean;
  metadata?: Record<string, unknown>;
}

export interface AIStage {
  id: string;
  name: string;
  description?: string;
  stage_order?: number;
  order?: number;
  order_position?: number; // Backward compatibility
  is_active?: boolean;
  personality_id?: string;
  actions?: unknown[];
  trigger?: string;
  next_stage?: string;
  next_stage_id?: string;
  trigger_conditions?: Record<string, unknown>;
  timeout_minutes?: number;
  is_final_stage?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface AIPersonality {
  id: string;
  name: string;
  description?: string;
  personality_type: string;
  system_prompt?: string;
  greeting_message?: string;
  response_style?: string;
  tone?: string;
  language?: string;
  temperature?: number;
  max_tokens?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  custom_instructions?: string;
  fallback_responses?: unknown;
}