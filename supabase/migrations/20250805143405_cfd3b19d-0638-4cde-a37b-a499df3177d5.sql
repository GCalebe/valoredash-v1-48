-- Segunda rodada de correções de segurança do linter

-- 1. Adicionar políticas RLS para tabelas que ainda não têm
-- Tabelas identificadas: custom_fields, dados_cliente, faq_items, funnel_data, hosts, knowledge_article_events, knowledge_base, knowledge_categories, knowledge_comments, knowledge_ratings, knowledge_tags, knowledge_tag_relations, n8n_chat_histories, n8n_chat_memory, utm_tracking

-- custom_fields - Campo personalizado por usuário
CREATE POLICY "Users can manage their own custom fields" ON public.custom_fields
FOR ALL USING (user_id = auth.uid());

-- dados_cliente - Dados de cliente por usuário  
CREATE POLICY "Users can manage their own client data" ON public.dados_cliente
FOR ALL USING (user_id = auth.uid());

-- faq_items - FAQs por usuário
CREATE POLICY "Users can manage their own FAQ items" ON public.faq_items
FOR ALL USING (user_id = auth.uid());

-- funnel_data - Dados de funil por usuário
CREATE POLICY "Users can manage their own funnel data" ON public.funnel_data
FOR ALL USING (user_id = auth.uid());

-- hosts - Hosts por usuário
CREATE POLICY "Users can manage their own hosts" ON public.hosts
FOR ALL USING (user_id = auth.uid());

-- knowledge_article_events - Eventos de artigos (todos podem ler, só autenticados podem inserir)
CREATE POLICY "Anyone can read article events" ON public.knowledge_article_events
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can log events" ON public.knowledge_article_events  
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- knowledge_base - Base de conhecimento por usuário
CREATE POLICY "Users can manage their own knowledge base" ON public.knowledge_base
FOR ALL USING (user_id = auth.uid());

-- knowledge_categories - Categorias por usuário
CREATE POLICY "Users can manage their own knowledge categories" ON public.knowledge_categories
FOR ALL USING (user_id = auth.uid());

-- knowledge_comments - Comentários por usuário
CREATE POLICY "Users can manage their own comments" ON public.knowledge_comments
FOR ALL USING (user_id = auth.uid());

-- knowledge_ratings - Avaliações por usuário
CREATE POLICY "Users can manage their own ratings" ON public.knowledge_ratings
FOR ALL USING (user_id = auth.uid());

-- knowledge_tags - Tags por usuário
CREATE POLICY "Users can manage their own tags" ON public.knowledge_tags
FOR ALL USING (user_id = auth.uid());

-- knowledge_tag_relations - Relações de tags (baseado no artigo)
CREATE POLICY "Users can manage tag relations for their articles" ON public.knowledge_tag_relations
FOR ALL USING (EXISTS (
  SELECT 1 FROM public.knowledge_base kb 
  WHERE kb.id = knowledge_tag_relations.article_id 
  AND kb.user_id = auth.uid()
));

-- n8n_chat_histories - Histórico de chat (acesso geral autenticado)
CREATE POLICY "Authenticated users can access chat histories" ON public.n8n_chat_histories
FOR ALL USING (auth.role() = 'authenticated');

-- n8n_chat_memory - Memória de chat (acesso geral autenticado)
CREATE POLICY "Authenticated users can access chat memory" ON public.n8n_chat_memory
FOR ALL USING (auth.role() = 'authenticated');

-- utm_tracking - Rastreamento UTM por usuário
CREATE POLICY "Users can manage their own UTM tracking" ON public.utm_tracking
FOR ALL USING (user_id = auth.uid());

-- 2. Corrigir funções sem search_path seguro
-- Identificar e corrigir funções restantes

-- Atualizar funções do pg_trgm que são extensões (não podemos modificar)
-- Focar nas funções personalizadas restantes

-- Função collect_metrics_fase3
CREATE OR REPLACE FUNCTION public.collect_metrics_fase3()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Limpar métricas antigas (manter apenas últimas 24h)
  DELETE FROM performance_metrics WHERE timestamp < NOW() - INTERVAL '24 hours';
  
  -- Inserir métricas com tipos válidos (counter, gauge, histogram)
  INSERT INTO performance_metrics (metric_name, metric_value, metric_type, tags, timestamp)
  VALUES 
    ('foreign_keys_total', 
     (SELECT COUNT(*) FROM information_schema.table_constraints 
      WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public'),
     'gauge', '{"category": "integrity", "phase": "3"}', NOW()),
    
    ('indexes_total',
     (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public'),
     'gauge', '{"category": "performance", "phase": "3"}', NOW()),
     
    ('contacts_total',
     (SELECT COUNT(*) FROM contacts),
     'gauge', '{"table": "contacts", "phase": "3"}', NOW()),
     
    ('profiles_total',
     (SELECT COUNT(*) FROM profiles),
     'gauge', '{"table": "profiles", "phase": "3"}', NOW()),
     
    ('chat_memory_total',
     (SELECT COUNT(*) FROM n8n_chat_memory),
     'gauge', '{"table": "n8n_chat_memory", "phase": "3"}', NOW()),
     
    ('chat_histories_total',
     (SELECT COUNT(*) FROM n8n_chat_histories),
     'gauge', '{"table": "n8n_chat_histories", "phase": "3"}', NOW()),
     
    ('user_sessions_total',
     (SELECT COUNT(*) FROM user_sessions),
     'gauge', '{"table": "user_sessions", "phase": "3"}', NOW()),
     
    ('user_settings_total',
     (SELECT COUNT(*) FROM user_settings),
     'gauge', '{"table": "user_settings", "phase": "3"}', NOW()),
     
    ('active_tables_count',
     (SELECT 
        (CASE WHEN (SELECT COUNT(*) FROM contacts) > 0 THEN 1 ELSE 0 END) +
        (CASE WHEN (SELECT COUNT(*) FROM profiles) > 0 THEN 1 ELSE 0 END) +
        (CASE WHEN (SELECT COUNT(*) FROM n8n_chat_memory) > 0 THEN 1 ELSE 0 END) +
        (CASE WHEN (SELECT COUNT(*) FROM n8n_chat_histories) > 0 THEN 1 ELSE 0 END) +
        (CASE WHEN (SELECT COUNT(*) FROM user_sessions) > 0 THEN 1 ELSE 0 END) +
        (CASE WHEN (SELECT COUNT(*) FROM user_settings) > 0 THEN 1 ELSE 0 END)
     ),
     'gauge', '{"category": "health", "phase": "3"}', NOW());
     
  RETURN 'Métricas coletadas com sucesso';
     
END;
$$;

-- Função check_alerts_fase3
CREATE OR REPLACE FUNCTION public.check_alerts_fase3()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  empty_tables INTEGER;
  expired_sessions INTEGER;
  alerts_created INTEGER := 0;
BEGIN
  -- Contar tabelas críticas vazias
  SELECT 
    (CASE WHEN (SELECT COUNT(*) FROM contacts) = 0 THEN 1 ELSE 0 END) +
    (CASE WHEN (SELECT COUNT(*) FROM profiles) = 0 THEN 1 ELSE 0 END) +
    (CASE WHEN (SELECT COUNT(*) FROM n8n_chat_memory) = 0 THEN 1 ELSE 0 END) +
    (CASE WHEN (SELECT COUNT(*) FROM n8n_chat_histories) = 0 THEN 1 ELSE 0 END) +
    (CASE WHEN (SELECT COUNT(*) FROM user_sessions) = 0 THEN 1 ELSE 0 END) +
    (CASE WHEN (SELECT COUNT(*) FROM user_settings) = 0 THEN 1 ELSE 0 END)
  INTO empty_tables;
  
  -- Inserir alerta se houver tabelas vazias
  IF empty_tables > 0 THEN
    INSERT INTO system_alerts (alert_type, alert_category, title, description, metric_value, severity, metadata)
    SELECT 
      'warning',
      'integrity',
      'Tabelas Críticas Vazias',
      'Encontradas ' || empty_tables || ' tabelas críticas sem dados',
      empty_tables,
      2,
      '{"phase": "3", "check_type": "empty_tables"}'
    WHERE NOT EXISTS (
      SELECT 1 FROM system_alerts 
      WHERE title = 'Tabelas Críticas Vazias' 
        AND is_resolved = FALSE 
        AND created_at > NOW() - INTERVAL '1 hour'
    );
    
    IF FOUND THEN
      alerts_created := alerts_created + 1;
    END IF;
  END IF;
  
  RETURN 'Verificação de alertas concluída. Alertas criados: ' || alerts_created;
END;
$$;

-- Função cleanup_expired_sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < NOW() OR is_active = false;
END;
$$;

-- Função calculate_daily_conversation_stats  
CREATE OR REPLACE FUNCTION public.calculate_daily_conversation_stats(target_date date DEFAULT CURRENT_DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    total_convs INTEGER;
    new_convs INTEGER;
    resolved_convs INTEGER;
BEGIN
    -- Calculate stats for the target date using existing conversations table structure
    SELECT COUNT(*) INTO total_convs
    FROM conversations
    WHERE DATE(created_at) <= target_date;
    
    SELECT COUNT(*) INTO new_convs
    FROM conversations
    WHERE DATE(created_at) = target_date;
    
    -- For now, set resolved_convs to 0 since we don't have resolved_at column
    resolved_convs := 0;
    
    -- Insert or update the daily stats
    INSERT INTO conversation_daily_data (
        date, total_conversations, new_conversations, resolved_conversations
    ) VALUES (
        target_date, total_convs, new_convs, resolved_convs
    )
    ON CONFLICT (date) DO UPDATE SET
        total_conversations = EXCLUDED.total_conversations,
        new_conversations = EXCLUDED.new_conversations,
        resolved_conversations = EXCLUDED.resolved_conversations,
        updated_at = NOW();
END;
$$;

-- Registrar no log de auditoria
INSERT INTO public.audit_log (table_name, record_id, operation, new_values, changed_at)
VALUES (
  'security_fixes', 
  'phase_2', 
  'UPDATE', 
  '{"action": "added_missing_rls_policies_and_fixed_functions", "tables_fixed": ["custom_fields", "dados_cliente", "faq_items", "funnel_data", "hosts", "knowledge_*", "n8n_*", "utm_tracking"], "functions_fixed": ["collect_metrics_fase3", "check_alerts_fase3", "cleanup_expired_sessions", "calculate_daily_conversation_stats"]}',
  NOW()
);