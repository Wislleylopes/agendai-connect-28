export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  shouldRetry?: (error: any) => boolean;
}

const defaultOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2,
  shouldRetry: (error: any) => {
    // Retry on network errors, timeouts, and server errors
    return (
      error?.message?.includes('NetworkError') ||
      error?.message?.includes('fetch') ||
      error?.message?.includes('timeout') ||
      error?.code === 'NETWORK_ERROR' ||
      error?.status >= 500
    );
  },
};

export const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const config = { ...defaultOptions, ...options };
  let lastError: any;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      console.log(`Tentativa ${attempt}/${config.maxAttempts}...`);
      return await operation();
    } catch (error) {
      lastError = error;
      console.error(`Tentativa ${attempt} falhou:`, error);

      // Don't retry if it's the last attempt or if we shouldn't retry this error
      if (attempt === config.maxAttempts || !config.shouldRetry(error)) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffFactor, attempt - 1),
        config.maxDelay
      );

      console.log(`Aguardando ${delay}ms antes da próxima tentativa...`);
      await sleep(delay);
    }
  }

  throw lastError;
};

export const createTimeoutPromise = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage = 'Operação expirou'
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    ),
  ]);
};

export const isNetworkError = (error: any): boolean => {
  if (!error) return false;
  
  const errorString = error.toString().toLowerCase();
  const message = error.message?.toLowerCase() || '';
  
  return (
    errorString.includes('networkerror') ||
    errorString.includes('fetch') ||
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('timeout') ||
    message.includes('connection') ||
    error.code === 'NETWORK_ERROR' ||
    error.name === 'NetworkError'
  );
};

export const getErrorMessage = (error: any): string => {
  if (isNetworkError(error)) {
    return 'Problema de conexão. Verifique sua internet e tente novamente.';
  }

  if (error?.message === 'Invalid login credentials') {
    return 'Email ou senha incorretos. Verifique suas credenciais.';
  }

  if (error?.message?.includes('Email not confirmed')) {
    return 'Email não confirmado. Verifique sua caixa de entrada.';
  }

  if (error?.message?.includes('User not found')) {
    return 'Usuário não encontrado. Verifique o email digitado.';
  }

  if (error?.message?.includes('Password should be at least')) {
    return 'A senha deve ter pelo menos 6 caracteres.';
  }

  return error?.message || 'Ocorreu um erro inesperado. Tente novamente.';
};