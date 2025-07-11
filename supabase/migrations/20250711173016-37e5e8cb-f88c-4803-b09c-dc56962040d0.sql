-- Create a unified products table with all necessary fields
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC DEFAULT 0,
  description TEXT,
  category TEXT,
  benefits TEXT[] DEFAULT '{}',
  objections TEXT[] DEFAULT '{}',
  differentials TEXT[] DEFAULT '{}',
  success_cases TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  icon TEXT,
  image TEXT,
  has_combo BOOLEAN DEFAULT false,
  has_upgrade BOOLEAN DEFAULT false,
  has_promotion BOOLEAN DEFAULT false,
  new BOOLEAN DEFAULT false,
  popular BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create index for better performance
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_created_at ON public.products(created_at);

-- Add trigger for updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing data from ai_products to products
INSERT INTO public.products (
  id, name, description, category, features, icon, image, new, popular, created_at
)
SELECT 
  id::uuid, 
  name, 
  description, 
  category, 
  features, 
  icon, 
  image, 
  new, 
  popular, 
  created_at
FROM public.ai_products;

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Products are viewable by authenticated users" 
ON public.products 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Products can be created by authenticated users" 
ON public.products 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Products can be updated by authenticated users" 
ON public.products 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Products can be deleted by authenticated users" 
ON public.products 
FOR DELETE 
USING (auth.role() = 'authenticated');