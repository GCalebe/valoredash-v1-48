-- Adicionar campo para anfitriões responsáveis na tabela contacts
ALTER TABLE public.contacts 
ADD COLUMN responsible_hosts TEXT[] DEFAULT NULL;

-- Adicionar comentário para documentar o campo
COMMENT ON COLUMN public.contacts.responsible_hosts IS 'Array de IDs dos anfitriões responsáveis pelo contato';