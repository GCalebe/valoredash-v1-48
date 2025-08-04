-- PHASE 1: CRITICAL DATABASE SECURITY FIXES
-- Fix RLS policies for tables without them and address security definer views

-- First, let's check which tables need RLS policies
-- Create proper RLS policies for critical tables

-- 1. Fix custom_fields table RLS policies
ALTER TABLE public.custom_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own custom fields" 
ON public.custom_fields 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own custom fields" 
ON public.custom_fields 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own custom fields" 
ON public.custom_fields 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own custom fields" 
ON public.custom_fields 
FOR DELETE 
USING (user_id = auth.uid());

-- 2. Fix custom_field_validation_rules table RLS policies
ALTER TABLE public.custom_field_validation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage validation rules for their fields" 
ON public.custom_field_validation_rules 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.custom_fields 
    WHERE id = field_id AND user_id = auth.uid()
  )
);

-- 3. Fix custom_field_audit_log table RLS policies
ALTER TABLE public.custom_field_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit logs for their data" 
ON public.custom_field_audit_log 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.contacts 
    WHERE id = client_id AND user_id = auth.uid()
  )
);

-- Only system can insert/update audit logs
CREATE POLICY "System can manage audit logs" 
ON public.custom_field_audit_log 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- 4. Fix dados_cliente table RLS policies (critical data table)
ALTER TABLE public.dados_cliente ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own client data" 
ON public.dados_cliente 
FOR SELECT 
USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can create client data" 
ON public.dados_cliente 
FOR INSERT 
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can update their own client data" 
ON public.dados_cliente 
FOR UPDATE 
USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can delete their own client data" 
ON public.dados_cliente 
FOR DELETE 
USING (user_id = auth.uid() OR user_id IS NULL);

-- 5. Fix evolution_instances table RLS policies
ALTER TABLE public.evolution_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own evolution instances" 
ON public.evolution_instances 
FOR ALL 
USING (user_id = auth.uid());

-- 6. Fix knowledge_base table RLS policies
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view published articles or their own" 
ON public.knowledge_base 
FOR SELECT 
USING (status = 'published' OR created_by = auth.uid());

CREATE POLICY "Users can create their own knowledge articles" 
ON public.knowledge_base 
FOR INSERT 
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own knowledge articles" 
ON public.knowledge_base 
FOR UPDATE 
USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own knowledge articles" 
ON public.knowledge_base 
FOR DELETE 
USING (created_by = auth.uid());

-- 7. Fix knowledge_categories table RLS policies
ALTER TABLE public.knowledge_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view categories" 
ON public.knowledge_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create categories" 
ON public.knowledge_categories 
FOR INSERT 
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own categories" 
ON public.knowledge_categories 
FOR UPDATE 
USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own categories" 
ON public.knowledge_categories 
FOR DELETE 
USING (created_by = auth.uid());

-- 8. Fix function search path vulnerabilities (CRITICAL)
-- Update all functions to have secure search paths

CREATE OR REPLACE FUNCTION public.update_updated_at_utm_tracking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_kanban_stages()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.soft_delete_record(table_name text, record_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  sql_query TEXT;
  record_exists BOOLEAN;
BEGIN
  -- Verificar se o registro existe e não está deletado
  sql_query := format('SELECT EXISTS(SELECT 1 FROM %I WHERE id = $1 AND deleted_at IS NULL)', table_name);
  EXECUTE sql_query USING record_id INTO record_exists;
  
  IF NOT record_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Fazer soft delete
  sql_query := format('UPDATE %I SET deleted_at = now() WHERE id = $1', table_name);
  EXECUTE sql_query USING record_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$function$;

-- 9. Secure materialized views by removing SECURITY DEFINER where inappropriate
-- Note: We'll need to recreate these views without SECURITY DEFINER

-- Drop and recreate views safely
DROP MATERIALIZED VIEW IF EXISTS mv_kanban_stages_cache;
DROP MATERIALIZED VIEW IF EXISTS mv_faq_items_cache;

-- Create secure materialized views
CREATE MATERIALIZED VIEW mv_kanban_stages_cache AS
SELECT 
  id,
  title,
  color,
  stage_order,
  created_at,
  updated_at,
  user_id
FROM public.kanban_stages
WHERE user_id IS NOT NULL;

CREATE MATERIALIZED VIEW mv_faq_items_cache AS
SELECT 
  id,
  question,
  answer,
  category,
  is_active,
  created_at,
  updated_at,
  user_id
FROM public.faq_items
WHERE is_active = true;

-- Create indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mv_kanban_stages_user_id ON mv_kanban_stages_cache(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mv_faq_items_user_id ON mv_faq_items_cache(user_id);

-- 10. Add critical missing RLS policies for system tables
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage system alerts" 
ON public.system_alerts 
FOR ALL 
USING (is_admin_user());

ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view performance metrics" 
ON public.performance_metrics 
FOR SELECT 
USING (is_admin_user());

CREATE POLICY "System can insert performance metrics" 
ON public.performance_metrics 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- Update timestamp functions for better security
CREATE OR REPLACE FUNCTION public._set_timestamps()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  IF TG_OP = 'INSERT' THEN
    NEW.created_at = NOW();
  END IF;
  RETURN NEW;
END;
$function$;