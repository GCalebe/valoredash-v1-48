-- =====================================================
-- CRIAÇÃO DA TABELA FAQ_ITEMS
-- Tabela para gerenciar perguntas frequentes
-- =====================================================

-- Criar tabela faq_items
CREATE TABLE IF NOT EXISTS faq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'Geral',
  tags TEXT[] DEFAULT '{}', -- Array de tags
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_faq_items_category ON faq_items(category);
CREATE INDEX IF NOT EXISTS idx_faq_items_is_active ON faq_items(is_active);
CREATE INDEX IF NOT EXISTS idx_faq_items_created_at ON faq_items(created_at);
CREATE INDEX IF NOT EXISTS idx_faq_items_tags ON faq_items USING GIN(tags);

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_faq_items_updated_at
    BEFORE UPDATE ON faq_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir alguns dados de exemplo
INSERT INTO faq_items (question, answer, category, tags) VALUES
('Como posso agendar uma consulta?', 'Você pode agendar uma consulta através do nosso sistema online ou entrando em contato conosco por telefone.', 'Agendamento', ARRAY['agendamento', 'consulta']),
('Quais são os horários de funcionamento?', 'Funcionamos de segunda a sexta das 8h às 18h, e aos sábados das 8h às 12h.', 'Horários', ARRAY['horarios', 'funcionamento']),
('Como posso cancelar um agendamento?', 'Para cancelar um agendamento, entre em contato conosco com pelo menos 24 horas de antecedência.', 'Agendamento', ARRAY['cancelamento', 'agendamento']),
('Quais formas de pagamento são aceitas?', 'Aceitamos dinheiro, cartão de débito, cartão de crédito e PIX.', 'Pagamento', ARRAY['pagamento', 'formas']),
('Vocês atendem convênios?', 'Sim, atendemos diversos convênios. Entre em contato para verificar se o seu convênio é aceito.', 'Convênios', ARRAY['convenio', 'planos']);

-- Habilitar RLS (Row Level Security) se necessário
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura para todos os usuários autenticados
CREATE POLICY "FAQ items são visíveis para usuários autenticados" ON faq_items
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir inserção/atualização/exclusão apenas para usuários autenticados
CREATE POLICY "FAQ items podem ser gerenciados por usuários autenticados" ON faq_items
    FOR ALL USING (auth.role() = 'authenticated');