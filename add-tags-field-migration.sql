-- Migração para adicionar campo tags na tabela contacts
-- Este script adiciona o campo tags como JSONB para armazenar as etiquetas dos clientes

-- Verificar se a coluna já existe antes de adicionar
DO $$ 
BEGIN
    -- Adicionar coluna tags se não existir
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'contacts' 
        AND column_name = 'tags'
    ) THEN
        ALTER TABLE contacts ADD COLUMN tags JSONB DEFAULT '[]';
        
        -- Adicionar comentário para documentação
        COMMENT ON COLUMN contacts.tags IS 'Array JSON de etiquetas do cliente com id, title e color';
        
        -- Criar índice para melhor performance em consultas
        CREATE INDEX IF NOT EXISTS idx_contacts_tags ON contacts USING GIN (tags);
        
        RAISE NOTICE 'Campo tags adicionado com sucesso à tabela contacts';
    ELSE
        RAISE NOTICE 'Campo tags já existe na tabela contacts';
    END IF;
END $$;

-- Exemplo de estrutura esperada para o campo tags:
-- [
--   {
--     "id": "1234567890",
--     "title": "Cliente VIP",
--     "color": "#3b82f6"
--   },
--   {
--     "id": "1234567891", 
--     "title": "Urgente",
--     "color": "#ef4444"
--   }
-- ]