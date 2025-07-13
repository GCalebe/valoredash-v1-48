-- Fase 1: Exclusão das tabelas fragmentadas e criação da estrutura unificada

-- 1. Remover views de compatibilidade se existirem
DROP VIEW IF EXISTS n8n_chat_histories;
DROP VIEW IF EXISTS n8n_chat_history;

-- 2. Remover triggers e funções relacionadas
DROP TRIGGER IF EXISTS trigger_sync_conversation_data ON n8n_chat_memory;
DROP FUNCTION IF EXISTS sync_conversation_data();

-- 3. Excluir tabelas fragmentadas de chat
DROP TABLE IF EXISTS n8n_chat_memory CASCADE;
DROP TABLE IF EXISTS n8n_chat_histories_old CASCADE;
DROP TABLE IF EXISTS n8n_chat_history_old CASCADE;

-- 4. Limpar tabela conversations (vamos recriar com estrutura otimizada)
DROP TABLE IF EXISTS conversations CASCADE;

-- 5. Criar tabela unificada para mensagens de chat
CREATE TABLE n8n_chat_messages (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  phone TEXT,
  user_message TEXT,
  bot_message TEXT,
  message_type TEXT DEFAULT 'text',
  message_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT true,
  
  -- Índices para performance
  CONSTRAINT unique_message_per_session UNIQUE (session_id, id)
);

-- 6. Criar índices otimizados
CREATE INDEX idx_n8n_chat_messages_session_id ON n8n_chat_messages(session_id);
CREATE INDEX idx_n8n_chat_messages_created_at ON n8n_chat_messages(created_at);
CREATE INDEX idx_n8n_chat_messages_phone ON n8n_chat_messages(phone);
CREATE INDEX idx_n8n_chat_messages_active ON n8n_chat_messages(active);

-- 7. Recriar tabela conversations unificada
CREATE TABLE conversations (
  id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  avatar TEXT,
  last_message TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE,
  unread_count INTEGER DEFAULT 0,
  client_data JSONB DEFAULT '{}', -- Para dados extras do cliente
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Índices para conversations
CREATE INDEX idx_conversations_session_id ON conversations(session_id);
CREATE INDEX idx_conversations_phone ON conversations(phone);
CREATE INDEX idx_conversations_last_message_time ON conversations(last_message_time);

-- 9. Atualizar tabela contacts para tornar session_id opcional
ALTER TABLE contacts ALTER COLUMN session_id DROP NOT NULL;

-- 10. Criar função para sincronizar dados automaticamente
CREATE OR REPLACE FUNCTION sync_chat_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar ou criar conversa
  INSERT INTO conversations (
    session_id, 
    name, 
    phone,
    last_message,
    last_message_time,
    unread_count
  ) VALUES (
    NEW.session_id,
    COALESCE((SELECT name FROM contacts WHERE session_id = NEW.session_id LIMIT 1), 'Cliente'),
    NEW.phone,
    COALESCE(NEW.user_message, NEW.bot_message),
    NEW.created_at,
    1
  )
  ON CONFLICT (session_id) DO UPDATE SET
    last_message = COALESCE(NEW.user_message, NEW.bot_message),
    last_message_time = NEW.created_at,
    unread_count = conversations.unread_count + 1,
    updated_at = NOW();

  -- Atualizar contato se existir
  UPDATE contacts 
  SET 
    last_message = COALESCE(NEW.user_message, NEW.bot_message),
    last_message_time = NEW.created_at,
    unread_count = COALESCE(unread_count, 0) + 1,
    updated_at = NOW()
  WHERE session_id = NEW.session_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Criar trigger para sincronização automática
CREATE TRIGGER trigger_sync_chat_data
  AFTER INSERT ON n8n_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION sync_chat_data();

-- 12. Habilitar realtime para as novas tabelas
ALTER TABLE n8n_chat_messages REPLICA IDENTITY FULL;
ALTER TABLE conversations REPLICA IDENTITY FULL;

-- 13. Adicionar às publicações realtime
ALTER PUBLICATION supabase_realtime ADD TABLE n8n_chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- 14. Criar políticas RLS
ALTER TABLE n8n_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Políticas para n8n_chat_messages
CREATE POLICY "Authenticated users can view chat messages" 
ON n8n_chat_messages FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert chat messages" 
ON n8n_chat_messages FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Políticas para conversations
CREATE POLICY "Authenticated users can view conversations" 
ON conversations FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert conversations" 
ON conversations FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update conversations" 
ON conversations FOR UPDATE 
USING (auth.role() = 'authenticated');