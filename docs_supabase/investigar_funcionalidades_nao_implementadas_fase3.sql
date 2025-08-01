-- =====================================================
-- FASE 3: INVESTIGAÇÃO DE FUNCIONALIDADES NÃO IMPLEMENTADAS
-- Data: 31/01/2025
-- Objetivo: Analisar sistemas com dados mas sem uso no código
-- =====================================================

-- =====================================================
-- 1. ANÁLISE DO FAQ SYSTEM
-- =====================================================

-- Verificar dados na tabela faq_items
SELECT 
  'FAQ_ITEMS' as sistema,
  COUNT(*) as total_registros,
  COUNT(DISTINCT category) as categorias_distintas,
  MIN(created_at) as primeiro_registro,
  MAX(created_at) as ultimo_registro,
  COUNT(CASE WHEN is_active = true THEN 1 END) as ativos,
  COUNT(CASE WHEN is_active = false THEN 1 END) as inativos
FROM faq_items;

-- Categorias mais populares no FAQ
SELECT 
  category,
  COUNT(*) as quantidade,
  COUNT(CASE WHEN is_active = true THEN 1 END) as ativos
FROM faq_items 
GROUP BY category 
ORDER BY quantidade DESC;

-- =====================================================
-- 2. ANÁLISE DO KNOWLEDGE BASE SYSTEM
-- =====================================================

-- Verificar dados na tabela knowledge_base
SELECT 
  'KNOWLEDGE_BASE' as sistema,
  COUNT(*) as total_registros,
  COUNT(DISTINCT category) as categorias_distintas,
  MIN(created_at) as primeiro_registro,
  MAX(created_at) as ultimo_registro,
  AVG(LENGTH(content)) as tamanho_medio_conteudo
FROM knowledge_base;

-- Verificar knowledge_tags
SELECT 
  'KNOWLEDGE_TAGS' as sistema,
  COUNT(*) as total_registros,
  COUNT(DISTINCT tag_name) as tags_distintas
FROM knowledge_tags;

-- Verificar knowledge_categories
SELECT 
  'KNOWLEDGE_CATEGORIES' as sistema,
  COUNT(*) as total_registros,
  COUNT(DISTINCT name) as categorias_distintas
FROM knowledge_categories;

-- =====================================================
-- 3. ANÁLISE DO UTM TRACKING SYSTEM
-- =====================================================

-- Verificar dados na tabela utm_tracking
SELECT 
  'UTM_TRACKING' as sistema,
  COUNT(*) as total_registros,
  COUNT(DISTINCT utm_source) as fontes_distintas,
  COUNT(DISTINCT utm_medium) as meios_distintos,
  COUNT(DISTINCT utm_campaign) as campanhas_distintas,
  COUNT(CASE WHEN utm_conversion = true THEN 1 END) as conversoes,
  ROUND(AVG(utm_conversion_value), 2) as valor_medio_conversao,
  MIN(created_at) as primeiro_registro,
  MAX(created_at) as ultimo_registro
FROM utm_tracking;

-- Top fontes UTM por conversões
SELECT 
  utm_source,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN utm_conversion = true THEN 1 END) as conversoes,
  ROUND(AVG(utm_conversion_value), 2) as valor_medio,
  ROUND((COUNT(CASE WHEN utm_conversion = true THEN 1 END) * 100.0 / COUNT(*)), 2) as taxa_conversao
FROM utm_tracking 
WHERE utm_source IS NOT NULL
GROUP BY utm_source 
ORDER BY conversoes DESC;

-- =====================================================
-- 4. ANÁLISE DO STAGE MAPPING SYSTEM
-- =====================================================

-- Verificar dados na tabela stage_name_mapping
SELECT 
  'STAGE_NAME_MAPPING' as sistema,
  COUNT(*) as total_registros,
  COUNT(DISTINCT old_name) as nomes_antigos_distintos,
  COUNT(DISTINCT new_name) as nomes_novos_distintos,
  MIN(created_at) as primeiro_registro,
  MAX(created_at) as ultimo_registro
FROM stage_name_mapping;

-- Mapeamentos mais comuns
SELECT 
  old_name,
  new_name,
  COUNT(*) as quantidade
FROM stage_name_mapping 
GROUP BY old_name, new_name 
ORDER BY quantidade DESC;

-- =====================================================
-- 5. ANÁLISE DOS SISTEMAS NÃO UTILIZADOS
-- =====================================================

-- Sistema de Campanhas
SELECT 
  'CAMPANHAS' as sistema,
  (
    SELECT COUNT(*) FROM campaigns
  ) as campaigns_count,
  (
    SELECT COUNT(*) FROM campaign_data
  ) as campaign_data_count,
  (
    SELECT COUNT(*) FROM campaign_recipients
  ) as campaign_recipients_count;

-- Sistema de Pagamentos
SELECT 
  'PAGAMENTOS' as sistema,
  (
    SELECT COUNT(*) FROM payment_methods
  ) as payment_methods_count,
  (
    SELECT COUNT(*) FROM payment_history
  ) as payment_history_count,
  (
    SELECT COUNT(*) FROM invoices
  ) as invoices_count,
  (
    SELECT COUNT(*) FROM invoice_items
  ) as invoice_items_count;

-- Sistema de Cupons
SELECT 
  'CUPONS' as sistema,
  (
    SELECT COUNT(*) FROM discount_coupons
  ) as discount_coupons_count,
  (
    SELECT COUNT(*) FROM coupon_redemptions
  ) as coupon_redemptions_count;

-- =====================================================
-- 6. ANÁLISE DE POTENCIAL DE IMPLEMENTAÇÃO
-- =====================================================

-- Resumo geral de funcionalidades com dados
WITH funcionalidades_com_dados AS (
  SELECT 'FAQ System' as funcionalidade, 
         (SELECT COUNT(*) FROM faq_items) as registros,
         'Alto' as potencial_implementacao,
         'Sistema já tem hook useFAQQuery.ts implementado' as observacao
  
  UNION ALL
  
  SELECT 'Knowledge Base' as funcionalidade,
         (SELECT COUNT(*) FROM knowledge_base) as registros,
         'Alto' as potencial_implementacao,
         'Sistema completo com categorias e tags' as observacao
  
  UNION ALL
  
  SELECT 'UTM Tracking' as funcionalidade,
         (SELECT COUNT(*) FROM utm_tracking) as registros,
         'Médio' as potencial_implementacao,
         'Dados de tracking já coletados, falta dashboard' as observacao
  
  UNION ALL
  
  SELECT 'Stage Mapping' as funcionalidade,
         (SELECT COUNT(*) FROM stage_name_mapping) as registros,
         'Baixo' as potencial_implementacao,
         'Pode ser sistema interno de migração' as observacao
  
  UNION ALL
  
  SELECT 'Sistema Campanhas' as funcionalidade,
         (SELECT COUNT(*) FROM campaigns) as registros,
         'Baixo' as potencial_implementacao,
         'Tabelas vazias, não prioritário' as observacao
  
  UNION ALL
  
  SELECT 'Sistema Pagamentos' as funcionalidade,
         (SELECT COUNT(*) FROM payment_methods) as registros,
         'Médio' as potencial_implementacao,
         'Importante para monetização futura' as observacao
  
  UNION ALL
  
  SELECT 'Sistema Cupons' as funcionalidade,
         (SELECT COUNT(*) FROM discount_coupons) as registros,
         'Baixo' as potencial_implementacao,
         'Funcionalidade de marketing avançada' as observacao
)
SELECT 
  funcionalidade,
  registros,
  potencial_implementacao,
  observacao,
  CASE 
    WHEN registros > 20 THEN 'Implementar na Fase 3'
    WHEN registros > 5 THEN 'Considerar para Fase 4'
    WHEN registros > 0 THEN 'Avaliar necessidade'
    ELSE 'Não prioritário'
  END as recomendacao
FROM funcionalidades_com_dados
ORDER BY registros DESC;

-- =====================================================
-- 7. VERIFICAÇÃO DE INTEGRIDADE DOS DADOS
-- =====================================================

-- Verificar se há referências órfãs ou dados inconsistentes
SELECT 
  'VERIFICACAO_INTEGRIDADE' as tipo,
  'FAQ com categorias inexistentes' as problema,
  COUNT(*) as quantidade
FROM faq_items f
LEFT JOIN knowledge_categories kc ON f.category = kc.name
WHERE kc.name IS NULL AND f.category IS NOT NULL;

-- Verificar UTM tracking sem conversões há muito tempo
SELECT 
  'VERIFICACAO_INTEGRIDADE' as tipo,
  'UTM sem conversões nos últimos 30 dias' as problema,
  COUNT(*) as quantidade
FROM utm_tracking
WHERE created_at > NOW() - INTERVAL '30 days'
  AND utm_conversion = false;

-- =====================================================
-- 8. RECOMENDAÇÕES FINAIS
-- =====================================================

-- Criar view com recomendações de implementação
CREATE OR REPLACE VIEW recomendacoes_implementacao_fase3 AS
WITH analise_funcionalidades AS (
  SELECT 
    'FAQ System' as funcionalidade,
    (SELECT COUNT(*) FROM faq_items) as registros_existentes,
    'Alto' as prioridade,
    'Implementar dashboard de FAQ e integração com chat' as acao_recomendada,
    'Semana 1-2' as prazo_sugerido
  
  UNION ALL
  
  SELECT 
    'Knowledge Base',
    (SELECT COUNT(*) FROM knowledge_base),
    'Alto',
    'Criar interface de busca e navegação por categorias',
    'Semana 2-3'
  
  UNION ALL
  
  SELECT 
    'UTM Analytics',
    (SELECT COUNT(*) FROM utm_tracking),
    'Médio',
    'Dashboard de analytics de campanhas e ROI',
    'Semana 3-4'
  
  UNION ALL
  
  SELECT 
    'Sistema Pagamentos',
    (SELECT COUNT(*) FROM payment_methods),
    'Médio',
    'Avaliar necessidade de monetização',
    'Fase 4'
  
  UNION ALL
  
  SELECT 
    'Stage Mapping',
    (SELECT COUNT(*) FROM stage_name_mapping),
    'Baixo',
    'Verificar se é sistema interno ou funcionalidade',
    'Investigar'
)
SELECT 
  funcionalidade,
  registros_existentes,
  prioridade,
  acao_recomendada,
  prazo_sugerido,
  CASE 
    WHEN registros_existentes > 20 THEN 'Implementação Recomendada'
    WHEN registros_existentes > 5 THEN 'Avaliar Implementação'
    WHEN registros_existentes > 0 THEN 'Baixa Prioridade'
    ELSE 'Não Implementar'
  END as status_recomendacao
FROM analise_funcionalidades
ORDER BY 
  CASE prioridade 
    WHEN 'Alto' THEN 1 
    WHEN 'Médio' THEN 2 
    ELSE 3 
  END,
  registros_existentes DESC;

-- Comentários de documentação
COMMENT ON VIEW recomendacoes_implementacao_fase3 IS 'Recomendações de implementação baseadas na análise de funcionalidades não implementadas - Fase 3';

-- Executar análise final
SELECT * FROM recomendacoes_implementacao_fase3;