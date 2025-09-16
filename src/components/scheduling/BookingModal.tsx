import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock, User, DollarSign, Calendar, MessageSquare } from 'lucide-react';
import { InteractiveCalendar } from './InteractiveCalendar';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/formatters';

interface Professional {
  id: string;
  full_name: string;
  services: Array<{
    id: string;
    name: string;
    price: number;
    duration: number;
    description?: string;
  }>;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  professional?: Professional;
  preselectedService?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  professional,
  preselectedService,
}) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(preselectedService || '');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedServiceData = professional?.services.find(s => s.id === selectedService);

  useEffect(() => {
    if (preselectedService) {
      setSelectedService(preselectedService);
      setStep(2);
    }
  }, [preselectedService]);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setStep(2);
  };

  const handleDateTimeSelect = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setStep(3);
  };

  const handleBookingConfirm = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !professional || !profile) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Create appointment datetime
      const appointmentDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const { error } = await supabase
        .from('appointments')
        .insert({
          client_id: profile.id,
          professional_id: professional.id,
          service_id: selectedService,
          appointment_date: appointmentDateTime.toISOString(),
          notes: notes || null,
          status: 'pending',
          appointment_confirmation: 'pending',
        });

      if (error) throw error;

      toast({
        title: 'Agendamento Realizado!',
        description: 'Seu agendamento foi criado com sucesso. Aguarde a confirmação do profissional.',
      });

      // Reset form and close modal
      setStep(1);
      setSelectedService(preselectedService || '');
      setSelectedDate(undefined);
      setSelectedTime(undefined);
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar agendamento. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedService(preselectedService || '');
    setSelectedDate(undefined);
    setSelectedTime(undefined);
    setNotes('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm();
        onClose();
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Agendar Consulta - {professional?.full_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`flex items-center ${stepNumber < 3 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      step > stepNumber ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Service Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Escolha o Serviço</h3>
              <div className="grid gap-4">
                {professional?.services.map((service) => (
                  <Card
                    key={service.id}
                    className={`cursor-pointer transition-colors hover:bg-accent ${
                      selectedService === service.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleServiceSelect(service.id)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{service.name}</h4>
                          {service.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {service.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {service.duration} min
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {formatCurrency(service.price)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Date and Time Selection */}
          {step === 2 && selectedServiceData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Escolha Data e Horário</h3>
                <Button
                  variant="ghost"
                  onClick={() => setStep(1)}
                >
                  Alterar Serviço
                </Button>
              </div>
              
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="default">{selectedServiceData.name}</Badge>
                    <Badge variant="secondary">{selectedServiceData.duration} min</Badge>
                    <Badge variant="outline">{formatCurrency(selectedServiceData.price)}</Badge>
                  </div>
                </CardContent>
              </Card>

              <InteractiveCalendar
                professionalId={professional!.id}
                serviceId={selectedService}
                onSelectDateTime={handleDateTimeSelect}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
              />
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && selectedServiceData && selectedDate && selectedTime && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Confirmar Agendamento</h3>
                <Button
                  variant="ghost"
                  onClick={() => setStep(2)}
                >
                  Alterar Horário
                </Button>
              </div>

              <Card>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{professional?.full_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedServiceData.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{formatCurrency(selectedServiceData.price)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações (opcional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Alguma observação especial para o profissional..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Voltar
                </Button>
                <Button onClick={handleBookingConfirm} disabled={loading}>
                  {loading ? 'Agendando...' : 'Confirmar Agendamento'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};