import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Bell, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Notification {
  id: string;
  type: 'appointment_created' | 'appointment_updated' | 'appointment_cancelled';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  data?: any;
}

export function NotificationSystem() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!profile?.id) return;

    // Subscribe to real-time appointment changes
    const appointmentChannel = supabase
      .channel('appointments-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `or(client_id.eq.${profile.id},professional_id.eq.${profile.id})`,
        },
        (payload) => {
          handleAppointmentChange(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(appointmentChannel);
    };
  }, [profile?.id]);

  const handleAppointmentChange = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    let notificationType: Notification['type'];
    let title: string;
    let message: string;

    switch (eventType) {
      case 'INSERT':
        notificationType = 'appointment_created';
        title = 'Novo Agendamento';
        message = profile?.user_role === 'professional' 
          ? 'Você recebeu um novo agendamento'
          : 'Seu agendamento foi criado com sucesso';
        break;
      case 'UPDATE':
        notificationType = 'appointment_updated';
        title = 'Agendamento Atualizado';
        if (oldRecord.status !== newRecord.status) {
          const statusMessages = {
            confirmed: 'foi confirmado',
            cancelled: 'foi cancelado',
            completed: 'foi concluído',
            pending: 'está pendente'
          };
          message = `Seu agendamento ${statusMessages[newRecord.status] || 'foi atualizado'}`;
        } else {
          message = 'Seu agendamento foi atualizado';
        }
        break;
      case 'DELETE':
        notificationType = 'appointment_cancelled';
        title = 'Agendamento Cancelado';
        message = 'Um agendamento foi cancelado';
        break;
      default:
        return;
    }

    const notification: Notification = {
      id: `${Date.now()}-${Math.random()}`,
      type: notificationType,
      title,
      message,
      read: false,
      created_at: new Date().toISOString(),
      data: newRecord || oldRecord
    };

    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
    setUnreadCount(prev => prev + 1);

    // Show toast notification
    toast({
      title,
      description: message,
      duration: 5000,
    });
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'appointment_created':
        return <Calendar className="w-4 h-4 text-primary" />;
      case 'appointment_updated':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'appointment_cancelled':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const formatTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs p-0"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs h-6"
            >
              Marcar todas como lidas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <DropdownMenuItem disabled>
            <div className="flex flex-col items-center text-center py-4">
              <Bell className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
            </div>
          </DropdownMenuItem>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start p-3 cursor-pointer"
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 ml-2" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTime(notification.created_at)}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}