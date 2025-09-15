import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus,
  Calendar, 
  DollarSign, 
  Clock, 
  Users, 
  Settings,
  Edit,
  Trash2,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  is_active: boolean;
  created_at: string;
}

interface Appointment {
  id: string;
  client_id: string;
  service_id: string;
  appointment_date: string;
  status: string;
  notes?: string;
  services: {
    name: string;
    price: number;
  };
  profiles: {
    full_name: string;
  };
}

export default function ProfessionalDashboard() {
  const { profile, loading } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    price: "",
    duration: ""
  });

  useEffect(() => {
    if (profile?.user_role === 'professional') {
      fetchServices();
      fetchAppointments();
    }
  }, [profile]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('professional_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os serviços.",
        variant: "destructive",
      });
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          services (name, price),
          profiles!appointments_client_id_fkey (full_name)
        `)
        .eq('professional_id', profile?.id)
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os agendamentos.",
        variant: "destructive",
      });
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!serviceForm.name || !serviceForm.price || !serviceForm.duration) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const serviceData = {
        name: serviceForm.name,
        description: serviceForm.description || null,
        price: parseFloat(serviceForm.price),
        duration: parseInt(serviceForm.duration),
        professional_id: profile?.id,
        is_active: true
      };

      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Serviço atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('services')
          .insert([serviceData]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Serviço adicionado com sucesso!",
        });
      }

      setServiceForm({ name: "", description: "", price: "", duration: "" });
      setEditingService(null);
      setIsServiceModalOpen(false);
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o serviço.",
        variant: "destructive",
      });
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      description: service.description || "",
      price: service.price.toString(),
      duration: service.duration.toString()
    });
    setIsServiceModalOpen(true);
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: false })
        .eq('id', serviceId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Serviço desativado com sucesso!",
      });

      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Erro",
        description: "Não foi possível desativar o serviço.",
        variant: "destructive",
      });
    }
  };

  const handleAppointmentStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Status do agendamento atualizado!",
      });

      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o agendamento.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      confirmed: "default",
      completed: "outline",
      cancelled: "destructive"
    } as const;

    const labels = {
      pending: "Pendente",
      confirmed: "Confirmado",
      completed: "Concluído",
      cancelled: "Cancelado"
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handle unauthorized access
  if (!profile || profile.user_role !== 'professional') {
    return <Navigate to="/" replace />;
  }

  const stats = {
    totalServices: services.filter(s => s.is_active).length,
    totalAppointments: appointments.length,
    monthlyRevenue: appointments
      .filter(a => a.status === 'completed')
      .reduce((total, a) => total + (a.services?.price || 0), 0),
    pendingAppointments: appointments.filter(a => a.status === 'pending').length
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Painel do Profissional</h1>
            <p className="text-muted-foreground">Gerencie seus serviços e agendamentos</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Serviços Ativos</p>
                  <p className="text-2xl font-bold">{stats.totalServices}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Agendamentos</p>
                  <p className="text-2xl font-bold">{stats.totalAppointments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold">{stats.pendingAppointments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Services Management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Meus Serviços
              </CardTitle>
              <Dialog open={isServiceModalOpen} onOpenChange={setIsServiceModalOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="flex items-center gap-2"
                    onClick={() => {
                      setEditingService(null);
                      setServiceForm({ name: "", description: "", price: "", duration: "" });
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar novo serviço
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingService ? 'Editar Serviço' : 'Adicionar Novo Serviço'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleServiceSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="service-name">Nome do Serviço *</Label>
                      <Input
                        id="service-name"
                        value={serviceForm.name}
                        onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                        placeholder="Ex: Corte Masculino"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="service-price">Valor (R$) *</Label>
                      <Input
                        id="service-price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={serviceForm.price}
                        onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})}
                        placeholder="35.00"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="service-duration">Duração (minutos) *</Label>
                      <Input
                        id="service-duration"
                        type="number"
                        min="1"
                        value={serviceForm.duration}
                        onChange={(e) => setServiceForm({...serviceForm, duration: e.target.value})}
                        placeholder="60"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="service-description">Descrição</Label>
                      <Textarea
                        id="service-description"
                        value={serviceForm.description}
                        onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                        placeholder="Descrição do serviço (opcional)"
                        maxLength={500}
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {serviceForm.description.length}/500 caracteres
                      </p>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">
                        {editingService ? 'Atualizar' : 'Adicionar'} Serviço
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsServiceModalOpen(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.filter(s => s.is_active).map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-4 border border-card-border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{service.name}</h3>
                      {service.description && (
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-primary font-semibold">
                          {formatCurrency(service.price)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {service.duration} min
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditService(service)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteService(service.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                {services.filter(s => s.is_active).length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum serviço cadastrado ainda.</p>
                    <p className="text-sm">Adicione seu primeiro serviço clicando no botão acima.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Appointments Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Agendamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.slice(0, 5).map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border border-card-border rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold">{appointment.profiles?.full_name}</p>
                      <p className="text-sm text-muted-foreground">{appointment.services?.name}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-primary">
                          {new Date(appointment.appointment_date).toLocaleString('pt-BR')}
                        </span>
                        <span className="text-sm font-medium">
                          {formatCurrency(appointment.services?.price || 0)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(appointment.status)}
                      {appointment.status === 'pending' && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAppointmentStatusUpdate(appointment.id, 'confirmed')}
                            className="p-1"
                          >
                            <CheckCircle className="w-4 h-4 text-success" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAppointmentStatusUpdate(appointment.id, 'cancelled')}
                            className="p-1"
                          >
                            <XCircle className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {appointments.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum agendamento encontrado.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}