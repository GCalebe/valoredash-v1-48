-- Verificar se user_id já existe na tabela products
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        -- Adicionar user_id à tabela products
        ALTER TABLE public.products ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        
        -- Criar índice para melhor performance
        CREATE INDEX idx_products_user_id ON public.products(user_id);
    END IF;
END $$;

-- Criar tabela para objeções de produtos se não existir
CREATE TABLE IF NOT EXISTS public.product_objections (
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

-- Habilitar RLS na tabela product_objections
ALTER TABLE public.product_objections ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para product_objections (verificar se não existem)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_objections' 
        AND policyname = 'Users can view their own product objections'
        AND schemaname = 'public'
    ) THEN
        CREATE POLICY "Users can view their own product objections" ON public.product_objections
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_objections' 
        AND policyname = 'Users can insert their own product objections'
        AND schemaname = 'public'
    ) THEN
        CREATE POLICY "Users can insert their own product objections" ON public.product_objections
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_objections' 
        AND policyname = 'Users can update their own product objections'
        AND schemaname = 'public'
    ) THEN
        CREATE POLICY "Users can update their own product objections" ON public.product_objections
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_objections' 
        AND policyname = 'Users can delete their own product objections'
        AND schemaname = 'public'
    ) THEN
        CREATE POLICY "Users can delete their own product objections" ON public.product_objections
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Trigger para atualizar updated_at em product_objections
CREATE OR REPLACE FUNCTION public.update_product_objections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS update_product_objections_updated_at ON public.product_objections;
CREATE TRIGGER update_product_objections_updated_at
    BEFORE UPDATE ON public.product_objections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_product_objections_updated_at();

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_product_objections_product_id ON public.product_objections(product_id);
CREATE INDEX IF NOT EXISTS idx_product_objections_user_id ON public.product_objections(user_id);