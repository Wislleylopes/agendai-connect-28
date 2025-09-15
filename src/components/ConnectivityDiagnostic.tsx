import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  Wifi, 
  Server, 
  Shield, 
  Globe 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'warning' | 'error' | 'loading';
  message: string;
  details?: string;
}

export const ConnectivityDiagnostic = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateResult = (test: string, status: DiagnosticResult['status'], message: string, details?: string) => {
    setResults(prev => {
      const filtered = prev.filter(r => r.test !== test);
      return [...filtered, { test, status, message, details }];
    });
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);

    // Test 1: Internet Connection
    updateResult('internet', 'loading', 'Verificando conexão com a internet...');
    try {
      const online = navigator.onLine;
      if (online) {
        // Test actual connectivity
        await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors' });
        updateResult('internet', 'success', 'Conexão com a internet funcionando');
      } else {
        updateResult('internet', 'error', 'Sem conexão com a internet');
      }
    } catch (error) {
      updateResult('internet', 'warning', 'Conexão limitada ou instável', error instanceof Error ? error.message : 'Erro desconhecido');
    }

    // Test 2: Supabase URL accessibility
    updateResult('supabase-url', 'loading', 'Testando conectividade com Supabase...');
    try {
      const response = await fetch('https://hjyzakkwpmhcmbqeihjl.supabase.co/rest/v1/', {
        method: 'HEAD',
        signal: AbortSignal.timeout(10000),
      });
      
      if (response.ok || response.status === 401) {
        updateResult('supabase-url', 'success', 'Servidor Supabase acessível');
      } else {
        updateResult('supabase-url', 'warning', `Servidor respondeu com status ${response.status}`, `Status: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      updateResult('supabase-url', 'error', 'Não foi possível conectar ao servidor Supabase', error instanceof Error ? error.message : 'Erro desconhecido');
    }

    // Test 3: Supabase Auth
    updateResult('supabase-auth', 'loading', 'Testando autenticação Supabase...');
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        updateResult('supabase-auth', 'warning', 'Serviço de autenticação com problemas', error.message);
      } else {
        updateResult('supabase-auth', 'success', 'Serviço de autenticação funcionando');
      }
    } catch (error) {
      updateResult('supabase-auth', 'error', 'Erro no serviço de autenticação', error instanceof Error ? error.message : 'Erro desconhecido');
    }

    // Test 4: DNS Resolution
    updateResult('dns', 'loading', 'Verificando resolução DNS...');
    try {
      const start = Date.now();
      await fetch('https://hjyzakkwpmhcmbqeihjl.supabase.co/rest/v1/', { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      });
      const duration = Date.now() - start;
      
      if (duration < 2000) {
        updateResult('dns', 'success', `DNS funcionando (${duration}ms)`);
      } else {
        updateResult('dns', 'warning', `DNS lento (${duration}ms)`, 'Pode indicar problemas de rede');
      }
    } catch (error) {
      updateResult('dns', 'error', 'Problema na resolução DNS', error instanceof Error ? error.message : 'Erro desconhecido');
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'loading':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'loading':
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getTestIcon = (test: string) => {
    switch (test) {
      case 'internet':
        return <Wifi className="w-4 h-4" />;
      case 'supabase-url':
        return <Server className="w-4 h-4" />;
      case 'supabase-auth':
        return <Shield className="w-4 h-4" />;
      case 'dns':
        return <Globe className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const hasErrors = results.some(r => r.status === 'error');
  const hasWarnings = results.some(r => r.status === 'warning');

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="w-5 h-5" />
          Diagnóstico de Conectividade
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Execute este diagnóstico para identificar problemas de conexão
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Button 
          onClick={runDiagnostics} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Executando Diagnóstico...
            </>
          ) : (
            'Executar Diagnóstico'
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((result) => (
              <div key={result.test} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="flex items-center gap-2 mt-0.5">
                  {getTestIcon(result.test)}
                  {getStatusIcon(result.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{result.message}</p>
                    <Badge variant="outline" className={getStatusColor(result.status)}>
                      {result.status}
                    </Badge>
                  </div>
                  
                  {result.details && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {result.details}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {!isRunning && (
              <Alert variant={hasErrors ? 'destructive' : hasWarnings ? 'default' : 'default'}>
                <AlertDescription>
                  {hasErrors ? (
                    <>
                      <strong>Problemas críticos detectados:</strong> Verifique sua conexão de internet e configurações de firewall.
                      Se o problema persistir, entre em contato com o suporte.
                    </>
                  ) : hasWarnings ? (
                    <>
                      <strong>Avisos detectados:</strong> A conexão está funcionando mas pode estar instável.
                      Monitore a situação e tente novamente se necessário.
                    </>
                  ) : (
                    <>
                      <strong>Tudo funcionando:</strong> Não foram detectados problemas de conectividade.
                      Se ainda está enfrentando problemas, tente fazer logout e login novamente.
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};