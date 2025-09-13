import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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

// Mock data for professionals
const professionals = [
  {
    id: 1,
    name: "João Silva",
    specialty: "Corte Masculino",
    rating: 4.8,
    reviews: 124,
    price: "R$ 35",
    location: "Centro",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    available: true
  },
  {
    id: 2,
    name: "Maria Santos",
    specialty: "Cabeleireira",
    rating: 4.9,
    reviews: 89,
    price: "R$ 50",
    location: "Bela Vista",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    available: true
  },
  {
    id: 3,
    name: "Carlos Pereira",
    specialty: "Barbeiro",
    rating: 4.7,
    reviews: 156,
    price: "R$ 30",
    location: "Vila Madalena",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    available: false
  }
];

// Mock data for appointments
const myAppointments = [
  {
    id: 1,
    professional: "João Silva",
    service: "Corte Masculino",
    date: "2024-01-20",
    time: "14:00",
    status: "confirmed",
    price: "R$ 35"
  },
  {
    id: 2,
    professional: "Maria Santos",
    service: "Escova",
    date: "2024-01-25",
    time: "16:30",
    status: "pending",
    price: "R$ 40"
  },
  {
    id: 3,
    professional: "Carlos Pereira",
    service: "Barba",
    date: "2024-01-15",
    time: "10:00",
    status: "completed",
    price: "R$ 25"
  }
];

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState<"book" | "professionals" | "appointments" | "profile">("book");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProfessionals = professionals.filter(prof =>
    prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Área do Cliente</h1>
              <p className="text-blue-100 mt-2">Bem-vindo, Ana Costa!</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">3</div>
              <div className="text-blue-100">Agendamentos ativos</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
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
                      <img
                        src={professional.image}
                        alt={professional.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{professional.name}</h3>
                        <p className="text-sm text-muted-foreground">{professional.specialty}</p>
                        <div className="flex items-center mt-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm ml-1">{professional.rating} ({professional.reviews})</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-1 text-muted-foreground" />
                        {professional.location}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-primary">{professional.price}</span>
                        <Badge variant={professional.available ? "default" : "secondary"}>
                          {professional.available ? "Disponível" : "Ocupado"}
                        </Badge>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-gradient-primary hover:bg-primary-hover text-white"
                      disabled={!professional.available}
                    >
                      {professional.available ? "Agendar Agora" : "Indisponível"}
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
                {myAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium text-foreground">{appointment.professional}</p>
                          <p className="text-sm text-muted-foreground">{appointment.service}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-primary font-medium">
                              {new Date(appointment.date).toLocaleDateString('pt-BR')} - {appointment.time}
                            </span>
                            <span className="text-sm font-medium">{appointment.price}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge 
                        variant={
                          appointment.status === 'confirmed' ? 'default' : 
                          appointment.status === 'pending' ? 'secondary' : 
                          'outline'
                        }
                      >
                        {appointment.status === 'confirmed' ? 'Confirmado' : 
                         appointment.status === 'pending' ? 'Pendente' : 
                         'Concluído'}
                      </Badge>
                      {appointment.status !== 'completed' && (
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
                ))}
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
                    <Input defaultValue="Ana Costa" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">E-mail</label>
                    <Input defaultValue="ana@email.com" type="email" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Telefone</label>
                    <Input defaultValue="(11) 99999-9999" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Data de Nascimento</label>
                    <Input type="date" defaultValue="1990-05-15" />
                  </div>
                </div>
                <Button className="bg-gradient-primary hover:bg-primary-hover text-white">
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}