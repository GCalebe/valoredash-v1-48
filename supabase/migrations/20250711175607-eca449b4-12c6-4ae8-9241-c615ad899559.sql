-- Criar tabela para histórico de mudanças de estágio
CREATE TABLE public.contact_stage_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    old_stage TEXT,
    new_stage TEXT NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    changed_by UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}',
    
    -- Índices para melhor performance
    INDEX idx_contact_stage_history_contact_id ON public.contact_stage_history(contact_id),
    INDEX idx_contact_stage_history_changed_at ON public.contact_stage_history(changed_at)
);

-- Habilitar RLS
ALTER TABLE public.contact_stage_history ENABLE ROW LEVEL SECURITY;

-- Política RLS para usuários autenticados
CREATE POLICY "Authenticated users can view stage history" 
ON public.contact_stage_history 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert stage history" 
ON public.contact_stage_history 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Função para registrar mudança de estágio
CREATE OR REPLACE FUNCTION public.log_contact_stage_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Só registra se o estágio realmente mudou
    IF OLD.kanban_stage IS DISTINCT FROM NEW.kanban_stage THEN
        INSERT INTO public.contact_stage_history (
            contact_id,
            old_stage,
            new_stage,
            changed_by,
            metadata
        ) VALUES (
            NEW.id,
            OLD.kanban_stage,
            NEW.kanban_stage,
            auth.uid(),
            jsonb_build_object(
                'old_stage_id', OLD.kanban_stage_id,
                'new_stage_id', NEW.kanban_stage_id,
                'contact_name', NEW.name
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger na tabela contacts
CREATE TRIGGER trigger_log_contact_stage_change
    AFTER UPDATE ON public.contacts
    FOR EACH ROW
    EXECUTE FUNCTION public.log_contact_stage_change();

-- Função para buscar histórico de um contato específico
CREATE OR REPLACE FUNCTION public.get_contact_stage_history(contact_uuid UUID)
RETURNS TABLE (
    id UUID,
    old_stage TEXT,
    new_stage TEXT,
    changed_at TIMESTAMP WITH TIME ZONE,
    changed_by UUID,
    metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.id,
        h.old_stage,
        h.new_stage,
        h.changed_at,
        h.changed_by,
        h.metadata
    FROM public.contact_stage_history h
    WHERE h.contact_id = contact_uuid
    ORDER BY h.changed_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar histórico por período
CREATE OR REPLACE FUNCTION public.get_stage_history_by_period(
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
    contact_id UUID,
    contact_name TEXT,
    old_stage TEXT,
    new_stage TEXT,
    changed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.contact_id,
        c.name as contact_name,
        h.old_stage,
        h.new_stage,
        h.changed_at,
        h.metadata
    FROM public.contact_stage_history h
    INNER JOIN public.contacts c ON c.id = h.contact_id
    WHERE (start_date IS NULL OR h.changed_at >= start_date)
    AND (end_date IS NULL OR h.changed_at <= end_date)
    ORDER BY h.changed_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;