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

    const generatedNotifications: NotificationItem[] = [];
    const now = new Date();
    const today = new Date().toISOString().split('T')[0];

    try {
      // Verificar agendamentos hoje
      const { data: todayBookings } = await supabase
        .from('agenda_bookings')
        .select('*')
        .eq('booking_date', today)
        .eq('status', 'confirmed')
        .order('start_time');

      if (todayBookings && todayBookings.length > 0) {
        const nextBooking = todayBookings[0];
        const bookingTime = new Date(`${nextBooking.booking_date}T${nextBooking.start_time}`);
        const timeDiff = bookingTime.getTime() - now.getTime();
        const minutesUntil = Math.floor(timeDiff / (1000 * 60));

        if (minutesUntil <= 30 && minutesUntil > 0) {
          generatedNotifications.push({
            id: `booking-${nextBooking.id}`,
            type: 'urgent',
            category: 'appointment',
            title: 'Agendamento em breve',
            subtitle: `Reunião com ${nextBooking.client_name} em ${minutesUntil} minutos`,
            timestamp: new Date(now.getTime() - 5 * 60000), // 5 minutos atrás
            actionable: true
          });
        }

        if (todayBookings.length > 1) {
          generatedNotifications.push({
            id: 'multiple-bookings-today',
            type: 'info',
            category: 'appointment',
            title: 'Agenda cheia hoje',
            subtitle: `Você tem ${todayBookings.length} agendamentos programados para hoje`,
            timestamp: new Date(now.getTime() - 30 * 60000), // 30 minutos atrás
          });
        }
      }

      // Verificar conversas não respondidas
      const { data: unreadConversations } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .gt('unread_count', 0)
        .order('last_message_time', { ascending: false })
        .limit(5);

      if (unreadConversations && unreadConversations.length > 0) {
        const urgentConversations = unreadConversations.filter(conv => {
          const lastMessage = new Date(conv.last_message_time || '');
          const hoursSince = (now.getTime() - lastMessage.getTime()) / (1000 * 60 * 60);
          return hoursSince > 2; // Mais de 2 horas sem resposta
        });

        if (urgentConversations.length > 0) {
          generatedNotifications.push({
            id: 'urgent-conversations',
            type: 'warning',
            category: 'conversation',
            title: 'Conversas aguardando resposta',
            subtitle: `${urgentConversations.length} cliente(s) esperando retorno há mais de 2 horas`,
            timestamp: new Date(now.getTime() - 15 * 60000), // 15 minutos atrás
            actionable: true
          });
        }

        if (unreadConversations.length >= 5) {
          generatedNotifications.push({
            id: 'many-unread',
            type: 'info',
            category: 'conversation',
            title: 'Muitas conversas pendentes',
            subtitle: `${unreadConversations.length} conversas não lidas no total`,
            timestamp: new Date(now.getTime() - 45 * 60000), // 45 minutos atrás
          });
        }
      }

      // Verificar novos contatos
      const { data: recentContacts } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()) // Últimas 24h
        .order('created_at', { ascending: false });

      if (recentContacts && recentContacts.length > 0) {
        if (recentContacts.length >= 5) {
          generatedNotifications.push({
            id: 'many-new-contacts',
            type: 'success',
            category: 'client',
            title: 'Muitos novos leads!',
            subtitle: `${recentContacts.length} novos contatos nas últimas 24 horas`,
            timestamp: new Date(now.getTime() - 60 * 60000), // 1 hora atrás
          });
        } else if (recentContacts.length > 0) {
          const latest = recentContacts[0];
          generatedNotifications.push({
            id: `new-contact-${latest.id}`,
            type: 'info',
            category: 'client',
            title: 'Novo contato',
            subtitle: `${latest.name} acabou de entrar em contato`,
            timestamp: new Date(latest.created_at),
            actionable: true
          });
        }
      }

      // Verificar agendamentos para amanhã
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const { data: tomorrowBookings } = await supabase
        .from('agenda_bookings')
        .select('*')
        .eq('booking_date', tomorrow)
        .eq('status', 'confirmed');

      if (tomorrowBookings && tomorrowBookings.length > 0) {
        generatedNotifications.push({
          id: 'tomorrow-schedule',
          type: 'info',
          category: 'appointment',
          title: 'Agenda de amanhã',
          subtitle: `${tomorrowBookings.length} agendamento(s) confirmado(s) para amanhã`,
          timestamp: new Date(now.getTime() - 2 * 60 * 60000), // 2 horas atrás
        });
      }

    } catch (error) {
      console.error('Erro ao gerar notificações:', error);
    }

    return generatedNotifications;
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
  }, [loadNotifications]);

  return {
    notifications,
    loading,
    markAsRead,
    clearAll,
    refresh: loadNotifications
  };
};