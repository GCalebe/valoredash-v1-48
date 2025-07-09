# Configuração do Banco de Dados Supabase

Este documento descreve o processo de configuração e uso do banco de dados Supabase para o projeto Valore CRM v2.

## Estrutura do Banco de Dados

O banco de dados contém as seguintes tabelas principais:

### Tabelas Existentes

- **contacts**: Tabela principal de clientes/contatos com todos os dados do CRM
- **client_stats**: Estatísticas gerais de clientes
- **conversation_metrics**: Métricas de conversação e funil de vendas
- **funnel_data**: Dados do funil de conversão para dashboard
- **utm_metrics**: Métricas de campanhas UTM
- **utm_tracking**: Rastreamento de campanhas UTM e conversões
- **ai_products**: Catálogo de produtos de IA disponíveis
- **custom_fields**: Definição de campos personalizados
- **custom_field_validation_rules**: Regras de validação para campos personalizados
- **client_custom_values**: Valores de campos personalizados para clientes
- **custom_field_audit_log**: Log de auditoria para alterações em campos personalizados

### Tabelas Pendentes

As seguintes tabelas precisam ser criadas manualmente via SQL Editor no painel do Supabase:

- **monthly_growth**: Crescimento mensal de clientes
- **conversation_daily_data**: Dados diários de conversação
- **conversion_by_time**: Conversão por período do dia
- **leads_by_source**: Leads por fonte de origem
- **leads_over_time**: Leads ao longo do tempo
- **campaign_data**: Dados de campanhas de marketing

## Scripts Disponíveis

O projeto inclui os seguintes scripts para gerenciar o banco de dados:

- **supabase-verify.js**: Verifica o estado atual do banco de dados e a existência das tabelas
- **supabase-data-seeder.js**: Preenche o banco de dados com dados de exemplo
- **execute-migration.cjs**: Tenta executar a migração SQL completa (limitado pela API do Supabase)
- **create-missing-tables.js**: Tenta criar as tabelas faltantes (limitado pela API do Supabase)
- **missing-tables.sql**: Contém as definições SQL das tabelas faltantes

## Comandos NPM

```bash
# Verificar o estado do banco de dados
npm run verify

# Preencher o banco de dados com dados de exemplo
npm run seed

# Tentar criar as tabelas faltantes
npm run create-tables
```

## Criação Manual das Tabelas Faltantes

Devido às limitações da API do Supabase, as tabelas faltantes precisam ser criadas manualmente:

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá para a seção "SQL Editor"
4. Cole o conteúdo do arquivo `missing-tables.sql`
5. Execute o SQL para criar as tabelas faltantes

## Configuração de Ambiente

O projeto utiliza um arquivo `.env` para configurar a conexão com o Supabase:

```
VITE_SUPABASE_URL=https://nkyvhwmjuksumizljclc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5reXZod21qdWtzdW1pemxqY2xjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODI4NzIsImV4cCI6MjA2NTE1ODg3Mn0.JYAUGHTbf9KVPCYFN9IDCm2uRT85cEj9G7llkOcrBEk
VITE_DEV=true
```

## Estrutura de Campos Personalizados

O sistema suporta campos personalizados com os seguintes tipos:

- **text**: Campos de texto simples
- **number**: Campos numéricos
- **date**: Campos de data
- **boolean**: Campos booleanos (sim/não)
- **select**: Campos de seleção única
- **multi_select**: Campos de seleção múltipla

## Regras de Validação

Os campos personalizados podem ter regras de validação dos seguintes tipos:

- **required**: Campo obrigatório
- **min_length**: Comprimento mínimo
- **max_length**: Comprimento máximo
- **min_value**: Valor mínimo
- **max_value**: Valor máximo
- **regex**: Validação por expressão regular
- **email**: Validação de e-mail
- **url**: Validação de URL
- **date_range**: Intervalo de datas

## Integridade Referencial

O sistema verifica a integridade referencial entre as seguintes tabelas:

- **contacts** → **client_custom_values**: Valores personalizados para contatos
- **contacts** → **utm_tracking**: Rastreamento UTM para contatos
- **custom_fields** → **custom_field_validation_rules**: Regras de validação para campos personalizados
- **custom_fields** → **client_custom_values**: Valores de campos personalizados
- **client_custom_values** → **custom_field_audit_log**: Log de auditoria para valores personalizados