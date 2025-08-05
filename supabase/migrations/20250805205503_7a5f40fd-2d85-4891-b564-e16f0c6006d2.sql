-- Adicionar user_id à tabela products
ALTER TABLE public.products ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Atualizar created_by para referenciar auth.users
ALTER TABLE public.products ALTER COLUMN created_by SET DEFAULT auth.uid();

-- Criar tabela para objeções de produtos
CREATE TABLE public.product_objections (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Habilitar RLS na tabela products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS na tabela product_objections
ALTER TABLE public.product_objections ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para products
CREATE POLICY "Users can view their own products" ON public.products
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products" ON public.products
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" ON public.products
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" ON public.products
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para product_objections
CREATE POLICY "Users can view their own product objections" ON public.product_objections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own product objections" ON public.product_objections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own product objections" ON public.product_objections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own product objections" ON public.product_objections
    FOR DELETE USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at em product_objections
CREATE OR REPLACE FUNCTION public.update_product_objections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_product_objections_updated_at
    BEFORE UPDATE ON public.product_objections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_product_objections_updated_at();

-- Índices para melhor performance
CREATE INDEX idx_product_objections_product_id ON public.product_objections(product_id);
CREATE INDEX idx_product_objections_user_id ON public.product_objections(user_id);
CREATE INDEX idx_products_user_id ON public.products(user_id);