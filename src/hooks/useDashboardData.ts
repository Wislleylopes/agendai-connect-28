import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DashboardStats {
  totalAppointments: number;
  monthlyRevenue: number;
  averageRating: number;
  uniqueClients: number;
  pendingAppointments: number;
  todayAppointments: number;
  completedAppointments: number;
}

export interface MonthlyData {
  month: string;
  revenue: number;
  services: number;
}

export interface ServiceDistribution {
  name: string;
  value: number;
  color: string;
}

export interface UpcomingAppointment {
  id: string;
  client_name: string;
  service_name: string;
  appointment_date: string;
  status: string;
  price: number;
}

export function useDashboardData() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    monthlyRevenue: 0,
    averageRating: 0,
    uniqueClients: 0,
    pendingAppointments: 0,
    todayAppointments: 0,
    completedAppointments: 0,
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [serviceDistribution, setServiceDistribution] = useState<ServiceDistribution[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.user_role === 'professional') {
      fetchDashboardData();
    }
  }, [profile]);

  const fetchDashboardData = async () => {
    if (!profile?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch appointments with related data
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          services (name, price),
          profiles!appointments_client_id_fkey (full_name)
        `)
        .eq('professional_id', profile.id);

      if (appointmentsError) throw appointmentsError;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Calculate stats
      const totalAppointments = appointments?.length || 0;
      const completedAppointments = appointments?.filter(a => a.status === 'completed').length || 0;
      const pendingAppointments = appointments?.filter(a => a.status === 'pending').length || 0;
      const todayAppointments = appointments?.filter(a => {
        const appointmentDate = new Date(a.appointment_date);
        return appointmentDate >= today && appointmentDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
      }).length || 0;

      const monthlyRevenue = appointments
        ?.filter(a => a.status === 'completed' && new Date(a.appointment_date) >= thisMonth)
        .reduce((total, a) => total + (a.services?.price || 0), 0) || 0;

      const uniqueClients = new Set(appointments?.map(a => a.client_id)).size;

      setStats({
        totalAppointments,
        monthlyRevenue,
        averageRating: 4.8, // TODO: Implement real rating system
        uniqueClients,
        pendingAppointments,
        todayAppointments,
        completedAppointments,
      });

      // Generate monthly data for the last 6 months
      const monthlyStats: MonthlyData[] = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        
        const monthAppointments = appointments?.filter(a => {
          const appointmentDate = new Date(a.appointment_date);
          return appointmentDate >= monthDate && appointmentDate < nextMonth && a.status === 'completed';
        }) || [];

        const monthRevenue = monthAppointments.reduce((total, a) => total + (a.services?.price || 0), 0);
        
        monthlyStats.push({
          month: monthDate.toLocaleDateString('pt-BR', { month: 'short' }),
          revenue: monthRevenue,
          services: monthAppointments.length,
        });
      }
      setMonthlyData(monthlyStats);

      // Calculate service distribution
      const serviceStats = new Map<string, number>();
      appointments?.forEach(a => {
        if (a.services?.name && a.status === 'completed') {
          serviceStats.set(a.services.name, (serviceStats.get(a.services.name) || 0) + 1);
        }
      });

      const colors = ['#007BFF', '#17A2B8', '#28A745', '#FFC107', '#DC3545'];
      const distribution = Array.from(serviceStats.entries())
        .map(([name, count], index) => ({
          name,
          value: Math.round((count / completedAppointments) * 100) || 0,
          color: colors[index % colors.length],
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Top 5 services

      setServiceDistribution(distribution);

      // Get upcoming appointments (next 5)
      const upcoming = appointments
        ?.filter(a => new Date(a.appointment_date) > now)
        .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
        .slice(0, 5)
        .map(a => ({
          id: a.id,
          client_name: a.profiles?.full_name || 'Cliente',
          service_name: a.services?.name || 'Serviço',
          appointment_date: a.appointment_date,
          status: a.status,
          price: a.services?.price || 0,
        })) || [];

      setUpcomingAppointments(upcoming);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    monthlyData,
    serviceDistribution,
    upcomingAppointments,
    loading,
    error,
    refreshData: fetchDashboardData,
  };
}