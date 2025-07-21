-- Migração Fase 1: Criação da tabela agendas (Estrutura Básica)
-- Knowledge Manager - Sistema de Agendamento

-- Criação da tabela agendas
CREATE TABLE IF NOT EXISTS agendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price DECIMAL(10,2),
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  max_participants INTEGER DEFAULT 1,
  requires_approval BOOLEAN DEFAULT false,
  buffer_time_minutes INTEGER DEFAULT 0,
  cancellation_policy TEXT,
  preparation_notes TEXT,
  follow_up_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Comentários nas colunas para documentação
COMMENT ON TABLE agendas IS 'Tabela principal para armazenar tipos de agendamentos disponíveis';
COMMENT ON COLUMN agendas.name IS 'Nome do tipo de agendamento';
COMMENT ON COLUMN agendas.description IS 'Descrição detalhada do agendamento';
COMMENT ON COLUMN agendas.duration_minutes IS 'Duração padrão em minutos';
COMMENT ON COLUMN agendas.price IS 'Preço do agendamento';
COMMENT ON COLUMN agendas.category IS 'Categoria do agendamento (ex: consulta, aula, reunião)';
COMMENT ON COLUMN agendas.max_participants IS 'Número máximo de participantes';
COMMENT ON COLUMN agendas.requires_approval IS 'Se requer aprovação manual';
COMMENT ON COLUMN agendas.buffer_time_minutes IS 'Tempo de intervalo entre agendamentos';
COMMENT ON COLUMN agendas.cancellation_policy IS 'Política de cancelamento';
COMMENT ON COLUMN agendas.preparation_notes IS 'Notas de preparação para o profissional';
COMMENT ON COLUMN agendas.follow_up_notes IS 'Notas de acompanhamento pós-agendamento';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_agendas_name ON agendas(name);
CREATE INDEX IF NOT EXISTS idx_agendas_category ON agendas(category);
CREATE INDEX IF NOT EXISTS idx_agendas_is_active ON agendas(is_active);
CREATE INDEX IF NOT EXISTS idx_agendas_created_by ON agendas(created_by);
CREATE INDEX IF NOT EXISTS idx_agendas_created_at ON agendas(created_at);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_agendas_updated_at
    BEFORE UPDATE ON agendas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE agendas ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
-- Política para permitir que usuários vejam todas as agendas ativas
CREATE POLICY "Users can view active agendas" ON agendas
    FOR SELECT USING (is_active = true OR auth.uid() = created_by);

-- Política para permitir que usuários autenticados criem agendas
CREATE POLICY "Authenticated users can create agendas" ON agendas
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Política para permitir que criadores editem suas agendas
CREATE POLICY "Users can update their own agendas" ON agendas
    FOR UPDATE USING (auth.uid() = created_by);

-- Política para permitir que criadores deletem suas agendas
CREATE POLICY "Users can delete their own agendas" ON agendas
    FOR DELETE USING (auth.uid() = created_by);

-- Inserir dados de exemplo para teste
INSERT INTO agendas (name, description, duration_minutes, price, category, max_participants, requires_approval) VALUES
('Consulta de Terapia', 'Sessão individual de terapia psicológica', 60, 150.00, 'consulta', 1, false),
('Aula de Yoga', 'Aula de yoga em grupo para iniciantes', 90, 50.00, 'aula', 10, false),
('Reunião de Negócios', 'Reunião para discussão de projetos e estratégias', 45, 200.00, 'reuniao', 5, true),
('Consulta Nutricional', 'Avaliação e orientação nutricional personalizada', 75, 120.00, 'consulta', 1, false)
ON CONFLICT (id) DO NOTHING;

-- Verificar se a tabela foi criada corretamente
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agendas') THEN
        RAISE NOTICE 'Tabela agendas criada com sucesso!';
    ELSE
        RAISE EXCEPTION 'Erro: Tabela agendas não foi criada!';
    END IF;
END $$;