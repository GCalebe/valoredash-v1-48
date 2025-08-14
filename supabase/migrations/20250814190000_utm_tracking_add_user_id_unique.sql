-- Add user_id column for multi-tenant scoping
ALTER TABLE public.utm_tracking
ADD COLUMN IF NOT EXISTS user_id uuid;

-- Backfill user_id from contacts using lead_id linkage
UPDATE public.utm_tracking u
SET user_id = c.user_id
FROM public.contacts c
WHERE u.lead_id = c.id AND u.user_id IS NULL;

-- Enforce NOT NULL when possible
ALTER TABLE public.utm_tracking
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.utm_tracking
ALTER COLUMN lead_id SET NOT NULL;

-- Add a unique constraint for upsert and data integrity
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.utm_tracking'::regclass
      AND conname = 'utm_tracking_user_lead_unique'
  ) THEN
    ALTER TABLE public.utm_tracking
    ADD CONSTRAINT utm_tracking_user_lead_unique UNIQUE (user_id, lead_id);
  END IF;
END $$;

-- Helpful index to speed lookup by (user_id, lead_id)
CREATE INDEX IF NOT EXISTS utm_tracking_user_lead_idx ON public.utm_tracking(user_id, lead_id);
