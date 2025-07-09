// AI-related type definitions

export interface AIMessage {
  id: string;
  content: string;
  role: 'assistant' | 'user';
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AIStage {
  id: string;
  name: string;
  description?: string;
  stage_order: number;
  order_position?: number; // Backward compatibility
  is_active: boolean;
  personality_id?: string;
  actions?: any[];
  trigger_conditions?: Record<string, any>;
  timeout_minutes?: number;
  next_stage_id?: string;
  is_final_stage?: boolean;
  created_at?: string;
  updated_at?: string;
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
}