import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, cacheUtils } from '@/lib/queryClient';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';

interface RealtimeConfig {
  enableClientUpdates?: boolean;
  enableMetricsUpdates?: boolean;
  enableConversationUpdates?: boolean;
  debounceMs?: number;
  pollingInterval?: number;
}

/**
 * Hook otimizado para atualizações em tempo real
 * 
 * Features:
 * - Debounce de updates para evitar spam
 * - Subscriptions condicionais por tipo de dados
 * - Invalidação inteligente de cache
 * - Cleanup automático
 * - Polling de fallback configurável
 */
export const useOptimizedRealtime = (config: RealtimeConfig = {}) => {
  const {
    enableClientUpdates = true,
    enableMetricsUpdates = true,
    enableConversationUpdates = true,
    debounceMs = 1000,
    pollingInterval = 30000, // 30 segundos
  } = config;

  const queryClient = useQueryClient();
  const subscriptionsRef = useRef<any[]>([]);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced invalidation functions
  const debouncedInvalidateContacts = useDebouncedCallback(() => {
    cacheUtils.invalidateContacts();
    console.log('🔄 Contacts cache invalidated (debounced)');
  }, debounceMs);

  const debouncedInvalidateMetrics = useDebouncedCallback(() => {
    cacheUtils.invalidateMetrics();
    console.log('📊 Metrics cache invalidated (debounced)');
  }, debounceMs);

  const debouncedInvalidateConversations = useDebouncedCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
    console.log('💬 Conversations cache invalidated (debounced)');
  }, debounceMs);

  // Setup client updates subscription
  const setupClientUpdates = useCallback(() => {
    if (!enableClientUpdates) return null;

    const subscription = supabase
      .channel('contacts_realtime')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'contacts' 
        }, 
        (payload) => {
          console.log('👤 Contact change detected:', payload.eventType);
          debouncedInvalidateContacts();
          
          // Otimização: invalidar métricas apenas se for relevante
          if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
            debouncedInvalidateMetrics();
          }
        }
      )
      .subscribe((status) => {
        console.log('👤 Contacts subscription status:', status);
      });

    return subscription;
  }, [enableClientUpdates, debouncedInvalidateContacts, debouncedInvalidateMetrics]);

  // Setup metrics updates subscription
  const setupMetricsUpdates = useCallback(() => {
    if (!enableMetricsUpdates) return null;

    const subscription = supabase
      .channel('metrics_realtime')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'conversation_metrics' 
        }, 
        (payload) => {
          console.log('📊 Metrics change detected:', payload.eventType);
          debouncedInvalidateMetrics();
        }
      )
      .subscribe((status) => {
        console.log('📊 Metrics subscription status:', status);
      });

    return subscription;
  }, [enableMetricsUpdates, debouncedInvalidateMetrics]);

  // Setup conversations subscription
  const setupConversationUpdates = useCallback(() => {
    if (!enableConversationUpdates) return null;

    const subscription = supabase
      .channel('conversations_realtime')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'conversations' 
        }, 
        (payload) => {
          console.log('💬 Conversation change detected:', payload.eventType);
          debouncedInvalidateConversations();
        }
      )
      .subscribe((status) => {
        console.log('💬 Conversations subscription status:', status);
      });

    return subscription;
  }, [enableConversationUpdates, debouncedInvalidateConversations]);

  // Polling de fallback para garantir sincronização
  const setupPolling = useCallback(() => {
    if (pollingInterval <= 0) return;

    pollingRef.current = setInterval(() => {
      console.log('🔄 Fallback polling - refreshing critical data');
      
      // Invalidar apenas dados críticos em tempo real
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.clientStats.latest,
        exact: true 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.realtimeMetrics,
        exact: true 
      });
    }, pollingInterval);
  }, [pollingInterval, queryClient]);

  // Cleanup function
  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up realtime subscriptions');
    
    // Unsubscribe all active subscriptions
    subscriptionsRef.current.forEach(subscription => {
      if (subscription) {
        subscription.unsubscribe();
      }
    });
    subscriptionsRef.current = [];

    // Clear polling
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Setup all subscriptions
  useEffect(() => {
    console.log('🚀 Setting up optimized realtime subscriptions');
    
    const subscriptions = [
      setupClientUpdates(),
      setupMetricsUpdates(),
      setupConversationUpdates(),
    ].filter(Boolean);

    subscriptionsRef.current = subscriptions;

    // Setup polling
    setupPolling();

    // Cleanup on unmount
    return cleanup;
  }, [
    setupClientUpdates,
    setupMetricsUpdates,
    setupConversationUpdates,
    setupPolling,
    cleanup
  ]);

  // Manual refresh functions
  const manualRefresh = useCallback(() => {
    console.log('🔄 Manual refresh triggered');
    cacheUtils.invalidateMetrics();
    cacheUtils.invalidateContacts();
    cacheUtils.invalidateRealtime();
  }, []);

  const refreshSpecific = useCallback((type: 'contacts' | 'metrics' | 'conversations') => {
    console.log(`🔄 Manual refresh for ${type}`);
    
    switch (type) {
      case 'contacts':
        cacheUtils.invalidateContacts();
        break;
      case 'metrics':
        cacheUtils.invalidateMetrics();
        break;
      case 'conversations':
        queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
        break;
    }
  }, [queryClient]);

  return {
    manualRefresh,
    refreshSpecific,
    cleanup,
    isEnabled: {
      clients: enableClientUpdates,
      metrics: enableMetricsUpdates,
      conversations: enableConversationUpdates,
    },
  };
};

/**
 * Hook simplificado para uso comum
 */
export const useBasicRealtime = () => {
  return useOptimizedRealtime({
    enableClientUpdates: true,
    enableMetricsUpdates: true,
    enableConversationUpdates: false, // Desabilitado por padrão para economizar recursos
    debounceMs: 2000, // Debounce maior para uso básico
    pollingInterval: 60000, // 1 minuto
  });
};

/**
 * Hook para dashboard com alta frequência de updates
 */
export const useDashboardRealtime = () => {
  return useOptimizedRealtime({
    enableClientUpdates: true,
    enableMetricsUpdates: true,
    enableConversationUpdates: false,
    debounceMs: 500, // Resposta mais rápida
    pollingInterval: 30000, // 30 segundos
  });
};