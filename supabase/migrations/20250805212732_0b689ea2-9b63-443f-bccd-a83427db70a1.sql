-- Remove produtos sem user_id (produtos órfãos)
-- Estes produtos não estão associados a nenhum usuário e podem causar problemas
-- nas políticas RLS e na aplicação

-- Primeiro, vamos listar quantos produtos serão removidos para log
DO $$
DECLARE
    produtos_removidos INTEGER;
BEGIN
    -- Contar produtos que serão removidos
    SELECT COUNT(*) INTO produtos_removidos FROM public.products WHERE user_id IS NULL;
    
    -- Log da operação
    RAISE NOTICE 'Removendo % produtos sem user_id', produtos_removidos;
    
    -- Remover produtos órfãos
    DELETE FROM public.products WHERE user_id IS NULL;
    
    -- Confirmar remoção
    RAISE NOTICE 'Produtos órfãos removidos com sucesso';
END $$;

-- Garantir que a coluna user_id seja obrigatória para evitar produtos órfãos no futuro
ALTER TABLE public.products 
ALTER COLUMN user_id SET NOT NULL;