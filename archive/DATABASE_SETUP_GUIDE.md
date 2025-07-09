# 🗄️ Guia de Configuração do Banco de Dados - Valore CRM v2

## 📋 Visão Geral

Este guia fornece instruções completas para configurar o banco de dados do Valore CRM v2, incluindo todas as tabelas necessárias para:

- ✅ **Gestão de Usuários e Perfis**
- ✅ **CRM e Contatos**
- ✅ **Sistema de Agenda e Calendário**
- ✅ **Gestão de Assinaturas e Precificação**
- ✅ **Sistema de Chat e IA**
- ✅ **Analytics e Métricas**
- ✅ **Campos Personalizados**
- ✅ **Produtos e Combos**

## 🚀 Execução Rápida

### 1. Migração Completa (Recomendado)

```bash
# Execute a migração completa
psql -h localhost -U postgres -d valore_crm_v2 -f complete_database_migration.sql
```

### 2. Verificação da Estrutura

```bash
# Verifique se tudo foi criado corretamente
psql -h localhost -U postgres -d valore_crm_v2 -f verify_database_structure.sql
```

## 📁 Arquivos de Migração Disponíveis

### 🔧 Scripts Principais

| Arquivo | Descrição | Quando Usar |
|---------|-----------|-------------|
| `complete_database_migration.sql` | **Migração completa** - Cria todas as tabelas | ✅ **Recomendado para novos projetos** |
| `verify_database_structure.sql` | **Verificação completa** - Valida estrutura | ✅ **Sempre após migrações** |

### 🎯 Scripts Específicos

| Arquivo | Descrição | Tabelas Incluídas |
|---------|-----------|-------------------|
| `create_calendar_tables.sql` | Sistema de Agenda | `calendar_events`, `calendar_attendees`, `appointments` |
| `create_subscription_tables.sql` | Sistema de Assinaturas | `pricing_plans`, `user_subscriptions`, `payment_methods`, `invoices` |
| `missing-tables.sql` | Tabelas de Analytics | `monthly_growth`, `campaign_data`, `leads_by_source`, etc. |

## 🏗️ Estrutura do Banco de Dados

### 👥 Módulo de Usuários
```sql
-- Tabelas principais:
auth.users              -- Autenticação (Supabase)
profiles               -- Perfis de usuário
```

### 📞 Módulo CRM
```sql
-- Tabelas principais:
contacts               -- Contatos e leads
custom_fields          -- Campos personalizados
client_custom_values   -- Valores dos campos personalizados
funnel_data           -- Dados do funil de vendas
utm_tracking          -- Rastreamento UTM
```

### 📅 Módulo de Agenda
```sql
-- Tabelas principais:
calendar_events        -- Eventos do calendário
calendar_attendees     -- Participantes dos eventos
appointments          -- Agendamentos específicos
```

### 💳 Módulo de Assinaturas
```sql
-- Tabelas principais:
pricing_plans         -- Planos de precificação
user_subscriptions    -- Assinaturas dos usuários
payment_methods       -- Métodos de pagamento
invoices             -- Faturas
invoice_items        -- Itens das faturas
payment_history      -- Histórico de pagamentos
```

### 🤖 Módulo de Chat/IA
```sql
-- Tabelas principais:
conversations         -- Conversas
n8n_chat_memory      -- Memória do chat IA
```

### 📊 Módulo de Analytics
```sql
-- Tabelas principais:
monthly_growth        -- Crescimento mensal
conversation_daily_data -- Dados diários de conversas
conversion_by_time    -- Conversões por tempo
leads_by_source      -- Leads por fonte
leads_over_time      -- Leads ao longo do tempo
campaign_data        -- Dados de campanhas
```

### 🛍️ Módulo de Produtos
```sql
-- Tabelas principais:
products             -- Produtos
product_combos       -- Combos de produtos
product_combo_items  -- Itens dos combos
```

## 🔐 Segurança e Permissões

### Row Level Security (RLS)
Todas as tabelas principais têm RLS habilitado com políticas que garantem:

- ✅ Usuários só acessam seus próprios dados
- ✅ Administradores têm acesso completo
- ✅ Isolamento total entre usuários

### Políticas Padrão
```sql
-- Exemplo de política aplicada em todas as tabelas:
CREATE POLICY "Users can view own data" ON table_name
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own data" ON table_name
  FOR INSERT WITH CHECK (user_id = auth.uid());
```

## 📈 Performance e Índices

### Índices Principais
- ✅ **user_id** em todas as tabelas (para RLS)
- ✅ **created_at, updated_at** para ordenação temporal
- ✅ **email** em contatos para busca rápida
- ✅ **session_id** para conversas
- ✅ **start_datetime** para eventos

### Triggers Automáticos
- ✅ **updated_at** atualizado automaticamente
- ✅ **created_at** definido na inserção
- ✅ Limpeza automática de dados expirados

## 🔍 Verificação e Troubleshooting

### Comandos de Verificação

```bash
# 1. Verificar se todas as tabelas existem
psql -d valore_crm_v2 -c "\dt"

# 2. Verificar contagem de registros
psql -d valore_crm_v2 -c "SELECT schemaname, tablename, n_tup_ins as rows FROM pg_stat_user_tables;"

# 3. Verificar índices
psql -d valore_crm_v2 -c "\di"

# 4. Verificar constraints
psql -d valore_crm_v2 -c "SELECT table_name, constraint_name, constraint_type FROM information_schema.table_constraints WHERE table_schema = 'public';"
```

### Problemas Comuns

#### ❌ Erro: "relation does not exist"
```bash
# Solução: Execute a migração completa
psql -d valore_crm_v2 -f complete_database_migration.sql
```

#### ❌ Erro: "permission denied"
```bash
# Solução: Verifique se RLS está configurado
psql -d valore_crm_v2 -c "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';"
```

#### ❌ Dados órfãos
```bash
# Solução: Execute a verificação de integridade
psql -d valore_crm_v2 -f verify_database_structure.sql
```

## 📊 Views e Relatórios

### Views Disponíveis

```sql
-- Eventos com participantes
v_calendar_events_with_attendees

-- Agenda do dia
v_today_schedule

-- Clientes completos (com campos personalizados)
v_clients_complete

-- Assinaturas ativas
v_active_subscriptions

-- Métricas de conversão
v_conversion_metrics
```

### Consultas Úteis

```sql
-- Verificar assinaturas ativas
SELECT * FROM v_active_subscriptions WHERE user_id = auth.uid();

-- Eventos de hoje
SELECT * FROM v_today_schedule WHERE user_id = auth.uid();

-- Contatos com campos personalizados
SELECT * FROM v_clients_complete WHERE user_id = auth.uid();
```

## 🔄 Migrações Futuras

### Adicionando Novas Tabelas

1. **Crie o arquivo de migração:**
```bash
# Formato: YYYYMMDDHHMMSS_description.sql
touch 20240115120000_add_new_feature.sql
```

2. **Estrutura recomendada:**
```sql
-- Criar tabela
CREATE TABLE new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

-- Criar políticas
CREATE POLICY "Users can view own data" ON new_table
  FOR SELECT USING (user_id = auth.uid());

-- Criar índices
CREATE INDEX idx_new_table_user_id ON new_table(user_id);

-- Criar trigger para updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON new_table
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 🎯 Próximos Passos

1. ✅ **Execute a migração completa**
2. ✅ **Verifique a estrutura**
3. ✅ **Teste as conexões da aplicação**
4. ✅ **Configure os hooks do Supabase**
5. ✅ **Implemente os tipos TypeScript**

## 📞 Suporte

Se encontrar problemas:

1. **Execute a verificação:** `verify_database_structure.sql`
2. **Consulte os logs:** Verifique mensagens de erro detalhadas
3. **Revise as políticas:** Confirme se RLS está funcionando
4. **Teste as queries:** Use as views para validar dados

---

**✨ Banco de dados configurado com sucesso!**

O Valore CRM v2 agora tem uma estrutura completa e robusta para suportar todas as funcionalidades planejadas.