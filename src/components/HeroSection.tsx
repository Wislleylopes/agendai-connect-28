import { Button } from "@/components/ui/button";
import { Calendar, Users, BarChart3, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

export const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-primary-light to-background py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                Agendamentos{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Inteligentes
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Conecte clientes e profissionais de forma simples e eficiente. 
                Gerencie horários, analise desempenho e faça seu negócio crescer.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/cadastro/cliente">
                <Button 
                  size="lg" 
                  className="bg-gradient-primary hover:bg-primary-hover text-white shadow-blue px-8 py-6 text-lg"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Sou Cliente
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/cadastro/profissional">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-6 text-lg"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Sou Profissional
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-card-border">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">1000+</div>
                <div className="text-sm text-muted-foreground">Profissionais</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">5000+</div>
                <div className="text-sm text-muted-foreground">Agendamentos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">4.9★</div>
                <div className="text-sm text-muted-foreground">Avaliação</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <img 
                src={heroImage} 
                alt="AgendAI Dashboard" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
            </div>
            
            {/* Floating Card */}
            <div className="absolute -bottom-6 -left-6 bg-background p-6 rounded-xl shadow-lg border border-card-border">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Agendamento Confirmado!</div>
                  <div className="text-sm text-muted-foreground">João Silva - 14:00</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};