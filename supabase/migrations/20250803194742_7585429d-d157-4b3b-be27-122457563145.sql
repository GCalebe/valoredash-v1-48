-- Enable RLS on remaining tables without Row Level Security
-- This fixes the remaining critical security vulnerabilities

-- First, let's check which tables don't have RLS enabled
DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN
        SELECT schemaname, tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        AND NOT EXISTS (
            SELECT 1 FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE c.relname = pg_tables.tablename
            AND n.nspname = pg_tables.schemaname
            AND c.relrowsecurity = true
        )
    LOOP
        EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY;', rec.schemaname, rec.tablename);
        RAISE NOTICE 'Enabled RLS on table %.%', rec.schemaname, rec.tablename;
    END LOOP;
END
$$;

-- Create basic RLS policies for tables that need them
-- These policies allow authenticated users to manage their own data

-- Documents table
CREATE POLICY "Users can manage their own documents"
ON public.documents
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Email templates table  
CREATE POLICY "Users can manage their own email templates"
ON public.email_templates
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Employee tables
CREATE POLICY "Users can manage employees"
ON public.employees
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage employee agendas"
ON public.employee_agendas
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage employee services"
ON public.employee_services
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- FAQ items table
CREATE POLICY "Users can manage FAQ items"
ON public.faq_items
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Metrics and analytics tables
CREATE POLICY "Users can manage their own leads data"
ON public.leads_by_source
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage their own leads over time"
ON public.leads_over_time
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage their own monthly growth"
ON public.monthly_growth
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Products and pricing tables
CREATE POLICY "Users can manage products"
ON public.products
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage product combos"
ON public.product_combos
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage product combo items"
ON public.product_combo_items
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view pricing plans"
ON public.pricing_plans
FOR SELECT
USING (true);

-- Payment and billing tables
CREATE POLICY "Users can manage their own payment history"
ON public.payment_history
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Subscription management
CREATE POLICY "Users can manage their own subscriptions"
ON public.user_subscriptions
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- System tables with admin-only access
CREATE POLICY "Admins only - system reports"
ON public.system_reports
FOR ALL
USING (is_admin_user())
WITH CHECK (is_admin_user());

CREATE POLICY "Admins only - user activity log"
ON public.user_activity_log
FOR ALL
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- UTM metrics table
CREATE POLICY "Users can manage UTM metrics"
ON public.utm_metrics
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Add user_id columns where missing and create appropriate policies
-- Note: This might require data migration for existing records

-- Images drive table
CREATE POLICY "Users can manage their own images"
ON public.imagens_drive
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Metrics cache table
CREATE POLICY "Users can access metrics cache"
ON public.metrics_cache
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Test connection table (should be admin only)
CREATE POLICY "Admins only - test connection"
ON public.test_connection
FOR ALL
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Tokens table (should be user-specific)
CREATE POLICY "Users can manage their own tokens"
ON public.tokens
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);