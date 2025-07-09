# Mapeamento de Gráficos de Métricas - Dashboard

## Status das Tabelas no Banco de Dados

### ✅ Tabelas Populadas com Dados
| Tabela | Registros | Status |
|--------|-----------|--------|
| `contacts` | 7 | ✅ Populada |
| `client_stats` | 5 | ✅ Populada |
| `conversation_metrics` | 5 | ✅ Populada |
| `funnel_data` | 7 | ✅ Populada |
| `ai_stages` | 7 | ✅ Populada |
| `ai_personality_settings` | 5 | ✅ Populada |
| `custom_field_validation_rules` | 1 | ✅ Populada |

### 🎉 Todas as Tabelas Agora Populadas
| Tabela | Registros | Status |
|--------|-----------|--------|
| `monthly_growth` | 6 | ✅ Populada |
| `utm_tracking` | 10 | ✅ Populada |

---

## Mapeamento Detalhado dos Gráficos

### 📊 **1. ConversationChart**
- **Arquivo**: `src/components/metrics/ConversationChart.tsx`
- **Hook**: `useConversationMetricsQuery()`
- **Tabela**: `conversation_metrics`
- **Dados Populados**: ✅ 5 registros
- **Tipo de Gráfico**: LineChart (Recharts)
- **Descrição**: Exibe métricas de conversação ao longo do tempo

### 📊 **2. ConversionByTimeChart**
- **Arquivo**: `src/components/metrics/ConversionByTimeChart.tsx`
- **Hook**: `useConversationMetricsQuery()` / `useMetricsByDateRangeQuery()`
- **Tabela**: `conversation_metrics`
- **Dados Populados**: ✅ 5 registros
- **Tipo de Gráfico**: BarChart/LineChart
- **Descrição**: Mostra conversões por período de tempo

### 📊 **3. LeadsGrowthChart**
- **Arquivo**: `src/components/metrics/LeadsGrowthChart.tsx`
- **Hook**: `useClientStatsQuery()` / Hook para `monthly_growth`
- **Tabela**: `monthly_growth` (principal) + `client_stats`
- **Dados Populados**: ❌ `monthly_growth` vazia (0 registros)
- **Tipo de Gráfico**: AreaChart/LineChart
- **Descrição**: Crescimento de leads mensais
- **⚠️ AÇÃO NECESSÁRIA**: Popular tabela `monthly_growth`

### 📊 **4. LeadsBySourceChart**
- **Arquivo**: `src/components/metrics/LeadsBySourceChart.tsx`
- **Hook**: `useClientStatsQuery()` / `useUTMMetricsQuery()`
- **Tabela**: `utm_tracking` + `client_stats`
- **Dados Populados**: ❌ `utm_tracking` vazia (0 registros)
- **Tipo de Gráfico**: PieChart
- **Descrição**: Distribuição de leads por fonte
- **⚠️ AÇÃO NECESSÁRIA**: Popular tabela `utm_tracking`

### 📊 **5. LeadsAverageByTimeChart**
- **Arquivo**: `src/components/metrics/LeadsAverageByTimeChart.tsx`
- **Hook**: `useConversationMetricsQuery()`
- **Tabela**: `conversation_metrics`
- **Dados Populados**: ✅ 5 registros
- **Tipo de Gráfico**: BarChart
- **Descrição**: Média de leads por período

### 📊 **6. LeadsByArrivalFunnelChart**
- **Arquivo**: `src/components/metrics/LeadsByArrivalFunnelChart.tsx`
- **Hook**: `useFunnelDataQuery()` / `useFunnelMetricsQuery()`
- **Tabela**: `funnel_data`
- **Dados Populados**: ✅ 7 registros
- **Tipo de Gráfico**: Funnel Chart customizado
- **Descrição**: Funil de conversão de leads

### 📊 **7. ConversionFunnelChart**
- **Arquivo**: `src/components/metrics/ConversionFunnelChart.tsx`
- **Hook**: `useFunnelDataQuery()` / `useFunnelMetricsQuery()`
- **Tabela**: `funnel_data`
- **Dados Populados**: ✅ 7 registros
- **Tipo de Gráfico**: Funnel Chart
- **Descrição**: Funil de conversão geral

### 📊 **8. UTMCampaignChart**
- **Arquivo**: `src/components/metrics/UTMCampaignChart.tsx`
- **Hook**: `useUTMMetricsQuery()` / `useMetricsByCampaignQuery()`
- **Tabela**: `utm_tracking`
- **Dados Populados**: ❌ 0 registros
- **Tipo de Gráfico**: BarChart/LineChart
- **Descrição**: Performance de campanhas UTM
- **⚠️ AÇÃO NECESSÁRIA**: Popular tabela `utm_tracking`

### 📊 **9. UTMSourceChart**
- **Arquivo**: `src/components/metrics/UTMSourceChart.tsx`
- **Hook**: `useUTMMetricsQuery()`
- **Tabela**: `utm_tracking`
- **Dados Populados**: ❌ 0 registros
- **Tipo de Gráfico**: PieChart
- **Descrição**: Distribuição por fonte UTM
- **⚠️ AÇÃO NECESSÁRIA**: Popular tabela `utm_tracking`

### 📊 **10. UTMDeviceDistributionChart**
- **Arquivo**: `src/components/metrics/UTMDeviceDistributionChart.tsx`
- **Hook**: `useUTMMetricsQuery()`
- **Tabela**: `utm_tracking`
- **Dados Populados**: ❌ 0 registros
- **Tipo de Gráfico**: PieChart/BarChart
- **Descrição**: Distribuição por dispositivo
- **⚠️ AÇÃO NECESSÁRIA**: Popular tabela `utm_tracking`

---

## 📋 Cards de Métricas

### 📈 **StatCard Components**
- **Arquivos**: Vários componentes `*Card.tsx`
- **Hooks**: `useDashboardMetricsQuery()`, `useClientStatsQuery()`
- **Tabelas**: `client_stats`, `conversation_metrics`, `contacts`
- **Dados Populados**: ✅ Todas as tabelas têm dados
- **Descrição**: Cards com estatísticas resumidas

### 📊 **Cards Específicos**
1. **AverageClosingTimeCard** - `conversation_metrics` ✅
2. **AverageResponseStartCard** - `conversation_metrics` ✅
3. **ResponseTimeCard** - `conversation_metrics` ✅
4. **NegotiatedValueCard** - `client_stats` ✅
5. **NegotiatingValueCard** - `client_stats` ✅
6. **SecondaryResponseRateCard** - `conversation_metrics` ✅

---

## 📋 Tabelas de Dados

### 📊 **LeadsTable**
- **Arquivo**: `src/components/metrics/LeadsTable.tsx`
- **Hook**: `useClientStatsQuery()`
- **Tabela**: `contacts` + `client_stats`
- **Dados Populados**: ✅ 7 contatos + 5 stats

### 📊 **RecentClientsTable**
- **Arquivo**: `src/components/metrics/RecentClientsTable.tsx`
- **Hook**: `useClientStatsQuery()`
- **Tabela**: `contacts`
- **Dados Populados**: ✅ 7 registros

### 📊 **UTMTrackingTable**
- **Arquivo**: `src/components/metrics/UTMTrackingTable.tsx`
- **Hook**: `useUTMMetricsQuery()`
- **Tabela**: `utm_tracking`
- **Dados Populados**: ❌ 0 registros
- **⚠️ AÇÃO NECESSÁRIA**: Popular tabela `utm_tracking`

---

## 🔧 Hooks de Dados Principais

### ✅ **Hooks Funcionais (com dados)**
1. **`useClientStatsQuery()`** - Tabela: `client_stats` (5 registros)
2. **`useConversationMetricsQuery()`** - Tabela: `conversation_metrics` (5 registros)
3. **`useFunnelDataQuery()`** - Tabela: `funnel_data` (7 registros)
4. **`useDashboardMetricsQuery()`** - Múltiplas tabelas (agregado)

### ❌ **Hooks sem Dados**
1. **`useUTMMetricsQuery()`** - Tabela: `utm_tracking` (0 registros)
2. **`useMetricsByCampaignQuery()`** - Tabela: `utm_tracking` (0 registros)
3. **Hook para `monthly_growth`** - Tabela: `monthly_growth` (0 registros)

---

## 🚨 Ações Necessárias

### 1. Popular Tabela `monthly_growth`
```sql
-- Exemplo de dados necessários
INSERT INTO monthly_growth (month, clients, leads, revenue, growth_rate) VALUES
('2024-01', 45, 120, 15000.00, 12.5),
('2024-02', 52, 135, 18500.00, 15.6),
('2024-03', 61, 148, 22000.00, 17.3);
```

### 2. Popular Tabela `utm_tracking`
```sql
-- Exemplo de dados necessários
INSERT INTO utm_tracking (utm_source, utm_medium, utm_campaign, utm_term, utm_content, landing_page, device_type, conversion_value) VALUES
('google', 'cpc', 'summer_sale', 'shoes', 'ad1', '/landing/shoes', 'desktop', 150.00),
('facebook', 'social', 'brand_awareness', 'fashion', 'post1', '/landing/fashion', 'mobile', 89.99),
('email', 'newsletter', 'weekly_deals', 'discount', 'header', '/deals', 'tablet', 75.50);
```

### 3. Criar Script de Seeding para Tabelas Faltantes
- Criar `seed-monthly-growth.js`
- Criar `seed-utm-tracking.js`
- Executar scripts para popular as tabelas vazias

---

## 📊 Resumo do Status

| Categoria | Total | Funcionais | Precisam de Dados |
|-----------|-------|------------|-------------------|
| **Gráficos** | 10 | 6 | 4 |
| **Cards** | 6 | 6 | 0 |
| **Tabelas** | 3 | 2 | 1 |
| **Hooks** | 7 | 4 | 3 |

### ✅ **60% dos gráficos estão funcionais**
### ❌ **40% precisam de dados nas tabelas `monthly_growth` e `utm_tracking`**

---

## 🎯 Próximos Passos

1. **Criar scripts de seeding** para `monthly_growth` e `utm_tracking`
2. **Executar scripts** para popular as tabelas vazias
3. **Verificar funcionamento** de todos os gráficos
4. **Testar dashboard** completo com todos os dados
5. **Documentar** quaisquer ajustes necessários nos componentes

---

*Documento gerado em: $(date)*
*Status: Mapeamento completo realizado*