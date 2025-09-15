import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { withRetry, createTimeoutPromise, getErrorMessage, isNetworkError } from '@/utils/retryUtils';

interface Profile {
  id: string;
  user_id: string;
  user_role: 'client' | 'professional' | 'admin';
  full_name: string;
  phone?: string;
  address?: string;
  theme_preference: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  networkError: string | null;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: any }>;
  retryLastOperation: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [lastFailedOperation, setLastFailedOperation] = useState<(() => Promise<any>) | null>(null);
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      const operation = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error) throw error;
        return data;
      };

      const data = await withRetry(operation, {
        maxAttempts: 3,
        shouldRetry: (error) => isNetworkError(error)
      });
      
      setProfile(data);
      setNetworkError(null);
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (isNetworkError(error)) {
        setNetworkError(getErrorMessage(error));
        setLastFailedOperation(() => () => fetchProfile(userId));
      }
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session);
        
        // Don't process auth changes during sign out
        if (isSigningOut && event !== 'SIGNED_OUT') {
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && !isSigningOut) {
          setTimeout(() => fetchProfile(session.user.id), 0);
        } else {
          setProfile(null);
        }
        
        // Reset signing out flag after SIGNED_OUT event
        if (event === 'SIGNED_OUT') {
          setIsSigningOut(false);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session only on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isSigningOut) {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isSigningOut]);

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const operation = async () => {
        const { error } = await createTimeoutPromise(
          supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: redirectUrl,
              data: userData
            }
          }),
          15000 // 15 second timeout for sign up
        );

        if (error) throw error;
        return { error: null };
      };

      const result = await withRetry(operation, {
        maxAttempts: 2, // Fewer retries for sign up
        shouldRetry: (error) => isNetworkError(error)
      });

      toast({
        title: "Cadastro realizado!",
        description: "Verifique seu e-mail para confirmar o cadastro.",
      });

      setNetworkError(null);
      return result;
    } catch (error: any) {
      const friendlyMessage = getErrorMessage(error);
      
      if (isNetworkError(error)) {
        setNetworkError(friendlyMessage);
        setLastFailedOperation(() => () => signUp(email, password, userData));
      }
      
      return { error: { ...error, message: friendlyMessage } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Iniciando processo de login...');
      
      const operation = async () => {
        console.log('Tentando fazer login...');
        const { error } = await createTimeoutPromise(
          supabase.auth.signInWithPassword({
            email,
            password,
          }),
          15000 // 15 second timeout
        );

        if (error) {
          console.error('Erro no login:', error);
          throw error;
        }
        console.log('Login realizado com sucesso');
        return { error: null };
      };

      const result = await withRetry(operation, {
        maxAttempts: 3,
        shouldRetry: (error) => isNetworkError(error),
        baseDelay: 2000, // 2 seconds between retries
      });

      setNetworkError(null);
      setLastFailedOperation(null);
      return result;
    } catch (error: any) {
      console.error('Erro final no login:', error);
      const friendlyMessage = getErrorMessage(error);
      
      if (isNetworkError(error)) {
        setNetworkError(friendlyMessage);
        setLastFailedOperation(() => () => signIn(email, password));
        
        toast({
          title: "Erro de Conexão",
          description: "Problema de rede detectado. Você pode tentar novamente.",
          variant: "destructive",
        });
      }
      
      return { error: { ...error, message: friendlyMessage } };
    }
  };

  const signOut = async () => {
    try {
      console.log('Iniciando processo de logout...');
      setIsSigningOut(true);
      
      // Clear local state immediately
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Clear localStorage to prevent auto-login
      localStorage.removeItem('supabase.auth.token');
      localStorage.clear();
      
      // Call Supabase signOut
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('Error signing out from Supabase:', error);
      }
      
      console.log('Logout concluído');
    } catch (error) {
      console.error('Error during signOut:', error);
    } finally {
      // Ensure state is cleared regardless of errors
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsSigningOut(false);
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    try {
      if (!user) throw new Error('Usuário não autenticado');

      const operation = async () => {
        const { error } = await supabase
          .from('profiles')
          .update(data)
          .eq('user_id', user.id);

        if (error) throw error;
        return { error: null };
      };

      const result = await withRetry(operation, {
        maxAttempts: 3,
        shouldRetry: (error) => isNetworkError(error)
      });

      // Update local profile state
      setProfile(prev => prev ? { ...prev, ...data } : null);
      setNetworkError(null);
      
      return result;
    } catch (error: any) {
      const friendlyMessage = getErrorMessage(error);
      
      if (isNetworkError(error)) {
        setNetworkError(friendlyMessage);
        setLastFailedOperation(() => () => updateProfile(data));
      }
      
      return { error: { ...error, message: friendlyMessage } };
    }
  };

  const retryLastOperation = async () => {
    if (lastFailedOperation) {
      try {
        await lastFailedOperation();
        setLastFailedOperation(null);
        setNetworkError(null);
        toast({
          title: "Operação realizada",
          description: "A operação foi concluída com sucesso.",
        });
      } catch (error: any) {
        console.error('Retry failed:', error);
        toast({
          title: "Erro ao tentar novamente",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    networkError,
    signUp,
    signIn,
    signOut,
    updateProfile,
    retryLastOperation,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};