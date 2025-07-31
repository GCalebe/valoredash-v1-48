-- Script para criar as tabelas que estão faltando

-- Criar tabela monthly_growth se não existir
CREATE TABLE IF NOT EXISTS monthly_growth (
  id SERIAL PRIMARY KEY,
  month VARCHAR(10) NOT NULL,
  growth_percentage DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela conversation_daily_data se não existir
CREATE TABLE IF NOT EXISTS conversation_daily_data (
  id SERIAL PRIMARY KEY,
  day VARCHAR(10) NOT NULL,
  messages INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela conversion_by_time se não existir
CREATE TABLE IF NOT EXISTS conversion_by_time (
  id SERIAL PRIMARY KEY,
  day VARCHAR(10) NOT NULL,
  morning INTEGER NOT NULL,
  afternoon INTEGER NOT NULL,
  evening INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela leads_by_source se não existir
CREATE TABLE IF NOT EXISTS leads_by_source (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  value INTEGER NOT NULL,
  color VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela leads_over_time se não existir
CREATE TABLE IF NOT EXISTS leads_over_time (
  id SERIAL PRIMARY KEY,
  month VARCHAR(10) NOT NULL,
  clients INTEGER NOT NULL,
  leads INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela campaign_data se não existir
CREATE TABLE IF NOT EXISTS campaign_data (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  leads INTEGER NOT NULL,
  conversions INTEGER NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir dados de exemplo em monthly_growth
INSERT INTO monthly_growth (month, growth_percentage) VALUES 
('Jan', 5.2), ('Fev', 6.1), ('Mar', 7.3), ('Abr', 8.5), ('Mai', 9.2), ('Jun', 10.1);

-- Inserir dados de exemplo em conversation_daily_data
INSERT INTO conversation_daily_data (day, messages) VALUES 
('Segunda', 120), ('Terça', 150), ('Quarta', 180), ('Quinta', 200), ('Sexta', 220), ('Sábado', 100), ('Domingo', 80);

-- Inserir dados de exemplo em conversion_by_time
INSERT INTO conversion_by_time (day, morning, afternoon, evening) VALUES 
('Segunda', 12, 18, 5), ('Terça', 14, 20, 6), ('Quarta', 16, 22, 7),
('Quinta', 18, 24, 8), ('Sexta', 20, 26, 9), ('Sábado', 10, 15, 12), ('Domingo', 8, 10, 7);

-- Inserir dados de exemplo em leads_by_source
INSERT INTO leads_by_source (name, value, color) VALUES 
('Facebook', 80, '#3B82F6'), ('Google', 60, '#10B981'), ('Indicação', 30, '#F59E0B');

-- Inserir dados de exemplo em leads_over_time
INSERT INTO leads_over_time (month, clients, leads) VALUES 
('Jan', 5, 15), ('Fev', 6, 18), ('Mar', 7, 20), ('Abr', 8, 22), ('Mai', 9, 24), ('Jun', 10, 26);

-- Inserir dados de exemplo em campaign_data
INSERT INTO campaign_data (name, leads, conversions, value) VALUES 
('verao2024', 30, 10, 5000.00),
('inverno2024', 20, 5, 3000.00),
('black_friday', 10, 5, 4000.00);