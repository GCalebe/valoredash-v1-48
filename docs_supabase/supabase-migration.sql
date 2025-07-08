-- =====================================================
-- MIGRAÇÃO DE DADOS MOCKUP PARA SUPABASE
-- Valore V2 Project - Dados de Teste
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TABELA DE CLIENTES/CONTATOS
-- =====================================================

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  client_name VARCHAR(255),
  client_size VARCHAR(50),
  client_type VARCHAR(50),
  cpf_cnpj VARCHAR(50),
  asaas_customer_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'Active',
  notes TEXT,
  last_contact DATE,
  kanban_stage VARCHAR(100),
  last_message TEXT,
  last_message_time VARCHAR(50),
  unread_count INTEGER DEFAULT 0,
  session_id VARCHAR(100),
  tags TEXT[], -- Array de tags
  responsible_user VARCHAR(255),
  sales DECIMAL(10,2),
  client_sector VARCHAR(100),
  budget DECIMAL(10,2),
  payment_method VARCHAR(50),
  client_objective TEXT,
  loss_reason VARCHAR(100),
  contract_number VARCHAR(100),
  contract_date DATE,
  payment VARCHAR(50),
  uploaded_files TEXT[], -- Array de arquivos
  consultation_stage VARCHAR(100),
  custom_values JSONB, -- Campos personalizados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. TABELAS DE MÉTRICAS
-- =====================================================

-- Tabela para estatísticas de clientes
CREATE TABLE IF NOT EXISTS client_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  total_clients INTEGER,
  total_chats INTEGER,
  new_clients_this_month INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para crescimento mensal
CREATE TABLE IF NOT EXISTS monthly_growth (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  month VARCHAR(10),
  clients INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para métricas de conversação
CREATE TABLE IF NOT EXISTS conversation_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  total_conversations INTEGER,
  response_rate DECIMAL(5,2),
  total_respondidas INTEGER,
  avg_response_time DECIMAL(5,2),
  conversion_rate DECIMAL(5,2),
  avg_closing_time DECIMAL(5,2),
  avg_response_start_time DECIMAL(5,2),
  secondary_response_rate DECIMAL(5,2),
  total_secondary_responses INTEGER,
  negotiated_value DECIMAL(12,2),
  average_negotiated_value DECIMAL(12,2),
  total_negotiating_value DECIMAL(12,2),
  previous_period_value DECIMAL(12,2),
  is_stale BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para dados de conversação por dia
CREATE TABLE IF NOT EXISTS conversation_daily_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date VARCHAR(10),
  respondidas INTEGER,
  nao_respondidas INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para dados do funil
CREATE TABLE IF NOT EXISTS funnel_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100),
  value INTEGER,
  percentage DECIMAL(5,2),
  color VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para conversão por tempo
CREATE TABLE IF NOT EXISTS conversion_by_time (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day VARCHAR(20),
  morning INTEGER,
  afternoon INTEGER,
  evening INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para leads por fonte
CREATE TABLE IF NOT EXISTS leads_by_source (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100),
  value INTEGER,
  color VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para leads ao longo do tempo
CREATE TABLE IF NOT EXISTS leads_over_time (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  month VARCHAR(10),
  clients INTEGER,
  leads INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. TABELAS UTM E CAMPANHAS
-- =====================================================

CREATE TABLE IF NOT EXISTS utm_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  total_campaigns INTEGER,
  total_leads INTEGER,
  conversion_rate DECIMAL(5,2),
  is_stale BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaign_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100),
  leads INTEGER,
  conversions INTEGER,
  value DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS utm_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id VARCHAR(100),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_term VARCHAR(100),
  utm_content VARCHAR(100),
  utm_conversion BOOLEAN DEFAULT FALSE,
  utm_conversion_value DECIMAL(10,2),
  utm_conversion_stage VARCHAR(100),
  landing_page VARCHAR(255),
  device_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. TABELA DE PRODUTOS AI
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  image TEXT,
  features TEXT[], -- Array de features
  category VARCHAR(100),
  popular BOOLEAN DEFAULT FALSE,
  new BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. TABELAS DE CAMPOS PERSONALIZADOS
-- =====================================================

-- Criar enum para tipos de campos personalizados
DO $$ BEGIN
  CREATE TYPE field_type_enum AS ENUM ('text', 'number', 'date', 'boolean', 'select', 'multi_select');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Criar enum para tipos de regras de validação
DO $$ BEGIN
  CREATE TYPE rule_type_enum AS ENUM ('required', 'min_length', 'max_length', 'regex', 'email', 'number_range', 'date_range', 'options');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tabela de campos personalizados
CREATE TABLE IF NOT EXISTS custom_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  field_name VARCHAR(255) NOT NULL,
  field_type field_type_enum NOT NULL,
  field_options JSONB,
  is_required BOOLEAN DEFAULT FALSE,
  category VARCHAR(100),
  description TEXT,
  placeholder VARCHAR(255),
  default_value TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de regras de validação para campos personalizados
CREATE TABLE IF NOT EXISTS custom_field_validation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  field_id UUID NOT NULL REFERENCES custom_fields(id) ON DELETE CASCADE,
  rule_type rule_type_enum NOT NULL,
  rule_value TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de valores de campos personalizados para clientes
CREATE TABLE IF NOT EXISTS client_custom_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES custom_fields(id) ON DELETE CASCADE,
  field_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, field_id)
);

-- Tabela de log de auditoria para campos personalizados
CREATE TABLE IF NOT EXISTS custom_field_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  custom_value_id UUID NOT NULL REFERENCES client_custom_values(id) ON DELETE CASCADE,
  change_type VARCHAR(50) NOT NULL, -- create, update, delete
  old_value TEXT,
  new_value TEXT,
  changed_by VARCHAR(255),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. INSERÇÃO DOS DADOS MOCKUP
-- =====================================================

-- Inserir clientes mockup
INSERT INTO contacts (
  id, name, email, phone, address, client_name, client_size, client_type, 
  cpf_cnpj, asaas_customer_id, status, notes, last_contact, kanban_stage, 
  last_message, last_message_time, unread_count, session_id, tags, 
  responsible_user, sales, client_sector, budget, payment_method, 
  client_objective, loss_reason, contract_number, contract_date, payment, 
  uploaded_files, consultation_stage, custom_values
) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'João Silva', 'joao.silva@email.com', '+55 11 99999-1234', 'Rua das Flores, 123 - São Paulo, SP', 'Silva Empreendimentos', 'Médio', 'pessoa-juridica', '12.345.678/0001-90', 'cus_000001', 'Active', 'Cliente muito interessado em soluções de automação', '2024-06-20', 'Qualificado', 'Olá! Gostaria de saber mais sobre os serviços disponíveis.', '2 min', 2, 'session_001', ARRAY['VIP', 'Automação', 'Urgente'], 'Gabriel Calebe', 15000.00, 'tecnologia', 25000.00, 'cartao', 'Automatizar processos internos da empresa', '', 'CTR-2024-001', '2024-06-15', 'pago', ARRAY['contrato_silva.pdf', 'proposta_tecnica.docx'], 'Proposta enviada', '{"origem": "Website", "interesse": ["Automação", "Consultoria"]}'),

('550e8400-e29b-41d4-a716-446655440002', 'Maria Santos', 'maria.santos@gmail.com', '+55 21 98765-4321', 'Av. Copacabana, 456 - Rio de Janeiro, RJ', 'Santos & Associados', 'Grande', 'pessoa-juridica', '98.765.432/0001-10', 'cus_000002', 'Active', 'Empresa de advocacia com interesse em digitalização', '2024-06-19', 'Negociação', 'Quando posso agendar uma consulta?', '1h', 0, 'session_002', ARRAY['Advocacia', 'Digitalização'], 'Ana Costa', 30000.00, 'saude', 50000.00, 'pix', 'Digitalizar documentos jurídicos', '', 'CTR-2024-002', '2024-06-18', 'pendente', ARRAY['ata_reuniao.pdf'], 'Negociação', '{"origem": "Indicação", "prioridade": "Alta"}'),

('550e8400-e29b-41d4-a716-446655440003', 'Carlos Oliveira', 'carlos@oliveira.com.br', '+55 11 91234-5678', 'Rua Augusta, 789 - São Paulo, SP', NULL, 'Pequeno', 'pessoa-fisica', '123.456.789-01', 'cus_000003', 'Active', 'Pessoa física interessada em consultoria', '2024-06-18', 'Nova consulta', 'Obrigado pelo atendimento, foi muito esclarecedor!', '3h', 1, 'session_003', ARRAY['Consultoria', 'Pessoa Física'], 'Lucas Mendes', 5000.00, 'comercio', 8000.00, 'boleto', 'Consultoria para abertura de negócio', '', '', '', 'pendente', ARRAY[]::TEXT[], 'Nova consulta', '{"origem": "Google Ads"}'),

('550e8400-e29b-41d4-a716-446655440004', 'Ana Paula Costa', 'anapaula@email.com', '+55 85 97777-8888', 'Rua do Sol, 321 - Fortaleza, CE', 'Costa Restaurantes', 'Médio', 'pessoa-juridica', '11.222.333/0001-44', 'cus_000004', 'Active', 'Rede de restaurantes buscando sistema de gestão', '2024-06-17', 'Chamada agendada', 'Preciso reagendar minha consulta para a próxima semana.', 'Ontem', 0, 'session_004', ARRAY['Restaurante', 'Gestão', 'Sistema'], 'Gabriel Calebe', 20000.00, 'comercio', 35000.00, 'transferencia', 'Sistema de gestão para restaurantes', '', 'CTR-2024-003', '2024-06-16', 'pago', ARRAY['menu_digital.pdf', 'layout_sistema.png'], 'Chamada agendada', '{"origem": "Facebook", "segmento": "Alimentação"}'),

('550e8400-e29b-41d4-a716-446655440005', 'Roberto Ferreira', 'roberto.ferreira@tech.com', '+55 31 96666-7777', 'Av. Afonso Pena, 654 - Belo Horizonte, MG', 'TechSolutions BH', 'Grande', 'pessoa-juridica', '55.666.777/0001-88', 'cus_000005', 'Inactive', 'Projeto cancelado por questões orçamentárias', '2024-06-10', 'Projeto cancelado – perdido', 'Qual o valor do serviço que conversamos?', '1 semana', 0, 'session_005', ARRAY['Tecnologia', 'Cancelado'], 'Ana Costa', 0.00, 'tecnologia', 100000.00, '', 'Desenvolvimento de plataforma customizada', 'orcamento', '', '', '', ARRAY['briefing_inicial.pdf'], 'Projeto cancelado – perdido', '{"origem": "LinkedIn", "motivo_perda": "Orçamento alto"}');

-- Inserir estatísticas de clientes
INSERT INTO client_stats (total_clients, total_chats, new_clients_this_month) 
VALUES (120, 250, 15);

-- Inserir crescimento mensal
INSERT INTO monthly_growth (month, clients) VALUES 
('Jan', 8), ('Fev', 10), ('Mar', 12), ('Abr', 14), ('Mai', 11), ('Jun', 9),
('Jul', 10), ('Ago', 8), ('Set', 12), ('Out', 7), ('Nov', 6), ('Dez', 13);

-- Inserir métricas de conversação
INSERT INTO conversation_metrics (
  total_conversations, response_rate, total_respondidas, avg_response_time,
  conversion_rate, avg_closing_time, avg_response_start_time, secondary_response_rate,
  total_secondary_responses, negotiated_value, average_negotiated_value,
  total_negotiating_value, previous_period_value, is_stale
) VALUES (
  340, 85.0, 289, 2.0, 30.0, 5.0, 45.0, 70.0, 200, 50000.00, 16666.00, 125000.00, 42000.00, FALSE
);

-- Inserir dados de conversação diária
INSERT INTO conversation_daily_data (date, respondidas, nao_respondidas) VALUES 
('Seg', 40, 5), ('Ter', 45, 8), ('Qua', 50, 9), ('Qui', 55, 12),
('Sex', 60, 10), ('Sáb', 25, 6), ('Dom', 14, 1);

-- Inserir dados do funil
INSERT INTO funnel_data (name, value, percentage, color) VALUES 
('Entraram', 340, 100.0, '#3B82F6'),
('Contato', 250, 74.0, '#10B981'),
('Reunião', 150, 44.0, '#F59E0B'),
('Fechamento', 100, 29.0, '#EF4444');

-- Inserir conversão por tempo
INSERT INTO conversion_by_time (day, morning, afternoon, evening) VALUES 
('Segunda', 12, 18, 5), ('Terça', 14, 20, 6), ('Quarta', 16, 22, 7),
('Quinta', 18, 24, 8), ('Sexta', 20, 26, 9), ('Sábado', 10, 15, 12), ('Domingo', 8, 10, 7);

-- Inserir leads por fonte
INSERT INTO leads_by_source (name, value, color) VALUES 
('Facebook', 80, '#3B82F6'), ('Google', 60, '#10B981'), ('Indicação', 30, '#F59E0B');

-- Inserir leads ao longo do tempo
INSERT INTO leads_over_time (month, clients, leads) VALUES 
('Jan', 5, 15), ('Fev', 6, 18), ('Mar', 7, 20), ('Abr', 8, 22), ('Mai', 9, 24), ('Jun', 10, 26);

-- Inserir métricas UTM
INSERT INTO utm_metrics (total_campaigns, total_leads, conversion_rate, is_stale) 
VALUES (5, 60, 25.0, FALSE);

-- Inserir dados de campanha
INSERT INTO campaign_data (name, leads, conversions, value) VALUES 
('verao2024', 30, 10, 5000.00),
('inverno2024', 20, 5, 3000.00),
('black_friday', 10, 5, 4000.00);

-- Inserir tracking UTM
INSERT INTO utm_tracking (
  lead_id, utm_source, utm_medium, utm_campaign, utm_term, utm_content,
  utm_conversion, utm_conversion_value, utm_conversion_stage, landing_page, device_type
) VALUES (
  'L1', 'facebook', 'cpc', 'verao2024', 'marketing', 'anuncio1',
  TRUE, 500.00, 'Fechamento', '/', 'mobile'
);

-- Inserir produtos AI
INSERT INTO ai_products (id, name, description, icon, image, features, category, popular, new) VALUES 
('ai-sdr', 'IA SDR', 'Prospecção fria automatizada com até 5% de sucesso em agendamentos de reuniões', 'UserRound', 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg', ARRAY['Prospecção fria automatizada', 'Qualificação de leads', 'Agendamento de reuniões', 'Acompanhamento personalizado', 'Integração com CRM'], 'Vendas', TRUE, FALSE),

('ai-atendente', 'IA Atendente', 'Atendimento automatizado para leads de anúncios e suporte a clientes existentes', 'MessageSquare', 'https://images.pexels.com/photos/7709452/pexels-photo-7709452.jpeg', ARRAY['Atendimento 24/7', 'Qualificação de leads', 'Respostas personalizadas', 'Transferência para humanos', 'Integração com WhatsApp'], 'Atendimento', TRUE, FALSE),

('ai-onboarding', 'IA Onboarding', 'Automatiza todo o processo de onboarding de novos clientes', 'Briefcase', 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg', ARRAY['Criação de grupos no WhatsApp', 'Organização no Google Drive', 'Geração de contratos', 'Envio para assinatura', 'Integração com Notion/Clickup'], 'Operações', FALSE, TRUE),

('ai-financeiro', 'IA Financeiro', 'Gerencia pagamentos recorrentes, envio de links e baixa automática', 'Wallet', 'https://images.pexels.com/photos/6694543/pexels-photo-6694543.jpeg', ARRAY['Lembretes de pagamento', 'Envio de links de pagamento', 'Baixa automática', 'Relatórios financeiros', 'Integração com sistemas de pagamento'], 'Financeiro', FALSE, FALSE),

('ai-gestor-trafego', 'IA Gestor de Tráfego', 'Análise e otimização automática de campanhas publicitárias', 'LineChart', 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg', ARRAY['Análise de campanhas', 'Otimização de orçamento', 'Pausa de anúncios de baixo desempenho', 'Recomendações de melhoria', 'Relatórios de performance'], 'Marketing', TRUE, FALSE);

-- =====================================================
-- 7. ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_kanban_stage ON contacts(kanban_stage);
CREATE INDEX IF NOT EXISTS idx_contacts_responsible_user ON contacts(responsible_user);
CREATE INDEX IF NOT EXISTS idx_contacts_client_sector ON contacts(client_sector);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);
CREATE INDEX IF NOT EXISTS idx_utm_tracking_utm_source ON utm_tracking(utm_source);
CREATE INDEX IF NOT EXISTS idx_utm_tracking_utm_campaign ON utm_tracking(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_ai_products_category ON ai_products(category);
CREATE INDEX IF NOT EXISTS idx_ai_products_popular ON ai_products(popular);

-- =====================================================
-- 8. VIEWS PARA FACILITAR CONSULTAS
-- =====================================================

-- View para dashboard de métricas
CREATE OR REPLACE VIEW dashboard_metrics AS
SELECT 
  cs.total_clients,
  cs.total_chats,
  cs.new_clients_this_month,
  cm.total_conversations,
  cm.response_rate,
  cm.conversion_rate,
  cm.negotiated_value,
  um.total_campaigns,
  um.total_leads
FROM client_stats cs
CROSS JOIN conversation_metrics cm
CROSS JOIN utm_metrics um
ORDER BY cs.created_at DESC, cm.created_at DESC, um.created_at DESC
LIMIT 1;

-- View para funil de conversão com filtro de data
CREATE OR REPLACE VIEW conversion_funnel_view AS
SELECT 
  fd.name,
  fd.value,
  fd.percentage,
  fd.color,
  fd.created_at
FROM funnel_data fd
ORDER BY fd.value DESC;

-- View para análise de leads por período
CREATE OR REPLACE VIEW leads_analysis AS
SELECT 
  lot.month,
  lot.clients,
  lot.leads,
  lbs.name as source_name,
  lbs.value as source_value
FROM leads_over_time lot
CROSS JOIN leads_by_source lbs
ORDER BY lot.month, lbs.value DESC;

-- =====================================================
-- 9. FUNÇÕES PARA FILTROS DE DATA
-- =====================================================

-- Função para filtrar métricas por período
CREATE OR REPLACE FUNCTION get_metrics_by_date_range(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  total_conversations INTEGER,
  response_rate DECIMAL,
  conversion_rate DECIMAL,
  negotiated_value DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.total_conversations,
    cm.response_rate,
    cm.conversion_rate,
    cm.negotiated_value
  FROM conversation_metrics cm
  WHERE cm.created_at::DATE BETWEEN start_date AND end_date
  ORDER BY cm.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Função para filtrar funil por período
CREATE OR REPLACE FUNCTION get_funnel_by_date_range(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  name VARCHAR,
  value INTEGER,
  percentage DECIMAL,
  color VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fd.name,
    fd.value,
    fd.percentage,
    fd.color
  FROM funnel_data fd
  WHERE fd.created_at::DATE BETWEEN start_date AND end_date
  ORDER BY fd.value DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 11. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE contacts IS 'Tabela principal de clientes/contatos com todos os dados do CRM';
COMMENT ON TABLE conversation_metrics IS 'Métricas de conversação e funil de vendas';
COMMENT ON TABLE funnel_data IS 'Dados do funil de conversão para dashboard';
COMMENT ON TABLE utm_tracking IS 'Rastreamento de campanhas UTM e conversões';
COMMENT ON TABLE ai_products IS 'Catálogo de produtos de IA disponíveis';

COMMENT ON FUNCTION get_metrics_by_date_range IS 'Retorna métricas filtradas por período de datas';
COMMENT ON FUNCTION get_funnel_by_date_range IS 'Retorna dados do funil filtrados por período';

-- =====================================================
-- MIGRAÇÃO CONCLUÍDA!
-- =====================================================

-- Para testar a migração, execute:
-- SELECT * FROM dashboard_metrics;
-- SELECT * FROM conversion_funnel_view;
-- SELECT * FROM get_metrics_by_date_range('2024-06-01', '2024-06-30');
-- SELECT * FROM get_funnel_by_date_range('2024-06-01', '2024-06-30');