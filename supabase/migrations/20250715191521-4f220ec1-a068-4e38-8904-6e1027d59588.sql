-- Migração para melhorar a estrutura da tabela calendar_events para agenda
-- Adicionando campos necessários se não existirem

-- Verificar e adicionar campos que podem estar faltando para compatibilidade com a agenda
DO $$ 
BEGIN
    -- Adicionar campo summary se não existir (compatível com a API externa)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'calendar_events' AND column_name = 'summary') THEN
        ALTER TABLE public.calendar_events ADD COLUMN summary text;
    END IF;

    -- Adicionar campo host_name se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'calendar_events' AND column_name = 'host_name') THEN
        ALTER TABLE public.calendar_events ADD COLUMN host_name text;
    END IF;

    -- Adicionar campo html_link se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'calendar_events' AND column_name = 'html_link') THEN
        ALTER TABLE public.calendar_events ADD COLUMN html_link text;
    END IF;
END $$;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id_start_time 
ON public.calendar_events(user_id, start_time);

CREATE INDEX IF NOT EXISTS idx_calendar_events_status 
ON public.calendar_events(status) WHERE status IS NOT NULL;

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_calendar_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_calendar_events_updated_at ON public.calendar_events;
CREATE TRIGGER trigger_update_calendar_events_updated_at
    BEFORE UPDATE ON public.calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION update_calendar_events_updated_at();