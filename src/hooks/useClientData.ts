import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Professional {
  id: string;
  full_name: string;
  phone?: string;
  companies?: {
    company_name: string;
    company_address?: string;
  };
  services: {
    id: string;
    name: string;
    description?: string;
    price: number;
    duration: number;
  }[];
  averageRating: number;
  reviewCount: number;
  isAvailable: boolean;
}

export interface ClientAppointment {
  id: string;
  professional_name: string;
  service_name: string;
  appointment_date: string;
  status: string;
  price: number;
  notes?: string;
}

export function useClientData() {
  const { profile } = useAuth();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [appointments, setAppointments] = useState<ClientAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.user_role === 'client') {
      fetchProfessionals();
      fetchAppointments();
    }
  }, [profile]);

  const fetchProfessionals = async () => {
    try {
      // Fetch professionals with their services and company info
      const { data: professionalsData, error: professionalsError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          phone,
          companies (
            company_name,
            company_address
          ),
          services (
            id,
            name,
            description,
            price,
            duration
          )
        `)
        .eq('user_role', 'professional');

      if (professionalsError) throw professionalsError;

      const formattedProfessionals: Professional[] = professionalsData?.map(prof => ({
        id: prof.id,
        full_name: prof.full_name,
        phone: prof.phone,
        companies: prof.companies?.[0] || null,
        services: prof.services?.filter(s => s !== null) || [],
        averageRating: 4.8, // TODO: Implement real rating system
        reviewCount: Math.floor(Math.random() * 200) + 50, // Mock for now
        isAvailable: true, // TODO: Implement availability system
      })) || [];

      setProfessionals(formattedProfessionals);
    } catch (err) {
      console.error('Error fetching professionals:', err);
      setError('Erro ao carregar profissionais');
    }
  };

  const fetchAppointments = async () => {
    if (!profile?.id) return;

    try {
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          services (name, price),
          profiles!appointments_professional_id_fkey (full_name)
        `)
        .eq('client_id', profile.id)
        .order('appointment_date', { ascending: false });

      if (appointmentsError) throw appointmentsError;

      const formattedAppointments: ClientAppointment[] = appointmentsData?.map(app => ({
        id: app.id,
        professional_name: app.profiles?.full_name || 'Profissional',
        service_name: app.services?.name || 'Serviço',
        appointment_date: app.appointment_date,
        status: app.status,
        price: app.services?.price || 0,
        notes: app.notes,
      })) || [];

      setAppointments(formattedAppointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  return {
    professionals,
    appointments,
    loading,
    error,
    refreshData: () => {
      fetchProfessionals();
      fetchAppointments();
    },
  };
}