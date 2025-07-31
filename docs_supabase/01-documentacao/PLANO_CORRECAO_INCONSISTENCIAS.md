# Plano de Ação para Correção das Inconsistências do Banco de Dados

## 🎯 Objetivo

Este documento apresenta um plano estruturado para corrigir as inconsistências identificadas entre a documentação e a implementação real do banco de dados Supabase do projeto Valore V2.

---

## 📋 Fases do Plano

### **FASE 1: CORREÇÕES CRÍTICAS (Prioridade Máxima)**
*Prazo estimado: 2-3 dias*

#### 1.1 Correção de Código com Referências Inválidas

**Problema:** Código referenciando tabelas que não existem

**Ações:**

1. **Arquivo: `src/hooks/useSupabaseData.ts`**
   ```typescript
   // CORRIGIR: Remover referências a tabelas inexistentes
   // ❌ Atual:
   const { data } = await supabase.from('conversation_metrics').select('*');
   
   // ✅ Corrigir para:
   const { data } = await supabase.from('dashboard_metrics').select('*');
   ```

2. **Arquivo: `src/app/chat-optimized/page.tsx`**
   ```typescript
   // CORRIGIR: Adicionar fallback para tabela conversations
   const fetchChatsFromSupabase = async () => {
     // Tentar conversations primeiro, depois contacts como fallback
     let { data, error } = await supabase.from('conversations').select('*');
     
     if (error || !data?.length) {
       // Fallback para contacts
       const { data: contactsData, error: contactsError } = await supabase
         .from('contacts')
         .select('id, name, phone, email, session_id, created_at')
         .order('created_at', { ascending: false });
       
       if (!contactsError) {
         data = contactsData;
       }
     }
     
     return data;
   };
   ```

3. **Arquivo: `src/hooks/useSupabaseAIProducts.ts`**
   ```typescript
   // CORRIGIR: Padronizar nome da tabela
   // ❌ Atual:
   type AIProduct = Database['public']['Tables']['products']['Row'];
   
   // ✅ Manter consistente com implementação real
   type AIProduct = Database['public']['Tables']['products']['Row'];
   ```

#### 1.2 Atualização dos Tipos TypeScript

**Ações:**

1. **Regenerar tipos automaticamente:**
   ```bash
   npx supabase gen types typescript --project-id nkyvhwmjuksumizljclc > src/integrations/supabase/types.ts
   ```

2. **Verificar consistência dos tipos:**
   - Confirmar que todos os tipos estão atualizados
   - Verificar se há campos obrigatórios não documentados
   - Validar relacionamentos entre tabelas

#### 1.3 Tratamento de Erros para Tabelas Inexistentes

**Implementar em todos os hooks:**

```typescript
// Template para hooks seguros
export const useSafeSupabaseQuery = (tableName: string) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: result, error: queryError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1); // Teste se tabela existe
        
        if (queryError) {
          console.warn(`Tabela ${tableName} não existe ou não acessível:`, queryError);
          setData([]);
        } else {
          // Se teste passou, fazer query real
          const { data: fullData } = await supabase.from(tableName).select('*');
          setData(fullData);
        }
      } catch (err) {
        setError(err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tableName]);

  return { data, error, loading };
};
```

---

### **FASE 2: ATUALIZAÇÃO DA DOCUMENTAÇÃO (Prioridade Alta)**
*Prazo estimado: 3-4 dias*

#### 2.1 Documentação das Tabelas Implementadas

**Criar documentação completa para:**

1. **Sistema de Agendamento**
   - `agendas`
   - `agenda_available_dates`
   - `agenda_booking_history`
   - `agenda_bookings`
   - `agenda_operating_hours`
   - `agenda_recurring_bookings`
   - `agenda_reminders`

2. **Sistema de Funcionários**
   - `employees`
   - `employee_agendas`

3. **Sistema de Conhecimento**
   - `knowledge_base`
   - `knowledge_categories`
   - `knowledge_analytics`
   - `knowledge_tags`
   - `knowledge_article_tags`
   - `knowledge_comments`
   - `knowledge_ratings`

4. **Sistema de IA**
   - `ai_personalities`
   - `ai_stages`
   - `ai_stage_transitions`

#### 2.2 Correção da Documentação Existente

**Atualizar estruturas incorretas:**

1. **Tabela `contacts`:**
   ```markdown
   ## contacts
   **Descrição**: Tabela principal de clientes/contatos
   
   ### Campos Principais:
   - `id` (UUID): Identificador único
   - `name` (VARCHAR): Nome do contato
   - `email` (VARCHAR): Email do contato
   - `phone` (VARCHAR): Telefone
   - `kanban_stage_id` (UUID): Referência ao estágio no kanban ⚠️ CORRIGIDO
   - `user_id` (UUID): Usuário proprietário ⚠️ ADICIONADO
   - `created_at` (TIMESTAMP): Data de criação
   - `updated_at` (TIMESTAMP): Data de atualização
   
   ### Relacionamentos:
   - `kanban_stage_id` → `kanban_stages.id`
   - `user_id` → `auth.users.id`
   ```

2. **Tabela `tokens`:**
   ```markdown
   ## tokens
   **Descrição**: Análise de custos e tokens de IA
   
   ### Campos Principais:
   - `id` (BIGINT): Identificador único
   - `Timestamp` (TIMESTAMPTZ): Data/hora do registro
   - `Workflow` (TEXT): Nome do workflow
   - `Input` (TEXT): Entrada do prompt
   - `Output` (TEXT): Saída gerada
   - `PromptTokens` (TEXT): Tokens do prompt
   - `CompletionTokens` (TEXT): Tokens da resposta
   - `CachedTokens` (TEXT): Tokens em cache
   - `CostUSD` (NUMERIC): Custo em dólares
   ```

#### 2.3 Remoção de Tabelas Não Implementadas

**Marcar como "PLANEJADAS" ou remover:**
- `client_stats`
- `conversation_daily_data`
- `monthly_growth`
- `conversion_by_time`
- `leads_by_source`
- `leads_over_time`
- `campaign_data`
- `audit_log`
- `dados_cliente_backup`
- `n8n_chat_memory`
- `n8n_chat_histories`
- `n8n_chat_history`
- `profiles`

---

### **FASE 3: IMPLEMENTAÇÃO DE FUNCIONALIDADES FALTANTES (Prioridade Média)**
*Prazo estimado: 1-2 semanas*

#### 3.1 Criação de Views Documentadas

1. **View `dashboard_metrics_complete`:**
   ```sql
   CREATE OR REPLACE VIEW dashboard_metrics_complete AS
   SELECT 
     COUNT(DISTINCT c.id) as total_contacts,
     COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'Active') as active_contacts,
     COUNT(DISTINCT c.id) FILTER (WHERE c.created_at > NOW() - INTERVAL '30 days') as new_contacts_month,
     COALESCE(AVG(c.sales), 0) as avg_sales,
     COALESCE(SUM(c.sales), 0) as total_sales,
     COUNT(DISTINCT a.id) as total_agendas,
     COUNT(DISTINCT ab.id) as total_bookings,
     COUNT(DISTINCT ab.id) FILTER (WHERE ab.status = 'confirmed') as confirmed_bookings
   FROM contacts c
   LEFT JOIN agendas a ON a.is_active = true
   LEFT JOIN agenda_bookings ab ON ab.booking_date > CURRENT_DATE - INTERVAL '30 days';
   ```

2. **View `contacts_complete`:**
   ```sql
   CREATE OR REPLACE VIEW contacts_complete AS
   SELECT 
     c.*,
     ks.name as kanban_stage_name,
     ks.color as kanban_stage_color,
     COUNT(ab.id) as total_bookings,
     MAX(ab.booking_date) as last_booking_date
   FROM contacts c
   LEFT JOIN kanban_stages ks ON ks.id = c.kanban_stage_id
   LEFT JOIN agenda_bookings ab ON ab.client_name = c.name
   GROUP BY c.id, ks.name, ks.color;
   ```

#### 3.2 Implementação de Funções Faltantes

1. **Função para métricas por período:**
   ```sql
   CREATE OR REPLACE FUNCTION get_metrics_by_period(
     start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
     end_date DATE DEFAULT CURRENT_DATE
   )
   RETURNS TABLE(
     period_start DATE,
     period_end DATE,
     new_contacts INTEGER,
     total_bookings INTEGER,
     confirmed_bookings INTEGER,
     total_revenue NUMERIC
   ) AS $$
   BEGIN
     RETURN QUERY
     SELECT 
       start_date as period_start,
       end_date as period_end,
       COUNT(DISTINCT c.id)::INTEGER as new_contacts,
       COUNT(DISTINCT ab.id)::INTEGER as total_bookings,
       COUNT(DISTINCT ab.id) FILTER (WHERE ab.status = 'confirmed')::INTEGER as confirmed_bookings,
       COALESCE(SUM(ab.price), 0) as total_revenue
     FROM contacts c
     LEFT JOIN agenda_bookings ab ON ab.booking_date BETWEEN start_date AND end_date
     WHERE c.created_at::DATE BETWEEN start_date AND end_date;
   END;
   $$ LANGUAGE plpgsql;
   ```

#### 3.3 Criação de Tabelas de Métricas (Se Necessário)

**Apenas se realmente necessárias para o negócio:**

1. **Tabela `conversation_metrics_daily`:**
   ```sql
   CREATE TABLE conversation_metrics_daily (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     date DATE NOT NULL,
     total_conversations INTEGER DEFAULT 0,
     responded_conversations INTEGER DEFAULT 0,
     response_rate DECIMAL(5,2) DEFAULT 0,
     avg_response_time_minutes INTEGER DEFAULT 0,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     UNIQUE(date)
   );
   ```

---

### **FASE 4: AUTOMAÇÃO E MONITORAMENTO (Prioridade Baixa)**
*Prazo estimado: 1 semana*

#### 4.1 Script de Validação Automática

**Criar script para verificar consistência:**

```javascript
// scripts/validate-database-consistency.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function validateDatabaseConsistency() {
  console.log('🔍 Validando consistência do banco de dados...');
  
  // 1. Verificar tabelas existentes
  const { data: tables } = await supabase.rpc('get_table_list');
  
  // 2. Verificar se código referencia tabelas inexistentes
  const codeFiles = getCodeFiles('./src');
  const invalidReferences = [];
  
  for (const file of codeFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const tableReferences = extractTableReferences(content);
    
    for (const ref of tableReferences) {
      if (!tables.includes(ref)) {
        invalidReferences.push({ file, table: ref });
      }
    }
  }
  
  // 3. Gerar relatório
  generateConsistencyReport({
    existingTables: tables,
    invalidReferences,
    timestamp: new Date().toISOString()
  });
}

validateDatabaseConsistency();
```

#### 4.2 Processo de Sincronização Contínua

1. **GitHub Action para validação:**
   ```yaml
   # .github/workflows/database-consistency.yml
   name: Database Consistency Check
   
   on:
     push:
       paths:
         - 'src/**/*.ts'
         - 'src/**/*.tsx'
         - 'supabase/migrations/**'
   
   jobs:
     validate:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Validate Database Consistency
           run: node scripts/validate-database-consistency.js
   ```

2. **Hook de pre-commit:**
   ```bash
   # .pre-commit-config.yaml
   repos:
     - repo: local
       hooks:
         - id: database-consistency
           name: Database Consistency Check
           entry: node scripts/validate-database-consistency.js
           language: node
           files: \.(ts|tsx)$
   ```

---

## 📊 Cronograma de Execução

| Fase | Atividade | Prazo | Responsável | Status |
|------|-----------|-------|-------------|--------|
| 1 | Correção código crítico | 2-3 dias | Dev Team | 🔄 Pendente |
| 1 | Atualização tipos TS | 1 dia | Dev Team | 🔄 Pendente |
| 1 | Tratamento de erros | 1 dia | Dev Team | 🔄 Pendente |
| 2 | Documentação tabelas | 3-4 dias | Tech Writer | 🔄 Pendente |
| 2 | Correção docs existentes | 1-2 dias | Tech Writer | 🔄 Pendente |
| 2 | Remoção docs inválidas | 1 dia | Tech Writer | 🔄 Pendente |
| 3 | Criação de views | 2-3 dias | DB Admin | 🔄 Pendente |
| 3 | Implementação funções | 3-4 dias | DB Admin | 🔄 Pendente |
| 3 | Tabelas de métricas | 2-3 dias | DB Admin | ⚠️ Opcional |
| 4 | Script validação | 2-3 dias | DevOps | 🔄 Pendente |
| 4 | Automação CI/CD | 1-2 dias | DevOps | 🔄 Pendente |

**Prazo total estimado:** 2-3 semanas

---

## 🎯 Critérios de Sucesso

### Fase 1 - Crítica
- [ ] Zero referências a tabelas inexistentes no código
- [ ] Todos os tipos TypeScript atualizados e consistentes
- [ ] Tratamento de erro implementado em todos os hooks
- [ ] Aplicação funciona sem erros de banco de dados

### Fase 2 - Documentação
- [ ] Documentação completa de todas as tabelas implementadas
- [ ] Estruturas de tabelas corrigidas na documentação
- [ ] Tabelas não implementadas removidas ou marcadas como planejadas
- [ ] Documentação sincronizada com implementação real

### Fase 3 - Funcionalidades
- [ ] Views principais implementadas e funcionando
- [ ] Funções SQL documentadas implementadas
- [ ] Métricas básicas disponíveis via views/funções

### Fase 4 - Automação
- [ ] Script de validação funcionando
- [ ] Processo de CI/CD validando consistência
- [ ] Documentação atualizada automaticamente

---

## 🚨 Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|----------|
| Quebra da aplicação durante correções | Média | Alto | Fazer correções em branch separada, testes extensivos |
| Perda de dados durante criação de views | Baixa | Alto | Backup completo antes de mudanças estruturais |
| Resistência da equipe às mudanças | Média | Médio | Comunicação clara dos benefícios, treinamento |
| Prazo insuficiente | Alta | Médio | Priorizar fases críticas, postergar opcionais |

---

## 📞 Contatos e Responsabilidades

- **Coordenador do Projeto:** [Nome]
- **Desenvolvedor Principal:** [Nome]
- **Administrador de BD:** [Nome]
- **Technical Writer:** [Nome]
- **DevOps:** [Nome]

---

**Data de Criação:** Janeiro 2025  
**Versão:** 1.0  
**Status:** Aguardando Aprovação  
**Próxima Revisão:** [Data]