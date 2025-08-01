-- =====================================================
-- FASE 3: IMPLEMENTAÇÃO DE ÍNDICES DE PERFORMANCE
-- Data: 31/01/2025
-- Objetivo: Otimizar performance das queries mais frequentes
-- =====================================================

-- =====================================================
-- 1. ÍNDICES PARA TABELA CONTACTS (mais usada no código)
-- =====================================================

-- Índice para busca por usuário (muito usado nos hooks)
CREATE INDEX IF NOT EXISTS idx_contacts_user_id_performance 
ON contacts(user_id) 
WHERE user_id IS NOT NULL;

-- Índice para busca por email (usado em validações)
CREATE INDEX IF NOT EXISTS idx_contacts_email_performance 
ON contacts(email) 
WHERE email IS NOT NULL AND email != '';

-- Índice para busca por telefone (usado em validações)
CREATE INDEX IF NOT EXISTS idx_contacts_phone_performance 
ON contacts(phone) 
WHERE phone IS NOT NULL AND phone != '';

-- Índice para ordenação por data de criação (dashboards)
CREATE INDEX IF NOT EXISTS idx_contacts_created_at_desc 
ON contacts(created_at DESC) 
WHERE created_at IS NOT NULL;

-- Índice composto para filtros comuns (usuário + data)
CREATE INDEX IF NOT EXISTS idx_contacts_user_created 
ON contacts(user_id, created_at DESC) 
WHERE user_id IS NOT NULL AND created_at IS NOT NULL;

-- Índice para status do contato (se existir)
CREATE INDEX IF NOT EXISTS idx_contacts_status 
ON contacts(status) 
WHERE status IS NOT NULL;

-- =====================================================
-- 2. ÍNDICES PARA CLIENT_CUSTOM_VALUES (alta atividade)
-- =====================================================

-- Índice para busca por cliente (muito usado)
CREATE INDEX IF NOT EXISTS idx_client_custom_values_client_id_performance 
ON client_custom_values(client_id) 
WHERE client_id IS NOT NULL;

-- Índice para busca por field_id (usado em queries dinâmicas)
CREATE INDEX IF NOT EXISTS idx_client_custom_values_field_id_performance 
ON client_custom_values(field_id) 
WHERE field_id IS NOT NULL;

-- Índice composto para busca específica (cliente + campo)
CREATE INDEX IF NOT EXISTS idx_client_custom_values_client_field 
ON client_custom_values(client_id, field_id) 
WHERE client_id IS NOT NULL AND field_id IS NOT NULL;

-- Índice para busca em valores JSON (se usado em pesquisas)
CREATE INDEX IF NOT EXISTS idx_client_custom_values_value_gin 
ON client_custom_values USING gin(field_value) 
WHERE field_value IS NOT NULL;

-- =====================================================
-- 3. ÍNDICES PARA CONTACT_STAGE_HISTORY (alta atividade)
-- =====================================================

-- Índice para busca por contato (histórico de mudanças)
CREATE INDEX IF NOT EXISTS idx_contact_stage_history_contact_id_performance 
ON contact_stage_history(contact_id) 
WHERE contact_id IS NOT NULL;

-- Índice para ordenação por data de mudança (timeline)
CREATE INDEX IF NOT EXISTS idx_contact_stage_history_changed_at_desc 
ON contact_stage_history(changed_at DESC) 
WHERE changed_at IS NOT NULL;

-- Índice composto para histórico específico (contato + data)
CREATE INDEX IF NOT EXISTS idx_contact_stage_history_contact_changed 
ON contact_stage_history(contact_id, changed_at DESC) 
WHERE contact_id IS NOT NULL AND changed_at IS NOT NULL;

-- Índice para busca por estágio anterior
CREATE INDEX IF NOT EXISTS idx_contact_stage_history_previous_stage 
ON contact_stage_history(previous_stage_id) 
WHERE previous_stage_id IS NOT NULL;

-- Índice para busca por novo estágio
CREATE INDEX IF NOT EXISTS idx_contact_stage_history_new_stage 
ON contact_stage_history(new_stage_id) 
WHERE new_stage_id IS NOT NULL;

-- =====================================================
-- 4. ÍNDICES PARA TABELAS DE CHAT (recém implementadas)
-- =====================================================

-- Índices para n8n_chat_memory (busca por sessão)
CREATE INDEX IF NOT EXISTS idx_n8n_chat_memory_session_performance 
ON n8n_chat_memory(session_id) 
WHERE session_id IS NOT NULL;

-- Índice para busca em dados de memória (JSON)
CREATE INDEX IF NOT EXISTS idx_n8n_chat_memory_data_gin 
ON n8n_chat_memory USING gin(memory_data) 
WHERE memory_data IS NOT NULL;

-- Índices para n8n_chat_histories (busca por sessão e data)
CREATE INDEX IF NOT EXISTS idx_n8n_chat_histories_session_performance 
ON n8n_chat_histories(session_id) 
WHERE session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_n8n_chat_histories_created_desc 
ON n8n_chat_histories(created_at DESC) 
WHERE created_at IS NOT NULL;

-- Índice composto para histórico de chat (sessão + data)
CREATE INDEX IF NOT EXISTS idx_n8n_chat_histories_session_created 
ON n8n_chat_histories(session_id, created_at DESC) 
WHERE session_id IS NOT NULL AND created_at IS NOT NULL;

-- Índice para busca por remetente
CREATE INDEX IF NOT EXISTS idx_n8n_chat_histories_sender 
ON n8n_chat_histories(sender) 
WHERE sender IS NOT NULL;

-- =====================================================
-- 5. ÍNDICES PARA USER_SESSIONS (gestão de sessões)
-- =====================================================

-- Índice para busca por usuário
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_performance 
ON user_sessions(user_id) 
WHERE user_id IS NOT NULL;

-- Índice para busca por token de sessão
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_performance 
ON user_sessions(session_token) 
WHERE session_token IS NOT NULL;

-- Índice para limpeza de sessões expiradas
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at 
ON user_sessions(expires_at) 
WHERE expires_at IS NOT NULL;

-- Índice composto para validação de sessão (usuário + token)
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_token 
ON user_sessions(user_id, session_token) 
WHERE user_id IS NOT NULL AND session_token IS NOT NULL;

-- =====================================================
-- 6. ÍNDICES PARA USER_SETTINGS (configurações)
-- =====================================================

-- Índice para busca por usuário
CREATE INDEX IF NOT EXISTS idx_user_settings_user_performance 
ON user_settings(user_id) 
WHERE user_id IS NOT NULL;

-- Índice para busca por chave de configuração
CREATE INDEX IF NOT EXISTS idx_user_settings_key_performance 
ON user_settings(setting_key) 
WHERE setting_key IS NOT NULL;

-- Índice composto para busca específica (usuário + chave)
CREATE INDEX IF NOT EXISTS idx_user_settings_user_key 
ON user_settings(user_id, setting_key) 
WHERE user_id IS NOT NULL AND setting_key IS NOT NULL;

-- Índice para busca em valores de configuração (JSON)
CREATE INDEX IF NOT EXISTS idx_user_settings_value_gin 
ON user_settings USING gin(setting_value) 
WHERE setting_value IS NOT NULL;

-- =====================================================
-- 7. ÍNDICES PARA TABELAS DE SISTEMA (frequentemente usadas)
-- =====================================================

-- Índices para kanban_stages (usado em cache)
CREATE INDEX IF NOT EXISTS idx_kanban_stages_user_performance 
ON kanban_stages(user_id) 
WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_kanban_stages_order 
ON kanban_stages(stage_order) 
WHERE stage_order IS NOT NULL;

-- Índices para profiles (tabela de usuários)
CREATE INDEX IF NOT EXISTS idx_profiles_email_performance 
ON profiles(email) 
WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_created_at_desc 
ON profiles(created_at DESC) 
WHERE created_at IS NOT NULL;

-- =====================================================
-- 8. ÍNDICES PARA ANALYTICS E RELATÓRIOS
-- =====================================================

-- Índice para audit_log (crescimento constante)
CREATE INDEX IF NOT EXISTS idx_audit_log_user_action 
ON audit_log(user_id, action) 
WHERE user_id IS NOT NULL AND action IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_log_created_desc 
ON audit_log(created_at DESC) 
WHERE created_at IS NOT NULL;

-- Índice para conversations (se usado)
CREATE INDEX IF NOT EXISTS idx_conversations_user_performance 
ON conversations(user_id) 
WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_updated_desc 
ON conversations(updated_at DESC) 
WHERE updated_at IS NOT NULL;

-- =====================================================
-- 9. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

-- Adicionar comentários nas tabelas principais
COMMENT ON INDEX idx_contacts_user_id_performance IS 'Índice de performance para busca de contatos por usuário - Fase 3';
COMMENT ON INDEX idx_contacts_email_performance IS 'Índice de performance para busca de contatos por email - Fase 3';
COMMENT ON INDEX idx_client_custom_values_client_id_performance IS 'Índice de performance para valores customizados por cliente - Fase 3';
COMMENT ON INDEX idx_client_custom_values_field_id_performance IS 'Índice de performance para valores customizados por field_id - Fase 3';
COMMENT ON INDEX idx_contact_stage_history_contact_id_performance IS 'Índice de performance para histórico de estágios - Fase 3';
COMMENT ON INDEX idx_n8n_chat_memory_session_performance IS 'Índice de performance para memória de chat por sessão - Fase 3';
COMMENT ON INDEX idx_user_sessions_user_performance IS 'Índice de performance para sessões por usuário - Fase 3';
COMMENT ON INDEX idx_user_settings_user_performance IS 'Índice de performance para configurações por usuário - Fase 3';

-- =====================================================
-- 10. VERIFICAÇÃO FINAL
-- =====================================================

-- Query para verificar os novos índices criados
-- SELECT 
--   schemaname,
--   tablename,
--   indexname,
--   indexdef
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
--   AND indexname LIKE '%performance%'
-- ORDER BY tablename, indexname;

-- =====================================================
-- RESUMO DA IMPLEMENTAÇÃO:
-- - 30+ novos índices de performance
-- - Cobertura completa das tabelas críticas
-- - Índices compostos para queries complexas
-- - Índices GIN para busca em JSON
-- - Índices condicionais para otimização
-- - Comentários para documentação
-- =====================================================