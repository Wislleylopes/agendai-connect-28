import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ProfessionalAvailability {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface TimeSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_blocked: boolean;
  reason?: string;
}

interface AvailableSlot {
  time: string;
  available: boolean;
}

export const useAvailability = (professionalId?: string) => {
  const { user, profile } = useAuth();
  const [availability, setAvailability] = useState<ProfessionalAvailability[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentProfessionalId = professionalId || profile?.id;

  const fetchAvailability = async () => {
    if (!currentProfessionalId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('professional_availability')
        .select('*')
        .eq('professional_id', currentProfessionalId)
        .order('day_of_week', { ascending: true });

      if (error) throw error;
      setAvailability(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar disponibilidade');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSlots = async (startDate: Date, endDate: Date) => {
    if (!currentProfessionalId) return;

    try {
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('professional_id', currentProfessionalId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);

      if (error) throw error;
      setTimeSlots(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar horários');
    }
  };

  const addAvailability = async (dayOfWeek: number, startTime: string, endTime: string) => {
    if (!currentProfessionalId) return;

    try {
      const { error } = await supabase
        .from('professional_availability')
        .insert({
          professional_id: currentProfessionalId,
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
          is_available: true,
        });

      if (error) throw error;
      await fetchAvailability();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar disponibilidade');
    }
  };

  const updateAvailability = async (id: string, updates: Partial<ProfessionalAvailability>) => {
    try {
      const { error } = await supabase
        .from('professional_availability')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchAvailability();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar disponibilidade');
    }
  };

  const deleteAvailability = async (id: string) => {
    try {
      const { error } = await supabase
        .from('professional_availability')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchAvailability();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar disponibilidade');
    }
  };

  const blockTimeSlot = async (date: Date, startTime: string, endTime: string, reason?: string) => {
    if (!currentProfessionalId) return;

    try {
      const { error } = await supabase
        .from('time_slots')
        .insert({
          professional_id: currentProfessionalId,
          date: date.toISOString().split('T')[0],
          start_time: startTime,
          end_time: endTime,
          is_blocked: true,
          reason,
        });

      if (error) throw error;
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 7);
      await fetchTimeSlots(date, endDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao bloquear horário');
    }
  };

  const getAvailableSlots = async (date: Date, serviceId: string): Promise<AvailableSlot[]> => {
    if (!currentProfessionalId) return [];

    try {
      // Get service duration
      const { data: service } = await supabase
        .from('services')
        .select('duration')
        .eq('id', serviceId)
        .single();

      if (!service) return [];

      const dayOfWeek = date.getDay();
      const dayAvailability = availability.find(a => a.day_of_week === dayOfWeek && a.is_available);
      
      if (!dayAvailability) return [];

      // Get existing appointments for this date
      const { data: appointments } = await supabase
        .from('appointments')
        .select('appointment_date')
        .eq('professional_id', currentProfessionalId)
        .eq('appointment_date::date', date.toISOString().split('T')[0])
        .neq('status', 'cancelled');

      // Get blocked time slots
      const blockedSlots = timeSlots.filter(
        slot => slot.date === date.toISOString().split('T')[0] && slot.is_blocked
      );

      // Generate available slots
      const slots: AvailableSlot[] = [];
      const startTime = dayAvailability.start_time;
      const endTime = dayAvailability.end_time;
      const duration = service.duration;

      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);

      while (start < end) {
        const slotTime = start.toTimeString().slice(0, 5);
        const slotEnd = new Date(start.getTime() + duration * 60000);
        
        if (slotEnd <= end) {
          // Check if slot is available
          const isBlocked = blockedSlots.some(blocked => {
            const blockedStart = new Date(`2000-01-01T${blocked.start_time}`);
            const blockedEnd = new Date(`2000-01-01T${blocked.end_time}`);
            return start >= blockedStart && start < blockedEnd;
          });

          const isBooked = appointments?.some(apt => {
            const aptTime = new Date(apt.appointment_date).toTimeString().slice(0, 5);
            return aptTime === slotTime;
          });

          slots.push({
            time: slotTime,
            available: !isBlocked && !isBooked,
          });
        }

        start.setMinutes(start.getMinutes() + 30); // 30-minute intervals
      }

      return slots;
    } catch (err) {
      console.error('Error getting available slots:', err);
      return [];
    }
  };

  useEffect(() => {
    if (currentProfessionalId) {
      fetchAvailability();
    }
  }, [currentProfessionalId]);

  return {
    availability,
    timeSlots,
    loading,
    error,
    addAvailability,
    updateAvailability,
    deleteAvailability,
    blockTimeSlot,
    fetchTimeSlots,
    getAvailableSlots,
    refreshData: fetchAvailability,
  };
};