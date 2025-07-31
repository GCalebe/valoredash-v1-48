# 📁 Estrutura Organizacional - Documentação Supabase

## 🎯 **Organização por Categorias**

Esta pasta foi reorganizada em **6 categorias principais** para facilitar a navegação e manutenção:

---

## 📚 **01-documentacao/**
**Toda a documentação técnica e análises**

- `README.md` - Documentação principal
- `README-SUPABASE.md` - Guia específico do Supabase
- `SUPABASE_DATABASE_DOCUMENTATION.md` - Documentação completa do banco
- `SUPABASE_MIGRATION_GUIDE.md` - Guia de migração
- `SUPABASE_MCP_DEBUG_GUIDE.md` - Guia de debug MCP
- `TABELAS_REAIS_DESCOBERTAS.md` - Lista das 73+ tabelas descobertas
- `INCONSISTENCIAS_DOCUMENTACAO.md` - Análise de inconsistências
- `VALIDACAO_ANALISE_MCP.md` - Validação da análise MCP
- `PLANO_CORRECAO_INCONSISTENCIAS.md` - Plano de correção
- `RESUMO_EXECUTIVO_ANALISE.md` - Resumo executivo
- `MIGRATION_VIA_NPM.md` - Migração via NPM
- `database-design-complete.md` - Design completo do banco
- `supabase-database-summary.md` - Resumo do banco
- `supabase-database-updated.md` - Atualizações do banco

---

## 🔧 **02-scripts/**
**Scripts gerais e utilitários diversos**

- `run-comprehensive-seeding.js` - Script de seeding abrangente
- `supabase-reset-and-seed-5.js` - Reset e seed versão 5

---

## 🚀 **03-migracoes/**
**Scripts de migração e estrutura do banco**

### **Arquivos SQL:**
- `supabase-migration.sql` - Migração principal
- `create-ai-tables.sql` - Criação de tabelas IA
- `create-faq-table.sql` - Criação da tabela FAQ
- `missing-tables.sql` - Tabelas faltantes
- `check-database-simple.sql` - Verificação simples
- `verify_database_structure.sql` - Verificação da estrutura

### **Scripts de Execução:**
- `execute-database-migration.js` - Execução de migração
- `execute-faq-migration.cjs` - Migração FAQ
- `execute-migration.cjs` - Execução geral
- `execute-seeding-now.js` - Seeding imediato

---

## ✅ **04-validacao/**
**Scripts de validação, verificação e testes**

### **Inspeção e Análise:**
- `inspect-funnel-data.js` - Inspeção de dados do funil
- `inspect-table-structure.js` - Inspeção da estrutura
- `inspect-tables-detailed.js` - Inspeção detalhada
- `inspect-tables.js` - Inspeção geral

### **Testes:**
- `test-funnel-data.js` - Teste de dados do funil
- `test-funnel-data-columns.js` - Teste de colunas

### **Verificação:**
- `verify-database.cjs` - Verificação do banco
- `verify-migration.js` - Verificação de migração
- `verify-agendas-table.js/.cjs` - Verificação da tabela agendas
- `supabase-health-check.js` - Verificação de saúde
- `supabase-verify.js` - Verificação geral

---

## 🌱 **05-seeds/**
**Scripts de população de dados (seeding)**

- `seed-comprehensive.js` - Seeding abrangente
- `seed-agendas-mockdata.cjs` - Dados mock para agendas
- `seed-ai-metrics.js` - Métricas de IA
- `seed-chat-messages.js` - Mensagens de chat
- `seed-chat-metrics.js` - Métricas de chat
- `seed-missing-tables.cjs` - Tabelas faltantes
- `supabase-data-seeder.js` - Seeder principal

---

## 🛠️ **06-utilitarios/**
**Utilitários, ferramentas e scripts auxiliares**

### **Scripts de Criação/Atualização:**
- `create-ai-tables.cjs` - Criação de tabelas IA
- `add-ai-types.cjs` - Adição de tipos IA
- `update-types.js/.cjs` - Atualização de tipos

### **Ferramentas de Sistema:**
- `repair-migrations.bat` - Reparo de migrações
- `reset-db.bat` - Reset do banco

---

## 🧙 **bmad-database-documentation/**
**Documentação especializada do BMad Master**

### **Relatórios de Análise:**
- `01-database-overview.md` - Visão geral
- `02-sql-validation-report.md` - Relatório de validação SQL
- `03-final-consolidated-report.md` - Relatório consolidado final
- `04-implementation-guide.md` - Guia de implementação
- `05-quick-activation-guide.md` - Guia de ativação rápida

### **Ferramentas e Scripts:**
- `validate-database-integrity.cjs` - Validação de integridade
- `monitor-table-utilization.cjs` - Monitoramento de utilização
- `TableUtilizationDashboard.tsx` - Dashboard React

### **Relatórios Gerados:**
- `table-utilization-report.json` - Relatório JSON
- `table-utilization-summary.md` - Resumo em Markdown
- `validation-report-mcp.json` - Relatório de validação MCP

---

## 🎯 **Como Usar Esta Estrutura**

### **Para Documentação:**
```bash
cd 01-documentacao/
# Consulte os arquivos .md para entender o sistema
```

### **Para Executar Migrações:**
```bash
cd 03-migracoes/
node execute-database-migration.js
```

### **Para Validar o Sistema:**
```bash
cd 04-validacao/
node supabase-health-check.js
```

### **Para Popular Dados:**
```bash
cd 05-seeds/
node seed-comprehensive.js
```

### **Para Monitoramento (BMad):**
```bash
cd bmad-database-documentation/
node monitor-table-utilization.cjs
```

---

## 📊 **Estatísticas da Organização**

- **📚 Documentação:** 14 arquivos
- **🔧 Scripts Gerais:** 2 arquivos
- **🚀 Migrações:** 10 arquivos
- **✅ Validação:** 12 arquivos
- **🌱 Seeds:** 7 arquivos
- **🛠️ Utilitários:** 6 arquivos
- **🧙 BMad Docs:** 12 arquivos

**Total:** **63 arquivos organizados** em **7 categorias**

---

## 🚀 **Benefícios da Nova Estrutura**

✅ **Navegação Intuitiva** - Encontre rapidamente o que precisa  
✅ **Manutenção Facilitada** - Cada categoria tem propósito específico  
✅ **Colaboração Melhorada** - Estrutura clara para toda a equipe  
✅ **Escalabilidade** - Fácil adição de novos arquivos  
✅ **Documentação Centralizada** - Tudo em um lugar lógico  

---

**🎉 Estrutura organizada com sucesso!** ✨

*Criado pelo BMad Master - Sistema de Documentação Inteligente*