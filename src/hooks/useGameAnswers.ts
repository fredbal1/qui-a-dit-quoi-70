
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRetryOperation } from '@/hooks/useRetryOperation';
import { useErrorMonitoring } from '@/hooks/useErrorMonitoring';

export const useGameAnswers = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { executeWithRetry } = useRetryOperation();
  const { logError, logGameAction } = useErrorMonitoring();

  const submitAnswer = async (roundId: string, content: string, isBluff: boolean = false) => {
    try {
      setLoading(true);
      logGameAction('submit_answer', roundId);

      // Validation côté client
      if (!content.trim()) {
        toast({
          title: "Réponse vide",
          description: "Veuillez saisir une réponse avant de valider",
          variant: "destructive"
        });
        return { success: false, error: "Réponse vide" };
      }

      if (content.length > 500) {
        toast({
          title: "Réponse trop longue",
          description: "La réponse ne peut pas dépasser 500 caractères",
          variant: "destructive"
        });
        return { success: false, error: "Réponse trop longue" };
      }

      const operation = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Utilisateur non connecté');
        }

        const { error } = await supabase
          .from('answers')
          .insert({
            player_id: user.id,
            round_id: roundId,
            content: content.trim(),
            is_bluff: isBluff,
            timestamp: new Date().toISOString()
          });

        if (error) throw error;
        return true;
      };

      const result = await executeWithRetry(operation, { maxRetries: 2 });
      
      if (result.success) {
        toast({
          title: "Réponse envoyée ! ✅",
          description: "Votre réponse a été soumise avec succès",
        });
        logGameAction('submit_answer', roundId, true);
      } else {
        logError({
          type: 'game_action',
          message: `Échec envoi réponse: ${result.error}`,
          context: { roundId, contentLength: content.length },
          timestamp: new Date().toISOString()
        });
      }

      return result;
    } catch (err: any) {
      logError({
        type: 'game_action',
        message: `Erreur submit answer: ${err.message}`,
        context: { roundId },
        timestamp: new Date().toISOString()
      });
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    submitAnswer,
    loading
  };
};
