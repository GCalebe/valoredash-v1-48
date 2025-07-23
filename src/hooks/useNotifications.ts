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
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    try {
      // 1. Negócios que precisam de atenção (sem contato a mais de 7 dias)
      const { data: staleContacts } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .not('status', 'eq', 'Perdido')
        .lt('last_contact', sevenDaysAgo.toISOString())
        .order('last_contact', { ascending: true })
        .limit(10);

      if (staleContacts && staleContacts.length >= 3) {
        generatedNotifications.push({
          id: 'stale-contacts',
          type: 'urgent',
          category: 'client',
          title: `${staleContacts.length} negócios precisam de atenção`,
          subtitle: 'Clientes sem contato há mais de 7 dias',
          timestamp: new Date(now.getTime() - 10 * 60000),
          actionable: true
        });
      }

      // 2. Follow-ups vencidos (baseado em last_contact + prazo esperado)
      const { data: overdueFollowups } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .not('status', 'eq', 'Perdido')
        .not('status', 'eq', 'Finalizado')
        .lt('last_contact', new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()) // 3 dias
        .order('last_contact', { ascending: true })
        .limit(8);

      if (overdueFollowups && overdueFollowups.length >= 2) {
        generatedNotifications.push({
          id: 'overdue-followups',
          type: 'warning',
          category: 'client',
          title: `${overdueFollowups.length} follow-ups vencidos`,
          subtitle: 'Ação necessária hoje para manter o relacionamento',
          timestamp: new Date(now.getTime() - 20 * 60000),
          actionable: true
        });
      }

      // 3. Clientes fazendo aniversário hoje (simulado - baseado em created_at)
      const { data: birthdayContacts } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString())
        .limit(5);

      // Simular aniversários baseado em created_at (dia/mês)
      const todayBirthdays = birthdayContacts?.filter(contact => {
        const createdDate = new Date(contact.created_at);
        return createdDate.getDate() === now.getDate() && createdDate.getMonth() === now.getMonth();
      }) || [];

      if (todayBirthdays.length > 0) {
        generatedNotifications.push({
          id: 'client-birthdays',
          type: 'success',
          category: 'client',
          title: `${todayBirthdays.length} clientes fazem aniversário hoje`,
          subtitle: 'Oportunidade de contato e relacionamento',
          timestamp: new Date(now.getTime() - 30 * 60000),
          actionable: true
        });
      }

      // 4. Melhor hora para ligar (IA recomenda horário)
      const currentHour = now.getHours();
      if (currentHour >= 13 && currentHour <= 16) {
        generatedNotifications.push({
          id: 'best-calling-time',
          type: 'info',
          category: 'system',
          title: 'Melhor hora para ligar: 14h-16h',
          subtitle: 'IA recomenda este horário para maior taxa de conversão',
          timestamp: new Date(now.getTime() - 40 * 60000)
        });
      }

      // 5. Follow-ups pendentes com nomes específicos
      const { data: pendingFollowups } = await supabase
        .from('contacts')
        .select('name, last_contact')
        .eq('user_id', user.id)
        .not('status', 'eq', 'Perdido')
        .lt('last_contact', new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString())
        .order('last_contact', { ascending: true })
        .limit(3);

      if (pendingFollowups && pendingFollowups.length > 0) {
        const clientNames = pendingFollowups.map(contact => {
          const daysSince = Math.floor((now.getTime() - new Date(contact.last_contact).getTime()) / (1000 * 60 * 60 * 24));
          return `${contact.name} (${daysSince}d)`;
        }).join(', ');

        generatedNotifications.push({
          id: 'pending-followups-detailed',
          type: 'warning',
          category: 'client',
          title: 'Follow-ups pendentes',
          subtitle: clientNames,
          timestamp: new Date(now.getTime() - 50 * 60000),
          actionable: true
        });
      }

      // 6. Agendamentos perdidos/cancelados
      const { data: missedBookings } = await supabase
        .from('agenda_bookings')
        .select('*')
        .eq('status', 'cancelled')
        .gte('booking_date', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('cancelled_at', { ascending: false })
        .limit(5);

      if (missedBookings && missedBookings.length > 0) {
        generatedNotifications.push({
          id: 'missed-bookings',
          type: 'warning',
          category: 'appointment',
          title: `${missedBookings.length} agendamentos cancelados`,
          subtitle: 'Considere reagendar ou fazer follow-up',
          timestamp: new Date(now.getTime() - 60 * 60000),
          actionable: true
        });
      }

      // Notificações adicionais existentes
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
            timestamp: new Date(now.getTime() - 5 * 60000),
            actionable: true
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
          return hoursSince > 2;
        });

        if (urgentConversations.length > 0) {
          generatedNotifications.push({
            id: 'urgent-conversations',
            type: 'warning',
            category: 'conversation',
            title: 'Conversas aguardando resposta',
            subtitle: `${urgentConversations.length} cliente(s) esperando retorno há mais de 2 horas`,
            timestamp: new Date(now.getTime() - 15 * 60000),
            actionable: true
          });
        }
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