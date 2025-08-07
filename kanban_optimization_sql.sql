-- Otimizações de índices para o sistema Kanban

-- Índice composto para otimizar consultas que filtram por user_id, kanban_stage_id e ordenam por created_at
-- Este índice melhora significativamente o desempenho das consultas usadas na visualização Kanban
CREATE INDEX IF NOT EXISTS idx_contacts_user_stage_created 
  ON public.contacts USING btree (user_id, kanban_stage_id, created_at DESC);

-- Índice para otimizar consultas de contagem por estágio do Kanban
-- Útil para o componente de funil e estatísticas
CREATE INDEX IF NOT EXISTS idx_contacts_user_stage_count 
  ON public.contacts USING btree (user_id, kanban_stage_id) 
  WHERE deleted_at IS NULL;

-- Índice para melhorar a performance de buscas por texto
-- Útil quando o usuário filtra contatos por termos de pesquisa
CREATE INDEX IF NOT EXISTS idx_contacts_search 
  ON public.contacts USING gin (to_tsvector('portuguese', name || ' ' || COALESCE(email, '') || ' ' || COALESCE(phone, '') || ' ' || COALESCE(client_name, '')));

-- Índice para otimizar consultas que filtram por tags
-- Melhora o desempenho quando o usuário filtra contatos por tags específicas
CREATE INDEX IF NOT EXISTS idx_contacts_tags 
  ON public.contacts USING gin (tags);

-- Adicionar estatísticas estendidas para melhorar o planejador de consultas
-- Isso ajuda o PostgreSQL a fazer melhores escolhas de plano de execução
CREATE STATISTICS IF NOT EXISTS contacts_user_stage_stats (dependencies) 
  ON user_id, kanban_stage_id FROM contacts;

-- Otimização para a tabela kanban_stages
-- Melhora consultas que buscam estágios por usuário e ordenam por ordering
CREATE INDEX IF NOT EXISTS idx_kanban_stages_user_ordering 
  ON public.kanban_stages USING btree (user_id, ordering);

-- Comentário: Após aplicar estes índices, é recomendável executar ANALYZE nas tabelas
-- para atualizar as estatísticas do planejador de consultas
ANALYZE contacts;
ANALYZE kanban_stages;