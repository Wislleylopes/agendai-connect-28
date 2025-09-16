import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardSkeleton } from "@/components/ui/loading-skeleton";
import { useClientData } from "@/hooks/useClientData";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  Search, 
  Star, 
  Filter,
  CheckCircle, 
  XCircle,
  MapPin,
  Phone,
  User
} from "lucide-react";

export default function ClientDashboard() {
  const { profile, loading: authLoading } = useAuth();
  const { professionals, appointments, loading, error } = useClientData();
  const [activeTab, setActiveTab] = useState<"book" | "professionals" | "appointments" | "profile">("book");
  const [searchTerm, setSearchTerm] = useState("");

  // Handle loading state
  if (authLoading || loading) {
    return (
      <DashboardLayout type="client">
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  // Handle unauthorized access
  if (!profile || profile.user_role !== 'client') {
    return <Navigate to="/" replace />;
  }

  // Handle error state
  if (error) {
    return (
      <DashboardLayout type="client">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-destructive mb-2">Erro</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  const filteredProfessionals = professionals.filter(prof =>
    prof.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.services.some(service => 
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <DashboardLayout type="client">
      {/* Header */}
      <div className="bg-gradient-primary text-white rounded-lg mb-8">
        <div className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Área do Cliente</h1>
              <p className="text-blue-100 mt-2">Bem-vindo, {profile?.full_name || 'Cliente'}!</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled').length}</div>
              <div className="text-blue-100">Agendamentos ativos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Button
          variant={activeTab === "book" ? "default" : "outline"}
          onClick={() => setActiveTab("book")}
          className="flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          Agendar
        </Button>
        <Button
          variant={activeTab === "professionals" ? "default" : "outline"}
          onClick={() => setActiveTab("professionals")}
          className="flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          Profissionais
        </Button>
        <Button
          variant={activeTab === "appointments" ? "default" : "outline"}
          onClick={() => setActiveTab("appointments")}
          className="flex items-center gap-2"
        >
          <Clock className="w-4 h-4" />
          Meus Agendamentos
        </Button>
        <Button
          variant={activeTab === "profile" ? "default" : "outline"}
          onClick={() => setActiveTab("profile")}
          className="flex items-center gap-2"
        >
          <User className="w-4 h-4" />
          Perfil
        </Button>
      </div>

      {/* Content based on active tab */}
      {activeTab === "book" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary" />
                Agendamento Rápido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Serviço</label>
                  <select className="w-full p-2 border border-card-border rounded-lg">
                    <option>Corte Masculino</option>
                    <option>Corte Feminino</option>
                    <option>Barba</option>
                    <option>Sobrancelha</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Data</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Horário</label>
                  <select className="w-full p-2 border border-card-border rounded-lg">
                    <option>09:00</option>
                    <option>10:00</option>
                    <option>11:00</option>
                    <option>14:00</option>
                    <option>15:00</option>
                    <option>16:00</option>
                  </select>
                </div>
              </div>
              <Button className="w-full bg-gradient-primary hover:bg-primary-hover text-white">
                Buscar Profissionais Disponíveis
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "professionals" && (
        <div className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar por nome ou especialidade..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Professionals List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfessionals.map((professional) => (
              <Card key={professional.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-xl">
                      {professional.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{professional.full_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {professional.companies?.company_name || 'Profissional Autônomo'}
                      </p>
                      <div className="flex items-center mt-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm ml-1">{professional.averageRating} ({professional.reviewCount})</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 mr-1 text-muted-foreground" />
                      {professional.companies?.company_address || 'Localização não informada'}
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 mr-1 text-muted-foreground" />
                      {professional.phone || 'Telefone não informado'}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Serviços:</p>
                      {professional.services.slice(0, 3).map((service) => (
                        <div key={service.id} className="flex items-center justify-between text-xs">
                          <span>{service.name}</span>
                          <span className="font-semibold text-primary">{formatCurrency(service.price)}</span>
                        </div>
                      ))}
                      {professional.services.length > 3 && (
                        <p className="text-xs text-muted-foreground">+{professional.services.length - 3} mais</p>
                      )}
                    </div>
                    <Badge variant={professional.isAvailable ? "default" : "secondary"}>
                      {professional.isAvailable ? "Disponível" : "Ocupado"}
                    </Badge>
                  </div>
                  
                  <Button 
                    className="w-full bg-gradient-primary hover:bg-primary-hover text-white"
                    disabled={!professional.isAvailable}
                  >
                    {professional.isAvailable ? "Agendar Agora" : "Indisponível"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "appointments" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-primary" />
                Meus Agendamentos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium text-foreground">{appointment.professional_name}</p>
                          <p className="text-sm text-muted-foreground">{appointment.service_name}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-primary font-medium">
                              {new Date(appointment.appointment_date).toLocaleDateString('pt-BR')} - {new Date(appointment.appointment_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-sm font-medium">{formatCurrency(appointment.price)}</span>
                          </div>
                          {appointment.notes && (
                            <p className="text-xs text-muted-foreground mt-1">{appointment.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge 
                        variant={
                          appointment.status === 'confirmed' ? 'default' : 
                          appointment.status === 'pending' ? 'secondary' : 
                          appointment.status === 'completed' ? 'outline' :
                          'destructive'
                        }
                      >
                        {appointment.status === 'confirmed' ? 'Confirmado' : 
                         appointment.status === 'pending' ? 'Pendente' : 
                         appointment.status === 'completed' ? 'Concluído' :
                         'Cancelado'}
                      </Badge>
                      {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost" className="p-1">
                            <Calendar className="w-4 h-4 text-primary" />
                          </Button>
                          <Button size="sm" variant="ghost" className="p-1">
                            <XCircle className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum agendamento encontrado</p>
                  <p className="text-sm">Seus agendamentos aparecerão aqui</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "profile" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2 text-primary" />
                Meu Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome Completo</label>
                  <Input defaultValue={profile?.full_name || ''} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">E-mail</label>
                  <Input defaultValue={profile?.user_id || ''} type="email" disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Telefone</label>
                  <Input defaultValue={profile?.phone || ''} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Endereço</label>
                  <Input defaultValue={profile?.address || ''} />
                </div>
              </div>
              <Button className="bg-gradient-primary hover:bg-primary-hover text-white">
                Salvar Alterações
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}