import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Search, Filter, MapPin, Star } from 'lucide-react';
import { BookingModal } from '@/components/scheduling/BookingModal';
import { AdvancedFilters } from '@/components/AdvancedFilters';
import { ServiceReviewsManager } from '@/components/ServiceReviewsManager';
import { useClientData } from '@/hooks/useClientData';
import { formatCurrency } from '@/utils/formatters';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

interface FilterCriteria {
  categories: string[];
  priceRange: { min: string; max: string };
  minRating: number;
  maxDuration: string;
  availability: string;
}

export const EnhancedClientDashboard: React.FC = () => {
  const { professionals, appointments, loading, error, refreshData } = useClientData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedService, setSelectedService] = useState<string>('');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [filters, setFilters] = useState<FilterCriteria>({
    categories: [],
    priceRange: { min: '', max: '' },
    minRating: 0,
    maxDuration: '',
    availability: '',
  });

  const filteredProfessionals = professionals.filter((professional) => {
    const matchesSearch = searchTerm === '' || 
      professional.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professional.services.some(service => 
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    // Aplicar filtros adicionais aqui quando necessário
    const matchesFilters = true; // Simplificado por enquanto

    return matchesSearch && matchesFilters;
  });

  const handleBookService = (professional: Professional, serviceId?: string) => {
    setSelectedProfessional(professional);
    setSelectedService(serviceId || '');
    setIsBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedProfessional(null);
    setSelectedService('');
    refreshData();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Buscar Serviços
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Meus Agendamentos
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Minhas Avaliações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Encontrar Profissionais</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por profissional ou serviço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <AdvancedFilters 
              activeFilters={filters}
              onFiltersChange={setFilters}
            />

            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <LoadingSkeleton key={i} className="h-64" />
                ))}
              </div>
            )}

            {error && (
              <div className="text-center py-8 text-destructive">
                <p>Erro ao carregar dados: {error}</p>
                <Button onClick={refreshData} className="mt-4">
                  Tentar Novamente
                </Button>
              </div>
            )}

            {!loading && !error && filteredProfessionals.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum profissional encontrado.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfessionals.map((professional) => (
                <Card key={professional.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{professional.full_name}</CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          Profissional verificado
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Serviços Disponíveis:</h4>
                        <div className="space-y-2">
                          {professional.services.slice(0, 3).map((service) => (
                            <div
                              key={service.id}
                              className="flex items-center justify-between p-2 bg-muted rounded-md"
                            >
                              <div>
                                <p className="font-medium text-sm">{service.name}</p>
                                {service.description && (
                                  <p className="text-xs text-muted-foreground">
                                    {service.description}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-sm">{formatCurrency(service.price)}</p>
                                <p className="text-xs text-muted-foreground">{service.duration} min</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {professional.services.length > 3 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            +{professional.services.length - 3} serviços adicionais
                          </p>
                        )}
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => handleBookService(professional)}
                      >
                        <CalendarDays className="h-4 w-4 mr-2" />
                        Agendar Consulta
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <div className="text-center py-8 text-muted-foreground">
              <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Visualização de agendamentos em desenvolvimento</p>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <ServiceReviewsManager />
          </TabsContent>
        </Tabs>

        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={handleCloseBookingModal}
          professional={selectedProfessional}
          preselectedService={selectedService}
        />
      </div>
    </div>
  );
};