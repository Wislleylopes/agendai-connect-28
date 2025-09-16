import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Star, MessageSquare, Calendar, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Review {
  id: string;
  rating: number;
  comment?: string;
  created_at: string;
  client: {
    full_name: string;
  };
  service: {
    name: string;
  };
  appointment: {
    appointment_date: string;
  };
}

interface CompletedAppointment {
  id: string;
  appointment_date: string;
  service: {
    id: string;
    name: string;
  };
  professional: {
    id: string;
    full_name: string;
  };
  has_review: boolean;
}

interface ReviewFormData {
  rating: number;
  comment: string;
}

export const ServiceReviewsManager: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [completedAppointments, setCompletedAppointments] = useState<CompletedAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<CompletedAppointment | null>(null);
  const [reviewForm, setReviewForm] = useState<ReviewFormData>({
    rating: 5,
    comment: '',
  });

  const fetchReviews = async () => {
    if (!profile?.id) return;

    try {
      let query = supabase
        .from('service_reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          client_id,
          service_id,
          appointment_id
        `)
        .order('created_at', { ascending: false });

      // Se for cliente, buscar apenas suas avaliações
      if (profile.user_role === 'client') {
        query = query.eq('client_id', profile.id);
      }
      // Se for profissional, buscar avaliações dos seus serviços
      else if (profile.user_role === 'professional') {
        query = query.eq('professional_id', profile.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Buscar dados relacionados manualmente
      const reviewsWithDetails = await Promise.all(
        (data || []).map(async (review) => {
          const [clientData, serviceData, appointmentData] = await Promise.all([
            supabase.from('profiles').select('full_name').eq('id', review.client_id).single(),
            supabase.from('services').select('name').eq('id', review.service_id).single(),
            supabase.from('appointments').select('appointment_date').eq('id', review.appointment_id).single()
          ]);

          return {
            ...review,
            client: clientData.data || { full_name: 'Cliente não encontrado' },
            service: serviceData.data || { name: 'Serviço não encontrado' },
            appointment: appointmentData.data || { appointment_date: new Date().toISOString() },
          };
        })
      );

      setReviews(reviewsWithDetails);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchCompletedAppointments = async () => {
    if (!profile?.id || profile.user_role !== 'client') return;

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          service:services!appointments_service_id_fkey (id, name),
          professional:profiles!appointments_professional_id_fkey (id, full_name)
        `)
        .eq('client_id', profile.id)
        .eq('status', 'completed')
        .order('appointment_date', { ascending: false });

      if (error) throw error;

      // Verificar quais agendamentos já têm avaliações
      const appointmentsWithReviews = await Promise.all(
        (data || []).map(async (appointment) => {
          const { data: existingReview } = await supabase
            .from('service_reviews')
            .select('id')
            .eq('appointment_id', appointment.id)
            .maybeSingle();

          return {
            ...appointment,
            has_review: !!existingReview,
          };
        })
      );

      setCompletedAppointments(appointmentsWithReviews);
    } catch (error) {
      console.error('Error fetching completed appointments:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchReviews(),
        fetchCompletedAppointments(),
      ]);
      setLoading(false);
    };

    if (profile?.id) {
      loadData();
    }
  }, [profile?.id, profile?.user_role]);

  const handleCreateReview = async () => {
    if (!selectedAppointment || !profile?.id) return;

    try {
        // Get professional profile id from appointments table
        const { data: appointmentData } = await supabase
          .from('appointments')
          .select('professional_id')
          .eq('id', selectedAppointment.id)
          .single();

        if (!appointmentData) throw new Error('Appointment not found');

        const { error } = await supabase
        .from('service_reviews')
        .insert({
          client_id: profile.id,
          professional_id: appointmentData.professional_id,
          service_id: selectedAppointment.service.id,
          appointment_id: selectedAppointment.id,
          rating: reviewForm.rating,
          comment: reviewForm.comment || null,
        });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Avaliação criada com sucesso',
      });

      setIsReviewModalOpen(false);
      setSelectedAppointment(null);
      setReviewForm({ rating: 5, comment: '' });
      
      await Promise.all([fetchReviews(), fetchCompletedAppointments()]);
    } catch (error) {
      console.error('Error creating review:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar avaliação',
        variant: 'destructive',
      });
    }
  };

  const openReviewModal = (appointment: CompletedAppointment) => {
    setSelectedAppointment(appointment);
    setReviewForm({ rating: 5, comment: '' });
    setIsReviewModalOpen(true);
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Avaliações para criar (apenas clientes) */}
      {profile?.user_role === 'client' && completedAppointments.filter(apt => !apt.has_review).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Avaliar Serviços</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedAppointments
                .filter(apt => !apt.has_review)
                .map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{appointment.service.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {appointment.professional.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(appointment.appointment_date), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <Button onClick={() => openReviewModal(appointment)}>
                      <Star className="h-4 w-4 mr-2" />
                      Avaliar
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Avaliações existentes */}
      <Card>
        <CardHeader>
          <CardTitle>
            {profile?.user_role === 'client' ? 'Minhas Avaliações' : 'Avaliações Recebidas'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                      <Badge variant="secondary">{review.service.name}</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(review.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{review.client.full_name}</span>
                    <Calendar className="h-4 w-4 text-muted-foreground ml-4" />
                    <span className="text-sm">
                      {format(new Date(review.appointment.appointment_date), "d 'de' MMMM", { locale: ptBR })}
                    </span>
                  </div>

                  {review.comment && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground italic">
                        "{review.comment}"
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma avaliação encontrada</p>
              {profile?.user_role === 'client' && (
                <p className="text-sm">Complete um agendamento para avaliar</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de criação de avaliação */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Avaliar Serviço</DialogTitle>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium">{selectedAppointment.service.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedAppointment.professional.full_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(selectedAppointment.appointment_date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>

              <div>
                <Label>Avaliação</Label>
                <div className="mt-2">
                  {renderStars(reviewForm.rating, true, (rating) => 
                    setReviewForm({ ...reviewForm, rating })
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="review-comment">Comentário (opcional)</Label>
                <Textarea
                  id="review-comment"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Conte como foi sua experiência..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsReviewModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleCreateReview}>
                  Avaliar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};