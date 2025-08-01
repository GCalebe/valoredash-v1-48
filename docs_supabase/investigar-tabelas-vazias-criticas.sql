-- 🔍 INVESTIGAÇÃO DE TABELAS VAZIAS CRÍTICAS
-- Data: 2025-07-31
-- Objetivo: Descobrir por que tabelas críticas estão vazias

-- ============================================================================
-- PARTE 1: VERIFICAR ESTRUTURA DAS TABELAS VAZIAS
-- ============================================================================

-- 1. Estrutura da tabela n8n_chat_memory
SELECT 
    'n8n_chat_memory' as tabela,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'n8n_chat_memory' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Estrutura da tabela n8n_chat_histories
SELECT 
    'n8n_chat_histories' as tabela,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'n8n_chat_histories' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Estrutura da tabela user_sessions
SELECT 
    'user_sessions' as tabela,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_sessions' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Estrutura da tabela user_settings
SELECT 
    'user_settings' as tabela,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_settings' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================================================
-- PARTE 2: VERIFICAR TRIGGERS E PROCEDURES
-- ============================================================================

-- Verificar triggers nas tabelas vazias
SELECT 
    event_object_table as tabela,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table IN ('n8n_chat_memory', 'n8n_chat_histories', 'user_sessions', 'user_settings')
ORDER BY event_object_table, trigger_name;

-- ============================================================================
-- PARTE 3: VERIFICAR POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ============================================================================

-- Verificar se RLS está habilitado e pode estar bloqueando inserções
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    forcerowsecurity
FROM pg_tables 
WHERE tablename IN ('n8n_chat_memory', 'n8n_chat_histories', 'user_sessions', 'user_settings')
  AND schemaname = 'public';

-- Verificar políticas RLS existentes
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
WHERE tablename IN ('n8n_chat_memory', 'n8n_chat_histories', 'user_sessions', 'user_settings')
  AND schemaname = 'public';

-- ============================================================================
-- PARTE 4: VERIFICAR ESTATÍSTICAS DE ATIVIDADE
-- ============================================================================

-- Verificar histórico de atividade das tabelas
SELECT 
    schemaname,
    relname as tabela,
    n_tup_ins as insercoes_tentadas,
    n_tup_upd as atualizacoes_tentadas,
    n_tup_del as delecoes_tentadas,
    n_live_tup as registros_atuais,
    n_dead_tup as registros_mortos,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables 
WHERE relname IN ('n8n_chat_memory', 'n8n_chat_histories', 'user_sessions', 'user_settings');

-- ============================================================================
-- PARTE 5: VERIFICAR TABELAS RELACIONADAS COM DADOS
-- ============================================================================

-- Verificar se existem tabelas relacionadas com dados
-- Tabelas de chat que podem ter dados
SELECT 'n8n_chat_messages' as tabela_relacionada, COUNT(*) as registros
FROM n8n_chat_messages
UNION ALL
SELECT 'conversations' as tabela_relacionada, COUNT(*) as registros
FROM conversations;

-- Verificar se existem usuários que deveriam ter sessões/configurações
SELECT 'profiles_ativos' as info, COUNT(*) as total
FROM profiles
UNION ALL
SELECT 'contacts_com_user_id' as info, COUNT(*) as total
FROM contacts WHERE user_id IS NOT NULL;

-- ============================================================================
-- PARTE 6: TESTE DE INSERÇÃO SIMPLES
-- ============================================================================

-- ATENÇÃO: Estes são testes de inserção - execute apenas se necessário
-- Descomente para testar se é possível inserir dados

/*
-- Teste 1: Tentar inserir em user_settings (se profiles existir)
INSERT INTO user_settings (id, user_id, theme, notifications_enabled, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    id,
    'light',
    true,
    NOW(),
    NOW()
FROM profiles 
LIMIT 1;

-- Teste 2: Tentar inserir em user_sessions (se profiles existir)
INSERT INTO user_sessions (id, user_id, session_token, expires_at, created_at)
SELECT 
    gen_random_uuid(),
    id,
    'test_session_' || gen_random_uuid(),
    NOW() + INTERVAL '1 day',
    NOW()
FROM profiles 
LIMIT 1;
*/

-- ============================================================================
-- PARTE 7: VERIFICAR DEPENDÊNCIAS E RELACIONAMENTOS
-- ============================================================================

-- Verificar se existem foreign keys que impedem inserções
SELECT 
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('n8n_chat_memory', 'n8n_chat_histories', 'user_sessions', 'user_settings');

-- ============================================================================
-- RELATÓRIO FINAL DE INVESTIGAÇÃO
-- ============================================================================

SELECT 
    'INVESTIGACAO_CONCLUIDA' as status,
    NOW() as timestamp,
    'Verifique os resultados acima para identificar a causa das tabelas vazias' as proximo_passo;

-- ============================================================================
-- NOTAS PARA ANÁLISE
-- ============================================================================

/*
🔍 POSSÍVEIS CAUSAS DE TABELAS VAZIAS:

1. **RLS (Row Level Security) muito restritivo**
   - Políticas que impedem inserções
   - Usuário sem permissões adequadas

2. **Triggers que falham**
   - Triggers BEFORE INSERT que retornam NULL
   - Triggers que fazem rollback

3. **Foreign Keys faltando**
   - Tentativas de inserção com IDs inválidos
   - Dados órfãos sendo rejeitados

4. **Aplicação não está inserindo dados**
   - Funcionalidade não implementada
   - Bugs no código de inserção
   - Configuração incorreta

5. **Dados foram deletados**
   - Limpeza automática muito agressiva
   - Cascade deletes não intencionais
   - Truncate acidental

📋 PRÓXIMOS PASSOS BASEADOS NOS RESULTADOS:
- Se RLS estiver ativo: Revisar políticas
- Se triggers existirem: Verificar lógica
- Se não há atividade: Verificar código da aplicação
- Se há atividade mas sem dados: Investigar deletes
*/