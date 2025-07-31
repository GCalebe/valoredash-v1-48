# Plano de Implementação Otimizado - Tabelas Supabase

## 🎯 **Objetivo**

Implementar apenas as tabelas essenciais, eliminando duplicações e focando nas funcionalidades críticas do sistema.

---

## 📊 **Resumo da Otimização**

- **Antes**: 308 "tabelas" documentadas
- **Após análise**: 120 tabelas reais identificadas
- **Plano otimizado**: 45 tabelas prioritárias
- **Redução**: 85% menos complexidade

---

## 🚀 **FASE 1: CRÍTICAS (15 tabelas) - Semana 1-2**

### **Sistema de Chat e Conversas (5 tabelas)**
```sql
-- Tabela principal de conversas
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255),
  client_id UUID REFERENCES contacts(id),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memória do chat N8N
CREATE TABLE n8n_chat_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255),
  memory_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Histórico de chats N8N
CREATE TABLE n8n_chat_histories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255),
  message_data JSONB,
  sender VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Sistema de Usuários (3 tabelas)**
```sql
-- Perfis de usuário
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Papéis/funções
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE,
  permissions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Sistema de Métricas Essenciais (4 tabelas)**
```sql
-- Estatísticas de clientes
CREATE TABLE client_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  total_clients INTEGER DEFAULT 0,
  total_chats INTEGER DEFAULT 0,
  new_clients_this_month INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Métricas UTM
CREATE TABLE utm_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  total_campaigns INTEGER DEFAULT 0,
  total_leads INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Sistema Kanban (1 tabela)**
```sql
-- Estágios do Kanban (elimina duplicação kanban_stage)
CREATE TABLE kanban_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100),
  order_position INTEGER,
  color VARCHAR(7),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Sistema de Campos Customizados (2 tabelas)**
```sql
-- Campos customizados
CREATE TABLE custom_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  field_name VARCHAR(100),
  field_type VARCHAR(50),
  field_options JSONB,
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Valores customizados dos clientes (elimina duplicação custom_values)
CREATE TABLE client_custom_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES contacts(id),
  field_id UUID REFERENCES custom_fields(id),
  field_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 📈 **FASE 2: IMPORTANTES (15 tabelas) - Semana 3-4**

### **Sistema de Produtos e Pricing (6 tabelas)**
```sql
-- Planos de preços
CREATE TABLE pricing_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100),
  description TEXT,
  price DECIMAL(10,2),
  billing_cycle VARCHAR(20), -- monthly, yearly
  features JSONB,
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assinaturas de usuário
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  plan_id UUID REFERENCES pricing_plans(id),
  status VARCHAR(50), -- active, canceled, past_due
  start_date DATE,
  end_date DATE,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Métodos de pagamento
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  type VARCHAR(50), -- credit_card, pix, boleto
  last_four_digits VARCHAR(4),
  card_brand VARCHAR(50),
  expiry_month INTEGER,
  expiry_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Faturas
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  subscription_id UUID REFERENCES user_subscriptions(id),
  amount DECIMAL(10,2),
  status VARCHAR(50), -- pending, paid, failed
  due_date DATE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Combos de produtos
CREATE TABLE product_combos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100),
  description TEXT,
  discount_percentage DECIMAL(5,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Itens dos combos
CREATE TABLE product_combo_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  combo_id UUID REFERENCES product_combos(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Sistema de Calendário (4 tabelas)**
```sql
-- Eventos do calendário (elimina duplicação com appointments)
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255),
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES profiles(id),
  client_id UUID REFERENCES contacts(id),
  status VARCHAR(50) DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Participantes dos eventos
CREATE TABLE calendar_attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES calendar_events(id),
  user_id UUID REFERENCES profiles(id),
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, declined
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Sistema de Conhecimento (3 tabelas)**
```sql
-- Categorias de conhecimento
CREATE TABLE knowledge_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100),
  description TEXT,
  parent_id UUID REFERENCES knowledge_categories(id),
  order_position INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags de conhecimento
CREATE TABLE knowledge_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE,
  color VARCHAR(7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Relacionamento artigo-tags
CREATE TABLE knowledge_article_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES knowledge_base(id),
  tag_id UUID REFERENCES knowledge_tags(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Sistema de Campanhas (2 tabelas)**
```sql
-- Campanhas de marketing
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100),
  description TEXT,
  type VARCHAR(50), -- email, sms, whatsapp
  status VARCHAR(50) DEFAULT 'draft',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates de email
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100),
  subject VARCHAR(255),
  body_html TEXT,
  body_text TEXT,
  variables JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔧 **FASE 3: OPCIONAIS (15 tabelas) - Semana 5-6**

### **Sistema de IA Avançado (5 tabelas)**
- `ai_stages` - Estágios de IA
- `ai_stage_transitions` - Transições
- `ai_personality_settings` - Configurações

### **Sistema de Auditoria (3 tabelas)**
- `audit_log` - Log geral
- `custom_field_audit_log` - Log de campos
- `custom_field_validation_rules` - Regras de validação

### **Sistema de Analytics Avançado (4 tabelas)**
- `conversation_daily_data` - Dados diários
- `monthly_growth` - Crescimento mensal
- `leads_by_source` - Leads por fonte
- `campaign_data` - Dados de campanha

### **Sistema de Backup (3 tabelas)**
- `chat_messages_backup` - Backup de mensagens
- Outras tabelas de backup conforme necessidade

---

## ❌ **NÃO IMPLEMENTAR (Duplicações Eliminadas)**

### **Duplicações Identificadas:**
1. ~~`n8n_chat_history`~~ → Usar `n8n_chat_histories`
2. ~~`kanban_stage`~~ → Usar `kanban_stages`
3. ~~`custom_values`~~ → Usar `client_custom_values`
4. ~~`chats_backup`~~ → Usar `chat_messages_backup`
5. ~~`appointments`~~ → Usar `calendar_events`
6. ~~`dados_cliente`~~ → Usar `contacts` (já existe)
7. ~~`conversation_metrics_daily`~~ → Usar `conversation_daily_data`

### **Campos que não são Tabelas:**
- Todos os campos individuais (`name`, `email`, `phone`, etc.)
- Campos UTM individuais
- Campos de métricas individuais
- Índices (`idx_*`)
- Funções (`get_*`, `update_*`)

---

## 📋 **CHECKLIST DE IMPLEMENTAÇÃO**

### **Fase 1 - Críticas ✅**
- [ ] `conversations`
- [ ] `n8n_chat_memory`
- [ ] `n8n_chat_histories`
- [ ] `profiles`
- [ ] `user_roles`
- [ ] `client_stats`
- [ ] `utm_metrics`
- [ ] `kanban_stages`
- [ ] `custom_fields`
- [ ] `client_custom_values`

### **Fase 2 - Importantes**
- [ ] Sistema de Produtos (6 tabelas)
- [ ] Sistema de Calendário (4 tabelas)
- [ ] Sistema de Conhecimento (3 tabelas)
- [ ] Sistema de Campanhas (2 tabelas)

### **Fase 3 - Opcionais**
- [ ] Sistema de IA Avançado
- [ ] Sistema de Auditoria
- [ ] Sistema de Analytics
- [ ] Sistema de Backup

---

## 🎯 **Benefícios da Otimização**

1. **Redução de Complexidade**: 85% menos tabelas para implementar
2. **Eliminação de Duplicações**: Sem redundâncias no sistema
3. **Foco em Essenciais**: Priorização das funcionalidades críticas
4. **Implementação Gradual**: Fases bem definidas
5. **Manutenibilidade**: Sistema mais limpo e organizado

---

## 📊 **Métricas de Sucesso**

- **Fase 1**: Sistema básico funcionando (2 semanas)
- **Fase 2**: Funcionalidades principais implementadas (4 semanas)
- **Fase 3**: Sistema completo (6 semanas)
- **Redução de Bugs**: Menos tabelas = menos pontos de falha
- **Performance**: Sistema mais eficiente

---

*Plano criado em: Janeiro 2025*
*Objetivo: Implementação eficiente e sem duplicações*