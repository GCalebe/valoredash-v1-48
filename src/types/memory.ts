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
  attributes?: Record<string, any>;
  confidence?: number;
}

/**
 * Interface para relacionamentos entre entidades
 */
export interface EntityRelationship {
  source: string;
  target: string;
  type: string;
  attributes?: Record<string, any>;
  confidence?: number;
}

/**
 * Interface para memória episódica (sequência de eventos)
 */
export interface EpisodicMemory {
  events: Array<{
    action: string;
    timestamp: string;
    actors: string[];
    context?: Record<string, any>;
  }>;
  summary?: string;
}

/**
 * Interface principal para a tabela n8n_chat_memory
 */
export interface N8nChatMemory {
  id: number;
  session_id: string;
  message: any;
  data?: string;
  hora?: string;
  created_at?: string;

  // Novos campos para tipos de memória
  memory_type?: MemoryType;
  memory_level?: MemoryLevel;
  expiration_date?: string;
  importance?: number; // 1-10
  entities?: SemanticEntity[];
  relationships?: EntityRelationship[];
  context?: Record<string, any>;
  metadata?: {
    tags?: string[];
    categories?: string[];
    [key: string]: any;
  };
}
