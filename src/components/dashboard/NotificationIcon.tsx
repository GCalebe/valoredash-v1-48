import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Bell, Calendar, MessageSquare, Users, AlertTriangle, Clock, CheckCircle, X } from "lucide-react";
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

const NotificationIcon = React.memo(() => {
  const { notifications, loading, markAsRead, clearAll } = useNotifications();
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNotificationListOpen, setIsNotificationListOpen] = useState(false);

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

  const handleNotificationClick = (notification: NotificationItem) => {
    setSelectedNotification(notification);
    setIsDialogOpen(true);
    markAsRead(notification.id);
  };

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  return (
    <>
      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setIsNotificationListOpen(!isNotificationListOpen)}
          className="border-white text-white bg-transparent hover:bg-white/20 h-8 w-8 p-0 relative"
          style={{ borderRadius: 8, borderWidth: 1.4 }}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>

        {isNotificationListOpen && (
          <div className="absolute top-10 right-0 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">Notificações</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsNotificationListOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="text-xs mt-2"
                >
                  Limpar todas
                </Button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500 scrollbar-thumb-rounded-full pr-2">
              {loading ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  Carregando...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  Nenhuma notificação
                </div>
              ) : (
                notifications.slice(0, 5).map((notification) => {
                  const Icon = getIcon(notification.category);
                  const styles = getTypeStyles(notification.type);
                  
                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-3 border-l-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                        styles.border,
                        styles.bg
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {notification.title}
                            </p>
                            <Badge 
                              className={cn("text-xs px-1.5 py-0.5", styles.badge)}
                            >
                              {notification.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                            {notification.subtitle}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTime(notification.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              
              {notifications.length > 5 && (
                <div className="p-3 text-center border-t border-gray-200 dark:border-gray-700">
                  <Button variant="ghost" size="sm" className="text-xs">
                    Ver todas ({notifications.length - 5} mais)
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedNotification && (
                <>
                  {React.createElement(getIcon(selectedNotification.category), {
                    className: "h-5 w-5"
                  })}
                  {selectedNotification.title}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedNotification && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={cn("text-xs", getTypeStyles(selectedNotification.type).badge)}>
                  {selectedNotification.type}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatTime(selectedNotification.timestamp)}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {selectedNotification.subtitle}
              </p>
              
              {selectedNotification.actionable && (
                <div className="flex gap-2">
                  <Button size="sm" variant="default">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Resolver
                  </Button>
                  <Button size="sm" variant="outline">
                    Ver detalhes
                  </Button>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});

NotificationIcon.displayName = 'NotificationIcon';

export default NotificationIcon;