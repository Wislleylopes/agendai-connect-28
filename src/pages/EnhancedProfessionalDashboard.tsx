import React, { useState } from 'react';
import ProfessionalDashboard from '@/pages/ProfessionalDashboard';
import { AvailabilityManager } from '@/components/scheduling/AvailabilityManager';
import { AppointmentCalendarView } from '@/components/scheduling/AppointmentCalendarView';
import { ServiceManager } from '@/components/ServiceManager';
import { ServiceReviewsManager } from '@/components/ServiceReviewsManager';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Settings, BarChart3, Star, Package } from 'lucide-react';

export const EnhancedProfessionalDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Agenda
            </TabsTrigger>
            <TabsTrigger value="availability" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horários
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Serviços
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Avaliações
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <ProfessionalDashboard />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Agenda</h1>
              </div>
              <AppointmentCalendarView />
            </div>
          </TabsContent>

          <TabsContent value="availability" className="space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Gerenciar Disponibilidade</h1>
              </div>
              <AvailabilityManager />
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Gerenciar Serviços</h1>
              </div>
              <ServiceManager />
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Avaliações</h1>
              </div>
              <ServiceReviewsManager />
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="text-center py-12 text-muted-foreground">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Configurações</h3>
              <p>Configurações adicionais em breve...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};