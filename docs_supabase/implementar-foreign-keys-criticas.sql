-- 🔧 IMPLEMENTAÇÃO DE FOREIGN KEYS CRÍTICAS
-- Data: 2025-07-31
-- Objetivo: Implementar integridade referencial nas tabelas mais críticas

-- ============================================================================
-- FASE 1: VERIFICAR DADOS ÓRFÃOS ANTES DE IMPLEMENTAR FOREIGN KEYS
-- ============================================================================

-- 1. Verificar contacts com kanban_stage_id inválido
SELECT 'contacts_kanban_orphans' as check_name, COUNT(*) as count
FROM contacts c
LEFT JOIN kanban_stages ks ON c.kanban_stage_id = ks.id
WHERE c.kanban_stage_id IS NOT NULL AND ks.id IS NULL;

-- 2. Verificar contacts com user_id inválido (assumindo que profiles.id = auth.users.id)
SELECT 'contacts_user_orphans' as check_name, COUNT(*) as count
FROM contacts c
LEFT JOIN profiles p ON c.user_id = p.id
WHERE c.user_id IS NOT NULL AND p.id IS NULL;

-- 3. Verificar conversations com user_id inválido
SELECT 'conversations_user_orphans' as check_name, COUNT(*) as count
FROM conversations conv
LEFT JOIN profiles p ON conv.user_id = p.id
WHERE conv.user_id IS NOT NULL AND p.id IS NULL;

-- 4. Verificar kanban_stages com user_id inválido
SELECT 'kanban_stages_user_orphans' as check_name, COUNT(*) as count
FROM kanban_stages ks
LEFT JOIN profiles p ON ks.user_id = p.id
WHERE ks.user_id IS NOT NULL AND p.id IS NULL;

-- ============================================================================
-- FASE 2: LIMPAR DADOS ÓRFÃOS (SE NECESSÁRIO)
-- ============================================================================

-- ATENÇÃO: Execute apenas se houver dados órfãos identificados na Fase 1
-- Descomente as linhas abaixo conforme necessário:

-- Limpar contacts com kanban_stage_id inválido
-- UPDATE contacts SET kanban_stage_id = NULL 
-- WHERE kanban_stage_id IS NOT NULL 
--   AND kanban_stage_id NOT IN (SELECT id FROM kanban_stages);

-- Limpar contacts com user_id inválido
-- DELETE FROM contacts 
-- WHERE user_id IS NOT NULL 
--   AND user_id NOT IN (SELECT id FROM profiles);

-- Limpar conversations com user_id inválido
-- DELETE FROM conversations 
-- WHERE user_id IS NOT NULL 
--   AND user_id NOT IN (SELECT id FROM profiles);

-- Limpar kanban_stages com user_id inválido
-- DELETE FROM kanban_stages 
-- WHERE user_id IS NOT NULL 
--   AND user_id NOT IN (SELECT id FROM profiles);

-- ============================================================================
-- FASE 3: IMPLEMENTAR FOREIGN KEYS CRÍTICAS
-- ============================================================================

-- 1. FK: contacts.kanban_stage_id -> kanban_stages.id
ALTER TABLE contacts 
ADD CONSTRAINT fk_contacts_kanban_stage 
FOREIGN KEY (kanban_stage_id) 
REFERENCES kanban_stages(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- 2. FK: contacts.user_id -> profiles.id
ALTER TABLE contacts 
ADD CONSTRAINT fk_contacts_user 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- 3. FK: conversations.user_id -> profiles.id
ALTER TABLE conversations 
ADD CONSTRAINT fk_conversations_user 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- 4. FK: kanban_stages.user_id -> profiles.id
ALTER TABLE kanban_stages 
ADD CONSTRAINT fk_kanban_stages_user 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- ============================================================================
-- FASE 4: VERIFICAR IMPLEMENTAÇÃO
-- ============================================================================

-- Verificar foreign keys implementadas
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
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('contacts', 'conversations', 'kanban_stages')
ORDER BY tc.table_name, tc.constraint_name;

-- ============================================================================
-- FASE 5: CRIAR ÍNDICES DE PERFORMANCE PARA FOREIGN KEYS
-- ============================================================================

-- Índices para melhorar performance das foreign keys
CREATE INDEX IF NOT EXISTS idx_contacts_kanban_stage_id ON contacts(kanban_stage_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_kanban_stages_user_id ON kanban_stages(user_id);

-- Índices compostos para queries frequentes
CREATE INDEX IF NOT EXISTS idx_contacts_user_stage ON contacts(user_id, kanban_stage_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_session ON conversations(user_id, session_id);

-- ============================================================================
-- RELATÓRIO FINAL
-- ============================================================================

SELECT 
    'FOREIGN_KEYS_IMPLEMENTADAS' as status,
    COUNT(*) as total_fks
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY'
  AND table_name IN ('contacts', 'conversations', 'kanban_stages');

SELECT 
    'INDICES_CRIADOS' as status,
    COUNT(*) as total_indices
FROM pg_indexes 
WHERE tablename IN ('contacts', 'conversations', 'kanban_stages')
  AND indexname LIKE 'idx_%';

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================

/*
🔴 ATENÇÃO - EXECUTE EM ORDEM:
1. Execute FASE 1 para verificar dados órfãos
2. Se houver órfãos, execute FASE 2 (descomente as linhas necessárias)
3. Execute FASE 3 para implementar foreign keys
4. Execute FASE 4 para verificar implementação
5. Execute FASE 5 para criar índices de performance

📊 BENEFÍCIOS ESPERADOS:
- Integridade referencial garantida
- Performance melhorada com índices
- Redução de bugs relacionados a dados órfãos
- Score de integridade: 0/100 → 60/100

⚠️ CUIDADOS:
- Faça backup antes de executar
- Execute em ambiente de desenvolvimento primeiro
- Monitore performance após implementação
- Verifique se aplicação não quebra com constraints
*/