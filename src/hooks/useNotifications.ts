import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface NotificationItem {
  id: string;
  type: 'urgent' | 'warning' | 'info' | 'success';
  category: 'appointment' | 'conversation' | 'client' | 'system';
  title: string;
  subtitle: string;
  timestamp: Date;
  actionable?: boolean;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const generateNotifications = useCallback(async (): Promise<NotificationItem[]> => {
    if (!user?.id) return [];

    const now = new Date();
    
    // Notificações mockadas
    const mockNotifications: NotificationItem[] = [
      {
        id: 'mock-1',
        type: 'urgent',
        category: 'client',
        title: 'João Silva precisa de follow-up urgente',
        subtitle: 'Cliente sem contato há 8 dias - risco de perder negócio',
        timestamp: new Date(now.getTime() - 10 * 60000),
        actionable: true
      },
      {
        id: 'mock-2',
        type: 'warning',
        category: 'appointment',
        title: 'Reunião com Maria Santos em 15 minutos',
        subtitle: 'Consulta de negociação agendada para 14:30',
        timestamp: new Date(now.getTime() - 5 * 60000),
        actionable: true
      },
      {
        id: 'mock-3',
        type: 'info',
        category: 'system',
        title: 'Melhor horário para ligações: 14h às 16h',
        subtitle: 'IA recomenda este período para maior taxa de conversão',
        timestamp: new Date(now.getTime() - 20 * 60000),
        actionable: true
      },
      {
        id: 'mock-4',
        type: 'success',
        category: 'client',
        title: 'Carlos Oliveira faz aniversário hoje',
        subtitle: 'Oportunidade perfeita para fortalecer relacionamento',
        timestamp: new Date(now.getTime() - 30 * 60000),
        actionable: true
      },
      {
        id: 'mock-5',
        type: 'warning',
        category: 'conversation',
        title: 'Ana Costa aguarda resposta há 3 horas',
        subtitle: 'Última mensagem: "Preciso da proposta até hoje"',
        timestamp: new Date(now.getTime() - 45 * 60000),
        actionable: true
      },
      {
        id: 'mock-6',
        type: 'urgent',
        category: 'appointment',
        title: 'Pedro Almeida cancelou reunião de amanhã',
        subtitle: 'Reagendar o mais rápido possível para não perder momentum',
        timestamp: new Date(now.getTime() - 60 * 60000),
        actionable: true
      }
    ];

    return mockNotifications;
  }, [user?.id]);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const newNotifications = await generateNotifications();
      setNotifications(newNotifications);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  }, [generateNotifications]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  useEffect(() => {
    loadNotifications();
    
    // Atualizar notificações a cada 5 minutos
    const interval = setInterval(loadNotifications, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user?.id]); // loadNotifications removida das dependências para evitar re-execuções desnecessárias

  return {
    notifications,
    loading,
    markAsRead,
    clearAll,
    refresh: loadNotifications
  };
};