-- Migração: ai_products para products (tabela unificada)
-- Data: $(date)
-- Descrição: Migra dados de ai_products para a nova tabela products unificada

-- 1. Criação da tabela products unificada
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price DECIMAL(10,2),
    description TEXT,
    category TEXT,
    benefits TEXT[],
    objections TEXT[],
    differentials TEXT[],
    success_cases TEXT[],
    features TEXT[],
    icon TEXT,
    image TEXT,
    has_combo BOOLEAN DEFAULT false,
    has_upgrade BOOLEAN DEFAULT false,
    has_promotion BOOLEAN DEFAULT false,
    new BOOLEAN DEFAULT false,
    popular BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 2. Migração dos dados existentes de ai_products para products
INSERT INTO public.products (
    id, name, description, features, category, popular, new, icon, image, created_at
)
SELECT 
    id, name, description, features, category, popular, new, icon, image, created_at
FROM public.ai_products
ON CONFLICT (id) DO NOTHING;

-- 3. Criação de índices para performance
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_popular ON public.products(popular);
CREATE INDEX IF NOT EXISTS idx_products_new ON public.products(new);
CREATE INDEX IF NOT EXISTS idx_products_created_by ON public.products(created_by);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);

-- 4. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Habilitar RLS (Row Level Security)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 6. Políticas RLS
CREATE POLICY "Users can view all products" ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert products" ON public.products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own products" ON public.products
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own products" ON public.products
    FOR DELETE USING (auth.uid() = created_by);

-- 7. Comentários para documentação
COMMENT ON TABLE public.products IS 'Tabela unificada de produtos - migrada de ai_products';
COMMENT ON COLUMN public.products.benefits IS 'Array de benefícios do produto';
COMMENT ON COLUMN public.products.objections IS 'Array de objeções comuns do produto';
COMMENT ON COLUMN public.products.differentials IS 'Array de diferenciais do produto';
COMMENT ON COLUMN public.products.success_cases IS 'Array de casos de sucesso do produto';
COMMENT ON COLUMN public.products.has_combo IS 'Indica se o produto possui combo disponível';
COMMENT ON COLUMN public.products.has_upgrade IS 'Indica se o produto possui upgrade disponível';
COMMENT ON COLUMN public.products.has_promotion IS 'Indica se o produto está em promoção';

-- 8. Verificação dos dados migrados
SELECT 
    'ai_products' as tabela,
    COUNT(*) as total_registros
FROM public.ai_products
UNION ALL
SELECT 
    'products' as tabela,
    COUNT(*) as total_registros
FROM public.products;

-- 9. Exemplo de consulta para verificar a migração
SELECT 
    p.id,
    p.name,
    p.category,
    p.popular,
    p.new,
    p.created_at,
    'Migrado de ai_products' as origem
FROM public.products p
WHERE p.id IN (SELECT id FROM public.ai_products)
ORDER BY p.created_at DESC;

-- NOTA: Após confirmar que a migração foi bem-sucedida,
-- você pode opcionalmente renomear ou remover a tabela ai_products:
-- ALTER TABLE public.ai_products RENAME TO ai_products_backup;
-- DROP TABLE public.ai_products; -- Use com cuidado!