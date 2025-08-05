-- Corrigir problema de segurança da view v_kanban_stages_optimized
-- Remover SECURITY DEFINER e recriar a view

DROP VIEW IF EXISTS public.v_kanban_stages_optimized;

-- Recriar a view sem SECURITY DEFINER para respeitar as políticas RLS
CREATE OR REPLACE VIEW public.v_kanban_stages_optimized AS
SELECT 
    ks.id,
    ks.title,
    ks.ordering,
    ks.settings,
    ks.user_id,
    ks.created_at,
    ks.updated_at,
    COUNT(c.id) as contact_count
FROM public.kanban_stages ks
LEFT JOIN public.contacts c ON c.kanban_stage_id = ks.id
GROUP BY ks.id, ks.title, ks.ordering, ks.settings, ks.user_id, ks.created_at, ks.updated_at
ORDER BY ks.ordering;

-- Garantir que a view também tenha RLS habilitado
ALTER VIEW public.v_kanban_stages_optimized SET (security_invoker = true);

-- Verificar se as políticas RLS das tabelas subjacentes estão corretas
-- As políticas já existem para kanban_stages e contacts baseadas em user_id = auth.uid()