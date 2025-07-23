import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, MessageSquare, Users, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  type: 'urgent' | 'warning' | 'info' | 'success';
  category: 'appointment' | 'conversation' | 'client' | 'system';
  title: string;
  subtitle: string;
  timestamp: Date;
  actionable?: boolean;
}

const NotificationsCard = React.memo(() => {
  const { notifications, loading, markAsRead, clearAll } = useNotifications();

  const getIcon = (category: string) => {
    switch (category) {
      case 'appointment': return Calendar;
      case 'conversation': return MessageSquare;
      case 'client': return Users;
      default: return Bell;
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'urgent':
        return {
          badge: 'bg-destructive text-destructive-foreground',
          border: 'border-l-destructive',
          bg: 'bg-destructive/5'
        };
      case 'warning':
        return {
          badge: 'bg-orange-500 text-white',
          border: 'border-l-orange-500',
          bg: 'bg-orange-500/5'
        };
      case 'info':
        return {
          badge: 'bg-primary text-primary-foreground',
          border: 'border-l-primary',
          bg: 'bg-primary/5'
        };
      case 'success':
        return {
          badge: 'bg-green-500 text-white',
          border: 'border-l-green-500',
          bg: 'bg-green-500/5'
        };
      default:
        return {
          badge: 'bg-muted text-muted-foreground',
          border: 'border-l-muted',
          bg: 'bg-muted/5'
        };
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    if (minutes > 0) return `${minutes}m atrás`;
    return 'Agora';
  };

  const priorityOrder = { urgent: 0, warning: 1, info: 2, success: 3 };
  const sortedNotifications = notifications.sort((a, b) => 
    priorityOrder[a.type] - priorityOrder[b.type]
  );

  return (
    <Card className="col-span-1 sm:col-span-2 lg:col-span-1 xl:col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Notificações
          {notifications.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {notifications.length}
            </Badge>
          )}
        </CardTitle>
        {notifications.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-xs h-6 px-2"
          >
            Limpar tudo
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhuma notificação pendente
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {sortedNotifications.slice(0, 5).map((notification) => {
              const Icon = getIcon(notification.category);
              const styles = getTypeStyles(notification.type);
              
              return (
                <div
                  key={notification.id}
                  className={cn(
                    "p-3 rounded-lg border-l-4 transition-all duration-200",
                    styles.border,
                    styles.bg,
                    "hover:shadow-sm cursor-pointer"
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-medium truncate">
                          {notification.title}
                        </p>
                        <Badge 
                          className={cn("text-xs px-1.5 py-0.5", styles.badge)}
                        >
                          {notification.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.subtitle}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatTime(notification.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {notifications.length > 5 && (
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" className="text-xs">
                  Ver todas ({notifications.length - 5} mais)
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

NotificationsCard.displayName = 'NotificationsCard';

export default NotificationsCard;