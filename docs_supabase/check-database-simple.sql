-- Script para verificar dados no banco de dados
-- Execute este script no Supabase SQL Editor

-- Verificar contagem de registros em todas as tabelas principais
SELECT 'contacts' as tabela, COUNT(*) as registros FROM contacts
UNION ALL
SELECT 'client_stats' as tabela, COUNT(*) as registros FROM client_stats
UNION ALL
SELECT 'monthly_growth' as tabela, COUNT(*) as registros FROM monthly_growth
UNION ALL
SELECT 'conversation_metrics' as tabela, COUNT(*) as registros FROM conversation_metrics
UNION ALL
SELECT 'funnel_data' as tabela, COUNT(*) as registros FROM funnel_data
UNION ALL
SELECT 'conversion_by_time' as tabela, COUNT(*) as registros FROM conversion_by_time
UNION ALL
SELECT 'leads_by_source' as tabela, COUNT(*) as registros FROM leads_by_source
UNION ALL
SELECT 'leads_over_time' as tabela, COUNT(*) as registros FROM leads_over_time
UNION ALL
SELECT 'utm_metrics' as tabela, COUNT(*) as registros FROM utm_metrics
UNION ALL
SELECT 'campaign_data' as tabela, COUNT(*) as registros FROM campaign_data
UNION ALL
SELECT 'utm_tracking' as tabela, COUNT(*) as registros FROM utm_tracking
UNION ALL
SELECT 'ai_products' as tabela, COUNT(*) as registros FROM ai_products
UNION ALL
SELECT 'custom_fields' as tabela, COUNT(*) as registros FROM custom_fields
UNION ALL
SELECT 'custom_field_validation_rules' as tabela, COUNT(*) as registros FROM custom_field_validation_rules
UNION ALL
SELECT 'client_custom_values' as tabela, COUNT(*) as registros FROM client_custom_values
UNION ALL
SELECT 'custom_field_audit_log' as tabela, COUNT(*) as registros FROM custom_field_audit_log
UNION ALL
SELECT 'chat_messages' as tabela, COUNT(*) as registros FROM chat_messages
UNION ALL
SELECT 'ai_stages' as tabela, COUNT(*) as registros FROM ai_stages
UNION ALL
SELECT 'ai_personality_settings' as tabela, COUNT(*) as registros FROM ai_personality_settings
ORDER BY tabela;

-- Verificar alguns dados de exemplo
SELECT 'Exemplo de contatos:' as info;
SELECT name, email, phone, created_at FROM contacts LIMIT 5;

SELECT 'Exemplo de estatísticas de clientes:' as info;
SELECT contact_id, total_interactions, last_interaction_date FROM client_stats LIMIT 5;

SELECT 'Exemplo de métricas de conversação:' as info;
SELECT contact_id, total_messages, avg_response_time FROM conversation_metrics LIMIT 5;

SELECT 'Exemplo de dados do funil:' as info;
SELECT stage, visitors, conversions, date FROM funnel_data LIMIT 5;

SELECT 'Exemplo de estágios de IA:' as info;
SELECT name, description, stage_order, is_active FROM ai_stages ORDER BY stage_order;

SELECT 'Exemplo de personalidades de IA:' as info;
SELECT name, personality_type, tone, is_active FROM ai_personality_settings;

-- Verificar integridade referencial
SELECT 'Verificação de integridade:' as info;
SELECT 
  'Contatos com estatísticas' as check_type,
  COUNT(DISTINCT c.id) as total_contacts,
  COUNT(DISTINCT cs.contact_id) as contacts_with_stats
FROM contacts c
LEFT JOIN client_stats cs ON c.id = cs.contact_id;

SELECT 
  'Contatos com métricas de conversação' as check_type,
  COUNT(DISTINCT c.id) as total_contacts,
  COUNT(DISTINCT cm.contact_id) as contacts_with_metrics
FROM contacts c
LEFT JOIN conversation_metrics cm ON c.id = cm.contact_id;

-- Resumo final
SELECT 'RESUMO FINAL:' as info;
SELECT 
  (SELECT COUNT(*) FROM contacts) as total_contacts,
  (SELECT COUNT(*) FROM client_stats) as total_client_stats,
  (SELECT COUNT(*) FROM conversation_metrics) as total_conversation_metrics,
  (SELECT COUNT(*) FROM funnel_data) as total_funnel_data,
  (SELECT COUNT(*) FROM utm_tracking) as total_utm_tracking,
  (SELECT COUNT(*) FROM ai_stages) as total_ai_stages,
  (SELECT COUNT(*) FROM ai_personality_settings) as total_ai_personalities;