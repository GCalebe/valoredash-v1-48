BEGIN;

-- 1) Vincular conversas existentes ao cliente quando o session_id coincidir
UPDATE public.conversations v
SET contact_id = c.id,
    user_id = COALESCE(v.user_id, c.user_id),
    name = COALESCE(v.name, c.name),
    phone = COALESCE(v.phone, c.phone),
    email = COALESCE(v.email, c.email),
    last_message = COALESCE(v.last_message, c.last_message),
    last_message_time = COALESCE(v.last_message_time, c.last_message_time),
    unread_count = COALESCE(v.unread_count, c.unread_count)
FROM public.contacts c
WHERE v.contact_id IS NULL
  AND c.session_id IS NOT NULL
  AND v.session_id = c.session_id;

-- 2) Inserir uma conversa para cada cliente que ainda não possua
INSERT INTO public.conversations
  (session_id, name, phone, email, avatar, last_message, last_message_time, unread_count, user_id, contact_id, client_data)
SELECT
  COALESCE(NULLIF(c.session_id, ''), 'sess_' || c.id::text) AS session_id,
  c.name,
  c.phone,
  c.email,
  NULL::text AS avatar,
  c.last_message,
  c.last_message_time,
  COALESCE(c.unread_count, 0) AS unread_count,
  c.user_id,
  c.id AS contact_id,
  '{}'::jsonb AS client_data
FROM public.contacts c
WHERE c.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.conversations v WHERE v.contact_id = c.id
  );

COMMIT;


