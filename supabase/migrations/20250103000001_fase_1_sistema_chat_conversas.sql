-- FASE 1: SISTEMA DE CHAT E CONVERSAS (5 tabelas críticas)
-- Migração para implementar as tabelas essenciais do sistema de chat

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela principal de conversas
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255),
  client_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'pending', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Memória do chat N8N
CREATE TABLE IF NOT EXISTS n8n_chat_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) NOT NULL,
  memory_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Histórico de chats N8N
CREATE TABLE IF NOT EXISTS n8n_chat_histories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) NOT NULL,
  message_data JSONB NOT NULL,
  sender VARCHAR(100) CHECK (sender IN ('user', 'assistant', 'system')),
  message_type VARCHAR(50) DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Mensagens do chat N8N (para compatibilidade)
CREATE TABLE IF NOT EXISTS n8n_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) NOT NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sender VARCHAR(100) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- 5. Backup de mensagens do chat
CREATE TABLE IF NOT EXISTS chat_messages_backup (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_message_id UUID,
  session_id VARCHAR(255),
  message_data JSONB,
  backup_reason VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);

CREATE INDEX IF NOT EXISTS idx_n8n_chat_memory_session_id ON n8n_chat_memory(session_id);
CREATE INDEX IF NOT EXISTS idx_n8n_chat_memory_created_at ON n8n_chat_memory(created_at);

CREATE INDEX IF NOT EXISTS idx_n8n_chat_histories_session_id ON n8n_chat_histories(session_id);
CREATE INDEX IF NOT EXISTS idx_n8n_chat_histories_created_at ON n8n_chat_histories(created_at);
CREATE INDEX IF NOT EXISTS idx_n8n_chat_histories_sender ON n8n_chat_histories(sender);

CREATE INDEX IF NOT EXISTS idx_n8n_chat_messages_session_id ON n8n_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_n8n_chat_messages_conversation_id ON n8n_chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_n8n_chat_messages_timestamp ON n8n_chat_messages(timestamp);

CREATE INDEX IF NOT EXISTS idx_chat_messages_backup_session_id ON chat_messages_backup(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_backup_original_id ON chat_messages_backup(original_message_id);

-- Triggers para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_n8n_chat_memory_updated_at 
    BEFORE UPDATE ON n8n_chat_memory 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE conversations IS 'Tabela principal para gerenciar conversas entre clientes e sistema';
COMMENT ON TABLE n8n_chat_memory IS 'Armazena dados de memória contextual do chat N8N para manter contexto entre sessões';
COMMENT ON TABLE n8n_chat_histories IS 'Histórico completo de mensagens do chat N8N com metadados';
COMMENT ON TABLE n8n_chat_messages IS 'Mensagens individuais do chat N8N vinculadas a conversas';
COMMENT ON TABLE chat_messages_backup IS 'Backup de mensagens do chat para recuperação e auditoria';

-- Políticas RLS (Row Level Security)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_chat_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_chat_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages_backup ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (podem ser refinadas conforme necessário)
CREATE POLICY "Users can view their own conversations" ON conversations
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert conversations" ON conversations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own conversations" ON conversations
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Políticas similares para outras tabelas
CREATE POLICY "Users can access chat memory" ON n8n_chat_memory
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can access chat histories" ON n8n_chat_histories
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can access chat messages" ON n8n_chat_messages
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can access chat backups" ON chat_messages_backup
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Inserir dados de exemplo para teste (opcional)
INSERT INTO conversations (session_id, status) 
VALUES ('test-session-001', 'active')
ON CONFLICT DO NOTHING;

-- Verificação final
SELECT 
    'conversations' as tabela, 
    COUNT(*) as total_registros,
    'Tabela principal de conversas criada com sucesso' as status
FROM conversations
UNION ALL
SELECT 
    'n8n_chat_memory' as tabela, 
    COUNT(*) as total_registros,
    'Tabela de memória do chat criada com sucesso' as status
FROM n8n_chat_memory
UNION ALL
SELECT 
    'n8n_chat_histories' as tabela, 
    COUNT(*) as total_registros,
    'Tabela de histórico do chat criada com sucesso' as status
FROM n8n_chat_histories
UNION ALL
SELECT 
    'n8n_chat_messages' as tabela, 
    COUNT(*) as total_registros,
    'Tabela de mensagens do chat criada com sucesso' as status
FROM n8n_chat_messages
UNION ALL
SELECT 
    'chat_messages_backup' as tabela, 
    COUNT(*) as total_registros,
    'Tabela de backup de mensagens criada com sucesso' as status
FROM chat_messages_backup;