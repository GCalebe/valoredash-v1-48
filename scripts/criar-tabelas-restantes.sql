-- Script SQL para criar as tabelas restantes da Fase 1
-- Execute este script manualmente no painel do Supabase ou via CLI

-- Tabela de memória do chat N8N
CREATE TABLE IF NOT EXISTS n8n_chat_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) NOT NULL,
  memory_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de histórico de chats N8N
CREATE TABLE IF NOT EXISTS n8n_chat_histories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) NOT NULL,
  message_data JSONB NOT NULL,
  sender VARCHAR(100) CHECK (sender IN ('user', 'assistant', 'system')),
  message_type VARCHAR(50) DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de backup de mensagens do chat
CREATE TABLE IF NOT EXISTS chat_messages_backup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_message_id UUID,
  session_id VARCHAR(255),
  message_data JSONB,
  backup_reason VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_n8n_chat_memory_session_id ON n8n_chat_memory(session_id);
CREATE INDEX IF NOT EXISTS idx_n8n_chat_memory_created_at ON n8n_chat_memory(created_at);

CREATE INDEX IF NOT EXISTS idx_n8n_chat_histories_session_id ON n8n_chat_histories(session_id);
CREATE INDEX IF NOT EXISTS idx_n8n_chat_histories_created_at ON n8n_chat_histories(created_at);
CREATE INDEX IF NOT EXISTS idx_n8n_chat_histories_sender ON n8n_chat_histories(sender);

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

CREATE TRIGGER update_n8n_chat_memory_updated_at 
    BEFORE UPDATE ON n8n_chat_memory 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE n8n_chat_memory IS 'Armazena dados de memória contextual do chat N8N para manter contexto entre sessões';
COMMENT ON TABLE n8n_chat_histories IS 'Histórico completo de mensagens do chat N8N com metadados';
COMMENT ON TABLE chat_messages_backup IS 'Backup de mensagens do chat para recuperação e auditoria';

-- Políticas RLS (Row Level Security)
ALTER TABLE n8n_chat_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_chat_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages_backup ENABLE ROW LEVEL SECURITY;

-- Políticas básicas
CREATE POLICY "Users can access chat memory" ON n8n_chat_memory
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can access chat histories" ON n8n_chat_histories
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can access chat backups" ON chat_messages_backup
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Verificação final
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
    'chat_messages_backup' as tabela, 
    COUNT(*) as total_registros,
    'Tabela de backup de mensagens criada com sucesso' as status
FROM chat_messages_backup;