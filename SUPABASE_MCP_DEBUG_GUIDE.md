# Guia de Debug com Servidor MCP do Supabase

## Comandos Disponíveis para Debug de Migrações

### 1. **Listagem e Informações do Projeto**
```bash
# Listar todos os projetos
list_projects

# Obter detalhes de um projeto específico
get_project(project_id)

# Obter URL da API do projeto
get_project_url(project_id)

# Obter chave anônima da API
get_anon_key(project_id)
```

### 2. **Estrutura do Banco de Dados**
```bash
# Listar todas as tabelas
list_tables(project_id, schemas=["public"])

# Listar extensões instaladas
list_extensions(project_id)

# Listar migrações aplicadas
list_migrations(project_id)
```

### 3. **Execução de SQL e Migrações**
```bash
# Executar SQL diretamente
execute_sql(project_id, query)

# Aplicar uma migração
apply_migration(project_id, name, query)
```

### 4. **Logs para Debug**
```bash
# Logs do PostgreSQL
get_logs(project_id, service="postgres")

# Logs da API
get_logs(project_id, service="api")

# Logs de Edge Functions
get_logs(project_id, service="edge-function")

# Logs de Auth
get_logs(project_id, service="auth")

# Logs de Storage
get_logs(project_id, service="storage")

# Logs de Realtime
get_logs(project_id, service="realtime")
```

### 5. **Geração de Tipos TypeScript**
```bash
# Gerar tipos TypeScript baseados no schema
generate_typescript_types(project_id)
```

## Estratégias de Debug de Migrações

### 1. **Verificação de Dependências**
Antes de aplicar uma migração, sempre verifique:
- Se as tabelas referenciadas existem
- Se as colunas referenciadas existem
- Se as funções necessárias estão disponíveis

```sql
-- Verificar se uma tabela existe
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'nome_da_tabela';

-- Verificar estrutura de uma tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'nome_da_tabela' AND table_schema = 'public' 
ORDER BY ordinal_position;
```

### 2. **Aplicação Incremental**
Quando uma migração falha:
1. Identifique o erro específico nos logs
2. Aplique as partes da migração que funcionam
3. Corrija as dependências faltantes
4. Continue com o restante da migração

### 3. **Verificação Pós-Migração**
```sql
-- Verificar se as tabelas foram criadas
SELECT tablename, hasindexes, hastriggers 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('lista', 'de', 'tabelas');

-- Verificar RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
```

## Status Atual do Projeto Valore CRM v2

### ✅ **Tabelas Criadas com Sucesso**

#### **Módulo Calendário**
- `calendar_events` - Eventos do calendário
- `calendar_attendees` - Participantes dos eventos
- `appointments` - Agendamentos

#### **Módulo Assinaturas e Pagamentos**
- `pricing_plans` - Planos de preços
- `user_subscriptions` - Assinaturas dos usuários
- `payment_methods` - Métodos de pagamento
- `invoices` - Faturas
- `invoice_items` - Itens das faturas
- `payment_history` - Histórico de pagamentos
- `discount_coupons` - Cupons de desconto
- `coupon_redemptions` - Resgates de cupons

#### **Módulo Campanhas**
- `campaigns` - Campanhas de marketing
- `campaign_recipients` - Destinatários das campanhas
- `email_templates` - Templates de email

#### **Módulo Analytics**
- `monthly_growth` - Crescimento mensal
- `conversation_daily_data` - Dados diários de conversas
- `conversion_by_time` - Conversões por tempo
- `leads_by_source` - Leads por fonte
- `leads_over_time` - Leads ao longo do tempo
- `campaign_data` - Dados de campanhas

### 🔧 **Recursos Implementados**
- ✅ Índices otimizados
- ✅ Row Level Security (RLS) habilitado
- ✅ Triggers para `updated_at`
- ✅ Funções de lógica de negócio
- ✅ Views para analytics
- ✅ Constraints e validações

### 📊 **Estatísticas**
- **Total de tabelas criadas**: 20 novas tabelas
- **Total de migrações aplicadas**: 27 migrações
- **Última migração**: `analytics_tables_final`

## Próximos Passos

1. **Testar as funcionalidades** - Verificar se todas as operações CRUD funcionam
2. **Configurar RLS policies** - Definir políticas de segurança específicas
3. **Popular dados de teste** - Inserir dados para validar o sistema
4. **Otimizar performance** - Ajustar índices conforme necessário
5. **Documentar APIs** - Criar documentação das endpoints

## Comandos Úteis para Monitoramento

```sql
-- Verificar tamanho das tabelas
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Verificar atividade de conexões
SELECT 
    datname,
    usename,
    application_name,
    client_addr,
    state,
    query_start
FROM pg_stat_activity 
WHERE state = 'active';
```

---

**Projeto**: Valore CRM v2  
**Status**: Migração de banco de dados concluída com sucesso  
**Data**: Janeiro 2025