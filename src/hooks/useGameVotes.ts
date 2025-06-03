
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRetryOperation } from '@/hooks/useRetryOperation';
import { useErrorMonitoring } from '@/hooks/useErrorMonitoring';

export const useGameVotes = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { executeWithRetry } = useRetryOperation();
  const { logError, logGameAction } = useErrorMonitoring();

  const submitVote = async (
    roundId: string, 
    targetPlayerId: string, 
    answerId: string, 
    voteType: string
  ) => {
    try {
      setLoading(true);
      logGameAction('submit_vote', roundId);

      // Validation côté client
      if (!targetPlayerId || !answerId || !voteType) {
        toast({
          title: "Vote incomplet",
          description: "Tous les champs du vote sont requis",
          variant: "destructive"
        });
        return { success: false, error: "Vote incomplet" };
      }

      const validVoteTypes = ['guess', 'bluff', 'truth'];
      if (!validVoteTypes.includes(voteType)) {
        toast({
          title: "Type de vote invalide",
          description: "Le type de vote n'est pas reconnu",
          variant: "destructive"
        });
        return { success: false, error: "Type de vote invalide" };
      }

      const operation = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Utilisateur non connecté');
        }

        const { error } = await supabase
          .from('votes')
          .upsert({
            player_id: user.id,
            round_id: roundId,
            target_player_id: targetPlayerId,
            answer_id: answerId,
            vote_type: voteType,
            timestamp: new Date().toISOString()
          }, {
            onConflict: 'player_id,round_id'
          });

        if (error) throw error;
        return true;
      };

      const result = await executeWithRetry(operation, { maxRetries: 2 });
      
      if (result.success) {
        toast({
          title: "Vote enregistré ! 🗳️",
          description: "Votre vote a été pris en compte",
        });
        logGameAction('submit_vote', roundId, true);
      } else {
        logError({
          type: 'game_action',
          message: `Échec envoi vote: ${result.error}`,
          context: { roundId, voteType },
          timestamp: new Date().toISOString()
        });
      }

      return result;
    } catch (err: any) {
      logError({
        type: 'game_action',
        message: `Erreur submit vote: ${err.message}`,
        context: { roundId, voteType },
        timestamp: new Date().toISOString()
      });
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    submitVote,
    loading
  };
};
