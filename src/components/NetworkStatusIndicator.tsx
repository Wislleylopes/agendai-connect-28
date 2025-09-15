import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export const NetworkStatusIndicator = () => {
  const { status, checkConnectivity } = useNetworkStatus();
  const [isChecking, setIsChecking] = useState(false);

  const handleRecheck = async () => {
    setIsChecking(true);
    await checkConnectivity();
    setIsChecking(false);
  };

  // Don't show indicator if everything is working fine
  if (status.isOnline && status.isConnectedToSupabase && !status.error) {
    return null;
  }

  const getStatusInfo = () => {
    if (!status.isOnline) {
      return {
        icon: WifiOff,
        variant: 'destructive' as const,
        title: 'Sem conexão com a internet',
        description: 'Verifique sua conexão de rede e tente novamente.',
      };
    }

    if (!status.isConnectedToSupabase) {
      return {
        icon: AlertTriangle,
        variant: 'destructive' as const,
        title: 'Problema de conectividade',
        description: status.error || 'Não foi possível conectar ao servidor.',
      };
    }

    return {
      icon: Wifi,
      variant: 'default' as const,
      title: 'Conectado',
      description: 'Conexão estabelecida com sucesso.',
    };
  };

  const { icon: Icon, variant, title, description } = getStatusInfo();

  return (
    <Alert variant={variant} className="mb-4">
      <Icon className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-sm">{description}</div>
          {status.lastChecked && (
            <div className="text-xs text-muted-foreground mt-1">
              Última verificação: {status.lastChecked.toLocaleTimeString()}
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRecheck}
          disabled={isChecking}
          className="ml-4"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
          Verificar
        </Button>
      </AlertDescription>
    </Alert>
  );
};