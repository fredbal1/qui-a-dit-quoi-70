
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useErrorMonitoring } from '@/hooks/useErrorMonitoring';

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  showToast?: boolean;
}

export const useRetryOperation = () => {
  const [retrying, setRetrying] = useState(false);
  const { toast } = useToast();
  const { logError } = useErrorMonitoring();

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<{ success: boolean; data?: T; error?: string }> => {
    const { maxRetries = 3, retryDelay = 1000, showToast = true } = options;
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        setRetrying(attempt > 0);
        
        if (attempt > 0) {
          // Attendre avant de réessayer
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
          
          if (showToast) {
            toast({
              title: `Tentative ${attempt + 1}/${maxRetries + 1}`,
              description: "Nouvel essai en cours...",
            });
          }
        }

        const result = await operation();
        setRetrying(false);
        
        if (attempt > 0 && showToast) {
          toast({
            title: "✅ Succès !",
            description: "L'opération a réussi après plusieurs tentatives",
          });
        }
        
        return { success: true, data: result };
      } catch (error: any) {
        lastError = error;
        
        logError({
          type: 'network',
          message: `Tentative ${attempt + 1} échouée: ${error.message}`,
          context: { attempt, maxRetries, operation: operation.name },
          timestamp: new Date().toISOString()
        });

        if (attempt === maxRetries) {
          setRetrying(false);
          
          if (showToast) {
            toast({
              title: "❌ Échec définitif",
              description: `L'opération a échoué après ${maxRetries + 1} tentatives`,
              variant: "destructive"
            });
          }
        }
      }
    }

    return { 
      success: false, 
      error: lastError?.message || 'Opération échouée après plusieurs tentatives' 
    };
  }, [toast, logError]);

  return {
    executeWithRetry,
    retrying
  };
};
