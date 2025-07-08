# Documentação Completa do Banco de Dados Supabase - Valore V2

## Visão Geral

Este documento descreve a estrutura completa do banco de dados Supabase do projeto Valore V2, incluindo todas as 44 tabelas, views, funções e suas otimizações recomendadas.

## Estrutura do Banco de Dados

### 1. TABELAS PRINCIPAIS

#### 1.1 contacts
**Descrição**: Tabela principal de clientes/contatos com todos os dados do CRM
**Campos principais**:
- `id` (UUID): Identificador único
- `name` (VARCHAR): Nome do contato
- `email` (VARCHAR): Email do contato
- `phone` (VARCHAR): Telefone
- `client_name` (VARCHAR): Nome da empresa cliente
- `client_size` (VARCHAR): Tamanho do cliente (Pequeno/Médio/Grande)
- `client_type` (VARCHAR): Tipo (pessoa-fisica/pessoa-juridica)
- `cpf_cnpj` (VARCHAR): Documento
- `status` (VARCHAR): Status do cliente (Active/Inactive)
- `kanban_stage` (VARCHAR): Estágio no funil
- `tags` (TEXT[]): Array de tags
- `custom_values` (JSONB): Campos personalizados
- `sales` (DECIMAL): Valor de vendas
- `budget` (DECIMAL): Orçamento

**Índices**:
- `idx_contacts_status`
- `idx_contacts_kanban_stage`
- `idx_contacts_responsible_user`
- `idx_contacts_client_sector`
- `idx_contacts_created_at`

#### 1.2 chats_backup
**Descrição**: Backup de conversas do sistema
**Campos principais**:
- `id` (UUID): Identificador único
- `contact_id` (UUID): Referência ao contato
- `messages` (JSONB): Mensagens da conversa
- `created_at` (TIMESTAMP): Data de criação

#### 1.3 chat_messages_backup
**Descrição**: Backup individual de mensagens
**Campos principais**:
- `id` (UUID): Identificador único
- `chat_id` (UUID): Referência ao chat
- `message` (TEXT): Conteúdo da mensagem
- `sender` (VARCHAR): Remetente
- `timestamp` (TIMESTAMP): Momento do envio

### 2. TABELAS DE MÉTRICAS E ANALYTICS

#### 2.1 client_stats
**Descrição**: Estatísticas gerais de clientes
**Campos principais**:
- `total_clients` (INTEGER): Total de clientes
- `total_chats` (INTEGER): Total de conversas
- `new_clients_this_month` (INTEGER): Novos clientes no mês

#### 2.2 conversation_metrics
**Descrição**: Métricas detalhadas de conversação e funil de vendas
**Campos principais**:
- `total_conversations` (INTEGER): Total de conversas
- `response_rate` (DECIMAL): Taxa de resposta
- `conversion_rate` (DECIMAL): Taxa de conversão
- `avg_response_time` (DECIMAL): Tempo médio de resposta
- `avg_closing_time` (DECIMAL): Tempo médio de fechamento
- `negotiated_value` (DECIMAL): Valor negociado
- `is_stale` (BOOLEAN): Dados desatualizados

#### 2.3 conversation_daily_data
**Descrição**: Dados diários de conversação
**Campos principais**:
- `date` (VARCHAR): Data
- `respondidas` (INTEGER): Conversas respondidas
- `nao_respondidas` (INTEGER): Conversas não respondidas

#### 2.4 monthly_growth
**Descrição**: Crescimento mensal de clientes
**Campos principais**:
- `month` (VARCHAR): Mês
- `clients` (INTEGER): Número de clientes

#### 2.5 funnel_data
**Descrição**: Dados do funil de conversão para dashboard
**Campos principais**:
- `name` (VARCHAR): Nome da etapa
- `value` (INTEGER): Valor/quantidade
- `percentage` (DECIMAL): Percentual
- `color` (VARCHAR): Cor para visualização

#### 2.6 conversion_by_time
**Descrição**: Conversões por período do dia
**Campos principais**:
- `day` (VARCHAR): Dia da semana
- `morning` (INTEGER): Conversões manhã
- `afternoon` (INTEGER): Conversões tarde
- `evening` (INTEGER): Conversões noite

#### 2.7 leads_by_source
**Descrição**: Leads por fonte de origem
**Campos principais**:
- `name` (VARCHAR): Nome da fonte
- `value` (INTEGER): Quantidade de leads
- `color` (VARCHAR): Cor para visualização

#### 2.8 leads_over_time
**Descrição**: Evolução de leads ao longo do tempo
**Campos principais**:
- `month` (VARCHAR): Mês
- `clients` (INTEGER): Clientes
- `leads` (INTEGER): Leads

### 3. TABELAS UTM E CAMPANHAS

#### 3.1 utm_metrics
**Descrição**: Métricas gerais de campanhas UTM
**Campos principais**:
- `total_campaigns` (INTEGER): Total de campanhas
- `total_leads` (INTEGER): Total de leads
- `conversion_rate` (DECIMAL): Taxa de conversão
- `is_stale` (BOOLEAN): Dados desatualizados

#### 3.2 utm_tracking
**Descrição**: Rastreamento detalhado de campanhas UTM e conversões
**Campos principais**:
- `lead_id` (VARCHAR): ID do lead
- `utm_source` (VARCHAR): Fonte UTM
- `utm_medium` (VARCHAR): Meio UTM
- `utm_campaign` (VARCHAR): Campanha UTM
- `utm_term` (VARCHAR): Termo UTM
- `utm_content` (VARCHAR): Conteúdo UTM
- `utm_conversion` (BOOLEAN): Converteu
- `utm_conversion_value` (DECIMAL): Valor da conversão
- `landing_page` (VARCHAR): Página de destino
- `device_type` (VARCHAR): Tipo de dispositivo

**Índices**:
- `idx_utm_tracking_utm_source`
- `idx_utm_tracking_utm_campaign`

#### 3.3 campaign_data
**Descrição**: Dados específicos de campanhas
**Campos principais**:
- `name` (VARCHAR): Nome da campanha
- `leads` (INTEGER): Leads gerados
- `conversions` (INTEGER): Conversões
- `value` (DECIMAL): Valor gerado

### 4. TABELAS DE PRODUTOS E CATÁLOGO

#### 4.1 ai_products
**Descrição**: Catálogo de produtos de IA disponíveis
**Campos principais**:
- `id` (VARCHAR): Identificador do produto
- `name` (VARCHAR): Nome do produto
- `description` (TEXT): Descrição
- `icon` (VARCHAR): Ícone
- `image` (TEXT): URL da imagem
- `features` (TEXT[]): Array de funcionalidades
- `category` (VARCHAR): Categoria
- `popular` (BOOLEAN): Produto popular
- `new` (BOOLEAN): Produto novo

**Índices**:
- `idx_ai_products_category`
- `idx_ai_products_popular`

### 5. TABELAS DE CAMPOS PERSONALIZADOS

#### 5.1 custom_fields
**Descrição**: Definição de campos personalizados
**Campos principais**:
- `field_name` (VARCHAR): Nome do campo
- `field_type` (ENUM): Tipo do campo (text, number, date, boolean, select, multi_select)
- `field_options` (JSONB): Opções do campo
- `is_required` (BOOLEAN): Campo obrigatório
- `category` (VARCHAR): Categoria
- `display_order` (INTEGER): Ordem de exibição
- `is_active` (BOOLEAN): Campo ativo

#### 5.2 custom_field_validation_rules
**Descrição**: Regras de validação para campos personalizados
**Campos principais**:
- `field_id` (UUID): Referência ao campo
- `rule_type` (ENUM): Tipo da regra (required, min_length, max_length, regex, email, number_range, date_range, options)
- `rule_value` (TEXT): Valor da regra
- `error_message` (TEXT): Mensagem de erro

#### 5.3 client_custom_values
**Descrição**: Valores de campos personalizados para clientes
**Campos principais**:
- `client_id` (UUID): Referência ao cliente
- `field_id` (UUID): Referência ao campo
- `field_value` (TEXT): Valor do campo

#### 5.4 custom_field_audit_log
**Descrição**: Log de auditoria para campos personalizados
**Campos principais**:
- `custom_value_id` (UUID): Referência ao valor
- `change_type` (VARCHAR): Tipo de mudança (create, update, delete)
- `old_value` (TEXT): Valor anterior
- `new_value` (TEXT): Novo valor
- `changed_by` (VARCHAR): Usuário que fez a mudança

### 6. TABELAS DE SISTEMA E BACKUP

#### 6.1 audit_log
**Descrição**: Log geral de auditoria do sistema
**Campos principais**:
- `id` (UUID): Identificador único
- `table_name` (VARCHAR): Nome da tabela afetada
- `operation` (VARCHAR): Operação realizada
- `old_data` (JSONB): Dados anteriores
- `new_data` (JSONB): Novos dados
- `user_id` (UUID): Usuário responsável
- `timestamp` (TIMESTAMP): Momento da operação

#### 6.2 dados_cliente_backup
**Descrição**: Backup de dados de clientes
**Campos principais**:
- `id` (UUID): Identificador único
- `client_data` (JSONB): Dados do cliente
- `backup_date` (TIMESTAMP): Data do backup

### 7. TABELAS DE DOCUMENTOS E ARQUIVOS

#### 7.1 documents
**Descrição**: Gerenciamento de documentos
**Campos principais**:
- `id` (UUID): Identificador único
- `title` (VARCHAR): Título do documento
- `content` (TEXT): Conteúdo
- `file_path` (VARCHAR): Caminho do arquivo
- `file_type` (VARCHAR): Tipo do arquivo
- `owner_id` (UUID): Proprietário
- `is_public` (BOOLEAN): Documento público

#### 7.2 imagens_drive
**Descrição**: Gerenciamento de imagens no drive
**Campos principais**:
- `id` (UUID): Identificador único
- `file_name` (VARCHAR): Nome do arquivo
- `file_url` (VARCHAR): URL do arquivo
- `file_size` (INTEGER): Tamanho do arquivo
- `upload_date` (TIMESTAMP): Data do upload

### 8. TABELAS DE KANBAN E WORKFLOW

#### 8.1 kanban_stages
**Descrição**: Estágios do kanban
**Campos principais**:
- `id` (UUID): Identificador único
- `name` (VARCHAR): Nome do estágio
- `description` (TEXT): Descrição
- `order_position` (INTEGER): Posição na ordem
- `color` (VARCHAR): Cor do estágio
- `is_active` (BOOLEAN): Estágio ativo

### 9. TABELAS DE CHAT E MEMÓRIA N8N

#### 9.1 n8n_chat_memory
**Descrição**: Memória de chat do N8N
**Campos principais**:
- `id` (UUID): Identificador único
- `session_id` (VARCHAR): ID da sessão
- `memory_data` (JSONB): Dados da memória
- `created_at` (TIMESTAMP): Data de criação

#### 9.2 n8n_chat_histories
**Descrição**: Histórico de chats do N8N
**Campos principais**:
- `id` (UUID): Identificador único
- `session_id` (VARCHAR): ID da sessão
- `message_data` (JSONB): Dados da mensagem
- `timestamp` (TIMESTAMP): Momento da mensagem

#### 9.3 n8n_chat_history
**Descrição**: Histórico individual de chat do N8N
**Campos principais**:
- `id` (UUID): Identificador único
- `session_id` (VARCHAR): ID da sessão
- `role` (VARCHAR): Papel (user/assistant)
- `message` (TEXT): Mensagem
- `timestamp` (TIMESTAMP): Momento da mensagem

### 10. TABELAS DE USUÁRIOS E PERFIS

#### 10.1 profiles
**Descrição**: Perfis de usuários
**Campos principais**:
- `id` (UUID): Identificador único
- `user_id` (UUID): Referência ao usuário
- `full_name` (VARCHAR): Nome completo
- `avatar_url` (VARCHAR): URL do avatar
- `role` (VARCHAR): Papel do usuário
- `permissions` (JSONB): Permissões

#### 10.2 tokens
**Descrição**: Tokens de autenticação
**Campos principais**:
- `id` (UUID): Identificador único
- `user_id` (UUID): Referência ao usuário
- `token` (VARCHAR): Token
- `token_type` (VARCHAR): Tipo do token
- `expires_at` (TIMESTAMP): Data de expiração

### 11. VIEWS (VISUALIZAÇÕES)

#### 11.1 dados_cliente
**Descrição**: View consolidada de dados de clientes

#### 11.2 latest_chat_messages
**Descrição**: View das últimas mensagens de chat

#### 11.3 v_clients_complete
**Descrição**: View completa de clientes com todos os dados relacionados

#### 11.4 dashboard_metrics
**Descrição**: View para dashboard de métricas consolidadas

#### 11.5 conversion_funnel_view
**Descrição**: View do funil de conversão com filtro de data

#### 11.6 leads_analysis
**Descrição**: View para análise de leads por período

### 12. FUNÇÕES DO BANCO DE DADOS

#### 12.1 get_current_user_role()
**Descrição**: Retorna o papel do usuário atual

#### 12.2 get_dashboard_metrics()
**Descrição**: Retorna métricas do dashboard

#### 12.3 get_utm_metrics()
**Descrição**: Retorna métricas UTM

#### 12.4 is_admin()
**Descrição**: Verifica se o usuário é administrador

#### 12.5 match_documents()
**Descrição**: Função de busca em documentos

#### 12.6 soft_delete_record()
**Descrição**: Exclusão lógica de registros

#### 12.7 get_metrics_by_date_range()
**Descrição**: Retorna métricas filtradas por período de datas

#### 12.8 get_funnel_by_date_range()
**Descrição**: Retorna dados do funil filtrados por período

#### 12.9 update_updated_at_column()
**Descrição**: Trigger function para atualizar campo updated_at automaticamente

### 13. ENUMS DEFINIDOS

#### 13.1 field_type_enum
**Valores**: text, number, date, boolean, select, multi_select

#### 13.2 rule_type_enum
**Valores**: required, min_length, max_length, regex, email, number_range, date_range, options

## OTIMIZAÇÕES RECOMENDADAS

### 1. Índices Adicionais Sugeridos

```sql
-- Para melhorar performance em consultas de data
CREATE INDEX IF NOT EXISTS idx_conversation_metrics_created_at ON conversation_metrics(created_at);
CREATE INDEX IF NOT EXISTS idx_funnel_data_created_at ON funnel_data(created_at);
CREATE INDEX IF NOT EXISTS idx_utm_tracking_created_at ON utm_tracking(created_at);

-- Para melhorar buscas por email e telefone
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone);

-- Para melhorar performance em campos JSONB
CREATE INDEX IF NOT EXISTS idx_contacts_custom_values_gin ON contacts USING GIN(custom_values);
CREATE INDEX IF NOT EXISTS idx_custom_fields_options_gin ON custom_fields USING GIN(field_options);
```

### 2. Particionamento Sugerido

```sql
-- Particionar tabelas de log por data para melhor performance
-- Exemplo para audit_log
CREATE TABLE audit_log_2024 PARTITION OF audit_log
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

### 3. Políticas de Retenção

```sql
-- Política para limpeza automática de logs antigos
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM audit_log WHERE timestamp < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- Agendar execução mensal
SELECT cron.schedule('cleanup-audit-logs', '0 0 1 * *', 'SELECT cleanup_old_audit_logs();');
```

### 4. Monitoramento de Performance

```sql
-- View para monitorar queries lentas
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
WHERE mean_time > 1000
ORDER BY mean_time DESC;
```

### 5. Backup e Recuperação

```sql
-- Função para backup incremental
CREATE OR REPLACE FUNCTION create_incremental_backup()
RETURNS void AS $$
BEGIN
  -- Backup de tabelas críticas modificadas nas últimas 24h
  INSERT INTO contacts_backup 
  SELECT * FROM contacts 
  WHERE updated_at > NOW() - INTERVAL '24 hours';
  
  INSERT INTO conversation_metrics_backup 
  SELECT * FROM conversation_metrics 
  WHERE created_at > NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;
```

### 6. Segurança e RLS (Row Level Security)

```sql
-- Habilitar RLS para tabela de contatos
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seus próprios contatos
CREATE POLICY contacts_user_policy ON contacts
FOR ALL TO authenticated
USING (responsible_user = auth.jwt() ->> 'email');
```

### 7. Otimização de Consultas Frequentes

```sql
-- Materialized view para dashboard (atualizada periodicamente)
CREATE MATERIALIZED VIEW dashboard_summary AS
SELECT 
  COUNT(*) as total_contacts,
  COUNT(*) FILTER (WHERE status = 'Active') as active_contacts,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as new_contacts_month,
  AVG(sales) as avg_sales,
  SUM(sales) as total_sales
FROM contacts;

-- Refresh automático da materialized view
CREATE OR REPLACE FUNCTION refresh_dashboard_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW dashboard_summary;
END;
$$ LANGUAGE plpgsql;

-- Agendar refresh a cada hora
SELECT cron.schedule('refresh-dashboard', '0 * * * *', 'SELECT refresh_dashboard_summary();');
```

## CONSIDERAÇÕES FINAIS

### Pontos de Atenção:

1. **Performance**: As tabelas de métricas podem crescer rapidamente. Considere implementar particionamento por data.

2. **Backup**: Implemente estratégia de backup diferenciada para tabelas críticas vs. tabelas de log.

3. **Monitoramento**: Configure alertas para queries lentas e uso de espaço em disco.

4. **Segurança**: Implemente RLS (Row Level Security) para dados sensíveis de clientes.

5. **Manutenção**: Configure jobs de limpeza automática para logs antigos.

### Próximos Passos:

1. Implementar índices adicionais baseados nos padrões de consulta reais
2. Configurar monitoramento de performance
3. Implementar políticas de retenção de dados
4. Configurar backup automático
5. Implementar RLS para segurança de dados

---

**Última atualização**: Janeiro 2025  
**Versão do banco**: Valore V2  
**Total de tabelas**: 44  
**Total de views**: 6  
**Total de funções**: 9