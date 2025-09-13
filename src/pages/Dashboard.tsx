import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Star, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  XCircle 
} from "lucide-react";

// Mock data for charts
const revenueData = [
  { month: 'Jan', revenue: 2400, services: 24 },
  { month: 'Fev', revenue: 1398, services: 14 },
  { month: 'Mar', revenue: 9800, services: 98 },
  { month: 'Abr', revenue: 3908, services: 39 },
  { month: 'Mai', revenue: 4800, services: 48 },
  { month: 'Jun', revenue: 3800, services: 38 },
];

const servicesData = [
  { name: 'Corte Masculino', value: 45, color: '#007BFF' },
  { name: 'Barba', value: 25, color: '#17A2B8' },
  { name: 'Sobrancelha', value: 20, color: '#28A745' },
  { name: 'Outros', value: 10, color: '#FFC107' },
];

const upcomingAppointments = [
  { id: 1, client: 'João Silva', service: 'Corte Masculino', time: '09:00', status: 'confirmed' },
  { id: 2, client: 'Maria Santos', service: 'Escova', time: '10:30', status: 'pending' },
  { id: 3, client: 'Pedro Costa', service: 'Barba', time: '14:00', status: 'confirmed' },
  { id: 4, client: 'Ana Lima', service: 'Sobrancelha', time: '15:30', status: 'confirmed' },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-blue-100 mt-2">Bem-vindo de volta, Carlos Barbeiro!</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">R$ 4.800</div>
              <div className="text-blue-100">Ganhos este mês</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Agendamentos Hoje</p>
                  <p className="text-2xl font-bold text-foreground">8</p>
                </div>
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-success mr-1" />
                <span className="text-sm text-success">+12%</span>
                <span className="text-sm text-muted-foreground ml-1">vs ontem</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Receita Mensal</p>
                  <p className="text-2xl font-bold text-foreground">R$ 4.800</p>
                </div>
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-success mr-1" />
                <span className="text-sm text-success">+26%</span>
                <span className="text-sm text-muted-foreground ml-1">vs mês anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avaliação Média</p>
                  <p className="text-2xl font-bold text-foreground">4.8</p>
                </div>
                <Star className="w-8 h-8 text-primary" />
              </div>
              <div className="flex items-center mt-2">
                <div className="flex">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className={`w-4 h-4 ${star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground ml-2">156 avaliações</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Clientes Únicos</p>
                  <p className="text-2xl font-bold text-foreground">142</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-success mr-1" />
                <span className="text-sm text-success">+8%</span>
                <span className="text-sm text-muted-foreground ml-1">novos este mês</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                  Evolução da Receita
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                    <XAxis dataKey="month" stroke="#666666" />
                    <YAxis stroke="#666666" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E5E5E5',
                        borderRadius: '8px'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#007BFF" 
                      strokeWidth={3}
                      dot={{ fill: '#007BFF', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Services Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart className="w-5 h-5 mr-2 text-primary" />
                  Serviços por Mês
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                    <XAxis dataKey="month" stroke="#666666" />
                    <YAxis stroke="#666666" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E5E5E5',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="services" fill="#007BFF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Services Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Serviços</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={servicesData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {servicesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {servicesData.map((service, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: service.color }}
                        />
                        <span className="text-sm text-muted-foreground">{service.name}</span>
                      </div>
                      <span className="text-sm font-medium">{service.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-primary" />
                  Próximos Agendamentos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{appointment.client}</p>
                      <p className="text-sm text-muted-foreground">{appointment.service}</p>
                      <p className="text-sm text-primary font-medium">{appointment.time}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                        {appointment.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost" className="p-1">
                          <CheckCircle className="w-4 h-4 text-success" />
                        </Button>
                        <Button size="sm" variant="ghost" className="p-1">
                          <XCircle className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}