# 🚀 Guia de Migração: Dados Mockados → Supabase

## 📋 Visão Geral

Este guia explica como migrar os dados mockados do projeto Valore V2 para o Supabase, permitindo que você trabalhe com dados reais em vez de dados simulados.

## 🎯 Objetivos

- ✅ Substituir dados mockados por dados reais do Supabase
- ✅ Manter a funcionalidade existente
- ✅ Adicionar filtros de data para o funil de conversão
- ✅ Implementar atualizações em tempo real
- ✅ Preparar para escalabilidade

## 📁 Arquivos Criados

### 1. **SQL Migration Script**
```
supabase-migration.sql
```
- Schema completo das tabelas
- Dados de exemplo baseados nos mocks
- Índices para performance
- Views para consultas otimizadas
- Funções SQL para filtros de data

### 2. **TypeScript Types**
```
src/types/supabase.ts
```
- Tipos TypeScript gerados automaticamente
- Interfaces para todas as tabelas
- Tipos auxiliares para filtros e parâmetros
- Constantes para validação

### 3. **Custom Hooks**
```
src/hooks/useSupabaseData.ts
```
- Hook principal `useSupabaseData`
- Hook para contatos com paginação `useContacts`
- Hook para métricas em tempo real `useRealTimeMetrics`
- Funções CRUD para manipulação de dados
- Utilitários para testes

### 4. **Example Component**
```
src/components/examples/SupabaseDataExample.tsx
```
- Componente demonstrativo
- Implementação de filtros de data
- Paginação de contatos
- Métricas em tempo real
- Teste de conexão

## 🛠️ Passo a Passo da Migração

### Passo 1: Configurar Supabase

1. **Acesse o Supabase Dashboard**
   - Vá para [https://supabase.com](https://supabase.com)
   - Faça login na sua conta
   - Selecione seu projeto Valore V2

2. **Execute o Script SQL**
   - No dashboard, vá para "SQL Editor"
   - Copie todo o conteúdo do arquivo `supabase-migration.sql`
   - Cole no editor e execute
   - Verifique se todas as tabelas foram criadas

### Passo 2: Verificar Configuração

1. **Confirme as Variáveis de Ambiente**
   ```env
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima
   ```

2. **Teste a Conexão**
   ```tsx
   import { SupabaseConnectionTest } from './components/examples/SupabaseDataExample';
   
   // Use o componente para testar
   <SupabaseConnectionTest />
   ```

### Passo 3: Substituir Dados Mockados

#### 3.1 Atualizar Componentes Existentes

**Antes (usando mocks):**
```tsx
import { metricsMock } from '../data/metricsMock';
import { clientsMock } from '../data/clientsMock';

const MyComponent = () => {
  const [metrics] = useState(metricsMock);
  const [clients] = useState(clientsMock);
  // ...
};
```

**Depois (usando Supabase):**
```tsx
import { useSupabaseData } from '../hooks/useSupabaseData';

const MyComponent = () => {
  const { metrics, contacts, funnelData, loading, error } = useSupabaseData();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  // ...
};
```

#### 3.2 Implementar Filtros de Data

```tsx
const ConversionFunnelWithFilters = () => {
  const [dateRange, setDateRange] = useState({
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  });

  const { funnelData, loading, refetch } = useSupabaseData({ dateRange });

  const handleDateChange = (newDateRange) => {
    setDateRange(newDateRange);
    refetch({ dateRange: newDateRange });
  };

  return (
    <div>
      <DateRangeFilter 
        value={dateRange} 
        onChange={handleDateChange} 
      />
      <FunnelChart data={funnelData} loading={loading} />
    </div>
  );
};
```

### Passo 4: Implementar Funcionalidades Avançadas

#### 4.1 Paginação de Contatos

```tsx
const ContactsList = () => {
  const {
    contacts,
    loading,
    page,
    totalPages,
    nextPage,
    prevPage
  } = useContacts({ status: 'Active' }, 20);

  return (
    <div>
      <ContactsTable contacts={contacts} loading={loading} />
      <Pagination 
        page={page}
        totalPages={totalPages}
        onNext={nextPage}
        onPrev={prevPage}
      />
    </div>
  );
};
```

#### 4.2 Métricas em Tempo Real

```tsx
const RealTimeMetrics = () => {
  const { metrics, loading } = useRealTimeMetrics();

  return (
    <div>
      {loading && <span>Atualizando...</span>}
      <MetricsCards metrics={metrics} />
    </div>
  );
};
```

## 🔧 Configurações Avançadas

### Row Level Security (RLS)

O script SQL já inclui políticas básicas de RLS. Para personalizar:

```sql
-- Exemplo: Permitir apenas usuários autenticados
CREATE POLICY "Users can view own contacts" ON contacts
  FOR SELECT USING (auth.uid()::text = responsible_user);

-- Exemplo: Permitir inserção apenas para usuários autenticados
CREATE POLICY "Users can insert contacts" ON contacts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
```

### Índices para Performance

O script inclui índices otimizados, mas você pode adicionar mais:

```sql
-- Índice para busca por texto
CREATE INDEX idx_contacts_search ON contacts 
USING gin(to_tsvector('portuguese', name || ' ' || coalesce(email, '') || ' ' || coalesce(client_name, '')));

-- Índice para filtros de data
CREATE INDEX idx_funnel_data_date ON funnel_data (created_at DESC);
```

## 📊 Estrutura de Dados

### Tabelas Principais

1. **contacts** - Informações de contatos/clientes
2. **conversation_metrics** - Métricas de conversação
3. **funnel_data** - Dados do funil de conversão
4. **utm_tracking** - Rastreamento de campanhas
5. **ai_products** - Produtos de IA disponíveis

### Views Otimizadas

1. **dashboard_metrics** - Métricas consolidadas do dashboard
2. **conversion_funnel_view** - Funil de conversão otimizado
3. **leads_analysis** - Análise de leads por fonte

### Funções SQL

1. **get_metrics_by_date_range()** - Métricas filtradas por período
2. **get_funnel_by_date_range()** - Funil filtrado por período

## 🧪 Testes e Validação

### 1. Teste de Conexão

```tsx
import { testSupabaseConnection, checkTablesExist } from '../hooks/useSupabaseData';

const runTests = async () => {
  const connection = await testSupabaseConnection();
  const tables = await checkTablesExist();
  
  console.log('Conexão:', connection.success);
  console.log('Tabelas existem:', tables);
};
```

### 2. Popular Dados de Teste

```tsx
import { seedTestData } from '../hooks/useSupabaseData';

const populateTestData = async () => {
  const result = await seedTestData();
  if (result.success) {
    console.log('Dados de teste inseridos com sucesso!');
  }
};
```

### 3. Validar Filtros de Data

```tsx
const testDateFilters = async () => {
  const { getFunnelByDateRange } = await import('../hooks/useSupabaseData');
  
  const result = await getFunnelByDateRange('2024-01-01', '2024-12-31');
  console.log('Dados do funil:', result.data);
};
```

## 🚨 Troubleshooting

### Problema: "relation does not exist"
**Solução:** Execute o script SQL completo no Supabase Dashboard

### Problema: "RLS policy violation"
**Solução:** Verifique as políticas de RLS ou desabilite temporariamente:
```sql
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
```

### Problema: Dados não aparecem
**Solução:** Verifique se os dados foram inseridos:
```sql
SELECT COUNT(*) FROM contacts;
SELECT COUNT(*) FROM funnel_data;
```

### Problema: Filtros de data não funcionam
**Solução:** Verifique o formato das datas (ISO 8601):
```tsx
const dateRange = {
  startDate: '2024-01-01T00:00:00.000Z',
  endDate: '2024-12-31T23:59:59.999Z'
};
```

## 📈 Próximos Passos

1. **Implementar Cache** - Use React Query ou SWR para cache
2. **Adicionar Websockets** - Para atualizações em tempo real
3. **Otimizar Queries** - Implementar lazy loading
4. **Adicionar Backup** - Configurar backup automático
5. **Monitoramento** - Implementar logs e métricas

## 🔗 Links Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)

## 💡 Dicas de Performance

1. **Use índices** para colunas frequentemente filtradas
2. **Limite resultados** com paginação
3. **Cache dados** que não mudam frequentemente
4. **Use views** para queries complexas
5. **Monitore** o uso de recursos no dashboard

---

**✅ Migração Completa!** 

Agora você pode trabalhar com dados reais do Supabase em vez de dados mockados, com filtros de data funcionais e atualizações em tempo real.