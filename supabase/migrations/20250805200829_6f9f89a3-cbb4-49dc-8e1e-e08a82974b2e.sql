-- Fix RLS policies for products table
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Products are viewable by authenticated users" ON public.products;
DROP POLICY IF EXISTS "Products can be created by authenticated users" ON public.products;
DROP POLICY IF EXISTS "Products can be updated by authenticated users" ON public.products;
DROP POLICY IF EXISTS "Products can be deleted by authenticated users" ON public.products;
DROP POLICY IF EXISTS "Users can manage products" ON public.products;

-- Create proper RLS policies that filter by created_by
CREATE POLICY "Users can view their own products" 
ON public.products 
FOR SELECT 
USING (created_by = auth.uid());

CREATE POLICY "Users can create their own products" 
ON public.products 
FOR INSERT 
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own products" 
ON public.products 
FOR UPDATE 
USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own products" 
ON public.products 
FOR DELETE 
USING (created_by = auth.uid());

-- Fix RLS policies for faq_items table
-- Drop conflicting overly permissive policies
DROP POLICY IF EXISTS "Users can manage FAQ items" ON public.faq_items;

-- Keep the specific policies that filter by user_id
-- (The remaining policies are already correctly filtering by user_id)