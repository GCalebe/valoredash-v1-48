-- 1) Add user_id column to products tables
ALTER TABLE public.client_products_interest
ADD COLUMN IF NOT EXISTS user_id uuid;

ALTER TABLE public.client_product_purchases
ADD COLUMN IF NOT EXISTS user_id uuid;

-- 2) Backfill user_id from contacts (client_id -> contacts.id)
UPDATE public.client_products_interest i
SET user_id = c.user_id
FROM public.contacts c
WHERE i.client_id = c.id AND i.user_id IS NULL;

UPDATE public.client_product_purchases p
SET user_id = c.user_id
FROM public.contacts c
WHERE p.client_id = c.id AND p.user_id IS NULL;

-- 3) Create helpful indexes
CREATE INDEX IF NOT EXISTS client_products_interest_user_client_idx
  ON public.client_products_interest(user_id, client_id);
CREATE INDEX IF NOT EXISTS client_product_purchases_user_client_idx
  ON public.client_product_purchases(user_id, client_id);

-- 4) Enable RLS and add tenant policies
ALTER TABLE public.client_products_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_product_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utm_tracking ENABLE ROW LEVEL SECURITY;

-- Policies for client_products_interest
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='client_products_interest' AND policyname='tenant_select_cpi'
  ) THEN
    CREATE POLICY tenant_select_cpi ON public.client_products_interest
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='client_products_interest' AND policyname='tenant_insert_cpi'
  ) THEN
    CREATE POLICY tenant_insert_cpi ON public.client_products_interest
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='client_products_interest' AND policyname='tenant_update_cpi'
  ) THEN
    CREATE POLICY tenant_update_cpi ON public.client_products_interest
      FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='client_products_interest' AND policyname='tenant_delete_cpi'
  ) THEN
    CREATE POLICY tenant_delete_cpi ON public.client_products_interest
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Policies for client_product_purchases
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='client_product_purchases' AND policyname='tenant_select_cpp'
  ) THEN
    CREATE POLICY tenant_select_cpp ON public.client_product_purchases
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='client_product_purchases' AND policyname='tenant_insert_cpp'
  ) THEN
    CREATE POLICY tenant_insert_cpp ON public.client_product_purchases
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='client_product_purchases' AND policyname='tenant_update_cpp'
  ) THEN
    CREATE POLICY tenant_update_cpp ON public.client_product_purchases
      FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='client_product_purchases' AND policyname='tenant_delete_cpp'
  ) THEN
    CREATE POLICY tenant_delete_cpp ON public.client_product_purchases
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Policies for utm_tracking (in case not present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='utm_tracking' AND policyname='tenant_select_utm'
  ) THEN
    CREATE POLICY tenant_select_utm ON public.utm_tracking
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='utm_tracking' AND policyname='tenant_insert_utm'
  ) THEN
    CREATE POLICY tenant_insert_utm ON public.utm_tracking
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='utm_tracking' AND policyname='tenant_update_utm'
  ) THEN
    CREATE POLICY tenant_update_utm ON public.utm_tracking
      FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='utm_tracking' AND policyname='tenant_delete_utm'
  ) THEN
    CREATE POLICY tenant_delete_utm ON public.utm_tracking
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;
