
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

export const useGameScoring = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const calculateRoundScore = async (roundId: string, gameType: string) => {
    try {
      setLoading(true);

      // Fetch answers and votes for this round
      const { data: answers } = await supabase
        .from('answers')
        .select('*')
        .eq('round_id', roundId);

      const { data: votes } = await supabase
        .from('votes')
        .select('*')
        .eq('round_id', roundId);

      if (!answers || !votes) return { success: false };

      const scoreUpdates: { [playerId: string]: number } = {};

      // Calculate scores based on game type
      switch (gameType) {
        case 'kikadi':
          // +1 point for correct author guess
          votes.forEach(vote => {
            if (vote.vote_type === 'guess') {
              const answer = answers.find(a => a.id === vote.answer_id);
              if (answer && answer.player_id === vote.target_player_id) {
                scoreUpdates[vote.player_id] = (scoreUpdates[vote.player_id] || 0) + 1;
              }
            }
          });
          break;

        case 'kidivrai':
          // +2 points if bluff not detected, +1 point for correct detection
          answers.forEach(answer => {
            const votesOnAnswer = votes.filter(v => v.answer_id === answer.id);
            const bluffVotes = votesOnAnswer.filter(v => v.vote_type === 'bluff').length;
            const truthVotes = votesOnAnswer.filter(v => v.vote_type === 'truth').length;
            
            if (answer.is_bluff && bluffVotes === 0) {
              // Bluff succeeded
              scoreUpdates[answer.player_id!] = (scoreUpdates[answer.player_id!] || 0) + 2;
            } else if (!answer.is_bluff && truthVotes > bluffVotes) {
              // Truth recognized
              scoreUpdates[answer.player_id!] = (scoreUpdates[answer.player_id!] || 0) + 1;
            }

            // Points for correct detection
            votesOnAnswer.forEach(vote => {
              const isCorrect = (answer.is_bluff && vote.vote_type === 'bluff') || 
                               (!answer.is_bluff && vote.vote_type === 'truth');
              if (isCorrect) {
                scoreUpdates[vote.player_id!] = (scoreUpdates[vote.player_id!] || 0) + 1;
              }
            });
          });
          break;

        case 'kideja':
          // +1 point for correct guess
          votes.forEach(vote => {
            if (vote.vote_type === 'guess' && vote.target_player_id) {
              scoreUpdates[vote.player_id!] = (scoreUpdates[vote.player_id!] || 0) + 1;
            }
          });
          break;

        case 'kidenous':
          // +1 point for being chosen, +1 point for choosing the winner
          const voteCounts: { [playerId: string]: number } = {};
          votes.forEach(vote => {
            if (vote.target_player_id) {
              voteCounts[vote.target_player_id] = (voteCounts[vote.target_player_id] || 0) + 1;
            }
          });

          const winner = Object.entries(voteCounts).reduce((max, [id, count]) => 
            count > (voteCounts[max] || 0) ? id : max, 
            Object.keys(voteCounts)[0]
          );

          if (winner) {
            scoreUpdates[winner] = (scoreUpdates[winner] || 0) + 1;
            votes.forEach(vote => {
              if (vote.target_player_id === winner) {
                scoreUpdates[vote.player_id!] = (scoreUpdates[vote.player_id!] || 0) + 1;
              }
            });
          }
          break;
      }

      // Apply score updates to database using RPC calls for atomic increments
      for (const [playerId, points] of Object.entries(scoreUpdates)) {
        // Get current values first
        const { data: currentPlayer } = await supabase
          .from('game_players')
          .select('score, xp, coins')
          .eq('user_id', playerId)
          .single();

        if (currentPlayer) {
          const { error } = await supabase
            .from('game_players')
            .update({ 
              score: (currentPlayer.score || 0) + points,
              xp: (currentPlayer.xp || 0) + (points * 25),
              coins: (currentPlayer.coins || 0) + (points * 10)
            })
            .eq('user_id', playerId);

          if (error) {
            console.error('Error updating player score:', error);
          }
        }
      }

      return { success: true, scoreUpdates };
    } catch (err: any) {
      console.error('Error calculating round score:', err);
      toast({
        title: "Erreur",
        description: "Impossible de calculer les scores",
        variant: "destructive"
      });
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    calculateRoundScore,
    loading
  };
};
