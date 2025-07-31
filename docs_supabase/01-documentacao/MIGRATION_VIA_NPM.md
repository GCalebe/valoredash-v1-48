# 🚀 Executar Migrações via NPM Scripts

## ✅ Resposta: Sim, é possível executar via scripts!

Embora não seja possível executar as migrações diretamente via MCP server (devido a limitações de acesso), criamos scripts NPM que facilitam o processo.

## 📋 Scripts Disponíveis

### 1. **Verificar Status da Migração**
```bash
npm run migrate
```
**O que faz:**
- ✅ Verifica quais tabelas existem
- ❌ Identifica tabelas faltando
- 📋 Fornece instruções detalhadas
- 🔗 Gera link direto para o SQL Editor do Supabase

### 2. **Verificar Após Migração**
```bash
npm run verify-migration
```
**O que faz:**
- ✅ Confirma se todas as tabelas foram criadas
- 📊 Mostra resumo do status
- 🎉 Confirma sucesso da migração

### 3. **Scripts Existentes**
```bash
# Criar tabelas específicas (analytics)
npm run create-tables

# Verificar estrutura geral
npm run verify

# Popular com dados de exemplo
npm run seed
```

## 🎯 Processo Recomendado

### Passo 1: Verificar Status
```bash
npm run migrate
```

### Passo 2: Executar no Supabase
O script fornecerá:
- 🔗 **Link direto** para o SQL Editor
- 📄 **Arquivo específico** a ser usado
- 📋 **Instruções passo a passo**

### Passo 3: Verificar Resultado
```bash
npm run verify-migration
```

## 📁 Arquivos de Migração

| Arquivo | Uso | Descrição |
|---------|-----|-----------|
| `complete_database_migration.sql` | **🎯 PRINCIPAL** | Migração completa - todas as tabelas |
| `create_calendar_tables.sql` | Específico | Apenas sistema de agenda |
| `create_subscription_tables.sql` | Específico | Apenas sistema de assinaturas |
| `missing-tables.sql` | Específico | Apenas tabelas de analytics |

## 🔧 Como Funciona

### Limitações do Cliente JavaScript
- ❌ **Não pode executar DDL** (CREATE TABLE, ALTER, etc.)
- ❌ **Não tem acesso administrativo** via API
- ✅ **Pode verificar** se tabelas existem
- ✅ **Pode fornecer instruções** precisas

### Solução Implementada
1. **Script analisa** o estado atual do banco
2. **Identifica** o que precisa ser criado
3. **Gera instruções** específicas para o Supabase
4. **Fornece link direto** para facilitar o processo
5. **Cria script de verificação** automática

## 📊 Exemplo de Saída

```bash
$ npm run migrate

🗄️ === MIGRAÇÃO COMPLETA DO BANCO DE DADOS - VALORE CRM V2 ===
📡 URL: https://nkyvhwmjuksumizljclc.supabase.co
🔑 Usando chave: Anon Key

🔍 Verificando tabelas existentes...
✅ contacts - já existe
✅ profiles - já existe
❌ calendar_events - não existe
❌ pricing_plans - não existe
❌ user_subscriptions - não existe

📊 Resumo: 2 existentes, 15 faltando

📋 INSTRUÇÕES PARA EXECUTAR A MIGRAÇÃO:

1. 🌐 Acesse: https://supabase.com/dashboard/project/nkyvhwmjuksumizljclc
2. 🛠️  Vá para "SQL Editor"
3. 📄 Abra: complete_database_migration.sql
4. 📋 Copie todo o conteúdo
5. 📝 Cole no SQL Editor
6. ▶️  Execute
7. ✅ Verifique erros

📄 Script de verificação criado: verify-migration.js
```

## 🎯 Vantagens desta Abordagem

### ✅ **Automatização Parcial**
- Verifica estado atual automaticamente
- Gera instruções precisas
- Cria scripts de verificação

### ✅ **Segurança**
- Não requer chaves administrativas
- Não executa SQL perigoso automaticamente
- Permite revisão antes da execução

### ✅ **Flexibilidade**
- Pode executar migração completa ou parcial
- Permite escolher quais tabelas criar
- Facilita troubleshooting

### ✅ **Rastreabilidade**
- Log completo do processo
- Verificação pós-migração
- Histórico de mudanças

## 🔍 Troubleshooting

### Problema: "Tabela não existe"
```bash
# Solução: Execute a migração
npm run migrate
# Siga as instruções fornecidas
```

### Problema: "Erro de permissão"
```bash
# Verifique se está usando a chave correta
# Configure SUPABASE_SERVICE_ROLE_KEY se disponível
```

### Problema: "Script não encontrado"
```bash
# Verifique se o arquivo existe
ls -la *.sql

# Ou use migração específica
npm run create-tables
```

## 🎉 Resultado Final

Após seguir o processo:
- ✅ **25+ tabelas** criadas
- ✅ **Índices otimizados** configurados
- ✅ **RLS habilitado** em todas as tabelas
- ✅ **Triggers automáticos** funcionando
- ✅ **Views úteis** disponíveis
- ✅ **Dados de exemplo** inseridos

---

**💡 Dica:** Execute `npm run migrate` sempre que precisar verificar o status do banco de dados ou obter instruções atualizadas para migração!