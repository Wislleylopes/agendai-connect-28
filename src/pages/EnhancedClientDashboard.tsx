import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Search, Filter, MapPin } from 'lucide-react';
import { BookingModal } from '@/components/scheduling/BookingModal';
import { useClientData } from '@/hooks/useClientData';
import { formatCurrency } from '@/utils/formatters';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

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

export const EnhancedClientDashboard: React.FC = () => {
  const { professionals, loading, error } = useClientData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | undefined>();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [preselectedService, setPreselectedService] = useState<string>();

  const filteredProfessionals = professionals.filter(professional =>
    professional.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professional.services.some(service => 
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleBookService = (professional: Professional, serviceId?: string) => {
    setSelectedProfessional(professional);
    setPreselectedService(serviceId);
    setIsBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedProfessional(undefined);
    setPreselectedService(undefined);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="h-8 w-48 bg-muted animate-pulse rounded" />
              <div className="h-10 w-64 bg-muted animate-pulse rounded" />
            </div>
            <div className="grid gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <LoadingSkeleton key={i} className="h-48" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <p className="text-destructive">Erro ao carregar profissionais: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Encontrar Profissionais</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar profissionais ou serviços..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Professional Cards */}
          <div className="grid gap-6">
            {filteredProfessionals.length > 0 ? (
              filteredProfessionals.map((professional) => (
                <Card key={professional.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-xl">{professional.full_name}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>Profissional Verificado</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleBookService(professional)}
                        className="shrink-0"
                      >
                        <CalendarDays className="h-4 w-4 mr-2" />
                        Agendar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-3">Serviços Disponíveis</h4>
                        <div className="grid gap-3 md:grid-cols-2">
                          {professional.services.map((service) => (
                            <div
                              key={service.id}
                              className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                              onClick={() => handleBookService(professional, service.id)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h5 className="font-medium">{service.name}</h5>
                                  {service.description && (
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                      {service.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="secondary">
                                      {service.duration} min
                                    </Badge>
                                    <Badge variant="outline">
                                      {formatCurrency(service.price)}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Nenhum profissional encontrado</h3>
                <p>Tente ajustar sua busca ou filtros</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={handleCloseBookingModal}
        professional={selectedProfessional}
        preselectedService={preselectedService}
      />
    </div>
  );
};