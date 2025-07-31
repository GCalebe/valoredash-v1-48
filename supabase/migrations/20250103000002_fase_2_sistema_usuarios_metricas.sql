-- FASE 2: SISTEMA DE USUÁRIOS, MÉTRICAS E KANBAN (15 tabelas importantes)
-- Migração para implementar tabelas importantes conforme Plano de Implementação Otimizado

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- SISTEMA DE USUÁRIOS E PERFIS (4 tabelas)
-- ========================================

-- 1. Perfis de usuários
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  email VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'manager')),
  permissions JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Configurações de usuário
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  setting_key VARCHAR(100) NOT NULL,
  setting_value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, setting_key)
);

-- 3. Sessões de usuário
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Log de atividades do usuário
CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  metadata JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- SISTEMA DE MÉTRICAS ESSENCIAIS (4 tabelas)
-- ========================================

-- 5. Métricas de conversação diárias
CREATE TABLE IF NOT EXISTS conversation_daily_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  total_conversations INTEGER DEFAULT 0,
  active_conversations INTEGER DEFAULT 0,
  completed_conversations INTEGER DEFAULT 0,
  average_response_time INTERVAL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, user_id)
);

-- 6. Métricas de performance
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_name VARCHAR(100) NOT NULL,
  metric_value NUMERIC,
  metric_type VARCHAR(50) CHECK (metric_type IN ('counter', 'gauge', 'histogram')),
  tags JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- 7. Relatórios de sistema
CREATE TABLE IF NOT EXISTS system_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_name VARCHAR(255) NOT NULL,
  report_type VARCHAR(50) CHECK (report_type IN ('daily', 'weekly', 'monthly', 'custom')),
  report_data JSONB NOT NULL,
  generated_by UUID REFERENCES auth.users(id),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  parameters JSONB DEFAULT '{}'
);

-- 8. Cache de métricas
CREATE TABLE IF NOT EXISTS metrics_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  cache_data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- SISTEMA KANBAN (1 tabela)
-- ========================================

-- 9. Estágios do Kanban
CREATE TABLE IF NOT EXISTS kanban_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  position INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  stage_type VARCHAR(50) DEFAULT 'custom' CHECK (stage_type IN ('lead', 'prospect', 'client', 'custom')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- SISTEMA DE CAMPOS CUSTOMIZADOS (2 tabelas)
-- ========================================

-- 10. Definições de campos customizados
CREATE TABLE IF NOT EXISTS custom_field_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  field_name VARCHAR(100) NOT NULL,
  field_type VARCHAR(50) CHECK (field_type IN ('text', 'number', 'date', 'boolean', 'select', 'multiselect')),
  field_options JSONB DEFAULT '{}',
  is_required BOOLEAN DEFAULT false,
  entity_type VARCHAR(50) CHECK (entity_type IN ('contact', 'conversation', 'product')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(field_name, entity_type)
);

-- 11. Valores de campos customizados para clientes
CREATE TABLE IF NOT EXISTS client_custom_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  field_definition_id UUID REFERENCES custom_field_definitions(id) ON DELETE CASCADE,
  field_value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, field_definition_id)
);

-- ========================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Índices para user_settings
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_key ON user_settings(setting_key);

-- Índices para user_sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- Índices para user_activity_log
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_action ON user_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at);

-- Índices para conversation_daily_data
CREATE INDEX IF NOT EXISTS idx_conversation_daily_data_date ON conversation_daily_data(date);
CREATE INDEX IF NOT EXISTS idx_conversation_daily_data_user_id ON conversation_daily_data(user_id);

-- Índices para performance_metrics
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON performance_metrics(user_id);

-- Índices para system_reports
CREATE INDEX IF NOT EXISTS idx_system_reports_type ON system_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_system_reports_generated_at ON system_reports(generated_at);

-- Índices para metrics_cache
CREATE INDEX IF NOT EXISTS idx_metrics_cache_key ON metrics_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_metrics_cache_expires ON metrics_cache(expires_at);

-- Índices para kanban_stages
CREATE INDEX IF NOT EXISTS idx_kanban_stages_position ON kanban_stages(position);
CREATE INDEX IF NOT EXISTS idx_kanban_stages_active ON kanban_stages(is_active);

-- Índices para custom_field_definitions
CREATE INDEX IF NOT EXISTS idx_custom_field_definitions_entity ON custom_field_definitions(entity_type);
CREATE INDEX IF NOT EXISTS idx_custom_field_definitions_name ON custom_field_definitions(field_name);

-- Índices para client_custom_values
CREATE INDEX IF NOT EXISTS idx_client_custom_values_client_id ON client_custom_values(client_id);
CREATE INDEX IF NOT EXISTS idx_client_custom_values_field_id ON client_custom_values(field_definition_id);

-- ========================================
-- TRIGGERS PARA UPDATED_AT
-- ========================================

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at 
    BEFORE UPDATE ON user_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_metrics_cache_updated_at 
    BEFORE UPDATE ON metrics_cache 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kanban_stages_updated_at 
    BEFORE UPDATE ON kanban_stages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_field_definitions_updated_at 
    BEFORE UPDATE ON custom_field_definitions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_custom_values_updated_at 
    BEFORE UPDATE ON client_custom_values 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ========================================

COMMENT ON TABLE profiles IS 'Perfis estendidos dos usuários com roles e permissões';
COMMENT ON TABLE user_settings IS 'Configurações personalizadas por usuário';
COMMENT ON TABLE user_sessions IS 'Controle de sessões ativas dos usuários';
COMMENT ON TABLE user_activity_log IS 'Log de atividades dos usuários para auditoria';
COMMENT ON TABLE conversation_daily_data IS 'Métricas diárias de conversações agregadas';
COMMENT ON TABLE performance_metrics IS 'Métricas de performance do sistema';
COMMENT ON TABLE system_reports IS 'Relatórios gerados pelo sistema';
COMMENT ON TABLE metrics_cache IS 'Cache de métricas para melhor performance';
COMMENT ON TABLE kanban_stages IS 'Estágios do sistema Kanban para organização de leads/clientes';
COMMENT ON TABLE custom_field_definitions IS 'Definições de campos customizados por entidade';
COMMENT ON TABLE client_custom_values IS 'Valores dos campos customizados para cada cliente';

-- ========================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_daily_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_custom_values ENABLE ROW LEVEL SECURITY;

-- Políticas básicas para profiles
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Políticas para user_settings
CREATE POLICY "Users can manage their own settings" ON user_settings
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para user_sessions
CREATE POLICY "Users can view their own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

-- Políticas para métricas (acesso geral para usuários autenticados)
CREATE POLICY "Authenticated users can access metrics" ON conversation_daily_data
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access performance metrics" ON performance_metrics
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Políticas para kanban_stages (acesso geral)
CREATE POLICY "Authenticated users can access kanban stages" ON kanban_stages
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Políticas para campos customizados
CREATE POLICY "Authenticated users can access custom field definitions" ON custom_field_definitions
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access client custom values" ON client_custom_values
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- ========================================
-- DADOS INICIAIS
-- ========================================

-- Inserir estágios padrão do Kanban
INSERT INTO kanban_stages (name, description, color, position, stage_type) VALUES
('Lead', 'Potencial cliente identificado', '#EF4444', 1, 'lead'),
('Qualificado', 'Lead qualificado e interessado', '#F59E0B', 2, 'prospect'),
('Proposta', 'Proposta enviada ao cliente', '#3B82F6', 3, 'prospect'),
('Negociação', 'Em processo de negociação', '#8B5CF6', 4, 'prospect'),
('Cliente', 'Cliente ativo', '#10B981', 5, 'client'),
('Perdido', 'Oportunidade perdida', '#6B7280', 6, 'custom')
ON CONFLICT DO NOTHING;

-- Inserir campos customizados padrão
INSERT INTO custom_field_definitions (field_name, field_type, entity_type, is_required) VALUES
('Orçamento', 'number', 'contact', false),
('Fonte do Lead', 'select', 'contact', false),
('Prioridade', 'select', 'contact', false),
('Data de Follow-up', 'date', 'contact', false)
ON CONFLICT DO NOTHING;

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================

SELECT 
    'Fase 2 - Tabelas Importantes' as fase,
    COUNT(*) as tabelas_verificadas,
    'Migração concluída com sucesso' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'profiles', 'user_settings', 'user_sessions', 'user_activity_log',
    'conversation_daily_data', 'performance_metrics', 'system_reports', 'metrics_cache',
    'kanban_stages', 'custom_field_definitions', 'client_custom_values'
);