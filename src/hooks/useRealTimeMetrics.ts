import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface RealtimeMetricsUpdate {
  type: 'contact_added' | 'conversation_updated' | 'metrics_updated';
  data: any;
  timestamp: string;
}

export const useRealTimeMetrics = () => {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [updateCount, setUpdateCount] = useState(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Canal para atualizações de contatos
    const contactsChannel = supabase
      .channel('contacts-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'contacts'
        },
        (payload) => {
          console.log('🔄 Atualização de contato:', payload);
          
          // Invalidar queries relacionadas a contatos
          queryClient.invalidateQueries({ 
            queryKey: ['consolidated-metrics'],
            exact: false 
          });
          queryClient.invalidateQueries({ 
            queryKey: ['time-series-data'],
            exact: false 
          });
          queryClient.invalidateQueries({ 
            queryKey: ['leads-by-source'],
            exact: false 
          });
          
          setLastUpdate(new Date());
          setUpdateCount(prev => prev + 1);
        }
      )
      .subscribe();

    // Canal para atualizações de conversas
    const conversationsChannel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          console.log('💬 Atualização de conversa:', payload);
          
          // Invalidar queries relacionadas a conversas
          queryClient.invalidateQueries({ 
            queryKey: ['consolidated-metrics'],
            exact: false 
          });
          queryClient.invalidateQueries({ 
            queryKey: ['time-series-data'],
            exact: false 
          });
          
          setLastUpdate(new Date());
          setUpdateCount(prev => prev + 1);
        }
      )
      .subscribe();

    // Canal para atualizações de métricas
    const metricsChannel = supabase
      .channel('metrics-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_metrics'
        },
        (payload) => {
          console.log('📊 Atualização de métrica:', payload);
          
          // Invalidar todas as queries de métricas
          queryClient.invalidateQueries({ 
            queryKey: ['consolidated-metrics'],
            exact: false 
          });
          
          setLastUpdate(new Date());
          setUpdateCount(prev => prev + 1);
        }
      )
      .subscribe();

    // Canal para dados UTM
    const utmChannel = supabase
      .channel('utm-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'utm_tracking'
        },
        (payload) => {
          console.log('🎯 Atualização UTM:', payload);
          
          queryClient.invalidateQueries({ 
            queryKey: ['leads-by-source'],
            exact: false 
          });
          
          setLastUpdate(new Date());
          setUpdateCount(prev => prev + 1);
        }
      )
      .subscribe();

    // Cleanup na desmontagem
    return () => {
      supabase.removeChannel(contactsChannel);
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(metricsChannel);
      supabase.removeChannel(utmChannel);
    };
  }, [queryClient]);

  // Função para forçar atualização manual
  const forceRefresh = () => {
    queryClient.invalidateQueries({ 
      queryKey: ['consolidated-metrics'],
      exact: false 
    });
    queryClient.invalidateQueries({ 
      queryKey: ['time-series-data'],
      exact: false 
    });
    queryClient.invalidateQueries({ 
      queryKey: ['leads-by-source'],
      exact: false 
    });
    
    setLastUpdate(new Date());
    setUpdateCount(prev => prev + 1);
  };

  return {
    lastUpdate,
    updateCount,
    forceRefresh,
    isConnected: true, // Simplificado - em produção você pode verificar o status da conexão
  };
};