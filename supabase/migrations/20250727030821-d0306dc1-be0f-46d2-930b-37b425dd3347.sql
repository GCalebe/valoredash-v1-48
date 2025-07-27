-- Critical Security Fix: Enable RLS on all public tables without policies
-- This addresses the RLS Disabled in Public errors

-- Enable RLS on tables that don't have it enabled
ALTER TABLE public.ai_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_custom_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_stage_history_backup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts_backup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_daily_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_by_time ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_funnel_view ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_field_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_field_validation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_metrics ENABLE ROW LEVEL SECURITY;

-- Create user roles table for proper role management
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'moderator');

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role app_role DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create security definer functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role app_role;
BEGIN
    -- Determine role based on email (first user is admin)
    IF NOT EXISTS (SELECT 1 FROM public.profiles) THEN
        user_role := 'admin';
    ELSE
        user_role := 'user';
    END IF;
    
    -- Insert profile
    INSERT INTO public.profiles (
        id, 
        email, 
        full_name,
        role,
        is_active
    )
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        user_role,
        true
    );
    
    -- Insert role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, user_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- Create trigger for new user handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Basic RLS policies for core tables
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.is_admin_user());

CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON public.user_roles
    FOR ALL USING (public.is_admin_user());

-- Secure public tables that should only be accessible to authenticated users
CREATE POLICY "Authenticated users only" ON public.client_stats
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users only" ON public.conversation_daily_data
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users only" ON public.conversation_metrics
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users only" ON public.conversion_by_time
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users only" ON public.dashboard_metrics
    FOR ALL TO authenticated USING (true);

-- Restrict access to sensitive audit and backup tables
CREATE POLICY "Admins only access" ON public.audit_log
    FOR ALL USING (public.is_admin_user());

CREATE POLICY "Admins only access" ON public.contact_stage_history_backup
    FOR ALL USING (public.is_admin_user());

CREATE POLICY "Admins only access" ON public.contacts_backup
    FOR ALL USING (public.is_admin_user());

CREATE POLICY "Admins only access" ON public.custom_field_audit_log
    FOR ALL USING (public.is_admin_user());

-- AI products should be publicly readable
CREATE POLICY "Public read access" ON public.ai_products
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage AI products" ON public.ai_products
    FOR ALL USING (public.is_admin_user());

-- Campaign and marketing data should be restricted to authenticated users
CREATE POLICY "Authenticated users only" ON public.campaign_data
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users only" ON public.campaign_recipients
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users only" ON public.campaigns
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users only" ON public.calendar_attendees
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users only" ON public.coupon_redemptions
    FOR ALL TO authenticated USING (true);

-- Custom field related tables should be user-specific where possible
CREATE POLICY "Authenticated users only" ON public.client_custom_values
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users only" ON public.custom_field_validation_rules
    FOR ALL TO authenticated USING (true);

-- Conversion funnel view should be readable by authenticated users
CREATE POLICY "Authenticated users can read" ON public.conversion_funnel_view
    FOR SELECT TO authenticated USING (true);