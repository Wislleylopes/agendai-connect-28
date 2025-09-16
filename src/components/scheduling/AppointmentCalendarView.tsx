import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addHours, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Clock, User, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface Appointment {
  id: string;
  appointment_date: string;
  status: string;
  appointment_confirmation: string;
  notes?: string;
  client: {
    full_name: string;
    phone?: string;
  };
  service: {
    name: string;
    duration: number;
  };
}

export const AppointmentCalendarView: React.FC = () => {
  const { profile } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const fetchAppointments = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          status,
          appointment_confirmation,
          notes,
          client:profiles!appointments_client_id_fkey (
            full_name,
            phone
          ),
          service:services!appointments_service_id_fkey (
            name,
            duration
          )
        `)
        .eq('professional_id', profile.id)
        .gte('appointment_date', weekStart.toISOString())
        .lte('appointment_date', weekEnd.toISOString())
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      setAppointments(data as Appointment[] || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [currentWeek, profile?.id]);

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter(apt => 
      isSameDay(new Date(apt.appointment_date), day)
    );
  };

  const getStatusColor = (status: string, confirmation: string) => {
    if (status === 'cancelled') return 'destructive';
    if (confirmation === 'confirmed') return 'default';
    if (confirmation === 'no_show') return 'secondary';
    return 'outline';
  };

  const getStatusLabel = (status: string, confirmation: string) => {
    if (status === 'cancelled') return 'Cancelado';
    if (confirmation === 'confirmed') return 'Confirmado';
    if (confirmation === 'no_show') return 'Falta';
    return 'Pendente';
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="h-96 bg-muted animate-pulse rounded-md" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Agenda da Semana</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Hoje
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigateWeek('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-4">
              {format(weekStart, 'd MMM', { locale: ptBR })} - {format(weekEnd, 'd MMM yyyy', { locale: ptBR })}
            </span>
            <Button variant="ghost" size="sm" onClick={() => navigateWeek('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-4 h-96">
          {weekDays.map((day) => {
            const dayAppointments = getAppointmentsForDay(day);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toString()}
                className={cn(
                  "border rounded-lg p-2 overflow-y-auto",
                  isToday && "bg-accent border-primary"
                )}
              >
                <div className="text-center mb-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    {format(day, 'EEEE', { locale: ptBR })}
                  </div>
                  <div className={cn(
                    "text-lg font-bold",
                    isToday && "text-primary"
                  )}>
                    {format(day, 'd')}
                  </div>
                </div>

                <div className="space-y-2">
                  {dayAppointments.map((appointment) => {
                    const appointmentTime = format(new Date(appointment.appointment_date), 'HH:mm');
                    
                    return (
                      <div
                        key={appointment.id}
                        className="p-2 bg-background border rounded text-xs space-y-1"
                      >
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span className="font-medium">{appointmentTime}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span className="truncate">{appointment.client.full_name}</span>
                        </div>

                        <div className="text-muted-foreground truncate">
                          {appointment.service.name}
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge 
                            variant={getStatusColor(appointment.status, appointment.appointment_confirmation)}
                            className="text-xs"
                          >
                            {getStatusLabel(appointment.status, appointment.appointment_confirmation)}
                          </Badge>
                          
                          {appointment.client.phone && (
                            <Phone className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>

                        {appointment.notes && (
                          <div className="text-muted-foreground text-xs truncate">
                            "{appointment.notes}"
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {dayAppointments.length === 0 && (
                    <div className="text-center text-muted-foreground text-xs py-4">
                      Sem agendamentos
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};