-- Criar enum para roles de usuário
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Atualizar a tabela profiles primeiro
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role app_role DEFAULT 'user',
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- Criar tabela de roles dos usuários
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Criar tabela de métricas de uso dos usuários
CREATE TABLE public.user_usage_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    total_conversations INTEGER DEFAULT 0,
    total_expenses DECIMAL(10,2) DEFAULT 0.00,
    month_year DATE NOT NULL, -- Para rastrear métricas mensais
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, month_year)
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_usage_metrics ENABLE ROW LEVEL SECURITY;

-- Função de segurança para verificar roles (evita recursão RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Função para verificar se é admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

-- Função para atualizar métricas de uso
CREATE OR REPLACE FUNCTION public.update_user_usage_metrics(
    _user_id UUID,
    _conversations_increment INTEGER DEFAULT 0,
    _expenses_increment DECIMAL DEFAULT 0.00
)
RETURNS VOID
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
    current_month DATE;
BEGIN
    current_month := date_trunc('month', now());
    
    INSERT INTO public.user_usage_metrics (
        user_id, 
        total_conversations, 
        total_expenses, 
        month_year
    )
    VALUES (
        _user_id,
        _conversations_increment,
        _expenses_increment,
        current_month
    )
    ON CONFLICT (user_id, month_year) 
    DO UPDATE SET
        total_conversations = user_usage_metrics.total_conversations + _conversations_increment,
        total_expenses = user_usage_metrics.total_expenses + _expenses_increment,
        updated_at = now();
END;
$$;

-- Trigger para criar role de usuário automaticamente quando um perfil é criado
CREATE OR REPLACE FUNCTION public.create_user_role_on_profile_insert()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
BEGIN
    -- Inserir role padrão para novos usuários
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, COALESCE(NEW.role, 'user'))
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Criar entrada inicial de métricas para o usuário
    INSERT INTO public.user_usage_metrics (user_id, month_year)
    VALUES (NEW.id, date_trunc('month', now()))
    ON CONFLICT (user_id, month_year) DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- Trigger na tabela profiles
CREATE TRIGGER create_user_role_trigger
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.create_user_role_on_profile_insert();

-- Políticas RLS para user_roles
CREATE POLICY "Users can view their own roles"
    ON public.user_roles
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
    ON public.user_roles
    FOR SELECT
    USING (public.is_admin_user());

CREATE POLICY "Admins can manage all roles"
    ON public.user_roles
    FOR ALL
    USING (public.is_admin_user());

-- Políticas RLS para user_usage_metrics
CREATE POLICY "Users can view their own metrics"
    ON public.user_usage_metrics
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all metrics"
    ON public.user_usage_metrics
    FOR SELECT
    USING (public.is_admin_user());

CREATE POLICY "System can update metrics"
    ON public.user_usage_metrics
    FOR ALL
    USING (public.is_admin_user() OR auth.uid() = user_id);

-- Atualizar handle_new_user para usar o domínio comercial247.com
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
    user_role app_role;
BEGIN
    -- Determinar role baseado no email
    IF NEW.email LIKE '%@comercial247.com' THEN
        user_role := 'admin';
    ELSE
        user_role := 'user';
    END IF;
    
    -- Inserir perfil
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
    
    RETURN NEW;
END;
$$;

-- Inserir dados iniciais para o primeiro admin
INSERT INTO public.profiles (id, email, full_name, role, is_active)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', email),
    CASE 
        WHEN email LIKE '%@comercial247.com' THEN 'admin'::app_role
        ELSE 'user'::app_role
    END,
    true
FROM auth.users
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = users.id)
ON CONFLICT (id) DO NOTHING;