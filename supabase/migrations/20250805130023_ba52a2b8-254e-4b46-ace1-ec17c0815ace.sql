-- Security Infrastructure Migration
-- Fix privilege escalation, implement proper user management, and enhance security

-- 1. Create proper user roles enum if not exists
DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create profiles table with proper security
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role app_role NOT NULL DEFAULT 'user',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(email)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create user_roles table for proper role management
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create security audit log
CREATE TABLE IF NOT EXISTS public.security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    resource TEXT,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on security audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- 5. Create session management table
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    session_token TEXT NOT NULL,
    device_info TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(session_token)
);

-- Enable RLS on user_sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- 6. Create security definer functions to avoid RLS recursion
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

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM public.profiles WHERE id = _user_id;
$$;

-- 7. Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role app_role;
BEGIN
    -- Determine role based on whether this is the first user
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

-- 8. Create security audit function
CREATE OR REPLACE FUNCTION public.log_security_event(
    _action TEXT,
    _resource TEXT DEFAULT NULL,
    _success BOOLEAN DEFAULT true,
    _error_message TEXT DEFAULT NULL,
    _metadata JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.security_audit_log (
        user_id,
        action,
        resource,
        success,
        error_message,
        metadata
    ) VALUES (
        auth.uid(),
        _action,
        _resource,
        _success,
        _error_message,
        _metadata
    );
END;
$$;

-- 9. Create password policy validation function
CREATE OR REPLACE FUNCTION public.validate_password(password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    -- Minimum 12 characters
    IF LENGTH(password) < 12 THEN
        RETURN FALSE;
    END IF;
    
    -- Must contain uppercase letter
    IF NOT password ~ '[A-Z]' THEN
        RETURN FALSE;
    END IF;
    
    -- Must contain lowercase letter
    IF NOT password ~ '[a-z]' THEN
        RETURN FALSE;
    END IF;
    
    -- Must contain number
    IF NOT password ~ '[0-9]' THEN
        RETURN FALSE;
    END IF;
    
    -- Must contain special character
    IF NOT password ~ '[!@#$%^&*(),.?":{}|<>]' THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$;

-- 10. Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 11. Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.is_admin_user());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles" ON public.profiles
    FOR ALL USING (public.is_admin_user());

-- 12. Create RLS policies for user_roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles" ON public.user_roles
    FOR ALL USING (public.is_admin_user());

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- 13. Create RLS policies for security audit log
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.security_audit_log;
CREATE POLICY "Admins can view audit logs" ON public.security_audit_log
    FOR SELECT USING (public.is_admin_user());

DROP POLICY IF EXISTS "System can insert audit logs" ON public.security_audit_log;
CREATE POLICY "System can insert audit logs" ON public.security_audit_log
    FOR INSERT WITH CHECK (true);

-- 14. Create RLS policies for user_sessions
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;
CREATE POLICY "Users can view their own sessions" ON public.user_sessions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own sessions" ON public.user_sessions;
CREATE POLICY "Users can manage their own sessions" ON public.user_sessions
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all sessions" ON public.user_sessions;
CREATE POLICY "Admins can view all sessions" ON public.user_sessions
    FOR SELECT USING (public.is_admin_user());

-- 15. Create function to clean expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.user_sessions 
    WHERE expires_at < NOW() OR is_active = false;
END;
$$;

-- 16. Update profiles updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();