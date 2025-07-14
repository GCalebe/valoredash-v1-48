-- Fase 1: Adicionar user_id e RLS para isolamento de dados

-- 1. Adicionar user_id às tabelas principais
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.calendar_events ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.n8n_chat_messages ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.custom_fields ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.ai_personality_settings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.ai_stages ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.faq_items ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.imagens_drive ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Popular user_id existente com o primeiro usuário admin (se existir dados)
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Pegar o primeiro usuário admin disponível
    SELECT auth.users.id INTO admin_user_id 
    FROM auth.users 
    JOIN public.profiles ON profiles.id = auth.users.id
    WHERE profiles.role = 'admin'
    LIMIT 1;
    
    -- Se não tiver admin, pegar qualquer usuário
    IF admin_user_id IS NULL THEN
        SELECT id INTO admin_user_id FROM auth.users LIMIT 1;
    END IF;
    
    -- Popular as tabelas com dados existentes
    IF admin_user_id IS NOT NULL THEN
        UPDATE public.contacts SET user_id = admin_user_id WHERE user_id IS NULL;
        UPDATE public.conversations SET user_id = admin_user_id WHERE user_id IS NULL;
        UPDATE public.calendar_events SET user_id = admin_user_id WHERE user_id IS NULL;
        UPDATE public.appointments SET user_id = admin_user_id WHERE user_id IS NULL;
        UPDATE public.n8n_chat_messages SET user_id = admin_user_id WHERE user_id IS NULL;
        UPDATE public.custom_fields SET user_id = admin_user_id WHERE user_id IS NULL;
        UPDATE public.ai_personality_settings SET user_id = admin_user_id WHERE user_id IS NULL;
        UPDATE public.ai_stages SET user_id = admin_user_id WHERE user_id IS NULL;
        UPDATE public.faq_items SET user_id = admin_user_id WHERE user_id IS NULL;
        UPDATE public.documents SET user_id = admin_user_id WHERE user_id IS NULL;
        UPDATE public.imagens_drive SET user_id = admin_user_id WHERE user_id IS NULL;
    END IF;
END $$;

-- 3. Tornar user_id NOT NULL após popular os dados
ALTER TABLE public.contacts ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.conversations ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.calendar_events ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.appointments ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.n8n_chat_messages ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.custom_fields ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.ai_personality_settings ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.ai_stages ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.faq_items ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.documents ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.imagens_drive ALTER COLUMN user_id SET NOT NULL;

-- 4. Limpar policies existentes que podem conflitar
DROP POLICY IF EXISTS "Allow anonymous read access to contacts" ON public.contacts;
DROP POLICY IF EXISTS "Permitir acesso autenticado aos contatos" ON public.contacts;
DROP POLICY IF EXISTS "Authenticated users can insert contacts" ON public.contacts;
DROP POLICY IF EXISTS "Authenticated users can update contacts" ON public.contacts;
DROP POLICY IF EXISTS "Authenticated users can view contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admins can delete contacts" ON public.contacts;

DROP POLICY IF EXISTS "Authenticated users can view conversations" ON public.conversations;
DROP POLICY IF EXISTS "Authenticated users can insert conversations" ON public.conversations;
DROP POLICY IF EXISTS "Authenticated users can update conversations" ON public.conversations;

DROP POLICY IF EXISTS "Authenticated users can view chat messages" ON public.n8n_chat_messages;
DROP POLICY IF EXISTS "Authenticated users can insert chat messages" ON public.n8n_chat_messages;

DROP POLICY IF EXISTS "FAQ items são visíveis para usuários autenticados" ON public.faq_items;
DROP POLICY IF EXISTS "FAQ items podem ser gerenciados por usuários autenticados" ON public.faq_items;

DROP POLICY IF EXISTS "Authenticated users can view documents" ON public.documents;
DROP POLICY IF EXISTS "Authenticated users can insert documents" ON public.documents;
DROP POLICY IF EXISTS "Authenticated users can update documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can delete documents" ON public.documents;

DROP POLICY IF EXISTS "Authenticated users can view images" ON public.imagens_drive;
DROP POLICY IF EXISTS "Authenticated users can insert images" ON public.imagens_drive;
DROP POLICY IF EXISTS "Authenticated users can update images" ON public.imagens_drive;
DROP POLICY IF EXISTS "Admins can delete images" ON public.imagens_drive;

-- 5. Criar RLS policies baseadas em user_id
-- Contacts
CREATE POLICY "Users can view their own contacts" ON public.contacts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts" ON public.contacts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts" ON public.contacts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts" ON public.contacts
    FOR DELETE USING (auth.uid() = user_id);

-- Conversations
CREATE POLICY "Users can view their own conversations" ON public.conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations" ON public.conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" ON public.conversations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" ON public.conversations
    FOR DELETE USING (auth.uid() = user_id);

-- Calendar Events
CREATE POLICY "Users can view their own calendar events" ON public.calendar_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar events" ON public.calendar_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar events" ON public.calendar_events
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar events" ON public.calendar_events
    FOR DELETE USING (auth.uid() = user_id);

-- Appointments
CREATE POLICY "Users can view their own appointments" ON public.appointments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own appointments" ON public.appointments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointments" ON public.appointments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own appointments" ON public.appointments
    FOR DELETE USING (auth.uid() = user_id);

-- Chat Messages
CREATE POLICY "Users can view their own chat messages" ON public.n8n_chat_messages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages" ON public.n8n_chat_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Custom Fields
CREATE POLICY "Users can view their own custom fields" ON public.custom_fields
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own custom fields" ON public.custom_fields
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom fields" ON public.custom_fields
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom fields" ON public.custom_fields
    FOR DELETE USING (auth.uid() = user_id);

-- AI Personality Settings
CREATE POLICY "Users can view their own AI personalities" ON public.ai_personality_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI personalities" ON public.ai_personality_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI personalities" ON public.ai_personality_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI personalities" ON public.ai_personality_settings
    FOR DELETE USING (auth.uid() = user_id);

-- AI Stages
CREATE POLICY "Users can view their own AI stages" ON public.ai_stages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI stages" ON public.ai_stages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI stages" ON public.ai_stages
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI stages" ON public.ai_stages
    FOR DELETE USING (auth.uid() = user_id);

-- FAQ Items
CREATE POLICY "Users can view their own FAQ items" ON public.faq_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own FAQ items" ON public.faq_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own FAQ items" ON public.faq_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own FAQ items" ON public.faq_items
    FOR DELETE USING (auth.uid() = user_id);

-- Documents
CREATE POLICY "Users can view their own documents" ON public.documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" ON public.documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON public.documents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON public.documents
    FOR DELETE USING (auth.uid() = user_id);

-- Images
CREATE POLICY "Users can view their own images" ON public.imagens_drive
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own images" ON public.imagens_drive
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own images" ON public.imagens_drive
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own images" ON public.imagens_drive
    FOR DELETE USING (auth.uid() = user_id);

-- 6. Atualizar triggers para incluir user_id automaticamente
CREATE OR REPLACE FUNCTION public.set_user_id_on_insert()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_id IS NULL THEN
        NEW.user_id = auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger às tabelas principais
CREATE TRIGGER set_user_id_contacts BEFORE INSERT ON public.contacts
    FOR EACH ROW EXECUTE FUNCTION public.set_user_id_on_insert();

CREATE TRIGGER set_user_id_conversations BEFORE INSERT ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION public.set_user_id_on_insert();

CREATE TRIGGER set_user_id_calendar_events BEFORE INSERT ON public.calendar_events
    FOR EACH ROW EXECUTE FUNCTION public.set_user_id_on_insert();

CREATE TRIGGER set_user_id_appointments BEFORE INSERT ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION public.set_user_id_on_insert();

CREATE TRIGGER set_user_id_chat_messages BEFORE INSERT ON public.n8n_chat_messages
    FOR EACH ROW EXECUTE FUNCTION public.set_user_id_on_insert();

CREATE TRIGGER set_user_id_custom_fields BEFORE INSERT ON public.custom_fields
    FOR EACH ROW EXECUTE FUNCTION public.set_user_id_on_insert();

CREATE TRIGGER set_user_id_ai_personalities BEFORE INSERT ON public.ai_personality_settings
    FOR EACH ROW EXECUTE FUNCTION public.set_user_id_on_insert();

CREATE TRIGGER set_user_id_ai_stages BEFORE INSERT ON public.ai_stages
    FOR EACH ROW EXECUTE FUNCTION public.set_user_id_on_insert();

CREATE TRIGGER set_user_id_faq_items BEFORE INSERT ON public.faq_items
    FOR EACH ROW EXECUTE FUNCTION public.set_user_id_on_insert();

CREATE TRIGGER set_user_id_documents BEFORE INSERT ON public.documents
    FOR EACH ROW EXECUTE FUNCTION public.set_user_id_on_insert();

CREATE TRIGGER set_user_id_images BEFORE INSERT ON public.imagens_drive
    FOR EACH ROW EXECUTE FUNCTION public.set_user_id_on_insert();