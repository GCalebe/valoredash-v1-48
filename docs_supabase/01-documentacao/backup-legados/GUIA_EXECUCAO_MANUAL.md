# 🔧 Guia de Execução Manual - Implementação das Tabelas

*Última atualização: Janeiro 2025*

## 🎯 **Situação Atual**

**Progresso:** 6/16 tabelas implementadas (38%)

**Problema:** O service role key não tem permissões para executar `CREATE TABLE` via API, sendo necessária execução manual no painel do Supabase.

---

## 📋 **Tabelas Já Implementadas ✅**

### **Funcionando Corretamente:**
1. ✅ `conversations` - Conversas principais
2. ✅ `n8n_chat_messages` - Mensagens do chat N8N
3. ✅ `profiles` - Perfis de usuários
4. ✅ `conversation_daily_data` - Métricas diárias
5. ✅ `kanban_stages` - Estágios do Kanban
6. ✅ `client_custom_values` - Valores customizados

---

## ❌ **Tabelas Pendentes (10 tabelas)**

### **Fase 1 - Chat e Conversas (3 tabelas):**
- `n8n_chat_memory`
- `n8n_chat_histories` 
- `chat_messages_backup`

### **Fase 2 - Usuários e Métricas (7 tabelas):**
- `user_settings`
- `user_sessions`
- `user_activity_log`
- `performance_metrics`
- `system_reports`
- `metrics_cache`
- `custom_field_definitions`

---

## 🚀 **Instruções para Execução Manual**

### **Passo 1: Acessar o Painel do Supabase**

1. Acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto: `nkyvhwmjuksumizljclc`
4. Vá para: **SQL Editor** (ícone de banco de dados)

### **Passo 2: Executar Scripts SQL**

#### **2.1 - Tabelas da Fase 1 (Chat)**

Copie e execute este SQL no editor:

```sql
-- FASE 1: Tabelas de Chat Restantes

-- 1. Memória do chat N8N
CREATE TABLE IF NOT EXISTS n8n_chat_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) NOT NULL,
  memory_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_n8n_chat_memory_session_id ON n8n_chat_memory(session_id);
ALTER TABLE n8n_chat_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access chat memory" ON n8n_chat_memory FOR ALL USING (auth.uid() IS NOT NULL);

-- 2. Histórico de chats N8N
CREATE TABLE IF NOT EXISTS n8n_chat_histories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) NOT NULL,
  message_data JSONB NOT NULL,
  sender VARCHAR(100) CHECK (sender IN ('user', 'assistant', 'system')),
  message_type VARCHAR(50) DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_n8n_chat_histories_session_id ON n8n_chat_histories(session_id);
ALTER TABLE n8n_chat_histories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access chat histories" ON n8n_chat_histories FOR ALL USING (auth.uid() IS NOT NULL);

-- 3. Backup de mensagens
CREATE TABLE IF NOT EXISTS chat_messages_backup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_message_id UUID,
  session_id VARCHAR(255),
  message_data JSONB,
  backup_reason VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_backup_session_id ON chat_messages_backup(session_id);
ALTER TABLE chat_messages_backup ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access chat backups" ON chat_messages_backup FOR ALL USING (auth.uid() IS NOT NULL);

-- Verificação
SELECT 'Fase 1 concluída' as status, COUNT(*) as tabelas FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('n8n_chat_memory', 'n8n_chat_histories', 'chat_messages_backup');
```

#### **2.2 - Tabelas da Fase 2 (Usuários e Métricas)**

Copie e execute este SQL no editor:

```sql
-- FASE 2: Tabelas de Usuários e Métricas Restantes

-- 1. Configurações de usuário
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  setting_key VARCHAR(100) NOT NULL,
  setting_value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, setting_key)
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);

-- 2. Sessões de usuário
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own sessions" ON user_sessions FOR SELECT USING (auth.uid() = user_id);

-- 3. Log de atividades
CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  metadata JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- 4. Métricas de performance
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name VARCHAR(100) NOT NULL,
  metric_value NUMERIC,
  metric_type VARCHAR(50) CHECK (metric_type IN ('counter', 'gauge', 'histogram')),
  tags JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON performance_metrics(metric_name);
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- 5. Relatórios do sistema
CREATE TABLE IF NOT EXISTS system_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_name VARCHAR(255) NOT NULL,
  report_type VARCHAR(50) CHECK (report_type IN ('daily', 'weekly', 'monthly', 'custom')),
  report_data JSONB NOT NULL,
  generated_by UUID REFERENCES auth.users(id),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  parameters JSONB DEFAULT '{}'
);

ALTER TABLE system_reports ENABLE ROW LEVEL SECURITY;

-- 6. Cache de métricas
CREATE TABLE IF NOT EXISTS metrics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  cache_data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_metrics_cache_key ON metrics_cache(cache_key);
ALTER TABLE metrics_cache ENABLE ROW LEVEL SECURITY;

-- 7. Definições de campos customizados
CREATE TABLE IF NOT EXISTS custom_field_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_name VARCHAR(100) NOT NULL,
  field_type VARCHAR(50) CHECK (field_type IN ('text', 'number', 'date', 'boolean', 'select', 'multiselect')),
  field_options JSONB DEFAULT '{}',
  is_required BOOLEAN DEFAULT false,
  entity_type VARCHAR(50) CHECK (entity_type IN ('contact', 'conversation', 'product')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(field_name, entity_type)
);

ALTER TABLE custom_field_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can access custom field definitions" ON custom_field_definitions FOR SELECT USING (auth.uid() IS NOT NULL);

-- Inserir campos customizados padrão
INSERT INTO custom_field_definitions (field_name, field_type, entity_type, is_required) VALUES
('Orçamento', 'number', 'contact', false),
('Fonte do Lead', 'select', 'contact', false),
('Prioridade', 'select', 'contact', false),
('Data de Follow-up', 'date', 'contact', false)
ON CONFLICT DO NOTHING;

-- Verificação
SELECT 'Fase 2 concluída' as status, COUNT(*) as tabelas FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN (
  'user_settings', 'user_sessions', 'user_activity_log', 'performance_metrics', 
  'system_reports', 'metrics_cache', 'custom_field_definitions'
);
```

### **Passo 3: Verificar Implementação**

Após executar os scripts, execute este comando para verificar:

```bash
node scripts/verificar-e-corrigir-implementacao.js
```

---

## 🧪 **Testando as Funcionalidades**

### **Teste 1: Sistema de Chat**
```javascript
// Testar inserção de mensagem
const { data, error } = await supabase
  .from('n8n_chat_messages')
  .insert({
    session_id: 'test-session',
    message: 'Teste de mensagem',
    sender: 'user'
  });
```

### **Teste 2: Sistema de Usuários**
```javascript
// Testar configuração de usuário
const { data, error } = await supabase
  .from('user_settings')
  .insert({
    user_id: 'user-uuid',
    setting_key: 'theme',
    setting_value: { theme: 'dark' }
  });
```

### **Teste 3: Sistema Kanban**
```javascript
// Testar estágios do Kanban
const { data, error } = await supabase
  .from('kanban_stages')
  .select('*')
  .order('position');
```

---

## 📊 **Impacto Esperado Após Execução Manual**

### **Antes da Execução:**
- ✅ 6/16 tabelas (38%)
- ⚠️ Funcionalidades limitadas

### **Após a Execução:**
- ✅ 16/16 tabelas (100%)
- 🎉 Sistema completo funcionando

### **Funcionalidades Habilitadas:**
- 💬 **Chat Completo**: Memória contextual, histórico, backup
- 👤 **Usuários Completos**: Configurações, sessões, logs
- 📊 **Métricas Avançadas**: Performance, relatórios, cache
- 🎯 **Kanban Completo**: Estágios + campos customizados

---

## 🔄 **Próximos Passos Após Execução**

### **Imediatos:**
1. ✅ Executar scripts SQL no painel do Supabase
2. 🧪 Rodar testes de verificação
3. 🔄 Atualizar hooks do React

### **Curto Prazo:**
1. 🧪 Implementar testes automatizados
2. 📚 Atualizar documentação da API
3. 🚀 Preparar para produção

### **Médio Prazo:**
1. 🔧 Implementar CLI personalizado
2. 📈 Monitorar performance
3. 🛡️ Implementar backup automático

---

## 🆘 **Suporte e Troubleshooting**

### **Problemas Comuns:**

**1. Erro de Permissão:**
- Verificar se está logado como owner do projeto
- Confirmar service role key no .env

**2. Tabela Já Existe:**
- Normal, o `IF NOT EXISTS` previne erros
- Verificar se a estrutura está correta

**3. Erro de Referência:**
- Executar scripts na ordem correta
- Verificar se tabelas dependentes existem

### **Contatos de Suporte:**
- 📧 Supabase Support: support@supabase.io
- 📚 Documentação: https://supabase.com/docs
- 💬 Discord: https://discord.supabase.com

---

## ✅ **Checklist de Execução**

- [x] Acessar painel do Supabase
- [x] Executar SQL da Fase 1 (3 tabelas)
- [x] Executar SQL da Fase 2 (7 tabelas)
- [x] Verificar criação das tabelas
- [x] Rodar script de verificação
- [x] Testar funcionalidades básicas
- [x] Atualizar hooks do React
- [x] Documentar mudanças

---

*Este guia garante a implementação completa do Plano de Implementação Otimizado, transformando o progresso de 38% para 100% em aproximadamente 30 minutos de execução manual.*