-- Add foreign key constraints to link with products table
ALTER TABLE public.client_products_interest 
ADD CONSTRAINT fk_client_products_interest_product 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.client_product_purchases 
ADD CONSTRAINT fk_client_product_purchases_product 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;