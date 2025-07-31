# Documentação Supabase - Valore V2

Esta pasta contém toda a documentação, scripts e arquivos relacionados ao banco de dados Supabase do projeto Valore V2.

## 📁 Estrutura da Pasta

### 📋 Documentação Principal

- **`SUPABASE_DATABASE_DOCUMENTATION.md`** - Documentação completa do banco de dados com todas as 44 tabelas, views, funções e otimizações recomendadas
- **`README-SUPABASE.md`** - Guia inicial do Supabase
- **`database-design-complete.md`** - Design completo do banco de dados
- **`supabase-database-summary.md`** - Resumo do banco de dados

### 🔧 Guias e Tutoriais

- **`SUPABASE_MIGRATION_GUIDE.md`** - Guia de migração do Supabase
- **`SUPABASE_MCP_DEBUG_GUIDE.md`** - Guia de debug do MCP Supabase

### 🗄️ Scripts SQL

- **`supabase-migration.sql`** - Script principal de migração com todas as tabelas e dados mockup
- **`missing-tables.sql`** - Script para criar tabelas faltantes
- **`verify_database_structure.sql`** - Script para verificar estrutura do banco

### 🔍 Scripts de Inspeção e Teste

#### Scripts de Inspeção
- **`inspect-funnel-data.js`** - Inspeção da estrutura da tabela funnel_data
- **`inspect-table-structure.js`** - Inspeção geral de estruturas de tabelas
- **`inspect-tables-detailed.js`** - Inspeção detalhada de tabelas
- **`inspect-tables.js`** - Inspeção básica de tabelas

#### Scripts de Teste
- **`test-funnel-data.js`** - Teste de dados do funil
- **`test-funnel-data-columns.js`** - Teste de colunas da tabela funnel_data

### 🚀 Scripts de Migração e Execução

- **`execute-database-migration.js`** - Execução de migração do banco
- **`execute-migration.cjs`** - Script de execução de migração (CommonJS)
- **`verify-migration.js`** - Verificação de migração

### 🔄 Scripts de Dados e Verificação

- **`supabase-data-seeder.js`** - Script para popular o banco com dados de teste
- **`supabase-reset-and-seed-5.js`** - Reset e população do banco (versão 5)
- **`supabase-health-check.js`** - Verificação de saúde do Supabase
- **`supabase-verify.js`** - Verificação geral do Supabase

## 🎯 Como Usar Esta Documentação

### 1. Para Desenvolvedores Novos no Projeto

1. Comece lendo o **`README-SUPABASE.md`** para entender o básico
2. Consulte **`SUPABASE_DATABASE_DOCUMENTATION.md`** para entender toda a estrutura
3. Use **`database-design-complete.md`** para entender o design do sistema

### 2. Para Migração e Setup

1. Use **`SUPABASE_MIGRATION_GUIDE.md`** como guia
2. Execute **`supabase-migration.sql`** para criar a estrutura
3. Use **`supabase-data-seeder.js`** para popular com dados de teste
4. Verifique com **`supabase-health-check.js`**

### 3. Para Debug e Troubleshooting

1. Consulte **`SUPABASE_MCP_DEBUG_GUIDE.md`**
2. Use os scripts de inspeção (`inspect-*.js`) para investigar problemas
3. Execute **`supabase-verify.js`** para verificação geral

### 4. Para Desenvolvimento e Testes

1. Use os scripts de teste (`test-*.js`) para validar funcionalidades
2. Execute **`verify-migration.js`** após mudanças no banco
3. Use **`supabase-reset-and-seed-5.js`** para resetar ambiente de desenvolvimento

## 📊 Resumo do Banco de Dados

### Estatísticas
- **Total de Tabelas**: 44
- **Total de Views**: 6
- **Total de Funções**: 9
- **Total de Enums**: 2

### Principais Categorias de Tabelas

1. **Clientes e Contatos** (5 tabelas)
   - `contacts`, `client_custom_values`, `custom_fields`, etc.

2. **Métricas e Analytics** (8 tabelas)
   - `conversation_metrics`, `funnel_data`, `client_stats`, etc.

3. **UTM e Campanhas** (3 tabelas)
   - `utm_tracking`, `utm_metrics`, `campaign_data`

4. **Chat e Mensagens** (6 tabelas)
   - `n8n_chat_memory`, `chat_messages_backup`, etc.

5. **Sistema e Auditoria** (4 tabelas)
   - `audit_log`, `profiles`, `tokens`, etc.

6. **Produtos e Catálogo** (1 tabela)
   - `ai_products`

7. **Documentos e Arquivos** (2 tabelas)
   - `documents`, `imagens_drive`

8. **Workflow e Kanban** (1 tabela)
   - `kanban_stages`

## 🔧 Comandos Úteis

### Verificar Saúde do Banco
```bash
node docs_supabase/supabase-health-check.js
```

### Executar Migração Completa
```bash
node docs_supabase/execute-database-migration.js
```

### Popular com Dados de Teste
```bash
node docs_supabase/supabase-data-seeder.js
```

### Verificar Estrutura
```bash
node docs_supabase/inspect-tables-detailed.js
```

## 🚨 Importante

- **Backup**: Sempre faça backup antes de executar migrações em produção
- **Ambiente**: Use os scripts de reset apenas em desenvolvimento
- **Segurança**: Nunca commite credenciais nos scripts
- **Performance**: Consulte as otimizações recomendadas na documentação principal

## 📝 Contribuindo

Ao adicionar novos scripts ou documentação:

1. Mantenha a nomenclatura consistente
2. Adicione comentários explicativos
3. Atualize este README
4. Teste em ambiente de desenvolvimento primeiro

---

**Última atualização**: Janeiro 2025  
**Versão**: Valore V2  
**Maintainer**: Equipe de Desenvolvimento Valore