import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Eye, EyeOff, ArrowLeft, User, Building } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [clientForm, setClientForm] = useState({
    fullName: '',
    email: '',
    password: '',
    address: ''
  });

  const [professionalForm, setProfessionalForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    companyName: '',
    cnpj: '',
    companyAddress: ''
  });

  const handleClientSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signUp(clientForm.email, clientForm.password, {
        full_name: clientForm.fullName,
        user_role: 'client',
        address: clientForm.address
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

  const handleProfessionalSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signUp(professionalForm.email, professionalForm.password, {
        full_name: professionalForm.fullName,
        user_role: 'professional',
        phone: professionalForm.phone,
        company_name: professionalForm.companyName,
        cnpj: professionalForm.cnpj,
        company_address: professionalForm.companyAddress
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
                <form onSubmit={handleClientSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-name">Nome Completo *</Label>
                    <Input
                      id="client-name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={clientForm.fullName}
                      onChange={(e) => setClientForm(prev => ({ ...prev, fullName: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client-email-signup">E-mail *</Label>
                    <Input
                      id="client-email-signup"
                      type="email"
                      placeholder="seu@email.com"
                      value={clientForm.email}
                      onChange={(e) => setClientForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client-address">Endereço Completo *</Label>
                    <Input
                      id="client-address"
                      type="text"
                      placeholder="Rua, número, bairro, cidade"
                      value={clientForm.address}
                      onChange={(e) => setClientForm(prev => ({ ...prev, address: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="client-password-signup">Senha *</Label>
                    <div className="relative">
                      <Input
                        id="client-password-signup"
                        type={showPassword ? "text" : "password"}
                        placeholder="Sua senha"
                        value={clientForm.password}
                        onChange={(e) => setClientForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary hover:bg-primary-hover text-white"
                    disabled={loading}
                  >
                    {loading ? "Criando conta..." : "Cadastrar como Cliente"}
                  </Button>
                </form>
              </TabsContent>

              {/* Professional Registration */}
              <TabsContent value="professional" className="space-y-4">
                <form onSubmit={handleProfessionalSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="prof-name">Nome Completo *</Label>
                    <Input
                      id="prof-name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={professionalForm.fullName}
                      onChange={(e) => setProfessionalForm(prev => ({ ...prev, fullName: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prof-email-signup">E-mail *</Label>
                    <Input
                      id="prof-email-signup"
                      type="email"
                      placeholder="seu@email.com"
                      value={professionalForm.email}
                      onChange={(e) => setProfessionalForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prof-phone">Telefone *</Label>
                    <Input
                      id="prof-phone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={professionalForm.phone}
                      onChange={(e) => setProfessionalForm(prev => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-name">Nome da Empresa *</Label>
                    <Input
                      id="company-name"
                      type="text"
                      placeholder="Nome da sua empresa"
                      value={professionalForm.companyName}
                      onChange={(e) => setProfessionalForm(prev => ({ ...prev, companyName: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      type="text"
                      placeholder="00.000.000/0000-00"
                      value={professionalForm.cnpj}
                      onChange={(e) => setProfessionalForm(prev => ({ ...prev, cnpj: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-address">Endereço da Empresa *</Label>
                    <Input
                      id="company-address"
                      type="text"
                      placeholder="Endereço completo da empresa"
                      value={professionalForm.companyAddress}
                      onChange={(e) => setProfessionalForm(prev => ({ ...prev, companyAddress: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="prof-password-signup">Senha *</Label>
                    <div className="relative">
                      <Input
                        id="prof-password-signup"
                        type={showPassword ? "text" : "password"}
                        placeholder="Sua senha"
                        value={professionalForm.password}
                        onChange={(e) => setProfessionalForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary hover:bg-primary-hover text-white"
                    disabled={loading}
                  >
                    {loading ? "Criando conta..." : "Cadastrar como Profissional"}
                  </Button>
                </form>
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