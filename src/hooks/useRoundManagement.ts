
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useGameScoring } from './useGameScoring';

export const useRoundManagement = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { calculateRoundScore } = useGameScoring();

  const createNewRound = async (gameId: string, roundNumber: number, miniGameId: string) => {
    try {
      setLoading(true);

      // Get a random question for this game type
      const { data: questions } = await supabase
        .from('questions')
        .select('*')
        .eq('game_type', miniGameId)
        .limit(10);

      if (!questions || questions.length === 0) {
        throw new Error('Aucune question disponible pour ce mini-jeu');
      }

      const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

      const { data: roundData, error } = await supabase
        .from('rounds')
        .insert({
          game_id: gameId,
          round_number: roundNumber,
          mini_game_id: miniGameId,
          question_id: randomQuestion.id,
          status: 'playing',
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, round: roundData };
    } catch (err: any) {
      console.error('Error creating round:', err);
      toast({
        title: "Erreur",
        description: "Impossible de créer la nouvelle manche",
        variant: "destructive"
      });
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const completeRound = async (roundId: string, gameType: string) => {
    try {
      setLoading(true);

      // Calculate scores for this round
      const scoreResult = await calculateRoundScore(roundId, gameType);
      if (!scoreResult.success) {
        throw new Error('Erreur lors du calcul des scores');
      }

      // Mark round as completed
      const { error } = await supabase
        .from('rounds')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', roundId);

      if (error) throw error;

      toast({
        title: "Manche terminée ! 🎉",
        description: "Les scores ont été mis à jour",
      });

      return { success: true, scoreUpdates: scoreResult.scoreUpdates };
    } catch (err: any) {
      console.error('Error completing round:', err);
      toast({
        title: "Erreur",
        description: "Impossible de terminer la manche",
        variant: "destructive"
      });
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    createNewRound,
    completeRound,
    loading
  };
};
