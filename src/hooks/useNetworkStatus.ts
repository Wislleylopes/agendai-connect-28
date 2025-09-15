import { useState, useEffect } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  isConnectedToSupabase: boolean;
  lastChecked: Date | null;
  error: string | null;
}

export const useNetworkStatus = () => {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isConnectedToSupabase: false,
    lastChecked: null,
    error: null,
  });

  const checkSupabaseConnectivity = async (): Promise<boolean> => {
    try {
      // Test basic connectivity to Supabase
      const response = await fetch('https://hjyzakkwpmhcmbqeihjl.supabase.co/rest/v1/', {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      
      return response.ok || response.status === 401; // 401 is expected without auth
    } catch (error) {
      console.error('Supabase connectivity check failed:', error);
      return false;
    }
  };

  const updateStatus = async () => {
    const isOnline = navigator.onLine;
    let isConnectedToSupabase = false;
    let error: string | null = null;

    if (isOnline) {
      try {
        isConnectedToSupabase = await checkSupabaseConnectivity();
        if (!isConnectedToSupabase) {
          error = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
        }
      } catch (err) {
        error = 'Erro ao verificar conectividade com o servidor.';
        console.error('Network status check error:', err);
      }
    } else {
      error = 'Sem conexão com a internet.';
    }

    setStatus({
      isOnline,
      isConnectedToSupabase,
      lastChecked: new Date(),
      error,
    });
  };

  useEffect(() => {
    // Initial check
    updateStatus();

    // Listen for online/offline events
    const handleOnline = () => updateStatus();
    const handleOffline = () => updateStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic check every 30 seconds
    const interval = setInterval(updateStatus, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return { status, checkConnectivity: updateStatus };
};