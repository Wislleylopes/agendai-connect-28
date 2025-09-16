import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ArrowLeft, User, Building } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { SignUpForm } from "@/components/forms/SignUpForm";
import { ClientSignUpData, ProfessionalSignUpData } from "@/schemas/authSchemas";

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleClientSignUp = async (data: ClientSignUpData) => {
    setLoading(true);

    try {
      const { error } = await signUp(data.email, data.password, {
        full_name: data.fullName,
        user_role: 'client',
        address: data.address
      });

      if (error) {
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive",
        });
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error during client signup:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfessionalSignUp = async (data: ProfessionalSignUpData) => {
    setLoading(true);

    try {
      const { error } = await signUp(data.email, data.password, {
        full_name: data.fullName,
        user_role: 'professional',
        phone: data.phone,
        company_name: data.companyName,
        cnpj: data.cnpj,
        company_address: data.companyAddress
      });

      if (error) {
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive",
        });
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error during professional signup:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Início
        </Link>

        <Card className="border-card-border shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Criar Conta no AgendAI
            </CardTitle>
            <p className="text-muted-foreground">
              Escolha o tipo de conta que deseja criar
            </p>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="client" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="client" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Cliente
                </TabsTrigger>
                <TabsTrigger value="professional" className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Profissional
                </TabsTrigger>
              </TabsList>

              {/* Client Registration */}
              <TabsContent value="client" className="space-y-4">
                <SignUpForm 
                  userType="client" 
                  onSubmit={handleClientSignUp} 
                  loading={loading} 
                />
              </TabsContent>

              {/* Professional Registration */}
              <TabsContent value="professional" className="space-y-4">
                <SignUpForm 
                  userType="professional" 
                  onSubmit={handleProfessionalSignUp} 
                  loading={loading} 
                />
              </TabsContent>
            </Tabs>

            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Faça login aqui
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}