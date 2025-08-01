-- Verificar dados na tabela knowledge_base
SELECT 
  'Total de artigos' as info,
  COUNT(*) as count
FROM knowledge_base;

-- Verificar artigos por status
SELECT 
  'Artigos por status' as info,
  status,
  COUNT(*) as count
FROM knowledge_base
GROUP BY status;

-- Verificar artigos por language
SELECT 
  'Artigos por idioma' as info,
  language,
  COUNT(*) as count
FROM knowledge_base
GROUP BY language;

-- Verificar artigos públicos
SELECT 
  'Artigos públicos' as info,
  is_public,
  COUNT(*) as count
FROM knowledge_base
GROUP BY is_public;

-- Verificar alguns artigos de exemplo
SELECT 
  id,
  title,
  category,
  subcategory,
  language,
  status,
  is_public,
  created_at
FROM knowledge_base
ORDER BY created_at DESC
LIMIT 5;

-- Verificar se há artigos que atendem aos critérios do filtro
SELECT 
  'Artigos que atendem critérios (pt, published, public)' as info,
  COUNT(*) as count
FROM knowledge_base
WHERE language = 'pt'
  AND status = 'published'
  AND is_public = true;

-- Verificar todos os valores únicos de language
SELECT DISTINCT language FROM knowledge_base ORDER BY language;

-- Verificar todos os valores únicos de status
SELECT DISTINCT status FROM knowledge_base ORDER BY status;