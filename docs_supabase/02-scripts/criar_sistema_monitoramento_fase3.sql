-- =====================================================
-- FASE 3: SISTEMA DE MONITORAMENTO E ALERTAS
-- Data: 31/01/2025
-- Objetivo: Implementar monitoramento proativo do banco de dados
-- =====================================================

-- =====================================================
-- 1. TABELA DE MÉTRICAS DE PERFORMANCE
-- =====================================================

CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name VARCHAR(100) NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_type VARCHAR(50) NOT NULL, -- 'count', 'percentage', 'size', 'time'
  table_name VARCHAR(100),
  category VARCHAR(50) NOT NULL, -- 'integrity', 'performance', 'usage', 'health'
  measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance_metrics
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_category ON performance_metrics(category);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_measured_at ON performance_metrics(measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_table ON performance_metrics(table_name) WHERE table_name IS NOT NULL;

-- =====================================================
-- 2. TABELA DE ALERTAS DO SISTEMA
-- =====================================================

CREATE TABLE IF NOT EXISTS system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type VARCHAR(50) NOT NULL, -- 'warning', 'error', 'critical', 'info'
  alert_category VARCHAR(50) NOT NULL, -- 'performance', 'integrity', 'capacity', 'security'
  title VARCHAR(200) NOT NULL,
  description TEXT,
  table_name VARCHAR(100),
  metric_value NUMERIC,
  threshold_value NUMERIC,
  severity INTEGER DEFAULT 1, -- 1=low, 2=medium, 3=high, 4=critical
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para system_alerts
CREATE INDEX IF NOT EXISTS idx_system_alerts_type ON system_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_system_alerts_category ON system_alerts(alert_category);
CREATE INDEX IF NOT EXISTS idx_system_alerts_severity ON system_alerts(severity DESC);
CREATE INDEX IF NOT EXISTS idx_system_alerts_resolved ON system_alerts(is_resolved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_alerts_table ON system_alerts(table_name) WHERE table_name IS NOT NULL;

-- =====================================================
-- 3. FUNÇÃO PARA COLETAR MÉTRICAS GERAIS
-- =====================================================

CREATE OR REPLACE FUNCTION collect_database_metrics()
RETURNS TABLE(
  metric_name TEXT,
  metric_value NUMERIC,
  metric_type TEXT,
  table_name TEXT,
  category TEXT
) AS $$
BEGIN
  -- Métricas de integridade
  RETURN QUERY
  SELECT 
    'foreign_keys_count'::TEXT,
    (SELECT COUNT(*)::NUMERIC 
     FROM information_schema.table_constraints 
     WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public'),
    'count'::TEXT,
    NULL::TEXT,
    'integrity'::TEXT;
    
  -- Métricas de performance
  RETURN QUERY
  SELECT 
    'total_indexes_count'::TEXT,
    (SELECT COUNT(*)::NUMERIC 
     FROM pg_indexes 
     WHERE schemaname = 'public'),
    'count'::TEXT,
    NULL::TEXT,
    'performance'::TEXT;
    
  -- Métricas de uso - tabelas críticas
  RETURN QUERY
  SELECT 
    'contacts_count'::TEXT,
    (SELECT COUNT(*)::NUMERIC FROM contacts),
    'count'::TEXT,
    'contacts'::TEXT,
    'usage'::TEXT;
    
  RETURN QUERY
  SELECT 
    'profiles_count'::TEXT,
    (SELECT COUNT(*)::NUMERIC FROM profiles),
    'count'::TEXT,
    'profiles'::TEXT,
    'usage'::TEXT;
    
  RETURN QUERY
  SELECT 
    'chat_memory_count'::TEXT,
    (SELECT COUNT(*)::NUMERIC FROM n8n_chat_memory),
    'count'::TEXT,
    'n8n_chat_memory'::TEXT,
    'usage'::TEXT;
    
  RETURN QUERY
  SELECT 
    'chat_histories_count'::TEXT,
    (SELECT COUNT(*)::NUMERIC FROM n8n_chat_histories),
    'count'::TEXT,
    'n8n_chat_histories'::TEXT,
    'usage'::TEXT;
    
  RETURN QUERY
  SELECT 
    'user_sessions_count'::TEXT,
    (SELECT COUNT(*)::NUMERIC FROM user_sessions),
    'count'::TEXT,
    'user_sessions'::TEXT,
    'usage'::TEXT;
    
  RETURN QUERY
  SELECT 
    'user_settings_count'::TEXT,
    (SELECT COUNT(*)::NUMERIC FROM user_settings),
    'count'::TEXT,
    'user_settings'::TEXT,
    'usage'::TEXT;
    
  -- Métricas de saúde - tabelas ativas
  RETURN QUERY
  SELECT 
    'active_tables_percentage'::TEXT,
    (SELECT 
      (COUNT(*) * 100.0 / 6)::NUMERIC
     FROM (
       SELECT 'contacts' as tabela, COUNT(*) as registros FROM contacts
       UNION ALL
       SELECT 'profiles' as tabela, COUNT(*) as registros FROM profiles
       UNION ALL
       SELECT 'n8n_chat_memory' as tabela, COUNT(*) as registros FROM n8n_chat_memory
       UNION ALL
       SELECT 'n8n_chat_histories' as tabela, COUNT(*) as registros FROM n8n_chat_histories
       UNION ALL
       SELECT 'user_sessions' as tabela, COUNT(*) as registros FROM user_sessions
       UNION ALL
       SELECT 'user_settings' as tabela, COUNT(*) as registros FROM user_settings
     ) t WHERE registros > 0),
    'percentage'::TEXT,
    NULL::TEXT,
    'health'::TEXT;
    
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. FUNÇÃO PARA VERIFICAR ALERTAS
-- =====================================================

CREATE OR REPLACE FUNCTION check_system_alerts()
RETURNS TABLE(
  alert_type TEXT,
  alert_category TEXT,
  title TEXT,
  description TEXT,
  table_name TEXT,
  metric_value NUMERIC,
  severity INTEGER
) AS $$
DECLARE
  empty_critical_tables INTEGER;
  low_performance_tables INTEGER;
  expired_sessions INTEGER;
BEGIN
  -- Verificar tabelas críticas vazias
  SELECT COUNT(*) INTO empty_critical_tables
  FROM (
    SELECT 'contacts' as tabela, COUNT(*) as registros FROM contacts
    UNION ALL
    SELECT 'profiles' as tabela, COUNT(*) as registros FROM profiles
    UNION ALL
    SELECT 'n8n_chat_memory' as tabela, COUNT(*) as registros FROM n8n_chat_memory
    UNION ALL
    SELECT 'n8n_chat_histories' as tabela, COUNT(*) as registros FROM n8n_chat_histories
    UNION ALL
    SELECT 'user_sessions' as tabela, COUNT(*) as registros FROM user_sessions
    UNION ALL
    SELECT 'user_settings' as tabela, COUNT(*) as registros FROM user_settings
  ) t WHERE registros = 0;
  
  IF empty_critical_tables > 0 THEN
    RETURN QUERY
    SELECT 
      'warning'::TEXT,
      'integrity'::TEXT,
      'Tabelas Críticas Vazias'::TEXT,
      format('Encontradas %s tabelas críticas sem dados', empty_critical_tables)::TEXT,
      NULL::TEXT,
      empty_critical_tables::NUMERIC,
      2::INTEGER;
  END IF;
  
  -- Verificar sessões expiradas
  SELECT COUNT(*) INTO expired_sessions
  FROM user_sessions 
  WHERE expires_at < NOW();
  
  IF expired_sessions > 10 THEN
    RETURN QUERY
    SELECT 
      'info'::TEXT,
      'security'::TEXT,
      'Limpeza de Sessões Necessária'::TEXT,
      format('Encontradas %s sessões expiradas que podem ser removidas', expired_sessions)::TEXT,
      'user_sessions'::TEXT,
      expired_sessions::NUMERIC,
      1::INTEGER;
  END IF;
  
  -- Verificar crescimento rápido de dados
  IF (SELECT COUNT(*) FROM n8n_chat_histories WHERE created_at > NOW() - INTERVAL '1 day') > 100 THEN
    RETURN QUERY
    SELECT 
      'info'::TEXT,
      'capacity'::TEXT,
      'Crescimento Rápido de Chat'::TEXT,
      'Histórico de chat crescendo rapidamente - considere arquivamento'::TEXT,
      'n8n_chat_histories'::TEXT,
      (SELECT COUNT(*)::NUMERIC FROM n8n_chat_histories WHERE created_at > NOW() - INTERVAL '1 day'),
      1::INTEGER;
  END IF;
  
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. FUNÇÃO PARA EXECUTAR COLETA COMPLETA
-- =====================================================

CREATE OR REPLACE FUNCTION run_monitoring_cycle()
RETURNS TABLE(
  metrics_collected INTEGER,
  alerts_generated INTEGER,
  execution_time INTERVAL
) AS $$
DECLARE
  start_time TIMESTAMP;
  metrics_count INTEGER := 0;
  alerts_count INTEGER := 0;
BEGIN
  start_time := NOW();
  
  -- Coletar métricas
  INSERT INTO performance_metrics (metric_name, metric_value, metric_type, table_name, category)
  SELECT m.metric_name, m.metric_value, m.metric_type, m.table_name, m.category
  FROM collect_database_metrics() m;
  
  GET DIAGNOSTICS metrics_count = ROW_COUNT;
  
  -- Verificar e inserir alertas
  INSERT INTO system_alerts (alert_type, alert_category, title, description, table_name, metric_value, severity)
  SELECT a.alert_type, a.alert_category, a.title, a.description, a.table_name, a.metric_value, a.severity
  FROM check_system_alerts() a
  WHERE NOT EXISTS (
    SELECT 1 FROM system_alerts sa 
    WHERE sa.title = a.title 
      AND sa.is_resolved = FALSE 
      AND sa.created_at > NOW() - INTERVAL '1 hour'
  );
  
  GET DIAGNOSTICS alerts_count = ROW_COUNT;
  
  RETURN QUERY
  SELECT 
    metrics_count,
    alerts_count,
    NOW() - start_time;
    
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. VIEW PARA DASHBOARD DE MÉTRICAS
-- =====================================================

CREATE OR REPLACE VIEW dashboard_metrics AS
WITH latest_metrics AS (
  SELECT DISTINCT ON (metric_name) 
    metric_name,
    metric_value,
    metric_type,
    table_name,
    category,
    measured_at
  FROM performance_metrics 
  ORDER BY metric_name, measured_at DESC
),
active_alerts AS (
  SELECT 
    alert_category,
    COUNT(*) as alert_count,
    MAX(severity) as max_severity
  FROM system_alerts 
  WHERE is_resolved = FALSE 
    AND created_at > NOW() - INTERVAL '24 hours'
  GROUP BY alert_category
)
SELECT 
  -- Métricas principais
  (SELECT metric_value FROM latest_metrics WHERE metric_name = 'foreign_keys_count') as foreign_keys,
  (SELECT metric_value FROM latest_metrics WHERE metric_name = 'total_indexes_count') as total_indexes,
  (SELECT metric_value FROM latest_metrics WHERE metric_name = 'active_tables_percentage') as active_tables_pct,
  
  -- Contadores de tabelas críticas
  (SELECT metric_value FROM latest_metrics WHERE metric_name = 'contacts_count') as contacts_count,
  (SELECT metric_value FROM latest_metrics WHERE metric_name = 'profiles_count') as profiles_count,
  (SELECT metric_value FROM latest_metrics WHERE metric_name = 'chat_memory_count') as chat_memory_count,
  (SELECT metric_value FROM latest_metrics WHERE metric_name = 'chat_histories_count') as chat_histories_count,
  (SELECT metric_value FROM latest_metrics WHERE metric_name = 'user_sessions_count') as user_sessions_count,
  (SELECT metric_value FROM latest_metrics WHERE metric_name = 'user_settings_count') as user_settings_count,
  
  -- Alertas ativos
  COALESCE((SELECT alert_count FROM active_alerts WHERE alert_category = 'integrity'), 0) as integrity_alerts,
  COALESCE((SELECT alert_count FROM active_alerts WHERE alert_category = 'performance'), 0) as performance_alerts,
  COALESCE((SELECT alert_count FROM active_alerts WHERE alert_category = 'security'), 0) as security_alerts,
  COALESCE((SELECT alert_count FROM active_alerts WHERE alert_category = 'capacity'), 0) as capacity_alerts,
  
  -- Última atualização
  (SELECT MAX(measured_at) FROM latest_metrics) as last_updated;

-- =====================================================
-- 7. POLÍTICAS RLS PARA SEGURANÇA
-- =====================================================

-- Habilitar RLS nas tabelas de monitoramento
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;

-- Políticas para performance_metrics
CREATE POLICY "Allow read performance_metrics for authenticated users" ON performance_metrics
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow insert performance_metrics for system" ON performance_metrics
    FOR INSERT WITH CHECK (true);

-- Políticas para system_alerts
CREATE POLICY "Allow read system_alerts for authenticated users" ON system_alerts
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow insert system_alerts for system" ON system_alerts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update system_alerts for authenticated users" ON system_alerts
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- =====================================================
-- 8. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE performance_metrics IS 'Tabela para armazenar métricas de performance do banco de dados - Fase 3';
COMMENT ON TABLE system_alerts IS 'Tabela para armazenar alertas do sistema de monitoramento - Fase 3';
COMMENT ON FUNCTION collect_database_metrics() IS 'Função para coletar métricas gerais do banco - Fase 3';
COMMENT ON FUNCTION check_system_alerts() IS 'Função para verificar condições de alerta - Fase 3';
COMMENT ON FUNCTION run_monitoring_cycle() IS 'Função principal para executar ciclo completo de monitoramento - Fase 3';
COMMENT ON VIEW dashboard_metrics IS 'View consolidada para dashboard de métricas - Fase 3';

-- =====================================================
-- 9. DADOS INICIAIS E TESTE
-- =====================================================

-- Executar primeira coleta de métricas
SELECT * FROM run_monitoring_cycle();

-- =====================================================
-- RESUMO DA IMPLEMENTAÇÃO:
-- - Sistema completo de monitoramento
-- - Coleta automática de métricas
-- - Sistema de alertas inteligente
-- - Dashboard consolidado
-- - Funções para automação
-- - Segurança com RLS
-- - Documentação completa
-- =====================================================