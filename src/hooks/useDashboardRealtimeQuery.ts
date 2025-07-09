import { useQueryClient } from '@tanstack/react-query';
import { queryKeys, cacheUtils } from '../lib/queryClient';
import { useDebounceCallback } from './useDebounceCallback';
import { useDashboardInvalidators } from './useDashboardInvalidators';
import { useDashboardRealtimeSubscriptions } from './useDashboardRealtimeSubscriptions';

interface UseDashboardRealtimeProps {
  refetchScheduleData?: () => Promise<void>;
  debounceMs?: number; // Tempo de debounce em ms (padrão: 1000ms)
}


export function useDashboardRealtimeQuery(props?: UseDashboardRealtimeProps) {
  const queryClient = useQueryClient();
  const debounceMs = props?.debounceMs || 1000;

  // Custom hooks for invalidators and debouncing
  const {
    invalidateClientData,
    invalidateConversationData,
    invalidateScheduleData,
    invalidateServicesData,
  } = useDashboardInvalidators(props?.refetchScheduleData);

  // Debounced callbacks para evitar atualizações excessivas
  const { debouncedCallback: debouncedClientUpdate } = useDebounceCallback(invalidateClientData, debounceMs);
  const { debouncedCallback: debouncedConversationUpdate } = useDebounceCallback(invalidateConversationData, debounceMs);
  const { debouncedCallback: debouncedScheduleUpdate } = useDebounceCallback(invalidateScheduleData, debounceMs);
  const { debouncedCallback: debouncedServicesUpdate } = useDebounceCallback(invalidateServicesData, debounceMs);

  // Setup realtime subscriptions
  useDashboardRealtimeSubscriptions({
    debouncedClientUpdate,
    debouncedConversationUpdate,
    debouncedScheduleUpdate,
    debouncedServicesUpdate,
    debounceMs,
  });

  // Utilitários para invalidação manual
  const utils = {
    invalidateMetrics: () => {
      cacheUtils.invalidateMetrics();
    },
    invalidateContacts: () => {
      cacheUtils.invalidateContacts();
    },
    invalidateRealtime: () => {
      cacheUtils.invalidateRealtime();
    },
    clearAll: () => {
      cacheUtils.clearAll();
    },
    invalidateClientData,
    invalidateConversationData,
    invalidateScheduleData,
    invalidateServicesData,
    prefetchCriticalData: () => {
      // Prefetch dados críticos
      queryClient.prefetchQuery({
        queryKey: queryKeys.clientStats.all,
        staleTime: 30000, // 30 segundos
      });
      queryClient.prefetchQuery({
        queryKey: queryKeys.conversations.latest,
        staleTime: 10000, // 10 segundos
      });
    },
  };

  return utils;
}