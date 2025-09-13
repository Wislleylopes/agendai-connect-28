import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, BarChart3, Users, CheckCircle, Star, Clock } from "lucide-react";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "how-it-works" | "for-professionals" | "for-clients";
}

export const InfoModal = ({ isOpen, onClose, type }: InfoModalProps) => {
  const getModalContent = () => {
    switch (type) {
      case "how-it-works":
        return {
          title: "Como Funciona",
          content: (
            <div className="space-y-6">
              <DialogDescription className="text-base leading-relaxed">
                O AgendAI conecta clientes e profissionais com facilidade. O cliente escolhe o serviço desejado, 
                verifica os profissionais disponíveis e agenda com poucos cliques. O profissional é notificado e 
                pode aceitar ou ajustar o horário. Todo o processo é registrado, permitindo controle e praticidade 
                para ambos os lados.
              </DialogDescription>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="text-center p-4">
                  <CardContent className="space-y-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold">1. Escolha</h4>
                    <p className="text-sm text-muted-foreground">
                      Navegue pelos profissionais e serviços disponíveis
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="text-center p-4">
                  <CardContent className="space-y-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold">2. Agende</h4>
                    <p className="text-sm text-muted-foreground">
                      Selecione data, horário e confirme seu agendamento
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="text-center p-4">
                  <CardContent className="space-y-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold">3. Confirme</h4>
                    <p className="text-sm text-muted-foreground">
                      Receba confirmação e gerencie seus agendamentos
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )
        };
        
      case "for-professionals":
        return {
          title: "Para Profissionais",
          content: (
            <div className="space-y-4">
              <DialogDescription className="text-base">
                Se você é um profissional, o AgendAI permite:
              </DialogDescription>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">Criar um perfil completo</h4>
                    <p className="text-sm text-muted-foreground">
                      Descrição, serviços oferecidos e disponibilidade personalizada
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">Gerenciar agendamentos</h4>
                    <p className="text-sm text-muted-foreground">
                      Visualizar e gerenciar todos os agendamentos recebidos
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">Dashboard analítico</h4>
                    <p className="text-sm text-muted-foreground">
                      Gráficos interativos de produtividade e performance
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">Controle de ganhos</h4>
                    <p className="text-sm text-muted-foreground">
                      Visualizar ganhos em tempo real com filtros por período
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">Sistema de avaliações</h4>
                    <p className="text-sm text-muted-foreground">
                      Receber avaliações dos clientes e se destacar na plataforma
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        };
        
      case "for-clients":
        return {
          title: "Para Clientes",
          content: (
            <div className="space-y-4">
              <DialogDescription className="text-base">
                Como cliente, você pode:
              </DialogDescription>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">Criar sua conta facilmente</h4>
                    <p className="text-sm text-muted-foreground">
                      Cadastro rápido e simples com poucos cliques
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">Buscar profissionais</h4>
                    <p className="text-sm text-muted-foreground">
                      Filtrar por serviço, avaliação, região e outros critérios
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">Verificar avaliações</h4>
                    <p className="text-sm text-muted-foreground">
                      Ler avaliações e comentários de outros clientes
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">Agendar diretamente</h4>
                    <p className="text-sm text-muted-foreground">
                      Escolher e agendar com o profissional de sua preferência
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">Acompanhar agendamentos</h4>
                    <p className="text-sm text-muted-foreground">
                      Visualizar histórico e agendamentos futuros na sua área pessoal
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        };
        
      default:
        return { title: "", content: null };
    }
  };

  const { title, content } = getModalContent();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">{title}</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};