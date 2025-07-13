-- Normalização dos dados de estágios Kanban

-- 1. Criar tabela de mapeamento de nomes de estágios (se não existir)
CREATE TABLE IF NOT EXISTS stage_name_mapping (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    old_name TEXT NOT NULL,
    new_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Inserir mapeamentos padrão dos nomes de estágios
INSERT INTO stage_name_mapping (old_name, new_name) VALUES
    ('Entraram', 'Novo Lead'),
    ('Contato feito', 'Contato Feito'),
    ('Conversa iniciada', 'Conversa Iniciada'),
    ('Reunião', 'Reunião Agendada'),
    ('Proposta', 'Proposta Enviada'),
    ('Fechamento', 'Fechado'),
    ('Perdido', 'Perdido'),
    ('Qualificado', 'Lead Qualificado'),
    ('Demonstração', 'Demonstração'),
    ('Negociação', 'Negociação'),
    ('Follow-up', 'Follow-up'),
    ('Interessado', 'Interessado')
ON CONFLICT DO NOTHING;

-- 3. Criar função para normalizar nomes de estágios
CREATE OR REPLACE FUNCTION normalize_stage_name(input_stage TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    normalized_name TEXT;
BEGIN
    -- Buscar mapeamento conhecido
    SELECT new_name INTO normalized_name 
    FROM stage_name_mapping 
    WHERE old_name = input_stage;
    
    -- Se não encontrou mapeamento, retorna o nome original
    IF normalized_name IS NULL THEN
        RETURN input_stage;
    END IF;
    
    RETURN normalized_name;
END;
$$;

-- 4. Atualizar dados existentes na tabela contacts
-- Normalizar os valores de kanban_stage usando a função
UPDATE contacts 
SET kanban_stage = normalize_stage_name(kanban_stage)
WHERE kanban_stage IS NOT NULL;

-- 5. Garantir que todos os contatos sem estágio sejam definidos como "Novo Lead"
UPDATE contacts 
SET kanban_stage = 'Novo Lead'
WHERE kanban_stage IS NULL OR kanban_stage = '';

-- 6. Criar trigger para normalizar automaticamente novos dados
CREATE OR REPLACE FUNCTION normalize_contact_stage()
RETURNS TRIGGER AS $$
BEGIN
    -- Normalizar o nome do estágio na inserção/atualização
    IF NEW.kanban_stage IS NOT NULL THEN
        NEW.kanban_stage = normalize_stage_name(NEW.kanban_stage);
    ELSE
        NEW.kanban_stage = 'Novo Lead';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Aplicar trigger na tabela contacts
DROP TRIGGER IF EXISTS normalize_stage_trigger ON contacts;
CREATE TRIGGER normalize_stage_trigger
    BEFORE INSERT OR UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION normalize_contact_stage();