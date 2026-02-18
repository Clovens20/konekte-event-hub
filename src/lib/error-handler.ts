import { PostgrestError } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

export interface AppError {
  message: string;
  code?: string;
  details?: string;
  retryable?: boolean;
}

/**
 * Convertit une erreur Supabase en erreur applicative standardisée
 */
export const handleSupabaseError = (error: PostgrestError | Error | unknown): AppError => {
  if (error instanceof Error) {
    // Erreur réseau ou autre erreur JavaScript
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return {
        message: 'Erè koneksyon. Tcheke koneksyon entènèt w.',
        code: 'NETWORK_ERROR',
        retryable: true,
      };
    }
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
    };
  }

  // Erreur Supabase PostgrestError
  const pgError = error as PostgrestError;
  
  switch (pgError.code) {
    case 'PGRST116':
      return {
        message: 'Pa jwenn okenn rezilta.',
        code: pgError.code,
        details: pgError.details,
      };
    case '23505':
      return {
        message: 'Antre sa a egziste deja (doublon).',
        code: pgError.code,
        details: pgError.details,
      };
    case '23503':
      return {
        message: 'Referans pa valid. Tcheke done yo.',
        code: pgError.code,
        details: pgError.details,
      };
    case '42501':
      return {
        message: 'Aksè pa otorize.',
        code: pgError.code,
        details: pgError.details,
      };
    default:
      return {
        message: pgError.message || 'Yon erè rive.',
        code: pgError.code,
        details: pgError.details,
        retryable: !pgError.code || pgError.code.startsWith('PGRST'),
      };
  }
};

/**
 * Affiche une erreur à l'utilisateur via toast
 */
export const showError = (error: AppError | Error | unknown, title = 'Erè') => {
  const appError = error instanceof Error 
    ? { message: error.message, code: 'UNKNOWN_ERROR' }
    : handleSupabaseError(error);
  
  toast({
    title,
    description: appError.message,
    variant: 'destructive',
  });
};

/**
 * Log une erreur pour le debugging (en développement)
 */
export const logError = (error: AppError | Error | unknown, context?: string) => {
  if (import.meta.env.DEV) {
    const appError = error instanceof Error
      ? { message: error.message, code: 'UNKNOWN_ERROR' }
      : handleSupabaseError(error);
    
    console.error(`[${context || 'Error'}]`, {
      ...appError,
      originalError: error,
    });
  }
};

