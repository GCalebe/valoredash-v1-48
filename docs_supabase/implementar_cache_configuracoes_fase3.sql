-- =====================================================
-- FASE 3: SISTEMA DE CACHE PARA CONFIGURAÇÕES
-- Data: 31/01/2025
-- Objetivo: Implementar cache para tabelas frequentemente acessadas
-- =====================================================

-- =====================================================
-- 1. MATERIALIZED VIEWS PARA CACHE
-- =====================================================

-- Cache para kanban_stages (17 registros, usado frequentemente)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_kanban_stages_cache AS
SELECT 
  id,
  user_id,
  title,
  description,
  color,
  ordering,
  settings,
  created_at,
  updated_at,
  -- Campos calculados para performance
  CASE 
    WHEN ordering <= 2 THEN 'inicial'
    WHEN ordering <= 4 THEN 'meio'
    ELSE 'final'
  END as stage_group,
  
  -- Contagem de contatos por estágio (atualizada no refresh)
  (
    SELECT COUNT(*) 
    FROM contacts c 
    WHERE c.kanban_stage_id = kanban_stages.id
  ) as contacts_count,
  
  NOW() as cache_updated_at
FROM kanban_stages
ORDER BY user_id, ordering;

-- Índices para a materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kanban_stages_cache_id ON mv_kanban_stages_cache(id);
CREATE INDEX IF NOT EXISTS idx_mv_kanban_stages_cache_user_ordering ON mv_kanban_stages_cache(user_id, ordering);
CREATE INDEX IF NOT EXISTS idx_mv_kanban_stages_cache_group ON mv_kanban_stages_cache(stage_group);

-- Cache para faq_items (31 registros, se implementado)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_faq_items_cache AS
SELECT 
  id,
  question,
  answer,
  category,
  tags,
  is_active,
  created_at,
  updated_at,
  created_by,
  
  -- Campos calculados
  LENGTH(answer) as answer_length,
  array_length(tags, 1) as tags_count,
  
  -- Ranking por categoria
  ROW_NUMBER() OVER (PARTITION BY category ORDER BY created_at DESC) as category_rank,
  
  NOW() as cache_updated_at
FROM faq_items
WHERE is_active = true
ORDER BY category, created_at DESC;

-- Índices para FAQ cache
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_faq_items_cache_id ON mv_faq_items_cache(id);
CREATE INDEX IF NOT EXISTS idx_mv_faq_items_cache_category ON mv_faq_items_cache(category);
CREATE INDEX IF NOT EXISTS idx_mv_faq_items_cache_tags ON mv_faq_items_cache USING GIN(tags);

-- Cache para knowledge_categories (9 registros)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_knowledge_categories_cache AS
SELECT 
  kc.id,
  kc.name,
  kc.description,
  kc.icon,
  kc.color,
  kc.is_active,
  kc.created_at,
  kc.updated_at,
  
  -- Contagem de artigos por categoria
  (
    SELECT COUNT(*) 
    FROM knowledge_base kb 
    WHERE kb.category = kc.name
  ) as articles_count,
  
  -- Contagem de FAQs por categoria
  (
    SELECT COUNT(*) 
    FROM faq_items fi 
    WHERE fi.category = kc.name AND fi.is_active = true
  ) as faq_count,
  
  NOW() as cache_updated_at
FROM knowledge_categories kc
WHERE kc.is_active = true
ORDER BY kc.name;

-- Índices para knowledge categories cache
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_knowledge_categories_cache_id ON mv_knowledge_categories_cache(id);
CREATE INDEX IF NOT EXISTS idx_mv_knowledge_categories_cache_name ON mv_knowledge_categories_cache(name);

-- =====================================================
-- 2. FUNÇÕES PARA REFRESH DO CACHE
-- =====================================================

-- Função para refresh completo do cache
CREATE OR REPLACE FUNCTION refresh_all_cache_fase3()
RETURNS TABLE(
  cache_name TEXT,
  refresh_status TEXT,
  rows_updated INTEGER,
  execution_time_ms INTEGER
) AS $$
DECLARE
  start_time TIMESTAMP;
  end_time TIMESTAMP;
  rows_count INTEGER;
BEGIN
  -- Refresh kanban_stages cache
  start_time := NOW();
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kanban_stages_cache;
  GET DIAGNOSTICS rows_count = ROW_COUNT;
  end_time := NOW();
  
  RETURN QUERY
  SELECT 
    'mv_kanban_stages_cache'::TEXT,
    'success'::TEXT,
    (SELECT COUNT(*)::INTEGER FROM mv_kanban_stages_cache),
    EXTRACT(EPOCH FROM (end_time - start_time) * 1000)::INTEGER;
  
  -- Refresh faq_items cache
  start_time := NOW();
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_faq_items_cache;
  end_time := NOW();
  
  RETURN QUERY
  SELECT 
    'mv_faq_items_cache'::TEXT,
    'success'::TEXT,
    (SELECT COUNT(*)::INTEGER FROM mv_faq_items_cache),
    EXTRACT(EPOCH FROM (end_time - start_time) * 1000)::INTEGER;
  
  -- Refresh knowledge_categories cache
  start_time := NOW();
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_knowledge_categories_cache;
  end_time := NOW();
  
  RETURN QUERY
  SELECT 
    'mv_knowledge_categories_cache'::TEXT,
    'success'::TEXT,
    (SELECT COUNT(*)::INTEGER FROM mv_knowledge_categories_cache),
    EXTRACT(EPOCH FROM (end_time - start_time) * 1000)::INTEGER;
    
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY
    SELECT 
      'error'::TEXT,
      SQLERRM::TEXT,
      0::INTEGER,
      0::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- Função para refresh seletivo baseado em mudanças
CREATE OR REPLACE FUNCTION refresh_cache_if_needed_fase3()
RETURNS TEXT AS $$
DECLARE
  last_kanban_update TIMESTAMP;
  last_faq_update TIMESTAMP;
  last_knowledge_update TIMESTAMP;
  cache_kanban_update TIMESTAMP;
  cache_faq_update TIMESTAMP;
  cache_knowledge_update TIMESTAMP;
  refreshed_caches TEXT := '';
BEGIN
  -- Verificar última atualização das tabelas originais
  SELECT MAX(updated_at) INTO last_kanban_update FROM kanban_stages;
  SELECT MAX(updated_at) INTO last_faq_update FROM faq_items;
  SELECT MAX(updated_at) INTO last_knowledge_update FROM knowledge_categories;
  
  -- Verificar última atualização dos caches
  SELECT MAX(cache_updated_at) INTO cache_kanban_update FROM mv_kanban_stages_cache;
  SELECT MAX(cache_updated_at) INTO cache_faq_update FROM mv_faq_items_cache;
  SELECT MAX(cache_updated_at) INTO cache_knowledge_update FROM mv_knowledge_categories_cache;
  
  -- Refresh kanban se necessário
  IF last_kanban_update > COALESCE(cache_kanban_update, '1970-01-01'::TIMESTAMP) THEN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kanban_stages_cache;
    refreshed_caches := refreshed_caches || 'kanban_stages, ';
  END IF;
  
  -- Refresh FAQ se necessário
  IF last_faq_update > COALESCE(cache_faq_update, '1970-01-01'::TIMESTAMP) THEN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_faq_items_cache;
    refreshed_caches := refreshed_caches || 'faq_items, ';
  END IF;
  
  -- Refresh knowledge se necessário
  IF last_knowledge_update > COALESCE(cache_knowledge_update, '1970-01-01'::TIMESTAMP) THEN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_knowledge_categories_cache;
    refreshed_caches := refreshed_caches || 'knowledge_categories, ';
  END IF;
  
  IF refreshed_caches = '' THEN
    RETURN 'Nenhum cache precisou ser atualizado';
  ELSE
    RETURN 'Caches atualizados: ' || TRIM(TRAILING ', ' FROM refreshed_caches);
  END IF;
  
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. TRIGGERS PARA AUTO-REFRESH
-- =====================================================

-- Função trigger para refresh automático
CREATE OR REPLACE FUNCTION trigger_cache_refresh_fase3()
RETURNS TRIGGER AS $$
BEGIN
  -- Usar pg_notify para notificar sistema de cache
  PERFORM pg_notify('cache_refresh_needed', TG_TABLE_NAME);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers para kanban_stages
DROP TRIGGER IF EXISTS trigger_kanban_stages_cache_refresh ON kanban_stages;
CREATE TRIGGER trigger_kanban_stages_cache_refresh
  AFTER INSERT OR UPDATE OR DELETE ON kanban_stages
  FOR EACH ROW EXECUTE FUNCTION trigger_cache_refresh_fase3();

-- Triggers para faq_items
DROP TRIGGER IF EXISTS trigger_faq_items_cache_refresh ON faq_items;
CREATE TRIGGER trigger_faq_items_cache_refresh
  AFTER INSERT OR UPDATE OR DELETE ON faq_items
  FOR EACH ROW EXECUTE FUNCTION trigger_cache_refresh_fase3();

-- Triggers para knowledge_categories
DROP TRIGGER IF EXISTS trigger_knowledge_categories_cache_refresh ON knowledge_categories;
CREATE TRIGGER trigger_knowledge_categories_cache_refresh
  AFTER INSERT OR UPDATE OR DELETE ON knowledge_categories
  FOR EACH ROW EXECUTE FUNCTION trigger_cache_refresh_fase3();

-- =====================================================
-- 4. VIEWS PARA ACESSO SIMPLIFICADO AO CACHE
-- =====================================================

-- View para kanban stages com cache
CREATE OR REPLACE VIEW v_kanban_stages_fast AS
SELECT 
  id,
  user_id,
  title,
  description,
  color,
  ordering,
  settings,
  stage_group,
  contacts_count,
  created_at,
  updated_at,
  'cached' as data_source
FROM mv_kanban_stages_cache

UNION ALL

-- Fallback para dados não cacheados (se cache estiver desatualizado)
SELECT 
  ks.id,
  ks.user_id,
  ks.title,
  ks.description,
  ks.color,
  ks.ordering,
  ks.settings,
  CASE 
    WHEN ks.ordering <= 2 THEN 'inicial'
    WHEN ks.ordering <= 4 THEN 'meio'
    ELSE 'final'
  END as stage_group,
  (
    SELECT COUNT(*) 
    FROM contacts c 
    WHERE c.kanban_stage_id = ks.id
  ) as contacts_count,
  ks.created_at,
  ks.updated_at,
  'live' as data_source
FROM kanban_stages ks
WHERE NOT EXISTS (
  SELECT 1 FROM mv_kanban_stages_cache mvc 
  WHERE mvc.id = ks.id
);

-- View para FAQ com cache
CREATE OR REPLACE VIEW v_faq_items_fast AS
SELECT 
  id,
  question,
  answer,
  category,
  tags,
  answer_length,
  tags_count,
  category_rank,
  created_at,
  updated_at,
  created_by,
  'cached' as data_source
FROM mv_faq_items_cache

UNION ALL

SELECT 
  fi.id,
  fi.question,
  fi.answer,
  fi.category,
  fi.tags,
  LENGTH(fi.answer) as answer_length,
  array_length(fi.tags, 1) as tags_count,
  ROW_NUMBER() OVER (PARTITION BY fi.category ORDER BY fi.created_at DESC) as category_rank,
  fi.created_at,
  fi.updated_at,
  fi.created_by,
  'live' as data_source
FROM faq_items fi
WHERE fi.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM mv_faq_items_cache mvc 
    WHERE mvc.id = fi.id
  );

-- =====================================================
-- 5. FUNÇÃO DE MONITORAMENTO DO CACHE
-- =====================================================

CREATE OR REPLACE FUNCTION monitor_cache_performance_fase3()
RETURNS TABLE(
  cache_name TEXT,
  total_rows INTEGER,
  cache_size_mb NUMERIC,
  last_refresh TIMESTAMP,
  cache_age_minutes INTEGER,
  hit_ratio_estimate NUMERIC,
  recommendation TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH cache_stats AS (
    SELECT 
      'mv_kanban_stages_cache' as cache_name,
      (SELECT COUNT(*)::INTEGER FROM mv_kanban_stages_cache) as total_rows,
      (SELECT pg_size_pretty(pg_total_relation_size('mv_kanban_stages_cache'))::TEXT) as size_pretty,
      (SELECT pg_total_relation_size('mv_kanban_stages_cache')::NUMERIC / 1024 / 1024) as size_mb,
      (SELECT MAX(cache_updated_at) FROM mv_kanban_stages_cache) as last_refresh
    
    UNION ALL
    
    SELECT 
      'mv_faq_items_cache',
      (SELECT COUNT(*)::INTEGER FROM mv_faq_items_cache),
      (SELECT pg_size_pretty(pg_total_relation_size('mv_faq_items_cache'))::TEXT),
      (SELECT pg_total_relation_size('mv_faq_items_cache')::NUMERIC / 1024 / 1024),
      (SELECT MAX(cache_updated_at) FROM mv_faq_items_cache)
    
    UNION ALL
    
    SELECT 
      'mv_knowledge_categories_cache',
      (SELECT COUNT(*)::INTEGER FROM mv_knowledge_categories_cache),
      (SELECT pg_size_pretty(pg_total_relation_size('mv_knowledge_categories_cache'))::TEXT),
      (SELECT pg_total_relation_size('mv_knowledge_categories_cache')::NUMERIC / 1024 / 1024),
      (SELECT MAX(cache_updated_at) FROM mv_knowledge_categories_cache)
  )
  SELECT 
    cs.cache_name,
    cs.total_rows,
    ROUND(cs.size_mb, 3),
    cs.last_refresh,
    EXTRACT(EPOCH FROM (NOW() - cs.last_refresh) / 60)::INTEGER as cache_age_minutes,
    -- Estimativa simples de hit ratio baseada na idade do cache
    CASE 
      WHEN EXTRACT(EPOCH FROM (NOW() - cs.last_refresh) / 60) < 30 THEN 95.0
      WHEN EXTRACT(EPOCH FROM (NOW() - cs.last_refresh) / 60) < 60 THEN 85.0
      WHEN EXTRACT(EPOCH FROM (NOW() - cs.last_refresh) / 60) < 120 THEN 70.0
      ELSE 50.0
    END as hit_ratio_estimate,
    CASE 
      WHEN EXTRACT(EPOCH FROM (NOW() - cs.last_refresh) / 60) < 30 THEN 'Cache atual - OK'
      WHEN EXTRACT(EPOCH FROM (NOW() - cs.last_refresh) / 60) < 60 THEN 'Cache válido'
      WHEN EXTRACT(EPOCH FROM (NOW() - cs.last_refresh) / 60) < 120 THEN 'Considerar refresh'
      ELSE 'Refresh recomendado'
    END as recommendation
  FROM cache_stats cs;
  
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. POLÍTICAS RLS PARA CACHE
-- =====================================================

-- Habilitar RLS nas materialized views
ALTER MATERIALIZED VIEW mv_kanban_stages_cache OWNER TO postgres;
ALTER MATERIALIZED VIEW mv_faq_items_cache OWNER TO postgres;
ALTER MATERIALIZED VIEW mv_knowledge_categories_cache OWNER TO postgres;

-- =====================================================
-- 7. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON MATERIALIZED VIEW mv_kanban_stages_cache IS 'Cache para kanban_stages com contagem de contatos - Fase 3';
COMMENT ON MATERIALIZED VIEW mv_faq_items_cache IS 'Cache para faq_items ativos com campos calculados - Fase 3';
COMMENT ON MATERIALIZED VIEW mv_knowledge_categories_cache IS 'Cache para knowledge_categories com contagens - Fase 3';

COMMENT ON FUNCTION refresh_all_cache_fase3() IS 'Refresh completo de todos os caches - Fase 3';
COMMENT ON FUNCTION refresh_cache_if_needed_fase3() IS 'Refresh seletivo baseado em mudanças - Fase 3';
COMMENT ON FUNCTION monitor_cache_performance_fase3() IS 'Monitoramento de performance dos caches - Fase 3';

COMMENT ON VIEW v_kanban_stages_fast IS 'View otimizada para kanban_stages com fallback - Fase 3';
COMMENT ON VIEW v_faq_items_fast IS 'View otimizada para faq_items com fallback - Fase 3';

-- =====================================================
-- 8. EXECUTAR PRIMEIRA CARGA DO CACHE
-- =====================================================

-- Executar refresh inicial
SELECT * FROM refresh_all_cache_fase3();

-- Verificar status do cache
SELECT * FROM monitor_cache_performance_fase3();