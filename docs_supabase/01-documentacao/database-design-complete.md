# Design Completo do Banco de Dados - Valore CRM v2

## 1. Requisitos do Projeto

### Funcionalidades Principais
- **CRM Completo**: Gestão de contatos, leads e clientes
- **Sistema de Agenda**: Agendamento de eventos e compromissos
- **Gestão de Conhecimento**: Produtos, combos e materiais de vendas
- **Sistema de Assinaturas**: Planos de precificação e pagamentos
- **Chat Inteligente**: Histórico de conversas com IA
- **Dashboard Analytics**: Métricas de funil, conversões e campanhas
- **Campos Personalizados**: Sistema flexível de campos customizáveis
- **Rastreamento UTM**: Análise de campanhas de marketing
- **Sistema de Usuários**: Autenticação e controle de acesso

### Requisitos Técnicos
- **Escalabilidade**: Suporte a múltiplos usuários e grandes volumes de dados
- **Performance**: Índices otimizados para consultas frequentes
- **Segurança**: Row Level Security (RLS) para isolamento de dados
- **Integridade**: Chaves estrangeiras e constraints apropriadas
- **Auditoria**: Logs de alterações em dados críticos

## 2. Entidades e Relacionamentos

### 2.1 Módulo de Usuários e Autenticação

#### `profiles` (Existente)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'user', -- 'admin', 'user'
  ai_access BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.2 Módulo de CRM

#### `contacts` (Existente)
```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  client_name TEXT,
  client_size TEXT,
  client_type TEXT,
  cpf_cnpj TEXT,
  asaas_customer_id TEXT,
  status TEXT DEFAULT 'active',
  kanban_stage_id UUID REFERENCES kanban_stages(id),
  session_id UUID,
  tags TEXT[],
  notes TEXT,
  responsible_user UUID REFERENCES auth.users(id),
  sales DECIMAL(10,2),
  client_sector TEXT,
  budget DECIMAL(10,2),
  payment_method TEXT,
  client_objective TEXT,
  loss_reason TEXT,
  contract_number TEXT,
  contract_date DATE,
  payment DECIMAL(10,2),
  uploaded_files JSONB,
  consultation_stage TEXT,
  last_contact TIMESTAMPTZ,
  last_message TEXT,
  last_message_time TIMESTAMPTZ,
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
```

#### `kanban_stages` (Existente)
```sql
CREATE TABLE kanban_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  color TEXT,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.3 Módulo de Agenda (FALTANTE)

#### `calendar_events` (CRIAR)
```sql
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  description TEXT,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'confirmed', -- 'confirmed', 'tentative', 'cancelled'
  html_link TEXT,
  location TEXT,
  host_name TEXT,
  contact_id UUID REFERENCES contacts(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `calendar_attendees` (CRIAR)
```sql
CREATE TABLE calendar_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  response_status TEXT DEFAULT 'needsAction', -- 'accepted', 'declined', 'tentative', 'needsAction'
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `appointments` (CRIAR)
```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id),
  pet_name TEXT,
  owner_name TEXT NOT NULL,
  phone TEXT,
  appointment_date TIMESTAMPTZ NOT NULL,
  service TEXT,
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'completed', 'cancelled'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.4 Módulo de Assinaturas e Precificação (FALTANTE)

#### `pricing_plans` (CRIAR)
```sql
CREATE TABLE pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  billing_period TEXT NOT NULL, -- 'monthly', 'yearly'
  features TEXT[],
  popular BOOLEAN DEFAULT false,
  ai_products TEXT[],
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `user_subscriptions` (CRIAR)
```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES pricing_plans(id),
  status TEXT NOT NULL, -- 'active', 'canceled', 'past_due', 'trialing'
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `payment_methods` (CRIAR)
```sql
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'credit_card', 'debit_card', 'pix'
  last_four TEXT,
  brand TEXT,
  expiry_month INTEGER,
  expiry_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `invoices` (CRIAR)
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL, -- 'paid', 'pending', 'failed'
  due_date TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.5 Módulo de Gestão de Conhecimento

#### `products` (Existente)
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  benefits TEXT[],
  objections TEXT[],
  has_combo BOOLEAN DEFAULT false,
  has_upgrade BOOLEAN DEFAULT false,
  has_promotion BOOLEAN DEFAULT false,
  differentials TEXT[],
  success_cases TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);
```

#### `product_combos` (Existente)
#### `product_combo_items` (Existente)

#### `documents` (Existente)
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  embedding VECTOR(1536), -- Para busca semântica
  document_type TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.6 Módulo de Chat e IA

#### `n8n_chat_memory` (Existente)
```sql
CREATE TABLE n8n_chat_memory (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  message JSONB NOT NULL,
  data TEXT,
  hora TEXT,
  memory_type TEXT, -- 'contextual', 'semantic', 'episodic'
  memory_level TEXT, -- 'short_term', 'medium_term', 'long_term'
  expiration_date TIMESTAMPTZ,
  importance INTEGER, -- 1-10
  entities JSONB,
  relationships JSONB,
  context JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `conversations` (CRIAR)
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID UNIQUE DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id),
  title TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'archived', 'closed'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.7 Módulo de Analytics e Métricas

#### `funnel_data` (Existente)
#### `utm_tracking` (Existente)
#### `utm_metrics` (Existente)

#### Tabelas de Analytics (CRIAR - do missing-tables.sql)
- `monthly_growth`
- `conversation_daily_data`
- `conversion_by_time`
- `leads_by_source`
- `leads_over_time`
- `campaign_data`

### 2.8 Módulo de Campos Personalizados

#### `custom_fields` (Existente)
#### `custom_field_validation_rules` (Existente)
#### `client_custom_values` (Existente)
#### `custom_field_audit_log` (Existente)

## 3. Tipos de Dados e Restrições

### 3.1 Tipos de Dados Principais
- **UUID**: Chaves primárias e estrangeiras
- **TEXT**: Campos de texto variável
- **DECIMAL(10,2)**: Valores monetários
- **TIMESTAMPTZ**: Timestamps com timezone
- **JSONB**: Dados estruturados flexíveis
- **TEXT[]**: Arrays de texto
- **VECTOR**: Embeddings para IA
- **BOOLEAN**: Flags e estados

### 3.2 Constraints Importantes
```sql
-- Constraints de integridade referencial
ALTER TABLE contacts ADD CONSTRAINT fk_contacts_user_id 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE calendar_events ADD CONSTRAINT fk_calendar_events_user_id 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_subscriptions ADD CONSTRAINT fk_subscriptions_user_id 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Constraints de validação
ALTER TABLE pricing_plans ADD CONSTRAINT chk_billing_period 
  CHECK (billing_period IN ('monthly', 'yearly'));

ALTER TABLE user_subscriptions ADD CONSTRAINT chk_subscription_status 
  CHECK (status IN ('active', 'canceled', 'past_due', 'trialing'));

ALTER TABLE calendar_events ADD CONSTRAINT chk_event_dates 
  CHECK (end_datetime > start_datetime);

-- Constraints de unicidade
ALTER TABLE utm_tracking ADD CONSTRAINT utm_tracking_utm_id_unique 
  UNIQUE (utm_id);

ALTER TABLE conversations ADD CONSTRAINT conversations_session_id_unique 
  UNIQUE (session_id);
```

## 4. Estratégia de Indexação

### 4.1 Índices Primários (Automáticos)
- Todas as chaves primárias UUID
- Constraints UNIQUE

### 4.2 Índices de Performance
```sql
-- Índices para consultas frequentes
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_kanban_stage ON contacts(kanban_stage_id);
CREATE INDEX idx_contacts_session_id ON contacts(session_id);
CREATE INDEX idx_contacts_created_at ON contacts(created_at);

-- Índices para agenda
CREATE INDEX idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX idx_calendar_events_start_date ON calendar_events(start_datetime);
CREATE INDEX idx_calendar_events_contact_id ON calendar_events(contact_id);
CREATE INDEX idx_calendar_events_status ON calendar_events(status);

-- Índices para assinaturas
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);

-- Índices para chat
CREATE INDEX idx_n8n_chat_memory_session_id ON n8n_chat_memory(session_id);
CREATE INDEX idx_n8n_chat_memory_user_id ON n8n_chat_memory(user_id);
CREATE INDEX idx_n8n_chat_memory_created_at ON n8n_chat_memory(created_at);
CREATE INDEX idx_n8n_chat_memory_memory_type ON n8n_chat_memory(memory_type);
```

### 4.3 Índices Especializados
```sql
-- Índices GIN para JSONB e arrays
CREATE INDEX idx_contacts_tags_gin ON contacts USING GIN (tags);
CREATE INDEX idx_n8n_chat_memory_message_gin ON n8n_chat_memory USING GIN (message);
CREATE INDEX idx_n8n_chat_memory_entities_gin ON n8n_chat_memory USING GIN (entities);
CREATE INDEX idx_client_custom_values_field_value_gin ON client_custom_values USING GIN (field_value);

-- Índice HNSW para busca vetorial
CREATE INDEX idx_documents_embedding_hnsw ON documents USING hnsw (embedding vector_l2_ops);

-- Índices compostos para consultas complexas
CREATE INDEX idx_contacts_user_status ON contacts(user_id, status);
CREATE INDEX idx_calendar_events_user_date ON calendar_events(user_id, start_datetime);
CREATE INDEX idx_utm_tracking_contact_campaign ON utm_tracking(contact_id, utm_campaign);
```

## 5. Considerações de Performance

### 5.1 Particionamento
```sql
-- Particionamento por data para tabelas de log
CREATE TABLE n8n_chat_memory_2024 PARTITION OF n8n_chat_memory
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE custom_field_audit_log_2024 PARTITION OF custom_field_audit_log
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

### 5.2 Views Materializadas
```sql
-- View materializada para dashboard
CREATE MATERIALIZED VIEW v_clients_complete AS
SELECT 
  c.*,
  ks.title AS kanban_stage,
  (
    SELECT jsonb_object_agg(cf.field_name, ccv.field_value)
    FROM client_custom_values ccv
    JOIN custom_fields cf ON ccv.field_id = cf.id
    WHERE ccv.client_id = c.id
  ) AS custom_fields_jsonb,
  (
    SELECT count(*)
    FROM n8n_chat_memory ncm
    WHERE ncm.session_id = c.session_id
  ) AS message_count
FROM contacts c
LEFT JOIN kanban_stages ks ON c.kanban_stage_id = ks.id;

CREATE UNIQUE INDEX v_clients_complete_id_idx ON v_clients_complete (id);
```

### 5.3 Triggers de Performance
```sql
-- Trigger para atualizar contadores
CREATE OR REPLACE FUNCTION update_contact_message_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE contacts 
  SET unread_count = (
    SELECT count(*) 
    FROM n8n_chat_memory 
    WHERE session_id = NEW.session_id
  )
  WHERE session_id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_message_count
AFTER INSERT ON n8n_chat_memory
FOR EACH ROW EXECUTE FUNCTION update_contact_message_count();
```

## 6. Considerações para Escalabilidade

### 6.1 Row Level Security (RLS)
```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can only see their own data" ON contacts
FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own events" ON calendar_events
FOR ALL TO authenticated USING (auth.uid() = user_id);
```

### 6.2 Arquivamento de Dados
```sql
-- Função para arquivar dados antigos
CREATE OR REPLACE FUNCTION archive_old_chat_data()
RETURNS void AS $$
BEGIN
  -- Mover dados antigos para tabela de arquivo
  INSERT INTO n8n_chat_memory_archive
  SELECT * FROM n8n_chat_memory
  WHERE created_at < NOW() - INTERVAL '1 year';
  
  -- Deletar dados arquivados
  DELETE FROM n8n_chat_memory
  WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;
```

### 6.3 Monitoramento e Métricas
```sql
-- View para monitoramento de performance
CREATE VIEW v_database_metrics AS
SELECT 
  'contacts' as table_name,
  count(*) as row_count,
  pg_size_pretty(pg_total_relation_size('contacts')) as size
FROM contacts
UNION ALL
SELECT 
  'n8n_chat_memory' as table_name,
  count(*) as row_count,
  pg_size_pretty(pg_total_relation_size('n8n_chat_memory')) as size
FROM n8n_chat_memory;
```

## 7. Scripts de Migração

### 7.1 Criação das Tabelas Faltantes
```sql
-- Script para criar todas as tabelas de agenda
\i create_calendar_tables.sql

-- Script para criar todas as tabelas de assinatura
\i create_subscription_tables.sql

-- Script para criar tabelas de analytics faltantes
\i missing-tables.sql
```

### 7.2 População de Dados Iniciais
```sql
-- Inserir planos de precificação padrão
INSERT INTO pricing_plans (name, description, price, billing_period, features) VALUES
('Básico', 'Plano básico para pequenas empresas', 99.00, 'monthly', ARRAY['CRM Básico', 'Até 1000 contatos']),
('Profissional', 'Plano completo para empresas em crescimento', 199.00, 'monthly', ARRAY['CRM Completo', 'Agenda', 'IA Avançada']),
('Enterprise', 'Plano para grandes empresas', 399.00, 'monthly', ARRAY['Recursos Ilimitados', 'Suporte Premium']);

-- Inserir estágios de kanban padrão
INSERT INTO kanban_stages (title, color, order_index) VALUES
('Lead', '#3B82F6', 1),
('Qualificado', '#10B981', 2),
('Proposta', '#F59E0B', 3),
('Fechado', '#EF4444', 4);
```

## 8. Resumo das Tabelas

### Existentes (5 tabelas principais)
- `contacts` - 7 registros
- `n8n_chat_memory` - 137 registros
- `tokens` - 33 registros
- `documents` - 0 registros
- `imagens_drive` - 0 registros

### A Criar (13 tabelas principais)
1. `calendar_events` - Sistema de agenda
2. `calendar_attendees` - Participantes de eventos
3. `appointments` - Agendamentos específicos
4. `pricing_plans` - Planos de precificação
5. `user_subscriptions` - Assinaturas de usuários
6. `payment_methods` - Métodos de pagamento
7. `invoices` - Faturas e cobranças
8. `conversations` - Conversas organizadas
9. `monthly_growth` - Crescimento mensal
10. `conversation_daily_data` - Dados diários de conversa
11. `conversion_by_time` - Conversões por horário
12. `leads_by_source` - Leads por fonte
13. `campaign_data` - Dados de campanhas

### Estimativa de Implementação
- **Fase 1**: Tabelas de agenda (1-2 dias)
- **Fase 2**: Sistema de assinaturas (2-3 dias)
- **Fase 3**: Analytics e métricas (1-2 dias)
- **Fase 4**: Otimizações e índices (1 dia)

**Total estimado**: 5-8 dias de desenvolvimento

Este design fornece uma base sólida e escalável para o Valore CRM v2, cobrindo todos os módulos identificados no código e preparando o sistema para crescimento futuro.