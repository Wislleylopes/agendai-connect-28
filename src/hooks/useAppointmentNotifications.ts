import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface AppointmentNotification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'confirmation' | 'cancellation' | 'reschedule';
  appointment_id: string;
  read: boolean;
  created_at: string;
}

export const useAppointmentNotifications = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<AppointmentNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const createNotification = async (
    appointmentId: string,
    type: AppointmentNotification['type'],
    title: string,
    message: string
  ) => {
    if (!profile?.id) return;

    try {
      const { error } = await supabase
        .from('appointment_notifications')
        .insert({
          appointment_id: appointmentId,
          user_id: profile.id,
          type,
          title,
          message,
          read: false,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const fetchNotifications = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('appointment_notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('appointment_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!profile?.id) return;

    try {
      const { error } = await supabase
        .from('appointment_notifications')
        .update({ read: true })
        .eq('user_id', profile.id)
        .eq('read', false);

      if (error) throw error;
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('appointment_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Schedule 24h reminder notifications
  const scheduleAppointmentReminder = async (appointmentId: string, appointmentDate: Date) => {
    const reminderTime = new Date(appointmentDate);
    reminderTime.setHours(reminderTime.getHours() - 24);

    if (reminderTime > new Date()) {
      // For demo purposes, we'll create the reminder immediately
      // In production, you'd use a cron job or scheduler
      await createNotification(
        appointmentId,
        'reminder',
        'Lembrete de Consulta',
        `Você tem uma consulta agendada para amanhã às ${appointmentDate.toLocaleTimeString()}`
      );
    }
  };

  // Real-time subscription for appointment changes
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel('appointment-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `client_id=eq.${profile.id},professional_id=eq.${profile.id}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const appointment = payload.new;
            
            if (appointment.client_id === profile.id) {
              // Client created appointment
              await createNotification(
                appointment.id,
                'confirmation',
                'Agendamento Criado',
                'Seu agendamento foi criado com sucesso. Aguarde a confirmação do profissional.'
              );
            }
            
            if (appointment.professional_id === profile.id) {
              // Professional received new appointment
              await createNotification(
                appointment.id,
                'confirmation',
                'Novo Agendamento',
                'Você recebeu um novo agendamento. Confirme para finalizar.'
              );
            }
          }
          
          if (payload.eventType === 'UPDATE') {
            const appointment = payload.new;
            const oldAppointment = payload.old;
            
            // Status or confirmation changed
            if (appointment.status !== oldAppointment.status || 
                appointment.appointment_confirmation !== oldAppointment.appointment_confirmation) {
              
              let title = '';
              let message = '';
              let type: AppointmentNotification['type'] = 'confirmation';
              
              if (appointment.status === 'cancelled') {
                title = 'Agendamento Cancelado';
                message = 'Seu agendamento foi cancelado.';
                type = 'cancellation';
              } else if (appointment.appointment_confirmation === 'confirmed') {
                title = 'Agendamento Confirmado';
                message = 'Seu agendamento foi confirmado pelo profissional.';
                type = 'confirmation';
              } else if (appointment.appointment_confirmation === 'no_show') {
                title = 'Falta Registrada';
                message = 'Foi registrada uma falta para este agendamento.';
                type = 'confirmation';
              }
              
              if (title && message) {
                await createNotification(appointment.id, type, title, message);
                
                toast({
                  title,
                  description: message,
                });
              }
            }
          }
          
          // Refresh notifications
          await fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [profile?.id]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    scheduleAppointmentReminder,
    refreshNotifications: fetchNotifications,
  };
};