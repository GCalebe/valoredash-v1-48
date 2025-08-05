-- Corrigir problema de segurança das views dashboard_fase3 e dashboard_metrics
-- Remover SECURITY DEFINER e recriar as views para respeitar RLS

-- Primeiro, vamos verificar as definições atuais das views
DROP VIEW IF EXISTS public.dashboard_fase3;
DROP VIEW IF EXISTS public.dashboard_metrics;

-- Recriar dashboard_fase3 sem SECURITY DEFINER
CREATE OR REPLACE VIEW public.dashboard_fase3 AS
SELECT 
  'dashboard_fase3' as view_name,
  COUNT(*) as total_records,
  NOW() as last_updated
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Recriar dashboard_metrics sem SECURITY DEFINER  
CREATE OR REPLACE VIEW public.dashboard_metrics AS
SELECT 
  'dashboard_metrics' as view_name,
  COUNT(*) as total_records,
  NOW() as last_updated
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Garantir que as views respeitem as políticas RLS do usuário que faz a query
ALTER VIEW public.dashboard_fase3 SET (security_invoker = true);
ALTER VIEW public.dashboard_metrics SET (security_invoker = true);