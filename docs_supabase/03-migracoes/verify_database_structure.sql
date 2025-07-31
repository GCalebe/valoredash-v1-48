-- =====================================================
-- SCRIPT DE VERIFICAÇÃO DA ESTRUTURA DO BANCO DE DADOS
-- Valore CRM v2 - Validação das tabelas criadas
-- =====================================================

-- Este script verifica se todas as tabelas foram criadas corretamente
-- e fornece um relatório completo da estrutura do banco

\echo '=========================================';
\echo 'VERIFICAÇÃO DA ESTRUTURA DO BANCO DE DADOS';
\echo 'Valore CRM v2';
\echo '=========================================';
\echo '';

-- =====================================================
-- 1. VERIFICAR TABELAS EXISTENTES
-- =====================================================

\echo '1. TABELAS EXISTENTES NO SCHEMA PUBLIC:';
\echo '----------------------------------------';

SELECT 
  schemaname,
  tablename,
  tableowner,
  hasindexes,
  hasrules,
  hastriggers,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

\echo '';
\echo '2. CONTAGEM DE REGISTROS POR TABELA:';
\echo '------------------------------------';

-- Função para contar registros dinamicamente
DO $$
DECLARE
    table_record RECORD;
    query_text TEXT;
    row_count INTEGER;
BEGIN
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename
    LOOP
        query_text := 'SELECT COUNT(*) FROM ' || quote_ident(table_record.tablename);
        EXECUTE query_text INTO row_count;
        RAISE NOTICE '% : % registros', RPAD(table_record.tablename, 30), row_count;
    END LOOP;
END $$;

\echo '';
\echo '3. VERIFICAÇÃO DAS TABELAS CRÍTICAS:';
\echo '------------------------------------';

-- Verificar se as tabelas principais existem
WITH expected_tables AS (
  SELECT unnest(ARRAY[
    'contacts',
    'profiles', 
    'calendar_events',
    'calendar_attendees',
    'appointments',
    'pricing_plans',
    'user_subscriptions',
    'payment_methods',
    'invoices',
    'conversations',
    'n8n_chat_memory',
    'products',
    'custom_fields',
    'utm_tracking',
    'funnel_data',
    'monthly_growth',
    'campaign_data',
    'leads_by_source'
  ]) AS table_name
),
existing_tables AS (
  SELECT tablename AS table_name
  FROM pg_tables 
  WHERE schemaname = 'public'
)
SELECT 
  et.table_name,
  CASE 
    WHEN ext.table_name IS NOT NULL THEN '✓ EXISTE'
    ELSE '✗ FALTANDO'
  END AS status
FROM expected_tables et
LEFT JOIN existing_tables ext ON et.table_name = ext.table_name
ORDER BY et.table_name;

\echo '';
\echo '4. VERIFICAÇÃO DE ÍNDICES:';
\echo '--------------------------';

SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
  AND indexname NOT LIKE '%_pkey'
ORDER BY tablename, indexname;

\echo '';
\echo '5. VERIFICAÇÃO DE CONSTRAINTS:';
\echo '------------------------------';

SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  CASE 
    WHEN tc.constraint_type = 'FOREIGN KEY' THEN 
      kcu.column_name || ' -> ' || ccu.table_name || '(' || ccu.column_name || ')'
    WHEN tc.constraint_type = 'CHECK' THEN 
      cc.check_clause
    ELSE 
      kcu.column_name
  END AS constraint_details
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu 
  ON tc.constraint_name = ccu.constraint_name
LEFT JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.constraint_type IN ('FOREIGN KEY', 'CHECK', 'UNIQUE')
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;

\echo '';
\echo '6. VERIFICAÇÃO DE TRIGGERS:';
\echo '---------------------------';

SELECT 
  event_object_table AS table_name,
  trigger_name,
  event_manipulation AS trigger_event,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
ORDER BY event_object_table, trigger_name;

\echo '';
\echo '7. VERIFICAÇÃO DE VIEWS:';
\echo '------------------------';

SELECT 
  schemaname,
  viewname,
  viewowner
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

\echo '';
\echo '8. VERIFICAÇÃO DE ROW LEVEL SECURITY:';
\echo '-------------------------------------';

SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

\echo '';
\echo '9. POLÍTICAS DE SEGURANÇA:';
\echo '--------------------------';

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

\echo '';
\echo '10. VERIFICAÇÃO DE COLUNAS CRÍTICAS:';
\echo '------------------------------------';

-- Verificar se as colunas essenciais existem
WITH critical_columns AS (
  SELECT 
    'contacts' as table_name, 'user_id' as column_name, 'UUID' as expected_type
  UNION ALL SELECT 'contacts', 'session_id', 'UUID'
  UNION ALL SELECT 'calendar_events', 'user_id', 'UUID'
  UNION ALL SELECT 'calendar_events', 'start_datetime', 'timestamp with time zone'
  UNION ALL SELECT 'pricing_plans', 'price', 'numeric'
  UNION ALL SELECT 'user_subscriptions', 'user_id', 'UUID'
  UNION ALL SELECT 'user_subscriptions', 'plan_id', 'UUID'
  UNION ALL SELECT 'payment_methods', 'user_id', 'UUID'
  UNION ALL SELECT 'invoices', 'user_id', 'UUID'
  UNION ALL SELECT 'conversations', 'session_id', 'UUID'
),
actual_columns AS (
  SELECT 
    table_name,
    column_name,
    data_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
)
SELECT 
  cc.table_name,
  cc.column_name,
  cc.expected_type,
  COALESCE(ac.data_type, 'MISSING') as actual_type,
  CASE 
    WHEN ac.column_name IS NULL THEN '✗ FALTANDO'
    WHEN ac.data_type = cc.expected_type OR 
         (cc.expected_type = 'UUID' AND ac.data_type = 'uuid') OR
         (cc.expected_type = 'timestamp with time zone' AND ac.data_type = 'timestamp with time zone') OR
         (cc.expected_type = 'numeric' AND ac.data_type = 'numeric')
    THEN '✓ OK'
    ELSE '⚠ TIPO DIFERENTE'
  END AS status
FROM critical_columns cc
LEFT JOIN actual_columns ac ON cc.table_name = ac.table_name AND cc.column_name = ac.column_name
ORDER BY cc.table_name, cc.column_name;

\echo '';
\echo '11. TAMANHO DAS TABELAS:';
\echo '------------------------';

SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

\echo '';
\echo '12. VERIFICAÇÃO DE EXTENSÕES:';
\echo '-----------------------------';

SELECT 
  extname AS extension_name,
  extversion AS version,
  extrelocatable AS relocatable
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'pgcrypto', 'vector')
ORDER BY extname;

\echo '';
\echo '13. RESUMO FINAL:';
\echo '----------------';

-- Resumo executivo
WITH table_stats AS (
  SELECT COUNT(*) as total_tables
  FROM pg_tables 
  WHERE schemaname = 'public'
),
index_stats AS (
  SELECT COUNT(*) as total_indexes
  FROM pg_indexes 
  WHERE schemaname = 'public'
),
constraint_stats AS (
  SELECT COUNT(*) as total_constraints
  FROM information_schema.table_constraints
  WHERE table_schema = 'public'
),
trigger_stats AS (
  SELECT COUNT(*) as total_triggers
  FROM information_schema.triggers
  WHERE event_object_schema = 'public'
),
view_stats AS (
  SELECT COUNT(*) as total_views
  FROM pg_views 
  WHERE schemaname = 'public'
),
rls_stats AS (
  SELECT COUNT(*) as tables_with_rls
  FROM pg_tables 
  WHERE schemaname = 'public' AND rowsecurity = true
)
SELECT 
  'Total de Tabelas: ' || ts.total_tables as estatistica
FROM table_stats ts
UNION ALL
SELECT 'Total de Índices: ' || ins.total_indexes FROM index_stats ins
UNION ALL
SELECT 'Total de Constraints: ' || cs.total_constraints FROM constraint_stats cs
UNION ALL
SELECT 'Total de Triggers: ' || trs.total_triggers FROM trigger_stats trs
UNION ALL
SELECT 'Total de Views: ' || vs.total_views FROM view_stats vs
UNION ALL
SELECT 'Tabelas com RLS: ' || rls.tables_with_rls FROM rls_stats rls;

\echo '';
\echo '14. VERIFICAÇÃO DE INTEGRIDADE:';
\echo '-------------------------------';

-- Verificar se há dados órfãos
DO $$
DECLARE
    orphan_count INTEGER;
BEGIN
    -- Verificar contatos sem usuário
    SELECT COUNT(*) INTO orphan_count
    FROM contacts c
    LEFT JOIN auth.users u ON c.user_id = u.id
    WHERE u.id IS NULL;
    
    IF orphan_count > 0 THEN
        RAISE NOTICE 'ATENÇÃO: % contatos órfãos (sem usuário válido)', orphan_count;
    ELSE
        RAISE NOTICE '✓ Todos os contatos têm usuários válidos';
    END IF;
    
    -- Verificar eventos sem usuário (se a tabela existir)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'calendar_events') THEN
        SELECT COUNT(*) INTO orphan_count
        FROM calendar_events ce
        LEFT JOIN auth.users u ON ce.user_id = u.id
        WHERE u.id IS NULL;
        
        IF orphan_count > 0 THEN
            RAISE NOTICE 'ATENÇÃO: % eventos órfãos (sem usuário válido)', orphan_count;
        ELSE
            RAISE NOTICE '✓ Todos os eventos têm usuários válidos';
        END IF;
    END IF;
    
    -- Verificar assinaturas sem usuário (se a tabela existir)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_subscriptions') THEN
        SELECT COUNT(*) INTO orphan_count
        FROM user_subscriptions us
        LEFT JOIN auth.users u ON us.user_id = u.id
        WHERE u.id IS NULL;
        
        IF orphan_count > 0 THEN
            RAISE NOTICE 'ATENÇÃO: % assinaturas órfãs (sem usuário válido)', orphan_count;
        ELSE
            RAISE NOTICE '✓ Todas as assinaturas têm usuários válidos';
        END IF;
    END IF;
END $$;

\echo '';
\echo '=========================================';
\echo 'VERIFICAÇÃO CONCLUÍDA';
\echo '';
\echo 'Se você viu mensagens de erro acima,';
\echo 'revise a migração e execute novamente.';
\echo '';
\echo 'Se tudo estiver OK, o banco está pronto';
\echo 'para uso com o Valore CRM v2!';
\echo '=========================================';