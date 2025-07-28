-- Adicionar a coluna para associar agendas a um item de FAQ
ALTER TABLE public.faq_items
ADD COLUMN associated_agendas UUID[];

-- Criar um índice para otimizar buscas nesta nova coluna
CREATE INDEX IF NOT EXISTS idx_faq_items_associated_agendas ON public.faq_items USING GIN(associated_agendas);

-- Adicionar um comentário para documentação
COMMENT ON COLUMN public.faq_items.associated_agendas IS 'Array de IDs de agendas (da tabela agendas) associadas a esta FAQ.';
