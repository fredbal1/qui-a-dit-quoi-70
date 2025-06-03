
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRetryOperation } from '@/hooks/useRetryOperation';
import { useErrorMonitoring } from '@/hooks/useErrorMonitoring';

export const useGamePhase = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { executeWithRetry } = useRetryOperation();
  const { logError, logGameAction } = useErrorMonitoring();

  const advancePhase = async (gameId: string) => {
    try {
      setLoading(true);
      logGameAction('advance_phase', gameId);

      const operation = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Utilisateur non connecté');
        }

        // Vérification que l'utilisateur est l'hôte
        const { data: gameData, error: gameError } = await supabase
          .from('games')
          .select('host, phase, current_round, total_rounds')
          .eq('id', gameId)
          .single();

        if (gameError) throw gameError;

        if (gameData.host !== user.id) {
          throw new Error('Seul le créateur peut faire avancer la partie');
        }

        // Logique de progression des phases
        const phaseOrder = ['intro', 'answer', 'vote', 'reveal', 'results'];
        const currentPhaseIndex = phaseOrder.indexOf(gameData.phase || 'intro');
        
        let nextPhase: string;
        let nextRound = gameData.current_round;

        if (currentPhaseIndex === phaseOrder.length - 1) {
          if (gameData.current_round && gameData.current_round < (gameData.total_rounds || 5)) {
            nextPhase = 'intro';
            nextRound = (gameData.current_round || 1) + 1;
          } else {
            nextPhase = 'ended';
          }
        } else {
          nextPhase = phaseOrder[currentPhaseIndex + 1];
        }

        const updateData: any = { phase: nextPhase };
        if (nextRound !== gameData.current_round) {
          updateData.current_round = nextRound;
        }

        const { error: updateError } = await supabase
          .from('games')
          .update(updateData)
          .eq('id', gameId);

        if (updateError) throw updateError;

        return { nextPhase };
      };

      const result = await executeWithRetry(operation, { maxRetries: 1 });
      
      if (result.success) {
        toast({
          title: "Phase avancée ! 🚀",
          description: `Passage à la phase: ${result.data?.nextPhase}`,
        });
        logGameAction('advance_phase', gameId, true);
        return { success: true, nextPhase: result.data?.nextPhase };
      } else {
        logError({
          type: 'game_action',
          message: `Échec avancement phase: ${result.error}`,
          context: { gameId },
          timestamp: new Date().toISOString()
        });
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      logError({
        type: 'game_action',
        message: `Erreur advance phase: ${err.message}`,
        context: { gameId },
        timestamp: new Date().toISOString()
      });
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    advancePhase,
    loading
  };
};
