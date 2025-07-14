-- Criar bucket para arquivos de clientes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('client-files', 'client-files', false);

-- Criar políticas de storage para arquivos de clientes
CREATE POLICY "Authenticated users can upload client files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'client-files');

CREATE POLICY "Authenticated users can view client files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'client-files');

CREATE POLICY "Authenticated users can update client files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'client-files');

CREATE POLICY "Authenticated users can delete client files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'client-files');

-- Adicionar coluna para armazenar informações dos arquivos na tabela contacts
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS files_metadata JSONB DEFAULT '[]'::jsonb;

-- Criar tabela para controlar uso de storage por usuário
CREATE TABLE IF NOT EXISTS user_storage_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  used_bytes BIGINT DEFAULT 0,
  max_bytes BIGINT DEFAULT 104857600, -- 100MB por usuário
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies para user_storage_usage
ALTER TABLE user_storage_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own storage usage"
ON user_storage_usage
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own storage usage"
ON user_storage_usage
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own storage usage"
ON user_storage_usage
FOR UPDATE
USING (auth.uid() = user_id);

-- Função para atualizar uso de storage
CREATE OR REPLACE FUNCTION update_user_storage_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Adicionar tamanho do arquivo
    INSERT INTO user_storage_usage (user_id, used_bytes)
    VALUES (auth.uid(), (NEW.metadata->>'size')::bigint)
    ON CONFLICT (user_id) DO UPDATE 
    SET used_bytes = user_storage_usage.used_bytes + (NEW.metadata->>'size')::bigint,
        updated_at = NOW();
  ELSIF TG_OP = 'DELETE' THEN
    -- Subtrair tamanho do arquivo
    UPDATE user_storage_usage 
    SET used_bytes = GREATEST(0, used_bytes - (OLD.metadata->>'size')::bigint),
        updated_at = NOW()
    WHERE user_id = auth.uid();
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar uso de storage automaticamente
CREATE TRIGGER update_storage_usage_trigger
  AFTER INSERT OR DELETE ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'client-files' OR OLD.bucket_id = 'client-files')
  EXECUTE FUNCTION update_user_storage_usage();