-- Migração para consolidar as tabelas n8n_chat_histories e n8n_chat_history
-- e adicionar campos para suportar novos tipos de memória

-- 1. Criar uma nova tabela consolidada com todos os campos necessários
CREATE TABLE IF NOT EXISTS n8n_chat_memory (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  message JSONB NOT NULL,
  data TEXT,
  hora TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Novos campos para suportar diferentes tipos de memória
  memory_type TEXT, -- 'contextual', 'semantic', 'episodic'
  memory_level TEXT, -- 'short_term', 'medium_term', 'long_term'
  expiration_date TIMESTAMP WITH TIME ZONE, -- Para memória de curto prazo
  importance INTEGER, -- Valor de 1-10 para determinar importância da memória
  entities JSONB, -- Para armazenar entidades mencionadas (memória semântica)
  relationships JSONB, -- Para armazenar relacionamentos entre entidades
  context JSONB, -- Contexto adicional para a memória
  metadata JSONB, -- Metadados adicionais (tags, categorias, etc.)

  -- Índices para melhorar performance de consultas
  CONSTRAINT unique_session_message UNIQUE (session_id, id)
);

-- 2. Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_n8n_chat_memory_session_id ON n8n_chat_memory(session_id);
CREATE INDEX IF NOT EXISTS idx_n8n_chat_memory_memory_type ON n8n_chat_memory(memory_type);
CREATE INDEX IF NOT EXISTS idx_n8n_chat_memory_memory_level ON n8n_chat_memory(memory_level);
CREATE INDEX IF NOT EXISTS idx_n8n_chat_memory_created_at ON n8n_chat_memory(created_at);

-- 3. Migrar dados da tabela n8n_chat_histories para a nova tabela
INSERT INTO n8n_chat_memory (session_id, message, data, hora, created_at)
SELECT
  session_id,
  message,
  data,
  hora,
  COALESCE(hora::timestamp with time zone, data::timestamp with time zone, NOW())
FROM n8n_chat_histories
ON CONFLICT (session_id, id) DO NOTHING;

-- 4. Migrar dados da tabela n8n_chat_history para a nova tabela
INSERT INTO n8n_chat_memory (session_id, message, data, hora, created_at)
SELECT
  session_id,
  message,
  data,
  hora,
  COALESCE(created_at::timestamp with time zone, hora::timestamp with time zone, data::timestamp with time zone, NOW())
FROM n8n_chat_history
ON CONFLICT (session_id, id) DO NOTHING;

-- 5. Criar uma view para manter compatibilidade com código existente
CREATE OR REPLACE VIEW n8n_chat_histories AS
SELECT id, session_id, message, data, hora
FROM n8n_chat_memory;

CREATE OR REPLACE VIEW n8n_chat_history AS
SELECT id, session_id, message, data, hora, created_at
FROM n8n_chat_memory;

-- 6. Comentar as linhas abaixo e executar apenas após verificar que tudo está funcionando
-- DROP TABLE IF EXISTS n8n_chat_histories;
-- DROP TABLE IF EXISTS n8n_chat_history;
