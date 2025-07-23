-- Criar uma política temporária para permitir acesso público às agendas
-- Esta será removida quando a autenticação estiver completamente implementada

-- Desabilitar RLS temporariamente para a tabela agendas para permitir desenvolvimento
ALTER TABLE agendas DISABLE ROW LEVEL SECURITY;

-- Ou criar uma política que permita acesso público
-- ALTER TABLE agendas ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Authenticated users can create agendas" ON agendas;
-- DROP POLICY IF EXISTS "Users can view active agendas" ON agendas;
-- DROP POLICY IF EXISTS "Users can update their own agendas" ON agendas;
-- DROP POLICY IF EXISTS "Users can delete their own agendas" ON agendas;

-- CREATE POLICY "Public read access to agendas" ON agendas FOR SELECT USING (true);
-- CREATE POLICY "Public insert access to agendas" ON agendas FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Public update access to agendas" ON agendas FOR UPDATE USING (true);
-- CREATE POLICY "Public delete access to agendas" ON agendas FOR DELETE USING (true);