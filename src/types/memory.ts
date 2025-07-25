// Definição de tipos para o sistema de memória da IA

/**
 * Tipos de memória suportados pelo sistema
 */
export type MemoryType = "contextual" | "semantic" | "episodic";

/**
 * Níveis de memória para diferentes durações
 */
export type MemoryLevel = "short_term" | "medium_term" | "long_term";

/**
 * Interface para entidades na memória semântica
 */
export interface SemanticEntity {
  name: string;
  type: string;
  attributes?: Record<string, unknown>;
  confidence?: number;
}

/**
 * Interface para relacionamentos entre entidades
 */
export interface EntityRelationship {
  source: string;
  target: string;
  type: string;
  relation?: string; // Backward compatibility
  attributes?: Record<string, unknown>;
  confidence?: number;
}

/**
 * Interface para memória episódica (sequência de eventos)
 */
export interface EpisodicMemory {
  id: number;
  date: string;
  description: string;
  events?: Array<{
    action: string;
    timestamp: string;
    actors: string[];
    context?: Record<string, unknown>;
  }>;
  summary?: string;
  details?: Record<string, unknown>;
}

/**
 * Interface principal para a tabela n8n_chat_memory
 */
export interface N8nChatMemory {
  id: number;
  session_id: string;
  message: unknown;
  data?: string;
  hora?: string;
  created_at?: string;

  // Novos campos para tipos de memória
  memory_type: MemoryType; // Required for Memory interface compatibility
  memory_level?: MemoryLevel;
  expiration_date?: string;
  importance?: number; // 1-10
  entities?: SemanticEntity[];
  relationships?: EntityRelationship[];
  context?: Record<string, unknown>;
  metadata?: {
    tags?: string[];
    categories?: string[];
    [key: string]: unknown;
  };
}

/**
 * Interface unificada para sistemas de memória
 */
export interface Memory {
  id: number;
  message: string;
  memory_type: MemoryType;
  created_at: string;
  importance?: number;
  entities?: Array<{ name: string }>;
  context?: Record<string, unknown>;
}
