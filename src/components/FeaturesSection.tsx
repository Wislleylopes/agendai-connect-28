import { Calendar, BarChart3, Users, Clock, Star, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import dashboardIcon from "@/assets/dashboard-icon.jpg";
import calendarIcon from "@/assets/calendar-icon.jpg";

const features = [
  {
    icon: Calendar,
    title: "Agendamento Simples",
    description: "Interface intuitiva para agendar serviços em poucos cliques. Calendário integrado e confirmações automáticas.",
    image: calendarIcon
  },
  {
    icon: BarChart3,
    title: "Dashboard Analítico",
    description: "Visualize seu desempenho com gráficos interativos. Acompanhe ganhos, clientes e avaliações em tempo real.",
    image: dashboardIcon
  },
  {
    icon: Users,
    title: "Gestão de Clientes",
    description: "Mantenha o histórico completo de seus clientes. Notas, preferências e comunicação centralizada.",
  },
  {
    icon: Clock,
    title: "Horários Flexíveis",
    description: "Defina sua disponibilidade e deixe os clientes escolherem os melhores horários para ambos.",
  },
  {
    icon: Star,
    title: "Sistema de Avaliações",
    description: "Construa sua reputação com avaliações genuínas. Feedback que ajuda a melhorar seus serviços.",
  },
  {
    icon: Shield,
    title: "Pagamentos Seguros",
    description: "Transações protegidas e controle financeiro completo. Receba com segurança e pontualidade.",
  }
];

export const FeaturesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
            Tudo que você precisa em{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              uma plataforma
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            AgendAI oferece ferramentas completas para profissionais e clientes, 
            simplificando o processo de agendamento e gestão de serviços.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg transition-all duration-300 border-card-border bg-gradient-card"
            >
              <CardContent className="p-8 space-y-4">
                {feature.image ? (
                  <div className="w-16 h-16 rounded-xl overflow-hidden">
                    <img 
                      src={feature.image} 
                      alt={feature.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-primary-light rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <feature.icon className="w-8 h-8 text-primary group-hover:text-white" />
                  </div>
                )}
                
                <h3 className="text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-primary p-8 rounded-2xl text-white">
            <h3 className="text-2xl font-bold mb-4">
              Pronto para começar?
            </h3>
            <p className="text-lg opacity-90 mb-6">
              Junte-se a milhares de profissionais que já usam o AgendAI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Cadastre-se Grátis
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors">
                Ver Demonstração
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};