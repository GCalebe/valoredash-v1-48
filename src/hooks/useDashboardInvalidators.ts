import { useCallback } from "react";
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';

export const useDashboardInvalidators = (refetchScheduleData?: () => Promise<void>) => {
  const queryClient = useQueryClient();

  const invalidateClientData = useCallback(() => {
    console.log("Invalidating client data queries");
    queryClient.invalidateQueries({ queryKey: queryKeys.clientStats.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.metrics });
  }, [queryClient]);

  const invalidateConversationData = useCallback(() => {
    console.log("Invalidating conversation data queries");
    queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.conversations.metrics });
    queryClient.invalidateQueries({ queryKey: queryKeys.conversations.latest });
  }, [queryClient]);

  const invalidateScheduleData = useCallback(async () => {
    console.log("Invalidating schedule data queries");
    queryClient.invalidateQueries({ queryKey: ['schedule'] });
    if (refetchScheduleData) {
      await refetchScheduleData();
    }
  }, [queryClient, refetchScheduleData]);

  const invalidateServicesData = useCallback(() => {
    console.log("Invalidating services data queries");
    queryClient.invalidateQueries({ queryKey: ['services'] });
    queryClient.invalidateQueries({ queryKey: queryKeys.clientStats.all });
  }, [queryClient]);

  return {
    invalidateClientData,
    invalidateConversationData,
    invalidateScheduleData,
    invalidateServicesData,
  };
};