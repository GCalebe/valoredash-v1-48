CREATE INDEX IF NOT EXISTS utm_tracking_lead_id_idx ON public.utm_tracking(lead_id);
CREATE INDEX IF NOT EXISTS client_products_interest_client_id_idx ON public.client_products_interest(client_id);
CREATE INDEX IF NOT EXISTS client_product_purchases_client_id_idx ON public.client_product_purchases(client_id);
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'contacts_id_idx'
  ) THEN
    CREATE INDEX contacts_id_idx ON public.contacts(id);
  END IF;
END $$;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'conversations' AND column_name = 'contact_id'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'conversations_contact_id_idx'
    ) THEN
      CREATE INDEX conversations_contact_id_idx ON public.conversations(contact_id);
    END IF;
  END IF;
END $$;
