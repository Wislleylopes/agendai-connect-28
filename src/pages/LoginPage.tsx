import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Eye, EyeOff, ArrowLeft, RefreshCw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { NetworkStatusIndicator } from "@/components/NetworkStatusIndicator";
import { isNetworkError } from "@/utils/retryUtils";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clientForm, setClientForm] = useState({ email: '', password: '' });
  const [professionalForm, setProfessionalForm] = useState({ email: '', password: '' });
  const [lastAttemptedLogin, setLastAttemptedLogin] = useState<{ email: string; password: string; userType: 'client' | 'professional' } | null>(null);
  const { signIn, user, profile, networkError, retryLastOperation } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user && profile) {
      switch (profile.user_role) {
        case 'admin':
          navigate('/admin-dashboard');
          break;
        case 'professional':
          navigate('/professional-dashboard');
          break;
        case 'client':
          navigate('/cliente-dashboard');
          break;
        default:
          navigate('/');
      }
    }
  }, [user, profile, navigate]);

  const handleLogin = async (e: React.FormEvent, userType: 'client' | 'professional') => {
    e.preventDefault();
    setLoading(true);

    const form = userType === 'client' ? clientForm : professionalForm;
    setLastAttemptedLogin({ email: form.email, password: form.password, userType });

    try {
      const { error } = await signIn(form.email, form.password);

      if (error) {
        // Only show toast for non-network errors (network errors are handled in AuthContext)
        if (!isNetworkError(error)) {
          toast({
            title: "Erro no login",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error during login:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryLogin = async () => {
    if (lastAttemptedLogin) {
      setLoading(true);
      try {
        const { error } = await signIn(lastAttemptedLogin.email, lastAttemptedLogin.password);
        
        if (error && !isNetworkError(error)) {
          toast({
            title: "Erro no login",
            description: error.message,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error during retry login:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Início
        </Link>

        {/* Network Status Indicator */}
        <NetworkStatusIndicator />

        <Card className="border-card-border shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Entrar no AgendAI
            </CardTitle>
            <p className="text-muted-foreground">
              Acesse sua conta para gerenciar agendamentos
            </p>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="client" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="client">Cliente</TabsTrigger>
                <TabsTrigger value="professional">Profissional</TabsTrigger>
              </TabsList>

              {/* Client Login */}
              <TabsContent value="client" className="space-y-4">
                <form onSubmit={(e) => handleLogin(e, 'client')} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-email">E-mail</Label>
                    <Input
                      id="client-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={clientForm.email}
                      onChange={(e) => setClientForm(prev => ({ ...prev, email: e.target.value }))}
                      className="border-input"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="client-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="client-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Sua senha"
                        value={clientForm.password}
                        onChange={(e) => setClientForm(prev => ({ ...prev, password: e.target.value }))}
                        className="border-input pr-10"
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

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="remember-client" className="rounded" />
                      <Label htmlFor="remember-client" className="text-sm">Lembrar-me</Label>
                    </div>
                    <Link to="/esqueci-senha" className="text-sm text-primary hover:underline">
                      Esqueci minha senha
                    </Link>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary hover:bg-primary-hover text-white"
                    disabled={loading}
                  >
                    {loading ? "Entrando..." : "Entrar como Cliente"}
                  </Button>

                  {/* Retry button for network errors */}
                  {networkError && lastAttemptedLogin && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleRetryLogin}
                      disabled={loading}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Tentar Novamente
                    </Button>
                  )}
                </form>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Não tem uma conta?{" "}
                    <Link to="/signup" className="text-primary hover:underline font-medium">
                      Cadastre-se aqui
                    </Link>
                  </p>
                </div>
              </TabsContent>

              {/* Professional Login */}
              <TabsContent value="professional" className="space-y-4">
                <form onSubmit={(e) => handleLogin(e, 'professional')} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="prof-email">E-mail</Label>
                    <Input
                      id="prof-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={professionalForm.email}
                      onChange={(e) => setProfessionalForm(prev => ({ ...prev, email: e.target.value }))}
                      className="border-input"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="prof-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="prof-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Sua senha"
                        value={professionalForm.password}
                        onChange={(e) => setProfessionalForm(prev => ({ ...prev, password: e.target.value }))}
                        className="border-input pr-10"
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

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="remember-prof" className="rounded" />
                      <Label htmlFor="remember-prof" className="text-sm">Lembrar-me</Label>
                    </div>
                    <Link to="/esqueci-senha" className="text-sm text-primary hover:underline">
                      Esqueci minha senha
                    </Link>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary hover:bg-primary-hover text-white"
                    disabled={loading}
                  >
                    {loading ? "Entrando..." : "Entrar como Profissional"}
                  </Button>

                  {/* Retry button for network errors */}
                  {networkError && lastAttemptedLogin && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleRetryLogin}
                      disabled={loading}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Tentar Novamente
                    </Button>
                  )}
                </form>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Não tem uma conta?{" "}
                    <Link to="/signup" className="text-primary hover:underline font-medium">
                      Cadastre-se aqui
                    </Link>
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Social Login */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-card-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-background px-2 text-muted-foreground">Ou continue com</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <Button variant="outline" className="border-card-border">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>
                <Button variant="outline" className="border-card-border">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}