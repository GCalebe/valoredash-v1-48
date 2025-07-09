# 🚀 Plano de Implementação - Otimização de Performance

## 📋 Resumo Executivo

Este documento detalha o plano de implementação para otimizar a performance da aplicação Valore V2, focando em cache inteligente, otimização de componentes e melhoria da experiência do usuário.

## 🎯 Objetivos Principais

- **Reduzir tempo de carregamento** de 3-5s para 1-2s
- **Implementar cache estratégico** com 70-80% de hit rate
- **Otimizar re-renders** reduzindo de 15-20 para 2-3 por interação
- **Manter funcionalidades existentes** sem breaking changes

## 📅 Cronograma Detalhado

### **SPRINT 1: Fundação do Cache (Semana 1)**

#### Dia 1-2: Setup React Query
```typescript
// 1. Configurar QueryClient
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false,
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// 2. Wrapper do Provider
// src/providers/QueryProvider.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export const QueryProvider = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);
```

#### Dia 3-4: Migrar Hooks Críticos
```typescript
// 3. Migrar useSupabaseClientStats
// src/hooks/queries/useClientStatsQuery.ts
import { useQuery } from '@tanstack/react-query';

export const useClientStatsQuery = () => {
  return useQuery({
    queryKey: ['client-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_stats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data?.[0] || null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos para stats
  });
};

// 4. Migrar useSupabaseFunnelData
// src/hooks/queries/useFunnelDataQuery.ts
export const useFunnelDataQuery = (dateRange?: { start: string; end: string }) => {
  return useQuery({
    queryKey: ['funnel-data', dateRange],
    queryFn: async () => {
      // Tentar usar view otimizada primeiro
      let { data, error } = await supabase
        .from('conversion_funnel_view')
        .select('*');
      
      if (error) {
        // Fallback para tabela principal
        ({ data, error } = await supabase
          .from('funnel_data')
          .select('*'));
      }
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutos para dados de funil
  });
};
```

#### Dia 5: Testes e Validação
- Testes de regressão
- Verificação de funcionalidades existentes
- Performance baseline

### **SPRINT 2: Otimização de Componentes (Semana 2)**

#### Dia 1-2: Memoização de Componentes
```typescript
// 1. Otimizar StatCard
// src/components/metrics/StatCard.tsx
import React, { memo } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  loading?: boolean;
}

export const StatCard = memo<StatCardProps>(({ 
  title, 
  value, 
  icon, 
  trend, 
  loading 
}) => {
  // Implementação existente
}, (prevProps, nextProps) => {
  // Custom comparison para evitar re-renders desnecessários
  return (
    prevProps.title === nextProps.title &&
    prevProps.value === nextProps.value &&
    prevProps.trend === nextProps.trend &&
    prevProps.loading === nextProps.loading
  );
});

// 2. Otimizar ConversationChart
// src/components/metrics/ConversationChart.tsx
import { useMemo } from 'react';

export const ConversationChart = memo<ConversationChartProps>(({ data, loading }) => {
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('pt-BR')
    }));
  }, [data]);

  const chartConfig = useMemo(() => ({
    margin: { top: 10, right: 10, left: 0, bottom: 20 },
    // Outras configurações estáticas
  }), []);

  // Resto da implementação
});
```

#### Dia 3-4: Lazy Loading
```typescript
// 3. Implementar Code Splitting
// src/pages/MetricsDashboard.tsx
import { lazy, Suspense } from 'react';

const ChatMetricsTab = lazy(() => import('@/components/metrics/ChatMetricsTab'));
const UTMMetricsTab = lazy(() => import('@/components/metrics/UTMMetricsTab'));
const ConversionFunnelChart = lazy(() => import('@/components/metrics/ConversionFunnelChart'));

export const MetricsDashboard = () => {
  return (
    <div>
      <Suspense fallback={<MetricsLoadingSkeleton />}>
        <Tabs defaultValue="chat">
          <TabsContent value="chat">
            <ChatMetricsTab />
          </TabsContent>
          <TabsContent value="utm">
            <UTMMetricsTab />
          </TabsContent>
        </Tabs>
      </Suspense>
    </div>
  );
};

// 4. Loading Skeletons
// src/components/ui/MetricsLoadingSkeleton.tsx
export const MetricsLoadingSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
      ))}
    </div>
    <div className="h-80 bg-gray-200 rounded-lg animate-pulse" />
  </div>
);
```

#### Dia 5: Performance Profiling
- React DevTools Profiler
- Identificar componentes com re-renders excessivos
- Otimizações específicas

### **SPRINT 3: Dados e Realtime (Semana 3)**

#### Dia 1-2: Paginação Inteligente
```typescript
// 1. Infinite Queries para listas grandes
// src/hooks/queries/useContactsInfiniteQuery.ts
import { useInfiniteQuery } from '@tanstack/react-query';

export const useContactsInfiniteQuery = (filters?: ContactFilters) => {
  return useInfiniteQuery({
    queryKey: ['contacts', 'infinite', filters],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .range(pageParam * 20, (pageParam + 1) * 20 - 1)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return {
        data: data || [],
        nextCursor: data?.length === 20 ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 2 * 60 * 1000,
  });
};

// 2. Componente com Virtualização
// src/components/contacts/VirtualizedContactsList.tsx
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';

export const VirtualizedContactsList = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useContactsInfiniteQuery();

  const items = data?.pages.flatMap(page => page.data) || [];
  
  const isItemLoaded = (index: number) => !!items[index];
  
  const loadMoreItems = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      itemCount={hasNextPage ? items.length + 1 : items.length}
      loadMoreItems={loadMoreItems}
    >
      {({ onItemsRendered, ref }) => (
        <List
          ref={ref}
          height={600}
          itemCount={items.length}
          itemSize={80}
          onItemsRendered={onItemsRendered}
        >
          {({ index, style }) => (
            <div style={style}>
              <ContactItem contact={items[index]} />
            </div>
          )}
        </List>
      )}
    </InfiniteLoader>
  );
};
```

#### Dia 3-4: Otimização Realtime
```typescript
// 3. Realtime com Debounce
// src/hooks/useOptimizedRealtime.ts
import { useDebouncedCallback } from 'use-debounce';
import { useQueryClient } from '@tanstack/react-query';

export const useOptimizedRealtime = () => {
  const queryClient = useQueryClient();
  
  const debouncedInvalidate = useDebouncedCallback(
    (queryKeys: string[]) => {
      queryKeys.forEach(key => {
        queryClient.invalidateQueries([key]);
      });
    },
    500 // 500ms debounce
  );

  useEffect(() => {
    const subscription = supabase
      .channel('optimized_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'contacts'
      }, (payload) => {
        // Invalidação seletiva baseada no tipo de mudança
        const affectedQueries = ['contacts', 'client-stats'];
        debouncedInvalidate(affectedQueries);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [debouncedInvalidate]);
};

// 4. Background Sync
// src/hooks/useBackgroundSync.ts
export const useBackgroundSync = () => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const interval = setInterval(() => {
      // Sync apenas dados críticos em background
      queryClient.invalidateQueries(['real-time-metrics'], {
        refetchType: 'none' // Não refetch imediatamente
      });
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [queryClient]);
};
```

#### Dia 5: Testes de Integração
- Testes de realtime functionality
- Validação de cache invalidation
- Performance testing

### **SPRINT 4: Refinamento (Semana 4)**

#### Dia 1-2: Monitoramento e Métricas
```typescript
// 1. Performance Monitor
// src/utils/performanceMonitor.ts
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance() {
    if (!this.instance) {
      this.instance = new PerformanceMonitor();
    }
    return this.instance;
  }

  measureRender(componentName: string, duration: number) {
    if (!this.metrics.has(componentName)) {
      this.metrics.set(componentName, []);
    }
    this.metrics.get(componentName)!.push(duration);
  }

  getAverageRenderTime(componentName: string): number {
    const times = this.metrics.get(componentName) || [];
    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  exportMetrics() {
    const report = {};
    this.metrics.forEach((times, component) => {
      report[component] = {
        average: this.getAverageRenderTime(component),
        samples: times.length,
        max: Math.max(...times),
        min: Math.min(...times)
      };
    });
    return report;
  }
}

// 2. HOC para Performance Tracking
// src/hocs/withPerformanceTracking.tsx
export const withPerformanceTracking = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) => {
  return React.forwardRef<any, P>((props, ref) => {
    const monitor = PerformanceMonitor.getInstance();
    
    return (
      <Profiler
        id={componentName}
        onRender={(id, phase, actualDuration) => {
          monitor.measureRender(id, actualDuration);
        }}
      >
        <Component {...props} ref={ref} />
      </Profiler>
    );
  });
};
```

#### Dia 3-4: Otimizações Finais
```typescript
// 3. Cache Preloading
// src/utils/cachePreloader.ts
export const preloadCriticalData = async (queryClient: QueryClient) => {
  const criticalQueries = [
    { key: ['client-stats'], fn: () => fetchClientStats() },
    { key: ['ai-products'], fn: () => fetchAIProducts() },
    { key: ['kanban-stages'], fn: () => fetchKanbanStages() },
  ];

  await Promise.allSettled(
    criticalQueries.map(({ key, fn }) => 
      queryClient.prefetchQuery(key, fn)
    )
  );
};

// 4. Error Boundaries Otimizados
// src/components/ErrorBoundary.tsx
export class OptimizedErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error para monitoramento
    console.error('Performance Error:', error, errorInfo);
    
    // Limpar cache corrompido se necessário
    if (error.message.includes('cache')) {
      this.props.queryClient.clear();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Algo deu errado</h2>
          <button onClick={() => window.location.reload()}>
            Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### Dia 5: Documentação e Entrega
- Documentação das otimizações
- Guia de melhores práticas
- Treinamento da equipe
- Deploy e monitoramento

## 📊 Métricas de Sucesso

### **KPIs Principais**
- **Time to First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1

### **Métricas de Cache**
- **Cache Hit Rate**: > 70%
- **Average Query Time**: < 200ms
- **Background Sync Efficiency**: > 90%

### **Métricas de Desenvolvimento**
- **Bundle Size Reduction**: 15-20%
- **Memory Usage**: Redução de 25%
- **CPU Usage**: Redução de 30%

## 🔧 Ferramentas de Monitoramento

### **Desenvolvimento**
- React DevTools Profiler
- React Query DevTools
- Chrome DevTools Performance
- Bundle Analyzer

### **Produção**
- Web Vitals monitoring
- Error tracking (Sentry)
- Performance monitoring (New Relic)
- Custom analytics dashboard

## ⚠️ Riscos e Mitigações

### **Riscos Identificados**
1. **Breaking Changes**: Mudanças podem quebrar funcionalidades
   - **Mitigação**: Testes extensivos e implementação gradual

2. **Cache Inconsistency**: Dados desatualizados
   - **Mitigação**: Invalidação inteligente e fallbacks

3. **Memory Leaks**: Cache excessivo
   - **Mitigação**: Configuração adequada de TTL e limpeza

4. **Complexity Increase**: Código mais complexo
   - **Mitigação**: Documentação e treinamento

## 🎯 Critérios de Aceitação

### **Funcionalidade**
- ✅ Todas as funcionalidades existentes mantidas
- ✅ Dados sempre atualizados e consistentes
- ✅ Realtime updates funcionando corretamente

### **Performance**
- ✅ Tempo de carregamento < 2s
- ✅ Interações responsivas < 100ms
- ✅ Cache hit rate > 70%

### **Qualidade**
- ✅ Cobertura de testes mantida
- ✅ Sem memory leaks
- ✅ Error handling robusto

## 📝 Próximos Passos

1. **Aprovação do Plano** ✋
2. **Setup do Ambiente de Desenvolvimento**
3. **Início do Sprint 1**
4. **Reviews Semanais de Progresso**
5. **Deploy Gradual em Produção**

---

**Responsável**: Equipe de Desenvolvimento  
**Prazo**: 4 semanas  
**Prioridade**: Alta  
**Status**: Aguardando Aprovação