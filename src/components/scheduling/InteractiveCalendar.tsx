import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAvailability } from '@/hooks/useAvailability';

interface AvailableSlot {
  time: string;
  available: boolean;
}

interface InteractiveCalendarProps {
  professionalId: string;
  serviceId: string;
  onSelectDateTime: (date: Date, time: string) => void;
  selectedDate?: Date;
  selectedTime?: string;
}

export const InteractiveCalendar: React.FC<InteractiveCalendarProps> = ({
  professionalId,
  serviceId,
  onSelectDateTime,
  selectedDate,
  selectedTime,
}) => {
  const [date, setDate] = useState<Date>(selectedDate || new Date());
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const { getAvailableSlots, fetchTimeSlots } = useAvailability(professionalId);

  const loadAvailableSlots = async (selectedDate: Date) => {
    setLoadingSlots(true);
    try {
      // Fetch time slots for the month
      const monthStart = startOfMonth(selectedDate);
      const monthEnd = endOfMonth(selectedDate);
      await fetchTimeSlots(monthStart, monthEnd);
      
      // Get available slots for the selected date
      const slots = await getAvailableSlots(selectedDate, serviceId);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error loading available slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (date) {
      loadAvailableSlots(date);
    }
  }, [date, professionalId, serviceId]);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
    }
  };

  const handleTimeSelect = (time: string) => {
    if (date) {
      onSelectDateTime(date, time);
    }
  };

  const isDateDisabled = (date: Date) => {
    // Disable past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Selecionar Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={isDateDisabled}
            locale={ptBR}
            className="rounded-md border pointer-events-auto"
          />
        </CardContent>
      </Card>

      {date && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horários Disponíveis - {format(date, "d 'de' MMMM", { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSlots ? (
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 bg-muted animate-pulse rounded-md"
                  />
                ))}
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={
                      selectedTime === slot.time
                        ? "default"
                        : slot.available
                        ? "outline"
                        : "secondary"
                    }
                    disabled={!slot.available}
                    onClick={() => handleTimeSelect(slot.time)}
                    className={cn(
                      "text-sm",
                      selectedTime === slot.time && "ring-2 ring-primary",
                      !slot.available && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {slot.time}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum horário disponível para esta data</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedDate && selectedTime && (
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Agendamento Selecionado</p>
                <p className="text-sm text-muted-foreground">
                  {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })} às {selectedTime}
                </p>
              </div>
              <Badge variant="secondary">Confirmado</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};