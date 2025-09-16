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

  // Schedule 24h reminder notifications
  const scheduleAppointmentReminder = async (appointmentId: string, appointmentDate: Date) => {
    const reminderTime = new Date(appointmentDate);
    reminderTime.setHours(reminderTime.getHours() - 24);

    if (reminderTime > new Date()) {
      // For demo purposes, we'll create the reminder immediately
      // In production, you'd use a cron job or scheduler
      toast({
        title: 'Lembrete de Consulta',
        description: `Você tem uma consulta agendada para amanhã às ${appointmentDate.toLocaleTimeString()}`,
      });
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
              toast({
                title: 'Agendamento Criado',
                description: 'Seu agendamento foi criado com sucesso. Aguarde a confirmação do profissional.',
              });
            }
            
            if (appointment.professional_id === profile.id) {
              // Professional received new appointment
              toast({
                title: 'Novo Agendamento',
                description: 'Você recebeu um novo agendamento. Confirme para finalizar.',
              });
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
              
              if (appointment.status === 'cancelled') {
                title = 'Agendamento Cancelado';
                message = 'Seu agendamento foi cancelado.';
              } else if (appointment.appointment_confirmation === 'confirmed') {
                title = 'Agendamento Confirmado';
                message = 'Seu agendamento foi confirmado pelo profissional.';
              } else if (appointment.appointment_confirmation === 'no_show') {
                title = 'Falta Registrada';
                message = 'Foi registrada uma falta para este agendamento.';
              }
              
              if (title && message) {
                toast({
                  title,
                  description: message,
                });
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  return {
    notifications,
    unreadCount,
    scheduleAppointmentReminder,
  };
};